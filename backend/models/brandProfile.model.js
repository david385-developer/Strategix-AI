import mongoose from "mongoose";

const brandProfileSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
      trim: true,
    },
    targetAudience: {
      type: String,
      required: [true, "Target audience is required"],
      trim: true,
    },
    products: {
      type: String,
      trim: true,
    },
    services: {
      type: String,
      trim: true,
    },
    brandTone: {
      type: String,
      required: [true, "Brand tone is required"],
      trim: true,
    },
    marketingGoals: {
      type: String,
      trim: true,
    },
    preferredPlatforms: {
      type: [String],
      default: [],
    },
    website: {
      type: String,
      trim: true,
    },
    brandGuidelines: {
      type: String,
      trim: true,
    },
    defaultHashtags: {
      type: String,
      trim: true,
    },
    primaryColor: {
      type: String,
      default: "#3B82F6", // Default tailwind blue
    },
  },
  {
    timestamps: true,
  }
);

const BrandProfile = mongoose.model("BrandProfile", brandProfileSchema);
export default BrandProfile;
