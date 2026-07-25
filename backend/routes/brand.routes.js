import express from "express";
import BrandController from "../controllers/brand.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", BrandController.getProfile);
router.put("/", BrandController.updateProfile);

export default router;
