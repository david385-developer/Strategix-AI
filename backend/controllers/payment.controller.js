import PaymentService from "../services/payment.service.js";
import SubscriptionService from "../services/subscription.service.js";
import Payment from "../models/payment.model.js";
import Invoice from "../models/invoice.model.js";
import Workspace from "../models/workspace.model.js";
import Subscription from "../models/subscription.model.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { verifyWebhookSignature } from "../utils/webhookVerifier.js";
import NotificationService from "../services/notification.service.js";

class PaymentController {
  static async createCheckout(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) throw new ApiError("No active workspace selected", 400);

      const { planId, billingCycle = "monthly" } = req.body;
      if (!planId) throw new ApiError("Plan ID is required", 400);

      const checkoutData = await PaymentService.createOrder(workspaceId, req.user._id, { planId, billingCycle });
      return ApiResponse.success(res, "Checkout order created", checkoutData);
    } catch (error) {
      next(error);
    }
  }

  static async verifyPayment(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) throw new ApiError("No active workspace selected", 400);

      const result = await PaymentService.verifyAndActivate(workspaceId, req.user._id, req.body);
      return ApiResponse.success(res, "Payment verified and plan activated successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async webhook(req, res, next) {
    try {
      const signature = req.headers["x-razorpay-signature"];
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "rzp_webhook_secret_12345";
      
      const isVerified = verifyWebhookSignature(req.rawBody, signature, secret);
      if (!isVerified) {
        console.warn("Invalid webhook signature received from Razorpay. Rejecting.");
        throw new ApiError("Invalid webhook signature", 400);
      }

      const event = req.body.event;
      const payload = req.body.payload;

      console.log(`Processing Razorpay Webhook Event: ${event}`);

      switch (event) {
        case "payment.captured": {
          const rzpPayment = payload.payment.entity;
          const razorpayOrderId = rzpPayment.order_id;
          const razorpayPaymentId = rzpPayment.id;
          
          const payment = await Payment.findOne({ razorpayOrderId });
          if (payment && payment.paymentStatus !== "captured") {
            const workspaceId = payment.workspaceId;
            const userId = payment.userId;
            await PaymentService.verifyAndActivate(workspaceId, userId, {
              razorpayOrderId,
              razorpayPaymentId,
              razorpaySignature: "webhook_verified",
            });
          }
          break;
        }

        case "payment.failed": {
          const rzpPayment = payload.payment.entity;
          const razorpayOrderId = rzpPayment.order_id;
          await Payment.findOneAndUpdate(
            { razorpayOrderId },
            { $set: { paymentStatus: "failed", failureReason: rzpPayment.error_description || "Payment failed" } }
          );
          break;
        }

        case "subscription.activated":
        case "subscription.resumed": {
          const rzpSub = payload.subscription.entity;
          const subId = rzpSub.id;
          await Subscription.findOneAndUpdate(
            { razorpaySubscriptionId: subId },
            { $set: { status: "active" } }
          );
          break;
        }

        case "subscription.paused": {
          const rzpSub = payload.subscription.entity;
          const subId = rzpSub.id;
          const sub = await Subscription.findOneAndUpdate(
            { razorpaySubscriptionId: subId },
            { $set: { status: "paused" } }
          );
          if (sub) {
            await NotificationService.notifyWorkspace(sub.workspaceId, "Subscription Paused", "Your billing cycle has been paused.", "system");
          }
          break;
        }

        case "subscription.cancelled": {
          const rzpSub = payload.subscription.entity;
          const subId = rzpSub.id;
          const sub = await Subscription.findOneAndUpdate(
            { razorpaySubscriptionId: subId },
            { $set: { status: "cancelled" } }
          );
          if (sub) {
            await NotificationService.notifyWorkspace(sub.workspaceId, "Subscription Cancelled", "Your subscription is now inactive.", "system");
          }
          break;
        }

        case "refund.processed": {
          const rzpRefund = payload.refund.entity;
          const paymentId = rzpRefund.payment_id;
          const payment = await Payment.findOne({ razorpayPaymentId: paymentId });
          if (payment) {
            await PaymentService.issueRefund(payment._id, rzpRefund.amount / 100);
          }
          break;
        }
      }

      return res.status(200).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  }

  static async downloadInvoice(req, res, next) {
    try {
      const { invoiceNumber } = req.params;
      const invoice = await Invoice.findOne({ invoiceNumber });
      if (!invoice) throw new ApiError("Invoice not found", 404);

      const workspace = await Workspace.findById(invoice.workspaceId);
      const payment = await Payment.findById(invoice.paymentId);

      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; line-height: 1.6; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); border-radius: 8px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 20px; }
          .title { font-size: 28px; font-weight: bold; color: #6366f1; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .details-table td { padding: 8px 0; vertical-align: top; }
          .details-table td.right { text-align: right; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 14px; }
          .items-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .totals { text-align: right; font-size: 16px; }
          .totals table { margin-left: auto; width: 250px; }
          .totals td { padding: 6px 0; }
          .totals td.bold { font-weight: bold; font-size: 18px; color: #6366f1; }
          .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #94a3b8; }
          .print-btn { display: inline-block; background: #6366f1; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; margin-bottom: 20px; border: none; cursor: pointer; }
          @media print { .print-btn { display: none; } }
        </style>
      </head>
      <body>
        <div style="max-width: 800px; margin: auto;">
          <button onclick="window.print()" class="print-btn">Print Invoice</button>
        </div>
        <div class="invoice-box">
          <div class="header">
            <div>
              <div class="title">STRATEGIX AI</div>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">Intelligent Digital Marketing Assistant</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; color: #64748b; font-size: 20px;">INVOICE</h2>
              <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>No:</strong> ${invoice.invoiceNumber}</p>
              <p style="margin: 2px 0 0 0; font-size: 14px;"><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <table class="details-table">
            <tr>
              <td>
                <strong>Billed To:</strong><br>
                ${workspace.customerName || "Customer"}<br>
                ${workspace.companyName ? `${workspace.companyName}<br>` : ""}
                ${workspace.billingAddress || "Billing address not configured"}<br>
                ${workspace.customerEmail || ""}<br>
                ${workspace.gstNumber ? `<strong>GSTIN:</strong> ${workspace.gstNumber}` : ""}
              </td>
              <td class="right">
                <strong>Issued By:</strong><br>
                Strategix AI Pvt Ltd<br>
                128 Innovation Labs, Tech City<br>
                Bangalore, Karnataka, 560001<br>
                billing@strategix.ai
              </td>
            </tr>
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th>Subscription Plan / Product</th>
                <th>Cycle</th>
                <th>Base Amount</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Strategix AI Marketing Automation Plan Upgrade</td>
                <td>${payment?.razorpayOrderId ? "Paid" : "Regular"}</td>
                <td>INR ${invoice.amount}</td>
                <td style="text-align: right;">INR ${invoice.amount}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td>INR ${invoice.amount}</td>
              </tr>
              <tr>
                <td>GST (18%):</td>
                <td>INR ${invoice.GST}</td>
              </tr>
              <tr style="border-top: 1px solid #e2e8f0;">
                <td class="bold">Total Paid:</td>
                <td class="bold">INR ${invoice.total}</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 6px; font-size: 13px;">
            <strong>Transaction Details:</strong><br>
            <strong>Payment Method:</strong> ${payment?.paymentMethod || "Razorpay Link"}<br>
            <strong>Payment ID:</strong> ${payment?.razorpayPaymentId || "rzp_txn_123456"}<br>
            <strong>Status:</strong> Successful
          </div>

          <div class="footer">
            Thank you for choosing Strategix AI! If you have questions, email support@strategix.ai.<br>
            © 2026 Strategix AI. All rights reserved.
          </div>
        </div>
      </body>
      </html>
      `;

      res.setHeader("Content-Type", "text/html");
      return res.send(html);
    } catch (error) {
      next(error);
    }
  }
}

export default PaymentController;
