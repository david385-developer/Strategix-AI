import AIService from "../services/ai.service.js";
import BrandProfile from "../models/brandProfile.model.js";
import Workspace from "../models/workspace.model.js";
import { chatPrompt } from "../prompts/chatPrompt.js";
import { chatResponseSchema } from "../utils/responseParser.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import Campaign from "../models/campaign.model.js";
import Content from "../models/content.model.js";
import CalendarEvent from "../models/calendarEvent.model.js";
import Activity from "../models/activity.model.js";

class AIController {
  static async chat(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      if (!workspaceId) {
        throw new ApiError("No active workspace selected", 400);
      }

      const { message, history = [] } = req.body;
      if (!message) {
        throw new ApiError("Message is required", 400);
      }

      const brand = await BrandProfile.findOne({ workspaceId });
      if (!brand) {
        throw new ApiError("Brand profile not configured yet for workspace", 400);
      }

      const [campaigns, content, events, activities] = await Promise.all([
        Campaign.find({ workspaceId }).select("name goal budget spent status reach engagement conversions startDate endDate"),
        Content.find({ workspaceId }).sort({ updatedAt: -1 }).limit(25).select("title platform status scheduledFor campaignId"),
        CalendarEvent.find({ workspaceId }).sort({ date: 1 }).limit(25).select("title platform date status contentId"),
        Activity.find({ workspaceId }).sort({ createdAt: -1 }).limit(15).select("action target type createdAt"),
      ]);
      const prompt = chatPrompt(brand, { workspaceId, campaigns, content, events, recentAnalytics: activities }, history, message);

      const fallbackGenerator = () => {
        return {
          content: "I'm sorry, I'm having trouble connecting to my brain right now. However, based on your brand guidelines, I recommend maintaining a clear and professional tone in your campaign messaging. Let me know if you would like me to try again!",
        };
      };

      const result = await AIService.generateStructuredContent(
        prompt,
        chatResponseSchema,
        fallbackGenerator
      );

      // Increment AI requests usage counter
      await Workspace.findByIdAndUpdate(workspaceId, { $inc: { aiRequestsCount: 1 } });

      return ApiResponse.success(res, "Chat completed successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async getSuggestions(req, res, next) {
    try {
      const workspaceId = req.user.activeWorkspaceId;
      const brand = await BrandProfile.findOne({ workspaceId });

      const suggestions = [
        "Generate a 30-day content calendar for Instagram",
        "Write 5 LinkedIn posts about AI in marketing",
        "Create a campaign strategy for a new product launch",
        "Suggest audience personas for a B2B SaaS product",
        "Draft an email sequence to re-engage inactive users",
        "Generate hashtags for a summer fashion campaign",
      ];

      if (brand) {
        suggestions[1] = `Write 3 LinkedIn posts for ${brand.businessName}`;
        suggestions[2] = `Create a campaign strategy targeting ${brand.targetAudience}`;
        suggestions[3] = `Suggest customer personas in the ${brand.industry} space`;
      }

      return ApiResponse.success(res, "Suggestions retrieved", { suggestions });
    } catch (error) {
      next(error);
    }
  }
}

export default AIController;
