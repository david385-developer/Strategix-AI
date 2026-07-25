import express from "express";
import AIController from "../controllers/ai.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { aiLimiter } from "../middleware/rateLimit.middleware.js";
import { enforceAICreditsLimit } from "../middleware/subscription.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/chat", enforceAICreditsLimit, aiLimiter, AIController.chat);
router.get("/suggestions", AIController.getSuggestions);

export default router;
export { router as aiRoutes };
