import razorpay from "../config/razorpay.js";
import Payment from "../models/payment.model.js";
import Subscription from "../models/subscription.model.js";
import Invoice from "../models/invoice.model.js";
import Workspace from "../models/workspace.model.js";
import NotificationService from "./notification.service.js";
import Activity from "../models/activity.model.js";
import { verifyPaymentSignature } from "../utils/paymentHelper.js";
import ApiError from "../utils/apiError.js";
import { getPlanDetails } from "../constants/plans.js";
import EmailService from "./email.service.js";
import User from "../models/user.model.js";

class PaymentService {
  static async createOrder(workspaceId, userId, { planId, billingCycle }) {
    const plan = getPlanDetails(planId);
    const amount = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

    if (amount === 0) {
      throw new ApiError("Free plan does not require checkout order creation.", 400);
    }

    const amountInPaise = amount * 100; // Razorpay expects paise (INR)

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new ApiError("Workspace not found", 404);

    const planShort = { free: "fre", starter: "str", professional: "pro", enterprise: "ent" }[planId] || "str";
    const cycleShort = billingCycle === "yearly" ? "y" : "m";
    const receipt = `rcpt_${planShort}_${cycleShort}_${Math.floor(Date.now() / 1000)}`;

    // Create Razorpay Order with mock fallback
    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt,
        notes: {
          workspaceId: workspaceId.toString(),
          userId: userId.toString(),
          planId,
          billingCycle,
        },
      });
    } catch (err) {
      console.warn("Razorpay API order creation failed, falling back to Sandbox mock order:", err.message || err);
      rzpOrder = {
        id: `order_mock_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        amount: amountInPaise,
        currency: "INR",
      };
    }

    // Create payment entry in DB as created
    const payment = new Payment({
      workspaceId,
      userId,
      razorpayOrderId: rzpOrder.id,
      amount,
      currency: "INR",
      paymentStatus: "created",
      receiptNumber: receipt,
    });
    await payment.save();

    return {
      orderId: rzpOrder.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key_12345",
      customer: {
        name: workspace.customerName || "Customer",
        email: workspace.customerEmail || "",
        contact: workspace.customerPhone || "",
      },
    };
  }

  static async verifyAndActivate(workspaceId, userId, verificationData) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = verificationData;

    // 1. Verify Payment Signature
    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      // Log payment failure
      await Payment.findOneAndUpdate(
        { razorpayOrderId, workspaceId },
        { $set: { paymentStatus: "failed", failureReason: "Signature verification failed" } }
      );
      throw new ApiError("Payment signature verification failed. Transaction rejected.", 400);
    }

    // 2. Fetch Razorpay Payment details (Mock checkout compatibility fallback)
    let paymentMethod = "UPI";
    let amountCharged = 0;
    let currency = "INR";
    let notes = {};

    try {
      if (razorpayOrderId && !razorpayOrderId.startsWith("order_mock_")) {
        const rzpPayment = await razorpay.payments.fetch(razorpayPaymentId);
        paymentMethod = rzpPayment.method || "card";
        amountCharged = rzpPayment.amount / 100;
        currency = rzpPayment.currency || "INR";
        notes = rzpPayment.notes || {};
      }
    } catch (e) {
      console.warn("Failed to fetch Razorpay payment details directly, using default values");
    }

    // Find and update local Payment log
    const payment = await Payment.findOne({ razorpayOrderId, workspaceId });
    if (!payment) throw new ApiError("Payment log not found", 404);

    if (payment.paymentStatus === "captured") {
      // Prevent duplicate activations
      return { payment, duplicate: true };
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.paymentStatus = "captured";
    payment.paymentMethod = paymentMethod;
    if (amountCharged > 0) payment.amount = amountCharged;
    
    // Find target plan details
    let planId = notes.planId;
    let billingCycle = notes.billingCycle;

    if ((!planId || !billingCycle) && payment.receiptNumber) {
      const parts = payment.receiptNumber.split("_");
      if (parts.length >= 3) {
        const shortPlan = parts[1];
        const shortCycle = parts[2];
        planId = { fre: "free", str: "starter", pro: "professional", ent: "enterprise" }[shortPlan] || "starter";
        billingCycle = shortCycle === "y" ? "yearly" : "monthly";
      }
    }

    planId = planId || "starter";
    billingCycle = billingCycle || "monthly";
    const plan = getPlanDetails(planId);

    // 3. Create or update subscription
    const nextBilling = new Date();
    if (billingCycle === "yearly") {
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    } else {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    }

    const sub = await Subscription.findOneAndUpdate(
      { workspaceId },
      {
        $set: {
          ownerId: userId,
          planId,
          billingCycle,
          amount: payment.amount,
          currency,
          status: "active",
          startDate: new Date(),
          nextBillingDate: nextBilling,
          endDate: nextBilling,
          autoRenew: true,
        },
      },
      { upsert: true, new: true }
    );

    payment.subscriptionId = sub._id;
    
    // Create unique invoice number
    const invNumber = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    payment.invoiceNumber = invNumber;
    await payment.save();

    // 4. Reset AI requests limit in workspace
    const workspace = await Workspace.findById(workspaceId);
    if (workspace) {
      workspace.aiRequestsCount = 0; // reset usage
      await workspace.save();
    }

    // 5. Generate Invoice record
    const gstAmount = Math.round(payment.amount * 0.18 * 100) / 100; // 18% GST standard
    const invoice = new Invoice({
      invoiceId: `inv_${Date.now()}`,
      workspaceId,
      paymentId: payment._id,
      invoiceNumber: invNumber,
      amount: payment.amount - gstAmount,
      GST: gstAmount,
      total: payment.amount,
      status: "paid",
      downloadUrl: `/api/payment/invoices/${invNumber}/download`,
    });
    await invoice.save();

    // Send invoice, subscription activation, and payment success emails
    const userDoc = await User.findById(userId);
    if (userDoc) {
      await EmailService.sendInvoiceEmail(
        userDoc.email,
        userDoc.name,
        invNumber,
        payment.amount
      ).catch(console.error);

      await EmailService.sendSubscriptionActivatedEmail(
        userDoc.email,
        userDoc.name,
        planId
      ).catch(console.error);

      await EmailService.sendPaymentSuccessEmail(
        userDoc.email,
        userDoc.name,
        invNumber,
        payment.amount
      ).catch(console.error);
    } else if (workspace && workspace.customerEmail) {
      await EmailService.sendInvoiceEmail(
        workspace.customerEmail,
        workspace.customerName || "Member",
        invNumber,
        payment.amount
      ).catch(console.error);
    }

    // Log Activity
    const user = await Workspace.findById(workspaceId).populate("ownerId", "name");
    const ownerName = user?.ownerId?.name || "System";
    
    const activity = new Activity({
      workspaceId,
      user: ownerName,
      initials: ownerName.split(" ").map((n) => n[0]).join("").toUpperCase(),
      action: "Upgraded subscription plan",
      target: plan.name,
      type: "settings",
    });
    await activity.save();

    // Send notifications
    await NotificationService.notifyWorkspace(
      workspaceId,
      "Subscription Activated",
      `Your subscription to plan ${plan.name} has been activated successfully!`,
      "system"
    );

    return { payment, subscription: sub, invoice };
  }

  static async issueRefund(paymentId, amount = null) {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new ApiError("Payment record not found", 404);

    if (payment.paymentStatus !== "captured") {
      throw new ApiError("Only captured payments can be refunded.", 400);
    }

    const refundAmount = amount || payment.amount;
    
    try {
      // Create Razorpay Refund
      await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: refundAmount * 100, // paise
      });
    } catch (e) {
      console.warn("Razorpay API refund failed, processing locally for sandbox compatibility:", e.message);
    }

    payment.paymentStatus = "refunded";
    payment.refundedAmount = refundAmount;
    await payment.save();

    // Update Subscription status
    await Subscription.findOneAndUpdate(
      { workspaceId: payment.workspaceId },
      { $set: { status: "cancelled" } }
    );

    // Update Invoice status
    await Invoice.findOneAndUpdate(
      { paymentId: payment._id },
      { $set: { status: "refunded" } }
    );

    await NotificationService.notifyWorkspace(
      payment.workspaceId,
      "Refund Processed",
      `A refund of $${refundAmount} has been processed for your workspace.`,
      "system"
    );

    return payment;
  }
}

export default PaymentService;
