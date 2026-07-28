import AuthService from "../services/auth.service.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import EmailService from "../services/email.service.js";
import User from "../models/user.model.js";

class AuthController {
  static async register(req, res, next) {
    try {
      const result = await AuthService.registerUser(req.body);
      
      // Save refresh token in HttpOnly cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return ApiResponse.success(res, "Registration successful", {
        user: result.user,
        token: result.accessToken,
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.loginUser(email, password);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return ApiResponse.success(res, "Login successful", {
        user: result.user,
        token: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      if (req.user) {
        await AuthService.logoutUser(req.user._id);
      }
      res.clearCookie("refreshToken");
      return ApiResponse.success(res, "Logout successful");
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req, res, next) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        throw new ApiError("Refresh token missing", 400);
      }

      const result = await AuthService.refreshTokens(token);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return ApiResponse.success(res, "Tokens refreshed", {
        token: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        throw new ApiError("Email is required", 400);
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new ApiError("User with this email does not exist", 404);
      }

      const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

      console.log("==========================================");
      console.log("PASSWORD RESET REQUESTED");
      console.log(`Email: ${email}`);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      console.log(`Reset Link: ${frontendUrl}/login?resetToken=${resetToken}`);
      console.log("==========================================");

      const resetLink = `${frontendUrl}/login?resetToken=${resetToken}`;
      await EmailService.sendPasswordResetEmail(email, user.name, resetLink);

      return ApiResponse.success(res, "Password reset link sent to your email");
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(req, res, next) {
    try {
      if (!req.user) {
        throw new ApiError("User context not found", 401);
      }
      return ApiResponse.success(res, "Current user retrieved", {
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
