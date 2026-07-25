import SubscriptionService from "../services/subscription.service.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";

class SubscriptionController {
  static async getBilling(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) throw new ApiError("No active workspace selected", 400);

      const overview = await SubscriptionService.getBillingOverview(workspaceId);
      return ApiResponse.success(res, "Billing overview retrieved successfully", overview);
    } catch (error) {
      next(error);
    }
  }

  static async updateBilling(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) throw new ApiError("No active workspace selected", 400);

      const updated = await SubscriptionService.updateBillingDetails(workspaceId, req.body);
      return ApiResponse.success(res, "Billing details updated successfully", { workspace: updated });
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) throw new ApiError("No active workspace selected", 400);

      const sub = await SubscriptionService.cancelSubscription(workspaceId);
      return ApiResponse.success(res, "Subscription cancelled successfully", { subscription: sub });
    } catch (error) {
      next(error);
    }
  }

  static async pause(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) throw new ApiError("No active workspace selected", 400);

      const sub = await SubscriptionService.pauseSubscription(workspaceId);
      return ApiResponse.success(res, "Subscription paused successfully", { subscription: sub });
    } catch (error) {
      next(error);
    }
  }

  static async resume(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) throw new ApiError("No active workspace selected", 400);

      const sub = await SubscriptionService.resumeSubscription(workspaceId);
      return ApiResponse.success(res, "Subscription resumed successfully", { subscription: sub });
    } catch (error) {
      next(error);
    }
  }

  static async manualUpgrade(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) throw new ApiError("No active workspace selected", 400);

      const { planId, billingCycle = "monthly" } = req.body;
      if (!planId) throw new ApiError("Plan ID is required", 400);

      const sub = await SubscriptionService.updatePlanManual(workspaceId, planId, billingCycle);
      return ApiResponse.success(res, `Workspace plan updated manually to ${planId}`, { subscription: sub });
    } catch (error) {
      next(error);
    }
  }
}

export default SubscriptionController;
