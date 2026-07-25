import ContentService from "../services/content.service.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";

class ContentController {
  static async create(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      
      let conflictWarning = false;
      if (req.body.status === "scheduled" && req.body.scheduledFor) {
        conflictWarning = await ContentService.assertScheduleAvailable(workspaceId, req.body.platform, req.body.scheduledFor);
      }

      const content = await ContentService.createContent(workspaceId, req.user._id, req.body);
      return ApiResponse.success(res, "Content created successfully", { content, conflictWarning }, 201);
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
      const result = await ContentService.getContentItems(workspaceId, req.query);
      return ApiResponse.success(res, "Content list retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const content = await ContentService.getContentById(req.params.id, req.user.activeWorkspaceId);
      return ApiResponse.success(res, "Content details retrieved", { content });
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

      let conflictWarning = false;
      if (req.body.status === "scheduled" || req.body.scheduledFor) {
        const existing = await ContentService.getContentById(req.params.id, workspaceId);
        conflictWarning = await ContentService.assertScheduleAvailable(
          workspaceId,
          req.body.platform || existing.platform,
          req.body.scheduledFor || existing.scheduledFor,
          req.params.id
        );
      }

      const content = await ContentService.updateContent(req.params.id, req.user.activeWorkspaceId, req.body);
      return ApiResponse.success(res, "Content updated successfully", { content, conflictWarning });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await ContentService.deleteContent(req.params.id, req.user.activeWorkspaceId);
      return ApiResponse.success(res, "Content deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  static async generateAI(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      const content = await ContentService.generateAIContent(workspaceId, req.user._id, req.body);
      return ApiResponse.success(res, "Content generated successfully", { content }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async rewriteAI(req, res, next) {
    try {
      const { instruction } = req.body;
      if (!instruction) {
        throw new ApiError("Rewrite instruction is required", 400);
      }
      const content = await ContentService.rewriteAIContent(req.params.id, instruction, req.user.activeWorkspaceId);
      return ApiResponse.success(res, "Content rewritten successfully", { content });
    } catch (error) {
      next(error);
    }
  }
}

export default ContentController;
