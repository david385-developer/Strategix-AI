import WorkspaceService from "../services/workspace.service.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";

class WorkspaceController {
  static async create(req, res, next) {
    try {
      const { name, urlSlug } = req.body;
      const workspace = await WorkspaceService.createWorkspace(req.user._id, name, urlSlug);
      return ApiResponse.success(res, "Workspace created successfully", { workspace }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getUserWorkspaces(req, res, next) {
    try {
      const workspaces = await WorkspaceService.getWorkspacesByUser(req.user._id);
      return ApiResponse.success(res, "Workspaces retrieved successfully", { workspaces });
    } catch (error) {
      next(error);
    }
  }

  static async getDetails(req, res, next) {
    try {
      const workspaceId = req.params.id || req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      const workspace = await WorkspaceService.getWorkspaceById(workspaceId);
      return ApiResponse.success(res, "Workspace details retrieved", { workspace });
    } catch (error) {
      next(error);
    }
  }

  static async switchWorkspace(req, res, next) {
    try {
      const { workspaceId } = req.body;
      const updatedUser = await WorkspaceService.switchWorkspace(req.user._id, workspaceId);
      return ApiResponse.success(res, "Workspace switched successfully", { user: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  static async getTeam(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      const members = await WorkspaceService.getTeamMembers(workspaceId);
      return ApiResponse.success(res, "Team members list retrieved", { members });
    } catch (error) {
      next(error);
    }
  }

  static async invite(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      const member = await WorkspaceService.inviteMember(workspaceId, req.body);
      return ApiResponse.success(res, "Invitation sent successfully", { member }, 201);
    } catch (error) {
      next(error);
    }
  }
}

export default WorkspaceController;
