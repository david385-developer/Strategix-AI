import express from "express";
import SettingsController from "../controllers/settings.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.put("/profile", SettingsController.updateProfile);
router.put("/password", SettingsController.changePassword);

export default router;
