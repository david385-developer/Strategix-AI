import mongoose from "mongoose";

const contentCalendarLinkSchema = new mongoose.Schema(
  {
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
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

const ContentCalendarLink = mongoose.model("ContentCalendarLink", contentCalendarLinkSchema);
export default ContentCalendarLink;
