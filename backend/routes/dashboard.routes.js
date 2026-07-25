import express from "express";
import DashboardController from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/overview", DashboardController.getOverview);

export default router;
