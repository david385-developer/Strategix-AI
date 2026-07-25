import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import CalendarController from "../controllers/calendar.controller.js";
const router = express.Router();
router.use(protect);
router.get("/", CalendarController.list);
router.patch("/:id", CalendarController.move);
export default router;
