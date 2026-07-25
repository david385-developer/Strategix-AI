import express from "express";
import AnalyticsController from "../controllers/analytics.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/overview", AnalyticsController.getOverview);

export default router;
