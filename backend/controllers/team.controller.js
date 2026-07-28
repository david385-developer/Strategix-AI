import Task from "../models/task.model.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import ActivityService from "../services/activity.service.js";

class TeamController {
  static async getTasks(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      const tasks = await Task.find({ workspaceId }).sort({ dueDate: 1 });
      return ApiResponse.success(res, "Tasks list retrieved successfully", {
        tasks: tasks.map((t) => ({
          id: t._id,
          title: t.title,
          status: t.status,
          assignee: t.assignee,
          dueDate: t.dueDate.toISOString().split("T")[0],
          campaign: t.campaign,
          campaignId: t.campaignId,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }
      const { title, assignee, dueDate, campaign, campaignId } = req.body;

      const task = new Task({
        title,
        assignee,
        dueDate: new Date(dueDate),
        campaign,
        campaignId: campaignId || null,
        workspaceId,
        status: "todo",
      });

      await task.save();

      await ActivityService.logAndNotify({
        user: req.user.name,
        initials: req.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
        action: "created task",
        target: task.title,
        type: "task",
        workspaceId,
        notifyTitle: "Task Created",
        notifyDesc: `${req.user.name} created task "${task.title}" and assigned it to ${task.assignee}`,
        notifyIcon: "system"
      });

      return ApiResponse.success(res, "Task created successfully", {
        task: {
          id: task._id,
          title: task.title,
          status: task.status,
          assignee: task.assignee,
          dueDate: task.dueDate.toISOString().split("T")[0],
          campaign: task.campaign,
          campaignId: task.campaignId,
        },
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req, res, next) {
    try {
      const { status, title, assignee, dueDate, campaign, campaignId } = req.body;
      const updateFields = {};
      if (status) updateFields.status = status;
      if (title) updateFields.title = title;
      if (assignee) updateFields.assignee = assignee;
      if (dueDate) updateFields.dueDate = new Date(dueDate);
      if (campaign !== undefined) updateFields.campaign = campaign;
      if (campaignId !== undefined) updateFields.campaignId = campaignId;

      const oldTask = await Task.findById(req.params.id);
      if (!oldTask) {
        throw new ApiError("Task not found", 404);
      }

      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      const actionStr = status === "done" && oldTask.status !== "done" ? "completed task" : "updated task";
      await ActivityService.logAndNotify({
        user: req.user.name,
        initials: req.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
        action: actionStr,
        target: task.title,
        type: "task",
        workspaceId: task.workspaceId,
        notifyTitle: actionStr === "completed task" ? "Task Completed" : "Task Updated",
        notifyDesc: `${req.user.name} ${actionStr} "${task.title}"`,
        notifyIcon: "system"
      });

      return ApiResponse.success(res, "Task updated successfully", {
        task: {
          id: task._id,
          title: task.title,
          status: task.status,
          assignee: task.assignee,
          dueDate: task.dueDate.toISOString().split("T")[0],
          campaign: task.campaign,
          campaignId: task.campaignId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req, res, next) {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) {
        throw new ApiError("Task not found", 404);
      }

      await ActivityService.logAndNotify({
        user: req.user.name,
        initials: req.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
        action: "deleted task",
        target: task.title,
        type: "task",
        workspaceId: task.workspaceId,
        notifyTitle: "Task Deleted",
        notifyDesc: `${req.user.name} deleted task "${task.title}"`,
        notifyIcon: "system"
      });

      return ApiResponse.success(res, "Task deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default TeamController;
