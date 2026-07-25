import express from "express";
import ContentController from "../controllers/content.controller.js";
import { contentValidator } from "../validators/content.validator.js";
import validateRequest from "../middleware/validation.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { aiLimiter } from "../middleware/rateLimit.middleware.js";

import { enforceAICreditsLimit } from "../middleware/subscription.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", contentValidator, validateRequest, ContentController.create);
router.get("/", ContentController.getList);
router.get("/:id", ContentController.getById);
router.put("/:id", contentValidator, validateRequest, ContentController.update);
router.delete("/:id", ContentController.delete);
router.post("/generate", enforceAICreditsLimit, aiLimiter, ContentController.generateAI);
router.post("/:id/rewrite", enforceAICreditsLimit, aiLimiter, ContentController.rewriteAI);

export default router;
