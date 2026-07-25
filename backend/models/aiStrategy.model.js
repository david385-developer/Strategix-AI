import mongoose from "mongoose";

const aiStrategySchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      unique: true,
      index: true,
    },
    objective: {
      type: String,
      required: true,
    },
    marketingObjectives: {
      type: [String],
      default: [],
    },
    targetAudience: {
      type: [String],
      default: [],
    },
    customerPersonas: {
      type: [String],
      default: [],
    },
    targetAudiencePoints: {
      type: [String],
      default: [],
    },
    funnelPoints: {
      type: [String],
      default: [],
    },
    postingSchedulePoints: {
      type: [String],
      default: [],
    },
    budgetPoints: {
      type: [String],
      default: [],
    },
    kpiPoints: {
      type: [String],
      default: [],
    },
    contentPillars: {
      type: [String],
      default: [],
    },
    marketingFunnel: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    postingSchedule: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    budgetRecommendations: {
      type: [String],
      default: [],
    },
    kpiRecommendations: {
      type: [String],
      default: [],
    },
    marketingRisks: {
      type: [String],
      default: [],
    },
    successMetrics: {
      type: [String],
      default: [],
    },
    predictedReach: {
      type: Number,
      default: 0,
    },
    predictedEngagement: {
      type: Number,
      default: 0,
    },
    predictedSignups: {
      type: Number,
      default: 0,
    },
    predictedShares: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const AIStrategy = mongoose.model("AIStrategy", aiStrategySchema);
export default AIStrategy;
