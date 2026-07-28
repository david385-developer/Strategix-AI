import GoogleCalendarService from "../services/googleCalendar.service.js";
import { verifyAccessToken } from "../utils/jwtHelper.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";

class IntegrationController {
  static async initiateGoogleAuth(req, res, next) {
    try {
      const token = req.query.token;
      if (!token) {
        throw new ApiError("Authentication token is required as a query parameter", 401);
      }

      const decoded = verifyAccessToken(token);
      if (!decoded) {
        throw new ApiError("Invalid or expired token", 401);
      }

      // Ensure user exists
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new ApiError("User not found", 404);
      }

      let authUrl = GoogleCalendarService.getAuthUrl();
      // Append state parameter containing the token so callback can identify the user
      authUrl += `&state=${encodeURIComponent(token)}`;

      return res.redirect(authUrl);
    } catch (error) {
      next(error);
    }
  }

  static async handleGoogleCallback(req, res, next) {
    try {
      const { code, state } = req.query;
      if (!state) {
        throw new ApiError("OAuth state parameter is missing", 400);
      }

      const decoded = verifyAccessToken(state);
      if (!decoded) {
        throw new ApiError("OAuth session expired or invalid", 401);
      }

      await GoogleCalendarService.handleCallback(decoded.id, code);

      // Redirect back to frontend settings integrations tab
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(`${frontendUrl}/app/settings?tab=integrations&status=success`);
    } catch (error) {
      console.error("Google OAuth callback error:", error.message);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(`${frontendUrl}/app/settings?tab=integrations&status=error&message=${encodeURIComponent(error.message)}`);
    }
  }

  static async getGoogleStatus(req, res, next) {
    try {
      const status = await GoogleCalendarService.getStatus(req.user._id);
      return ApiResponse.success(res, "Google status retrieved", status);
    } catch (error) {
      next(error);
    }
  }

  static async disconnectGoogle(req, res, next) {
    try {
      const success = await GoogleCalendarService.disconnect(req.user._id);
      if (!success) {
        throw new ApiError("Google Calendar connection not found", 404);
      }
      return ApiResponse.success(res, "Google Calendar disconnected successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default IntegrationController;
