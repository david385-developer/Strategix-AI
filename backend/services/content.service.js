import Content from "../models/content.model.js";
import Campaign from "../models/campaign.model.js";
import BrandProfile from "../models/brandProfile.model.js";
import CalendarEvent from "../models/calendarEvent.model.js";
import Workspace from "../models/workspace.model.js";
import AIStrategy from "../models/aiStrategy.model.js";
import AIService from "./ai.service.js";
import ActivityService from "./activity.service.js";
import { contentPrompt } from "../prompts/contentPrompt.js";
import { rewritePrompt } from "../prompts/rewritePrompt.js";
import { contentGeneratedSchema } from "../utils/responseParser.js";
import { getPaginationOptions, buildFilterQuery, getPaginationMetadata } from "../utils/pagination.js";
import ApiError from "../utils/apiError.js";
import mongoose from "mongoose";
import NotificationService from "./notification.service.js";

class ContentService {
  static async assertScheduleAvailable(workspaceId, platform, scheduledFor, contentId = null) {
    const minTime = process.env.NODE_ENV === "development" ? Date.now() - 120000 : Date.now(); // 2 minutes grace
    if (!scheduledFor || new Date(scheduledFor).getTime() <= minTime) {
      throw new ApiError("Scheduled date must be in the future", 400);
    }
    const start = new Date(scheduledFor); const end = new Date(start.getTime() + 60 * 60 * 1000);
    const conflict = await Content.findOne({ workspaceId, platform, scheduledFor: { $gte: start, $lt: end }, ...(contentId ? { _id: { $ne: contentId } } : {}) });
    return Boolean(conflict);
  }
  static async syncCalendarEvent(content, session = null) {
    if (content.status === "scheduled" && content.scheduledFor) {
      const eventData = {
        title: content.title,
        date: content.scheduledFor,
        platform: content.platform,
        status: content.status,
        time: content.scheduledFor.toISOString().split("T")[1]?.substring(0, 5) || "09:00",
        contentId: content._id,
        workspaceId: content.workspaceId,
      };

      await CalendarEvent.findOneAndUpdate(
        { contentId: content._id },
        { $set: eventData },
        { upsert: true, session }
      );
    } else {
      // Remove from calendar if status changes from scheduled or scheduledFor is removed
      await CalendarEvent.findOneAndDelete({ contentId: content._id }).session(session);
    }
  }

  static async syncLinkedInPost(content, session = null) {
    if (content.platform && content.platform.toLowerCase() === "linkedin") {
      const LinkedInPost = (await import("../models/linkedinPost.model.js")).default;
      if (content.status === "scheduled") {
        const fullText = [
          content.body,
          Array.isArray(content.hashtags) && content.hashtags.length ? content.hashtags.join(" ") : "",
          content.cta
        ].filter(Boolean).join("\n\n");

        await LinkedInPost.findOneAndUpdate(
          { contentId: content._id },
          {
            workspaceId: content.workspaceId,
            contentId: content._id,
            text: fullText,
            scheduledAt: content.scheduledFor,
            status: "scheduled",
          },
          { upsert: true, new: true, session }
        );
      } else {
        await LinkedInPost.deleteOne({ contentId: content._id }).session(session);
      }
    }
  }

  static async createContent(workspaceId, userObj, contentData) {
    if (contentData.status === "scheduled") await this.assertScheduleAvailable(workspaceId, contentData.platform, contentData.scheduledFor);

    try {
      const content = new Content({
        ...contentData,
        workspaceId,
        createdById: userObj._id,
      });

      await content.save();
      await this.syncCalendarEvent(content);
      await this.syncLinkedInPost(content);

      try {
        const GoogleCalendarService = (await import("./googleCalendar.service.js")).default;
        await GoogleCalendarService.syncContentEvent(userObj._id, content);
      } catch (err) {
        console.error("Google Calendar sync failed during content creation:", err.message);
      }

      const initials = userObj.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
      await ActivityService.logAndNotify({
        user: userObj.name,
        initials,
        action: contentData.status === "scheduled" ? "created and scheduled content" : "created draft content",
        target: content.title,
        type: "content",
        workspaceId,
        notifyTitle: contentData.status === "scheduled" ? "Content Scheduled" : "Content Created",
        notifyDesc: `${userObj.name} ${contentData.status === "scheduled" ? "scheduled content" : "created draft content"} "${content.title}"`,
        notifyIcon: contentData.status === "scheduled" ? "calendar" : "system"
      });

      return content;
    } catch (error) {
      throw error;
    }
  }

