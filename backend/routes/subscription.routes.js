import express from "express";
import SubscriptionController from "../controllers/subscription.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { enforceBillingOwner } from "../middleware/subscription.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/billing", SubscriptionController.getBilling);
router.put("/billing", enforceBillingOwner, SubscriptionController.updateBilling);
router.post("/cancel", enforceBillingOwner, SubscriptionController.cancel);
router.post("/pause", enforceBillingOwner, SubscriptionController.pause);
router.post("/resume", enforceBillingOwner, SubscriptionController.resume);
router.post("/manual-upgrade", enforceBillingOwner, SubscriptionController.manualUpgrade);

export default router;
