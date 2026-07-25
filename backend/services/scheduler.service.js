import cron from "node-cron";
import Subscription from "../models/subscription.model.js";
import Workspace from "../models/workspace.model.js";
import Payment from "../models/payment.model.js";
import Invoice from "../models/invoice.model.js";
import NotificationService from "./notification.service.js";

class SchedulerService {
  static init() {
    console.log("Initializing background cron scheduler...");

    // Run every day at midnight (00:00)
    cron.schedule("0 0 * * *", async () => {
      console.log("Running daily subscription check background worker...");
      try {
        await SchedulerService.checkExpirationsAndRenewals();
      } catch (error) {
        console.error("Error in daily background check task:", error);
      }
    });
  }

  static async checkExpirationsAndRenewals() {
    const now = new Date();

    // 1. Handle Active Subscriptions that have hit billing renewal date
    const expiringSubscriptions = await Subscription.find({
      status: "active",
      nextBillingDate: { $lte: now },
    });

    for (const sub of expiringSubscriptions) {
      if (sub.planId === "free") continue;

      if (sub.autoRenew) {
        // Auto-renew: Create payment and invoice details, advance dates
        const billingCycle = sub.billingCycle || "monthly";
        const nextBilling = new Date();
        if (billingCycle === "yearly") {
          nextBilling.setFullYear(nextBilling.getFullYear() + 1);
        } else {
          nextBilling.setMonth(nextBilling.getMonth() + 1);
        }

        // Mock payment captured
        const payment = new Payment({
          workspaceId: sub.workspaceId,
          userId: sub.ownerId,
          subscriptionId: sub._id,
          razorpayOrderId: `auto_ord_${Date.now()}`,
          razorpayPaymentId: `auto_pay_${Date.now()}`,
          amount: sub.amount,
          currency: sub.currency,
          paymentMethod: "UPI (Auto)",
          paymentStatus: "captured",
          invoiceNumber: `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        });
        await payment.save();

        // Save Invoice details
        const gstAmount = Math.round(payment.amount * 0.18 * 100) / 100;
        const invoice = new Invoice({
          invoiceId: `inv_${Date.now()}`,
          workspaceId: sub.workspaceId,
          paymentId: payment._id,
          invoiceNumber: payment.invoiceNumber,
          amount: payment.amount - gstAmount,
          GST: gstAmount,
          total: payment.amount,
          status: "paid",
          downloadUrl: `/api/payment/invoices/${payment.invoiceNumber}/download`,
        });
        await invoice.save();

        // Advance subscription next billing date
        sub.nextBillingDate = nextBilling;
        sub.endDate = nextBilling;
        await sub.save();

        // Reset workspace AI usage counter
        await Workspace.findByIdAndUpdate(sub.workspaceId, { $set: { aiRequestsCount: 0 } });

        await NotificationService.notifyWorkspace(
          sub.workspaceId,
          "Subscription Auto-Renewed",
          `Your subscription to plan ${sub.planId.toUpperCase()} has been successfully renewed.`,
          "system"
        );
      } else {
        // Expiration: Set subscription status to expired
        sub.status = "expired";
        await sub.save();

        await NotificationService.notifyWorkspace(
          sub.workspaceId,
          "Subscription Expired",
          `Your subscription has expired. Workspace limits have reverted to the Free plan.`,
          "system"
        );
      }
    }

    // 2. Warn users on ending Free trials (expiring in 3 days)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const endingTrials = await Subscription.find({
      status: "trial",
      trialEnd: { $lte: threeDaysFromNow, $gt: now },
    });

    for (const trial of endingTrials) {
      await NotificationService.notifyWorkspace(
        trial.workspaceId,
        "Free Trial Ending Soon",
        `Your workspace free trial of plan ${trial.planId.toUpperCase()} ends on ${trial.trialEnd.toLocaleDateString()}. Please configure payment details to avoid interruption.`,
        "system"
      );
    }

    // 3. Mark trials as expired once date is past
    const expiredTrials = await Subscription.find({
      status: "trial",
      trialEnd: { $lte: now },
    });

    for (const trial of expiredTrials) {
      trial.status = "expired";
      trial.planId = "free";
      await trial.save();

      await NotificationService.notifyWorkspace(
        trial.workspaceId,
        "Trial Expired",
        `Your free trial has expired. Workspace downgraded to the Free plan.`,
        "system"
      );
    }
  }
}

export default SchedulerService;
