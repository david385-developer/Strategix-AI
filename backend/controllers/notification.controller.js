import NotificationService from "../services/notification.service.js";
import ApiResponse from "../utils/apiResponse.js";

class NotificationController {
  static async getList(req, res, next) {
    try {
      const list = await NotificationService.getNotifications(req.user._id);
      return ApiResponse.success(res, "Notifications retrieved", { list });
    } catch (error) {
      next(error);
    }
  }

  static async markRead(req, res, next) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id, req.user._id);
      return ApiResponse.success(res, "Notification marked as read", { notification });
    } catch (error) {
      next(error);
    }
  }

  static async markAllRead(req, res, next) {
    try {
      await NotificationService.markAllAsRead(req.user._id);
      return ApiResponse.success(res, "All notifications marked as read");
    } catch (error) {
      next(error);
    }
  }
}

export default NotificationController;
