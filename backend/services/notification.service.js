import Notification from "../models/notification.model.js";
import ApiError from "../utils/apiError.js";
import User from "../models/user.model.js";

class NotificationService {
  static async notifyWorkspace(workspaceId, title, description, icon = "system") {
    const allowed = ["approval", "mention", "published", "ai", "comment", "system"];
    const verifiedIcon = allowed.includes(icon) ? icon : "system";
    const users = await User.find({ activeWorkspaceId: workspaceId }).select("_id");
    if (users.length) await Notification.insertMany(users.map(({ _id: userId }) => ({ userId, title, description, icon: verifiedIcon })));
  }

  static async notifyUser(userId, title, description, icon = "system") {
    const allowed = ["approval", "mention", "published", "ai", "comment", "system"];
    const verifiedIcon = allowed.includes(icon) ? icon : "system";
    await Notification.create({ userId, title, description, icon: verifiedIcon });
  }
  static async getNotifications(userId) {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    return notifications.map((n) => ({
      id: n._id,
      icon: n.icon,
      title: n.title,
      description: n.description,
      time: n.createdAt.toISOString(),
      read: n.read,
      group: n.group,
    }));
  }

  static async markAsRead(notificationId, userId) {
    const notification = await Notification.findByIdAndUpdate(
      { _id: notificationId, userId },
      { $set: { read: true } },
      { new: true }
    );
    if (!notification) {
      throw new ApiError("Notification not found", 404);
    }
    return notification;
  }

  static async markAllAsRead(userId) {
    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    return true;
  }
}

export default NotificationService;
