import mongoose from "mongoose";

const linkedinPostSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    mediaUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["scheduled", "published", "failed"],
      default: "scheduled",
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    publishedAt: {
      type: Date,
    },
    errorReason: {
      type: String,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    reactions: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    lastSyncedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for cron worker post delivery scans
linkedinPostSchema.index({ status: 1, scheduledAt: 1 });

const LinkedInPost = mongoose.model("LinkedInPost", linkedinPostSchema);

export default LinkedInPost;