  static async getContentItems(workspaceId, queryParams) {
    const filter = buildFilterQuery(queryParams, ["title", "body"]);
    filter.workspaceId = workspaceId;

    if (queryParams.campaign) {
      if (mongoose.Types.ObjectId.isValid(queryParams.campaign)) {
        filter.campaignId = queryParams.campaign;
      } else {
        const Campaign = mongoose.model("Campaign");
        const cmp = await Campaign.findOne({ name: queryParams.campaign, workspaceId });
        if (cmp) {
          filter.campaignId = cmp._id;
        } else {
          filter.campaignId = new mongoose.Types.ObjectId();
        }
      }
    }

    if (queryParams.platform) {
      filter.platform = queryParams.platform;
    }

    if (queryParams.startDate && queryParams.endDate) {
      filter.scheduledFor = {
        $gte: new Date(queryParams.startDate),
        $lte: new Date(queryParams.endDate),
      };
    }

    if (queryParams.favorite === "true") {
      filter.favorite = true;
    }

    const { page, limit, skip, sort } = getPaginationOptions(queryParams);

    const total = await Content.countDocuments(filter);
    const items = await Content.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("campaignId", "name color");

    const formattedItems = items.map((item) => ({
      id: item._id,
      type: item.type,
      platform: item.platform,
      title: item.title,
      body: item.body,
      caption: item.caption,
      hashtags: item.hashtags,
      cta: item.cta,
      status: item.status,
      scheduledFor: item.scheduledFor ? item.scheduledFor.toISOString() : undefined,
      campaign: item.campaignId?.name || "",
      campaignColor: item.campaignId?.color || "",
      campaignId: item.campaignId?._id || "",
      favorite: item.favorite,
    }));

    return {
      contentItems: formattedItems,
      pagination: getPaginationMetadata(total, page, limit),
    };
  }

  static async getContentById(contentId, workspaceId) {
    const item = await Content.findOne({ _id: contentId, workspaceId }).populate("campaignId", "name color");
    if (!item) {
      throw new ApiError("Content item not found", 404);
    }
    return item;
  }

  static async updateContent(contentId, workspaceId, updateData) {
    try {
      if (updateData.status === "scheduled" || updateData.scheduledFor) {
        const existing = await Content.findOne({ _id: contentId, workspaceId });
        if (!existing) throw new ApiError("Content item not found", 404);
        await this.assertScheduleAvailable(workspaceId, updateData.platform || existing.platform, updateData.scheduledFor || existing.scheduledFor, contentId);
      }
      const content = await Content.findOneAndUpdate(
        { _id: contentId, workspaceId },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!content) {
        throw new ApiError("Content item not found", 404);
      }

      await this.syncCalendarEvent(content);
      await this.syncLinkedInPost(content);

      try {
        const GoogleCalendarService = (await import("./googleCalendar.service.js")).default;
        await GoogleCalendarService.syncContentEvent(content.createdById, content);
      } catch (err) {
        console.error("Google Calendar sync failed during content update:", err.message);
      }

      return content;
    } catch (error) {
      throw error;
    }
  }

