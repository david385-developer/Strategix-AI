import express from "express";
import IntegrationController from "../controllers/integration.controller.js";
import LinkedInController from "../controllers/linkedin.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes for OAuth flow redirection
router.get("/google/auth", IntegrationController.initiateGoogleAuth);
router.get("/google/callback", IntegrationController.handleGoogleCallback);
router.get("/linkedin/auth", LinkedInController.initiateAuth);
router.get("/linkedin/callback", LinkedInController.handleCallback);

// Protected routes requiring authentication header
router.use(protect);
router.get("/google/status", IntegrationController.getGoogleStatus);
router.post("/google/disconnect", IntegrationController.disconnectGoogle);
router.get("/linkedin/status", LinkedInController.getStatus);
router.post("/linkedin/disconnect", LinkedInController.disconnect);

export default router;
