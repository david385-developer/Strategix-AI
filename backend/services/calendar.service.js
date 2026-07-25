import CalendarEvent from "../models/calendarEvent.model.js";
import ContentService from "./content.service.js";
import ApiError from "../utils/apiError.js";

class CalendarService {
  static async list(workspaceId, query = {}) {
    const filter = { workspaceId };
    if (query.platform) filter.platform = query.platform;
    if (query.from || query.to) filter.date = { ...(query.from ? { $gte: new Date(query.from) } : {}), ...(query.to ? { $lte: new Date(query.to) } : {}) };
    const events = await CalendarEvent.find(filter).sort({ date: 1 }).populate({ path: "contentId", select: "title campaignId" });
    return events;
  }

  static async move(workspaceId, id, date) {
    if (!date || new Date(date) <= new Date()) throw new ApiError("Scheduled date must be in the future", 400);
    const event = await CalendarEvent.findOne({ _id: id, workspaceId });
    if (!event) throw new ApiError("Calendar event not found", 404);
    const conflict = await ContentService.assertScheduleAvailable(workspaceId, event.platform, date, event.contentId);
    if (event.contentId) await ContentService.updateContent(event.contentId, workspaceId, { scheduledFor: date, status: "scheduled" });
    else await CalendarEvent.updateOne({ _id: id, workspaceId }, { $set: { date } });
    return { warning: conflict, event: await CalendarEvent.findOne({ _id: id, workspaceId }) };
  }
}
export default CalendarService;
