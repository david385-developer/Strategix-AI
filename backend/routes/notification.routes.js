import express from "express";
import NotificationController from "../controllers/notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", NotificationController.getList);
router.put("/:id/read", NotificationController.markRead);
router.put("/read-all", NotificationController.markAllRead);

export default router;
