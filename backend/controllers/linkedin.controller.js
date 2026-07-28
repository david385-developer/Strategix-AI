import LinkedInService from "../services/linkedin.service.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import jwt from "jsonwebtoken";

class LinkedInController {
  static async initiateAuth(req, res, next) {
    try {
      const token = req.query.token;
      if (!token) throw new ApiError("Authentication token is required for OAuth callback linkage", 401);

      const authUrl = LinkedInService.getAuthUrl(token);
      return res.redirect(authUrl);
    } catch (error) {
      next(error);
    }
  }

  static async handleCallback(req, res, next) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    try {
      const { code, state, error, error_description } = req.query;

      if (error) {
        console.error("LinkedIn OAuth error returned:", error_description || error);
        return res.redirect(`${frontendUrl}/app/settings?tab=integrations&status=error&message=${encodeURIComponent(error_description || "LinkedIn authentication failed")}`);
      }

      if (!state) {
        throw new ApiError("OAuth state parameter is missing", 400);
      }

      // Parse JWT token from state to identify the user
      let userId;
      try {
        const decoded = jwt.verify(state, process.env.JWT_SECRET || "fallback_secret_key_12345");
        userId = decoded.id;
      } catch (err) {
        console.error("LinkedIn state verification failed:", err.message);
        return res.redirect(`${frontendUrl}/app/settings?tab=integrations&status=error&message=Session%20expired.%20Please%20try%20again.`);
      }

      await LinkedInService.handleCallback(userId, code);
      return res.redirect(`${frontendUrl}/app/settings?tab=integrations&status=success`);
    } catch (error) {
      console.error("LinkedIn callback handler failed:", error);
      return res.redirect(`${frontendUrl}/app/settings?tab=integrations&status=error&message=${encodeURIComponent(error.message || "An unexpected error occurred")}`);
    }
  }

  static async getStatus(req, res, next) {
    try {
      const status = await LinkedInService.getStatus(req.user._id);
      return ApiResponse.success(res, "LinkedIn connection status retrieved", status);
    } catch (error) {
      next(error);
    }
  }

  static async disconnect(req, res, next) {
    try {
      const disconnected = await LinkedInService.disconnect(req.user._id);
      if (!disconnected) throw new ApiError("LinkedIn connection not found", 404);
      return ApiResponse.success(res, "LinkedIn connection disconnected successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default LinkedInController;
