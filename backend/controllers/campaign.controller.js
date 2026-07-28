import CampaignService from "../services/campaign.service.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";

class CampaignController {
  static async create(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      const campaign = await CampaignService.createCampaign(workspaceId, req.user, req.body);
      return ApiResponse.success(res, "Campaign created successfully", { campaign }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getList(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      const result = await CampaignService.getCampaigns(workspaceId, req.query);
      return ApiResponse.success(res, "Campaigns list retrieved", result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      const campaign = await CampaignService.getCampaignById(req.params.id, workspaceId);
      return ApiResponse.success(res, "Campaign details retrieved", { campaign });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      const campaign = await CampaignService.updateCampaign(req.params.id, workspaceId, req.body, req.user);
      return ApiResponse.success(res, "Campaign updated successfully", { campaign });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      await CampaignService.deleteCampaign(req.params.id, workspaceId, req.user);
      return ApiResponse.success(res, "Campaign deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getAIStrategy(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      const strategy = await CampaignService.getAIStrategy(req.params.id, workspaceId);
      if (!strategy) {
        return ApiResponse.success(res, "No strategy found for this campaign", { strategy: null });
      }
      return ApiResponse.success(res, "AI strategy retrieved", { strategy });
    } catch (error) {
      next(error);
    }
  }

  static async generateAIStrategy(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      const result = await CampaignService.generateAIStrategy(req.params.id, workspaceId, req.user);
      return ApiResponse.success(res, "AI strategy generated successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async emailCampaignDetails(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      const result = await CampaignService.emailCampaignDetails(req.params.id, workspaceId, req.user);
      return ApiResponse.success(res, "Campaign details email sent successfully", result);
    } catch (error) {
      next(error);
    }
  }
}

export default CampaignController;
