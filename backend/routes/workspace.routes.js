import express from "express";
import WorkspaceController from "../controllers/workspace.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { enforceTeamLimit } from "../middleware/subscription.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", WorkspaceController.create);
router.get("/", WorkspaceController.getUserWorkspaces);
router.get("/details", WorkspaceController.getDetails);
router.post("/switch", WorkspaceController.switchWorkspace);
router.get("/team", WorkspaceController.getTeam);
router.post("/invite", authorize("owner", "admin"), enforceTeamLimit, WorkspaceController.invite);

export default router;
