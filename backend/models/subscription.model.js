import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      unique: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    razorpayCustomerId: {
      type: String,
      default: "",
    },
    razorpaySubscriptionId: {
      type: String,
      default: "",
      index: true,
    },
    planId: {
      type: String,
      required: true,
      enum: ["free", "starter", "professional", "enterprise"],
      default: "free",
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    status: {
      type: String,
      required: true,
      enum: [
        "trial",
        "active",
        "pending",
        "paused",
        "cancelled",
        "expired",
        "failed",
        "past_due",
      ],
      default: "active",
    },
    trialStart: {
      type: Date,
    },
    trialEnd: {
      type: Date,
    },
    nextBillingDate: {
      type: Date,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
