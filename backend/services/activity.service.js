import Activity from "../models/activity.model.js";
import NotificationService from "./notification.service.js";

class ActivityService {
  static async logAndNotify({
    user = "System",
    initials = "SYS",
    action,
    target,
    type,
    workspaceId,
    notify = true,
    notifyTitle = "",
    notifyDesc = "",
    notifyIcon = "system"
  }) {
    try {
      const activity = new Activity({
        user,
        initials,
        action,
        target,
        type,
        workspaceId,
      });
      await activity.save();

      if (notify) {
        const title = notifyTitle || `${type.charAt(0).toUpperCase() + type.slice(1)} ${action}`;
        const description = notifyDesc || `${user} ${action} "${target}"`;
        await NotificationService.notifyWorkspace(workspaceId, title, description, notifyIcon || type);
      }

      return activity;
    } catch (error) {
      console.error("Failed to log activity and notify:", error);
    }
  }
}

export default ActivityService;
