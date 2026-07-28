import express from "express";
import AuthController from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import validateRequest from "../middleware/validation.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post("/register", authLimiter, registerValidator, validateRequest, AuthController.register);
router.post("/login", authLimiter, loginValidator, validateRequest, AuthController.login);
router.post("/forgot-password", authLimiter, AuthController.forgotPassword);
router.post("/logout", protect, AuthController.logout);
router.post("/refresh", AuthController.refresh);
router.get("/me", protect, AuthController.getCurrentUser);

export default router;