  static async deleteContent(contentId, workspaceId) {
    try {
      const content = await Content.findOne({ _id: contentId, workspaceId });
      if (!content) {
        throw new ApiError("Content item not found", 404);
      }

      await Content.findByIdAndDelete(contentId);
      await CalendarEvent.findOneAndDelete({ contentId });
      
      const LinkedInPost = (await import("../models/linkedinPost.model.js")).default;
      await LinkedInPost.deleteOne({ contentId });

      try {
        const GoogleCalendarService = (await import("./googleCalendar.service.js")).default;
        await GoogleCalendarService.syncContentEvent(content.createdById, { _id: contentId, status: "draft" });
      } catch (err) {
        console.error("Google Calendar event delete failed during content removal:", err.message);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async generateAIContent(workspaceId, userObj, generationParams) {
    const { campaignId, type, platform, promptText, action = "generate" } = generationParams;

    const brand = await BrandProfile.findOne({ workspaceId });
    if (!brand) {
      throw new ApiError("Brand profile not configured yet for workspace", 400);
    }

    let campaignObj = null;
    let strategyObj = null;
    if (campaignId) {
      campaignObj = await Campaign.findOne({ _id: campaignId, workspaceId });
      if (campaignObj) {
        strategyObj = await AIStrategy.findOne({ campaignId });
      }
    }

    const actionInstruction = action === "generate" ? "Create original content" : `${action} the requested content while preserving the brand voice`;
    let prompt = `${actionInstruction}.\n${contentPrompt(brand, campaignObj, platform || type, promptText)}`;

    if (strategyObj) {
      prompt += `\n\nAdditional Campaign AI Strategy context to guide your generation:
- Target Audience Details: ${strategyObj.targetAudience?.join("; ") || "N/A"}
- Recommended Pillars: ${strategyObj.contentPillars?.join(", ") || "N/A"}
- Funnel Recommendations: TOFU: ${strategyObj.marketingFunnel?.TOFU?.join(", ") || "N/A"}, MOFU: ${strategyObj.marketingFunnel?.MOFU?.join(", ") || "N/A"}, BOFU: ${strategyObj.marketingFunnel?.BOFU?.join(", ") || "N/A"}
`;
    }

    const fallbackGenerator = () => {
      return {
        title: `Unlocking growth: Key strategies for ${brand.businessName}`,
        body: `Are you looking to scale your marketing and grow your business? In the ${brand.industry} industry, standing out requires clear positioning, deep audience understanding, and value-first content creation. Let's make an impact today!`,
        caption: `🚀 Transform your workflow with these game-changing insights for ${brand.businessName}. Read more below!`,
        hashtags: ["marketing", brand.industry.toLowerCase().replace(/\s+/g, ""), "growth", "strategix"],
        cta: `Visit our site at ${brand.website || "strategix.ai"} to learn more!`,
        imagePrompt: "A sleek, modern workplace desk with laptop displaying growth charts, bright lighting, high resolution, photorealistic",
      };
    };

    const contentData = await AIService.generateStructuredContent(
      prompt,
      contentGeneratedSchema,
      fallbackGenerator
    );

    // Save as a draft or scheduled content item
    let status = "draft";
    let scheduledFor = null;

    if (campaignObj) {
      status = "scheduled";
      // Pick a slot: tomorrow at 10 AM, or start date, whichever is later
      const start = new Date(campaignObj.startDate);
      const end = new Date(campaignObj.endDate);
      const now = new Date();
      
      const slot = new Date(Math.max(now.getTime() + 24 * 60 * 60 * 1000, start.getTime()));
      slot.setHours(10, 0, 0, 0);

      if (slot > end) {
        scheduledFor = end;
      } else {
        scheduledFor = slot;
      }
    }

    const content = new Content({
      workspaceId,
      campaignId: campaignId || null,
      title: contentData.title,
      body: contentData.body,
      caption: contentData.caption,
      hashtags: contentData.hashtags,
      cta: contentData.cta,
      imagePrompt: contentData.imagePrompt,
      type: type || platform || "instagram",
      platform: platform || type || "instagram",
      status,
      scheduledFor,
      createdById: userObj._id,
    });

    const saved = await content.save();
    await Workspace.findByIdAndUpdate(workspaceId, { $inc: { aiRequestsCount: 1 } });
    
    // Automatically sync calendar event if scheduled
    const authorName = userObj ? userObj.name : "AI Assistant";
    const authorInitials = userObj ? userObj.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AI";

    if (status === "scheduled") {
      await this.syncCalendarEvent(saved);
      await ActivityService.logAndNotify({
        user: authorName,
        initials: authorInitials,
        action: "generated and scheduled content",
        target: saved.title,
        type: "ai",
        workspaceId,
        notifyTitle: "Content Scheduled",
        notifyDesc: `"${saved.title}" was generated and scheduled for ${scheduledFor.toLocaleDateString()} by ${authorName}`,
        notifyIcon: "calendar"
      });
    } else {
      await ActivityService.logAndNotify({
        user: authorName,
        initials: authorInitials,
        action: "generated draft content",
        target: saved.title,
        type: "ai",
        workspaceId,
        notifyTitle: "Content Generated",
        notifyDesc: `"${saved.title}" was generated as a draft in Content Studio by ${authorName}`,
        notifyIcon: "ai"
      });
    }

    return saved;
  }

  static async rewriteAIContent(contentId, instruction, workspaceId, userObj = null) {
    const content = await Content.findOne({ _id: contentId, workspaceId });
    if (!content) {
      throw new ApiError("Content item not found", 404);
    }

    const brand = await BrandProfile.findOne({ workspaceId: content.workspaceId });
    if (!brand) {
      throw new ApiError("Brand profile not found for workspace", 400);
    }

    const prompt = rewritePrompt(brand, content, instruction);

    const fallbackGenerator = () => {
      return {
        title: `${content.title} (Optimized)`,
        body: `${content.body}\n\nRefined under instructions: "${instruction}"`,
        caption: `${content.caption || ""} (Refined)`,
        hashtags: content.hashtags,
        cta: content.cta,
        imagePrompt: content.imagePrompt,
      };
    };

    const rewrittenData = await AIService.generateStructuredContent(
      prompt,
      contentGeneratedSchema,
      fallbackGenerator
    );

    content.title = rewrittenData.title;
    content.body = rewrittenData.body;
    content.caption = rewrittenData.caption;
    content.hashtags = rewrittenData.hashtags;
    content.cta = rewrittenData.cta;
    content.imagePrompt = rewrittenData.imagePrompt;

    await content.save();
    await Workspace.findByIdAndUpdate(workspaceId, { $inc: { aiRequestsCount: 1 } });

    // Sync changes to calendar if scheduled
    await this.syncCalendarEvent(content);

    // Log Activity and notify workspace
    const authorName = userObj ? userObj.name : "AI Assistant";
    const authorInitials = userObj ? userObj.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AI";
    await ActivityService.logAndNotify({
      user: authorName,
      initials: authorInitials,
      action: "rewrote content",
      target: content.title,
      type: "ai",
      workspaceId,
      notifyTitle: "Content Rewritten by AI",
      notifyDesc: `AI refined "${content.title}" following instruction: "${instruction}"`,
      notifyIcon: "ai"
    });

    return content;
  }
}

export default ContentService;
