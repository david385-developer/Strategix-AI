import express from "express";
import TeamController from "../controllers/team.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/tasks", TeamController.getTasks);
router.post("/tasks", TeamController.createTask);
router.put("/tasks/:id", TeamController.updateTask);
router.delete("/tasks/:id", TeamController.deleteTask);

export default router;
