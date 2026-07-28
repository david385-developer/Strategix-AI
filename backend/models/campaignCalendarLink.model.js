import mongoose from "mongoose";

const campaignCalendarLinkSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      unique: true,
    },
    googleEventId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CampaignCalendarLink = mongoose.model("CampaignCalendarLink", campaignCalendarLinkSchema);
export default CampaignCalendarLink;
