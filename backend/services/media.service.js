import Media from "../models/media.model.js";
import { deleteFromCloudinary } from "../utils/uploadHelper.js";
import ApiError from "../utils/apiError.js";
import NotificationService from "./notification.service.js";

class MediaService {
  static async saveMedia(workspaceId, userId, filename, url, publicId, sizeBytes = 0) {
    const media = new Media({
      filename,
      url,
      publicId,
      uploadedBy: userId,
      workspaceId,
      sizeBytes,
    });
    const saved = await media.save();
    await NotificationService.notifyWorkspace(workspaceId, "Media uploaded", `Media asset "${filename}" was successfully uploaded.`, "system");
    return saved;
  }

  static async getMediaLibrary(workspaceId) {
    return await Media.find({ workspaceId }).sort({ createdAt: -1 });
  }

  static async deleteMedia(mediaId) {
    const media = await Media.findById(mediaId);
    if (!media) {
      throw new ApiError("Media record not found", 404);
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(media.publicId);

    // Delete from database
    await Media.findByIdAndDelete(mediaId);
    await NotificationService.notifyWorkspace(media.workspaceId, "Media deleted", `Media asset "${media.filename}" was deleted.`, "system");
    return true;
  }
}

export default MediaService;
