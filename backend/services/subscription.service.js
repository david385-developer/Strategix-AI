import Subscription from "../models/subscription.model.js";
import Payment from "../models/payment.model.js";
import Invoice from "../models/invoice.model.js";
import Campaign from "../models/campaign.model.js";
import User from "../models/user.model.js";
import Media from "../models/media.model.js";
import Workspace from "../models/workspace.model.js";
import { getPlanDetails } from "../constants/plans.js";
import ApiError from "../utils/apiError.js";
import NotificationService from "./notification.service.js";

class SubscriptionService {
  static async getBillingOverview(workspaceId) {
    // 1. Fetch active/inactive subscription details
    let sub = await Subscription.findOne({ workspaceId });
    if (!sub) {
      // Create default free subscription
      sub = new Subscription({
        workspaceId,
        ownerId: (await Workspace.findById(workspaceId))?.ownerId,
        planId: "free",
        amount: 0,
        status: "active",
      });
      await sub.save();
    }

    const plan = getPlanDetails(sub.planId);

    // 2. Fetch usage metrics
    const campaignCount = await Campaign.countDocuments({ workspaceId });
    const teamMembers = await User.countDocuments({ activeWorkspaceId: workspaceId });
    const mediaCount = await Media.countDocuments({ workspaceId });
    const workspace = await Workspace.findById(workspaceId);
    const aiRequestsUsed = workspace?.aiRequestsCount || 0;

    const mediaRecords = await Media.find({ workspaceId });
    const storageUsed = mediaRecords.reduce((acc, m) => acc + (m.sizeBytes || 0), 0);

    // 3. Fetch billing history (payments & invoices)
    const payments = await Payment.find({ workspaceId }).sort({ createdAt: -1 });
    const invoices = await Invoice.find({ workspaceId }).sort({ createdAt: -1 });

    return {
      subscription: {
        planId: sub.planId,
        planName: plan.name,
        status: sub.status,
        billingCycle: sub.billingCycle,
        amount: sub.amount,
        nextBillingDate: sub.nextBillingDate ? sub.nextBillingDate.toISOString() : null,
        trialEnd: sub.trialEnd ? sub.trialEnd.toISOString() : null,
        autoRenew: sub.autoRenew,
      },
      usage: {
        campaigns: {
          used: campaignCount,
          limit: plan.campaignLimit,
        },
        teamMembers: {
          used: teamMembers,
          limit: plan.teamMemberLimit,
        },
        media: {
          used: mediaCount,
          limit: plan.mediaLimit,
        },
        storage: {
          used: storageUsed,
          limit: plan.storageLimit,
        },
        aiRequests: {
          used: aiRequestsUsed,
          limit: plan.aiRequestsLimit,
        },
      },
      customer: {
        customerName: workspace?.customerName || "",
        customerEmail: workspace?.customerEmail || "",
        customerPhone: workspace?.customerPhone || "",
        billingAddress: workspace?.billingAddress || "",
        gstNumber: workspace?.gstNumber || "",
        companyName: workspace?.companyName || "",
      },
      payments: payments.map((p) => ({
        id: p._id,
        orderId: p.razorpayOrderId,
        paymentId: p.razorpayPaymentId || "Pending",
        amount: p.amount,
        currency: p.currency,
        method: p.paymentMethod || "UPI",
        status: p.paymentStatus,
        receipt: p.receiptNumber,
        invoice: p.invoiceNumber,
        date: p.createdAt.toISOString(),
      })),
      invoices: invoices.map((inv) => ({
        id: inv._id,
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        gst: inv.GST,
        total: inv.total,
        status: inv.status,
        downloadUrl: inv.downloadUrl,
        date: inv.createdAt.toISOString(),
      })),
    };
  }

  static async updateBillingDetails(workspaceId, details) {
    const { customerName, customerEmail, customerPhone, billingAddress, gstNumber, companyName } = details;

    const workspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        $set: {
          customerName,
          customerEmail,
          customerPhone,
          billingAddress,
          gstNumber,
          companyName,
        },
      },
      { new: true }
    );

    if (!workspace) throw new ApiError("Workspace not found", 404);

    return workspace;
  }

  static async cancelSubscription(workspaceId) {
    const sub = await Subscription.findOne({ workspaceId });
    if (!sub) throw new ApiError("Subscription not found", 404);

    sub.autoRenew = false;
    sub.status = "cancelled";
    await sub.save();

    await NotificationService.notifyWorkspace(
      workspaceId,
      "Subscription Cancelled",
      `Your premium plan subscription has been cancelled. It will remain active until the end of your billing cycle.`,
      "system"
    );

    return sub;
  }

  static async pauseSubscription(workspaceId) {
    const sub = await Subscription.findOne({ workspaceId });
    if (!sub) throw new ApiError("Subscription not found", 404);

    sub.status = "paused";
    await sub.save();

    await NotificationService.notifyWorkspace(
      workspaceId,
      "Subscription Paused",
      `Your subscription has been paused. Limits and AI access are suspended.`,
      "system"
    );

    return sub;
  }

  static async resumeSubscription(workspaceId) {
    const sub = await Subscription.findOne({ workspaceId });
    if (!sub) throw new ApiError("Subscription not found", 404);

    sub.status = "active";
    await sub.save();

    await NotificationService.notifyWorkspace(
      workspaceId,
      "Subscription Resumed",
      `Your subscription is active again! Dynamic usage tracking limits restored.`,
      "system"
    );

    return sub;
  }

  static async updatePlanManual(workspaceId, planId, billingCycle = "monthly") {
    const plan = getPlanDetails(planId);
    const amount = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

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
          planId,
          billingCycle,
          amount,
          status: "active",
          nextBillingDate: nextBilling,
          endDate: nextBilling,
        },
      },
      { upsert: true, new: true }
    );

    // Reset AI usage limits
    await Workspace.findByIdAndUpdate(workspaceId, { $set: { aiRequestsCount: 0 } });

    await NotificationService.notifyWorkspace(
      workspaceId,
      "Subscription Plan Updated",
      `Your workspace has been successfully migrated to the ${plan.name} plan.`,
      "system"
    );

    return sub;
  }
}

export default SubscriptionService;
