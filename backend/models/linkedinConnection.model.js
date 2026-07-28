import mongoose from "mongoose";

const linkedinConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    linkedinId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Enforce single connection per user-account mapping
linkedinConnectionSchema.index({ userId: 1, linkedinId: 1 }, { unique: true });

const LinkedInConnection = mongoose.model("LinkedInConnection", linkedinConnectionSchema);

export default LinkedInConnection;
