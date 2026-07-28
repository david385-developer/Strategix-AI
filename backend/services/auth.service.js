import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Workspace from "../models/workspace.model.js";
import BrandProfile from "../models/brandProfile.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtHelper.js";
import ApiError from "../utils/apiError.js";
import mongoose from "mongoose";
import EmailService from "./email.service.js";

class AuthService {
  static async registerUser(userData) {
    try {
      const { name, email, password } = userData;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ApiError("Email already in use", 400);
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: "owner", // First user is the owner
      });

      await user.save();

      // Create default workspace
      const workspace = new Workspace({
        name: `${name}'s Workspace`,
        urlSlug: `workspace-${user._id.toString().substring(18)}`,
        ownerId: user._id,
      });

      await workspace.save();

      // Create default brand profile
      const brand = new BrandProfile({
        workspaceId: workspace._id,
        businessName: `${name} Brand`,
        industry: "SaaS",
        targetAudience: "Tech Enthusiasts",
        brandTone: "Professional",
      });

      await brand.save();

      // Update user's active workspace
      user.activeWorkspaceId = workspace._id;
      await user.save();

      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      user.refreshToken = refreshToken;
      await user.save();

      // Trigger asynchronous Welcome Email dispatch
      EmailService.sendWelcomeEmail(user.email, user.name).catch(console.error);

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          activeWorkspaceId: user.activeWorkspaceId,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  static async loginUser(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError("Invalid credentials", 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        activeWorkspaceId: user.activeWorkspaceId,
      },
      accessToken,
      refreshToken,
    };
  }

  static async logoutUser(userId) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = "";
      await user.save();
    }
    return true;
  }

  static async refreshTokens(token) {
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      throw new ApiError("Refresh token is invalid or expired", 401);
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      throw new ApiError("Refresh token mismatch", 401);
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}

export default AuthService;
