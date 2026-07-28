import mongoose from "mongoose";

const googleConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    expiryDate: {
      type: Number, // Epoch timestamp in ms
    },
    email: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const GoogleConnection = mongoose.model("GoogleConnection", googleConnectionSchema);
export default GoogleConnection;
