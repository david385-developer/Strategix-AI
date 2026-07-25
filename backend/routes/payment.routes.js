import express from "express";
import PaymentController from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { enforceBillingOwner } from "../middleware/subscription.middleware.js";

const router = express.Router();

// Public Razorpay webhook handler
router.post("/webhook", PaymentController.webhook);

// Public invoice download page
router.get("/invoices/:invoiceNumber/download", PaymentController.downloadInvoice);

// Protected routes (require billing ownership authentication)
router.use(protect);
router.post("/checkout", enforceBillingOwner, PaymentController.createCheckout);
router.post("/verify", enforceBillingOwner, PaymentController.verifyPayment);

export default router;
