import Subscription from "../models/subscription.model.js";
import Campaign from "../models/campaign.model.js";
import User from "../models/user.model.js";
import Media from "../models/media.model.js";
import Workspace from "../models/workspace.model.js";
import { getPlanDetails } from "../constants/plans.js";
import ApiError from "../utils/apiError.js";

// Helper to get workspace subscription limits
export const getWorkspaceLimits = async (workspaceId) => {
  const sub = await Subscription.findOne({ workspaceId, status: { $in: ["active", "trial"] } });
  const planId = sub ? sub.planId : "free";
  return {
    planId,
    details: getPlanDetails(planId),
    subscription: sub,
  };
};

export const enforceCampaignLimit = async (req, res, next) => {
  try {
    const workspaceId = req.user.activeWorkspaceId;
    if (!workspaceId) return next(new ApiError("No active workspace selected", 400));

    const { details } = await getWorkspaceLimits(workspaceId);

    // Count campaigns in workspace
    const count = await Campaign.countDocuments({ workspaceId });
    if (count >= details.campaignLimit) {
      return res.status(403).json({
        success: false,
        code: "UPGRADE_REQUIRED",
        message: `Campaign limit reached (${details.campaignLimit} campaigns) for plan: ${details.name}. Please upgrade your plan.`,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const enforceTeamLimit = async (req, res, next) => {
  try {
    const workspaceId = req.user.activeWorkspaceId;
    if (!workspaceId) return next(new ApiError("No active workspace selected", 400));

    const { details } = await getWorkspaceLimits(workspaceId);

    // Count team members in workspace
    const count = await User.countDocuments({ activeWorkspaceId: workspaceId });
    if (count >= details.teamMemberLimit) {
      return res.status(403).json({
        success: false,
        code: "UPGRADE_REQUIRED",
        message: `Team member limit reached (${details.teamMemberLimit} members) for plan: ${details.name}. Please upgrade your plan.`,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const enforceUploadLimit = async (req, res, next) => {
  try {
    const workspaceId = req.user.activeWorkspaceId;
    if (!workspaceId) return next(new ApiError("No active workspace selected", 400));

    const { details } = await getWorkspaceLimits(workspaceId);

    // Count media files in workspace
    const count = await Media.countDocuments({ workspaceId });
    if (count >= details.mediaLimit) {
      return res.status(403).json({
        success: false,
        code: "UPGRADE_REQUIRED",
        message: `Media upload limit reached (${details.mediaLimit} files) for plan: ${details.name}. Please upgrade your plan.`,
      });
    }

    // Check storage size
    const mediaRecords = await Media.find({ workspaceId });
    const storageUsed = mediaRecords.reduce((acc, m) => acc + (m.sizeBytes || 0), 0);
    if (storageUsed >= details.storageLimit) {
      return res.status(403).json({
        success: false,
        code: "UPGRADE_REQUIRED",
        message: `Storage limit reached (${(details.storageLimit / (1024 * 1024)).toFixed(1)} MB) for plan: ${details.name}. Please upgrade your plan.`,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const enforceAICreditsLimit = async (req, res, next) => {
  try {
    const workspaceId = req.user.activeWorkspaceId;
    if (!workspaceId) return next(new ApiError("No active workspace selected", 400));

    const { details } = await getWorkspaceLimits(workspaceId);

    // Check workspace AI usage counter
    const workspace = await Workspace.findById(workspaceId);
    const used = workspace?.aiRequestsCount || 0;

    if (used >= details.aiRequestsLimit) {
      return res.status(403).json({
        success: false,
        code: "UPGRADE_REQUIRED",
        message: `AI request limit reached (${details.aiRequestsLimit} requests) for plan: ${details.name}. Please upgrade your plan.`,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const enforceBillingOwner = async (req, res, next) => {
  try {
    const workspaceId = req.user.activeWorkspaceId;
    if (!workspaceId) return next(new ApiError("No active workspace selected", 400));

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return next(new ApiError("Workspace not found", 404));

    if (workspace.ownerId.toString() !== req.user._id.toString() && req.user.role !== "owner") {
      return next(new ApiError("Only the workspace owner is authorized to manage billing", 403));
    }
    next();
  } catch (error) {
    next(error);
  }
};
