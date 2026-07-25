import CalendarService from "../services/calendar.service.js";
import ApiResponse from "../utils/apiResponse.js";
class CalendarController {
  static async list(req, res, next) { try { return ApiResponse.success(res, "Calendar retrieved", { events: await CalendarService.list(req.user.activeWorkspaceId, req.query) }); } catch (e) { next(e); } }
  static async move(req, res, next) { try { return ApiResponse.success(res, "Calendar event moved", await CalendarService.move(req.user.activeWorkspaceId, req.params.id, req.body.date)); } catch (e) { next(e); } }
}
export default CalendarController;
