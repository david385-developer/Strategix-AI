import BrandService from "../services/brand.service.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";

class BrandController {
  static async getProfile(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      const brand = await BrandService.getBrandProfile(workspaceId);
      return ApiResponse.success(res, "Brand profile retrieved", { brand });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      const brand = await BrandService.updateBrandProfile(workspaceId, req.body);
      return ApiResponse.success(res, "Brand profile updated successfully", { brand });
    } catch (error) {
      next(error);
    }
  }
}

export default BrandController;
