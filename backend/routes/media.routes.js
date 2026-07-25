import express from "express";
import MediaController from "../controllers/media.controller.js";
import upload from "../middleware/upload.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { uploadLimiter } from "../middleware/rateLimit.middleware.js";
import { enforceUploadLimit } from "../middleware/subscription.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/upload", enforceUploadLimit, uploadLimiter, upload.single("file"), MediaController.upload);
router.get("/", MediaController.getList);
router.delete("/:id", MediaController.delete);

export default router;
