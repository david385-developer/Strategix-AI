import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
    },
    urlSlug: {
      type: String,
      required: [true, "URL slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
    },
    // Billing and Subscription Details
    razorpayCustomerId: {
      type: String,
      default: "",
    },
    customerName: {
      type: String,
      default: "",
    },
    customerEmail: {
      type: String,
      default: "",
    },
    customerPhone: {
      type: String,
      default: "",
    },
    billingAddress: {
      type: String,
      default: "",
    },
    gstNumber: {
      type: String,
      default: "",
    },
    companyName: {
      type: String,
      default: "",
    },
    // Usage limits tracking counters
    aiRequestsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Workspace = mongoose.model("Workspace", workspaceSchema);
export default Workspace;
