import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["owner", "admin", "editor", "viewer"],
      default: "viewer",
    },
    phone: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    activeWorkspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
    notificationPreferences: {
      emailApprovals: { type: Boolean, default: true },
      emailMentions: { type: Boolean, default: true },
      emailAi: { type: Boolean, default: false },
      emailWeekly: { type: Boolean, default: true },
      pushApprovals: { type: Boolean, default: true },
      pushMentions: { type: Boolean, default: false },
      pushAi: { type: Boolean, default: true },
    },
    refreshToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
