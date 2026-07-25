import AnalyticsService from "../services/analytics.service.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";

class AnalyticsController {
  static async getOverview(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      const data = await AnalyticsService.getAnalyticsOverview(workspaceId, req.query.range);
      return ApiResponse.success(res, "Analytics data retrieved", data);
    } catch (error) {
      next(error);
    }
  }
}

export default AnalyticsController;
