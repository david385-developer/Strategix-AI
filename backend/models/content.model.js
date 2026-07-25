import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    body: {
      type: String,
      required: [true, "Body is required"],
    },
    caption: {
      type: String,
      trim: true,
    },
    hashtags: {
      type: [String],
      default: [],
    },
    cta: {
      type: String,
      trim: true,
    },
    imagePrompt: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "draft", "published", "approval"],
      default: "draft",
      index: true,
    },
    scheduledFor: {
      type: Date,
      index: true,
    },
    favorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdById: {
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

contentSchema.index({ title: "text" });
contentSchema.index({ workspaceId: 1, scheduledFor: 1 });

const Content = mongoose.model("Content", contentSchema);
export default Content;
