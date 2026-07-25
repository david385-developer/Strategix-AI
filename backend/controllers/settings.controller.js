import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";

class SettingsController {
  static async updateProfile(req, res, next) {
    try {
      const { name, phone, bio, avatarUrl, notificationPreferences } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (bio !== undefined) user.bio = bio;
      if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
      if (notificationPreferences) {
        user.notificationPreferences = {
          ...user.notificationPreferences.toObject(),
          ...notificationPreferences,
        };
      }

      await user.save();

      return ApiResponse.success(res, "Profile updated successfully", {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          activeWorkspaceId: user.activeWorkspaceId,
          notificationPreferences: user.notificationPreferences,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        throw new ApiError("Please provide current and new passwords", 400);
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        throw new ApiError("User not found", 404);
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new ApiError("Incorrect current password", 400);
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      return ApiResponse.success(res, "Password changed successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default SettingsController;
