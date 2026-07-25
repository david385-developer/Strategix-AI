import express from "express";
import CampaignController from "../controllers/campaign.controller.js";
import { campaignValidator } from "../validators/campaign.validator.js";
import validateRequest from "../middleware/validation.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { aiLimiter } from "../middleware/rateLimit.middleware.js";

import { enforceCampaignLimit } from "../middleware/subscription.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", enforceCampaignLimit, campaignValidator, validateRequest, CampaignController.create);
router.get("/", CampaignController.getList);
router.get("/:id", CampaignController.getById);
router.put("/:id", campaignValidator, validateRequest, CampaignController.update);
router.delete("/:id", CampaignController.delete);
router.get("/:id/strategy", CampaignController.getAIStrategy);
router.post("/:id/strategy/generate", aiLimiter, CampaignController.generateAIStrategy);

export default router;
