import Workspace from "../models/workspace.model.js";
import User from "../models/user.model.js";
import BrandProfile from "../models/brandProfile.model.js";
import ApiError from "../utils/apiError.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import NotificationService from "./notification.service.js";

class WorkspaceService {
  static async createWorkspace(ownerId, name, urlSlug) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingSlug = await Workspace.findOne({ urlSlug }).session(session);
      if (existingSlug) {
        throw new ApiError("Workspace URL slug is already taken", 400);
      }

      const workspace = new Workspace({
        name,
        urlSlug,
        ownerId,
      });

      await workspace.save({ session });

      // Create brand profile for new workspace
      const brand = new BrandProfile({
        workspaceId: workspace._id,
        businessName: name,
        industry: "SaaS",
        targetAudience: "General",
        brandTone: "Professional",
      });

      await brand.save({ session });

      await session.commitTransaction();
      session.endSession();

      await NotificationService.notifyWorkspace(workspace._id, "Workspace created", `Welcome to your new workspace "${name}"!`, "system");
      return workspace;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
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
    
    // Format to match TeamMember interface
    return users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      initials: user.name.split(" ").map(n => n[0]).join("").toUpperCase(),
      color: "blue", // Mock visual theme color
      tasksAssigned: 5, // Mock task stats
      tasksCompleted: 3,
      lastActive: "Today",
    }));
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
