import Workspace from "../models/workspace.model.js";
import User from "../models/user.model.js";
import BrandProfile from "../models/brandProfile.model.js";
import Task from "../models/task.model.js";
import ApiError from "../utils/apiError.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import NotificationService from "./notification.service.js";
import EmailService from "./email.service.js";

class WorkspaceService {
  static async createWorkspace(ownerId, name, urlSlug) {
    try {
      const existingSlug = await Workspace.findOne({ urlSlug });
      if (existingSlug) {
        throw new ApiError("Workspace URL slug is already taken", 400);
      }

      const workspace = new Workspace({
        name,
        urlSlug,
        ownerId,
      });

      await workspace.save();

      // Create brand profile for new workspace
      const brand = new BrandProfile({
        workspaceId: workspace._id,
        businessName: name,
        industry: "SaaS",
        targetAudience: "General",
        brandTone: "Professional",
      });

      await brand.save();

      await NotificationService.notifyWorkspace(workspace._id, "Workspace created", `Welcome to your new workspace "${name}"!`, "system");
      return workspace;
    } catch (error) {
      throw error;
    }
  }

  static async getWorkspacesByUser(userId) {
    // Find all workspaces owned or where user belongs
    return await Workspace.find({ ownerId: userId });
  }

  static async getWorkspaceById(workspaceId) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new ApiError("Workspace not found", 404);
    }
    return workspace;
  }

  static async switchWorkspace(userId, workspaceId) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new ApiError("Workspace not found", 404);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    user.activeWorkspaceId = workspace._id;
    await user.save();

    await NotificationService.notifyWorkspace(workspace._id, "Workspace switched", `Switched to workspace: ${workspace.name}`, "system");

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      activeWorkspaceId: user.activeWorkspaceId,
    };
  }

  static async getTeamMembers(workspaceId) {
    // Return all users active in this workspace
    const users = await User.find({ activeWorkspaceId: workspaceId }).select("-password");
    const colors = ["hsl(243 75% 59%)", "hsl(158 64% 52%)", "hsl(38 92% 50%)", "hsl(262 83% 58%)", "hsl(199 89% 48%)"];

    const formattedMembers = [];
    for (const user of users) {
      const tasksAssigned = await Task.countDocuments({ workspaceId, assignee: user.name });
      const tasksCompleted = await Task.countDocuments({ workspaceId, assignee: user.name, status: "done" });

      const now = new Date();
      const diffMs = now - new Date(user.updatedAt);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      let lastActive = "Active now";
      if (diffMins >= 1 && diffMins < 60) lastActive = `${diffMins}m ago`;
      else if (diffHours >= 1 && diffHours < 24) lastActive = `${diffHours}h ago`;
      else if (diffDays >= 1) lastActive = `${diffDays}d ago`;

      const color = colors[Math.abs(user.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length];

      formattedMembers.push({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
        color,
        tasksAssigned,
        tasksCompleted,
        lastActive,
      });
    }

    return formattedMembers;
  }

  static async inviteMember(workspaceId, memberData) {
    const { name, email, role } = memberData;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      user.activeWorkspaceId = workspaceId;
      user.role = role;
      await user.save();
    } else {
      // Create user with dummy password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("StrategixInvitedTempUserPw123!", salt);

      user = new User({
        name,
        email,
        password: hashedPassword,
        role,
        activeWorkspaceId: workspaceId,
      });

      await user.save();
    }

    await NotificationService.notifyWorkspace(workspaceId, "Team member invited", `Team invitation sent to ${name} (${email}) as a ${role}.`, "mention");

    // Trigger team invitation email asynchronously
    Workspace.findById(workspaceId)
      .then(workspace => {
        const workspaceName = workspace ? workspace.name : "Strategix Workspace";
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const inviteLink = `${frontendUrl}/login?inviteEmail=${encodeURIComponent(email)}`;
        return EmailService.sendTeamInvitationEmail(email, "A Strategix Team Member", workspaceName, inviteLink);
      })
      .catch(console.error);

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      initials: user.name.split(" ").map(n => n[0]).join("").toUpperCase(),
      color: "indigo",
      tasksAssigned: 0,
      tasksCompleted: 0,
      lastActive: "Pending Invite",
    };
  }
}

export default WorkspaceService;
