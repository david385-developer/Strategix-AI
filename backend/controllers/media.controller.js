import MediaService from "../services/media.service.js";
import { uploadToCloudinary } from "../utils/uploadHelper.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";

class MediaController {
  static async upload(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }

      if (!req.file) {
        throw new ApiError("Please upload a file", 400);
      }

      // Stream upload to Cloudinary
      const uploadResult = await uploadToCloudinary(req.file.buffer, "strategix");

      // Save media log to DB
      const media = await MediaService.saveMedia(
        workspaceId,
        req.user._id,
        req.file.originalname,
        uploadResult.url,
        uploadResult.publicId,
        uploadResult.bytes || req.file.size || 0
      );

      return ApiResponse.success(res, "File uploaded successfully", { media }, 201);
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
      const mediaList = await MediaService.getMediaLibrary(workspaceId);
      return ApiResponse.success(res, "Media library retrieved", { mediaList });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await MediaService.deleteMedia(req.params.id);
      return ApiResponse.success(res, "Media asset deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default MediaController;
