import mongoose from "mongoose";

const campaignReminderSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    timingType: {
      type: String,
      enum: ["7_days_before", "3_days_before", "1_day_before", "1_hour_before"],
      required: true,
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate timing schedules for the same campaign
campaignReminderSchema.index({ campaignId: 1, timingType: 1 }, { unique: true });

const CampaignReminder = mongoose.model("CampaignReminder", campaignReminderSchema);
export default CampaignReminder;
