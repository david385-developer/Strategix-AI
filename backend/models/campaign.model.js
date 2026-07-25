import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
    },
    goal: {
      type: String,
      required: [true, "Campaign goal is required"],
      trim: true,
    },
    budget: {
      type: Number,
      required: true,
      default: 0,
    },
    spent: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "draft", "scheduled", "completed", "paused"],
      default: "draft",
      index: true,
    },
    channel: {
      type: [String],
      required: true,
      default: [],
    },
    progress: {
      type: Number,
      default: 0,
    },
    reach: {
      type: Number,
      default: 0,
    },
    engagement: {
      type: Number,
      default: 0,
    },
    conversions: {
      type: Number,
      default: 0,
    },
    healthScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound and text indexes for search optimizations
campaignSchema.index({ name: "text" });

campaignSchema.pre("validate", function (next) {
  if (this.budget < 0) return next(new Error("Budget cannot be negative"));
  if (this.endDate <= this.startDate) return next(new Error("End date must be after the start date"));
  next();
});

campaignSchema.methods.calculateHealthScore = function () {
  const spend = this.spent || 1;
  const efficiency = (this.conversions || 0) / spend;
  return Math.min(100, Math.max(0, Math.round(efficiency * 45)));
};

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;
