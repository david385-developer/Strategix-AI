import Campaign from "../models/campaign.model.js";
import Content from "../models/content.model.js";
import AIStrategy from "../models/aiStrategy.model.js";
import CalendarEvent from "../models/calendarEvent.model.js";
import BrandProfile from "../models/brandProfile.model.js";
import AIService from "./ai.service.js";
import NotificationService from "./notification.service.js";
import ActivityService from "./activity.service.js";
import { campaignStrategyPrompt } from "../prompts/campaignStrategyPrompt.js";
import { campaignStrategySchema } from "../utils/responseParser.js";
import { getPaginationOptions, buildFilterQuery, getPaginationMetadata } from "../utils/pagination.js";
import ApiError from "../utils/apiError.js";
import mongoose from "mongoose";
import GoogleCalendarService from "./googleCalendar.service.js";
import CampaignReminderService from "./campaignReminder.service.js";
import EmailService from "./email.service.js";

class CampaignService {
  static validateCampaignData(data) {
    if (data.budget !== undefined && data.budget < 0) {
      throw new ApiError("Budget cannot be negative", 400);
    }
    if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
      throw new ApiError("End date must be after the start date", 400);
    }
  }

  static async automateCampaignStatus(c) {
    if (!c) return;
    const now = new Date();
    if (c.status !== "draft" && c.status !== "paused") {
      const start = new Date(c.startDate);
      const end = new Date(c.endDate);
      const prevStatus = c.status;
      const prevProgress = c.progress;

      if (now < start) {
        c.status = "scheduled";
      } else if (now >= start && now <= end) {
        c.status = "active";
      } else {
        c.status = "completed";
      }

      const duration = end - start;
      if (duration > 0) {
        c.progress = Math.min(100, Math.max(0, Math.round(((now - start) / duration) * 100)));
      } else {
        c.progress = 100;
      }

      if (c.status !== prevStatus || c.progress !== prevProgress) {
        await Campaign.findByIdAndUpdate(c._id, { $set: { status: c.status, progress: c.progress } });
      }
    }
  }

  static formatStrategyForFrontend(strategy) {
    if (!strategy) return null;
    return {
      id: strategy._id,
      campaignId: strategy.campaignId,
      objective: strategy.objective,
      audience: strategy.targetAudiencePoints?.join("\n") || "",
      funnel: strategy.funnelPoints?.join("\n") || "",
      schedule: strategy.postingSchedulePoints?.join("\n") || "",
      budget: strategy.budgetPoints?.join("\n") || "",
      kpis: strategy.kpiPoints?.join("\n") || "",
      pillars: strategy.contentPillars?.join(", ") || "",
      predictedReach: strategy.predictedReach,
      predictedEngagement: strategy.predictedEngagement,
      predictedSignups: strategy.predictedSignups,
      predictedShares: strategy.predictedShares,
      marketingObjectives: strategy.marketingObjectives,
      targetAudience: strategy.targetAudience,
      customerPersonas: strategy.customerPersonas,
      marketingFunnel: strategy.marketingFunnel,
      postingSchedule: strategy.postingSchedule,
      budgetRecommendations: strategy.budgetRecommendations,
      kpiRecommendations: strategy.kpiRecommendations,
      marketingRisks: strategy.marketingRisks,
      successMetrics: strategy.successMetrics,
    };
  }

  static async createCampaign(workspaceId, userObj, campaignData) {
    CampaignService.validateCampaignData(campaignData);
    const campaign = new Campaign({
      ...campaignData,
      workspaceId,
      ownerId: userObj._id,
    });
    const saved = await campaign.save();

    // Trigger Google Calendar sync and schedule reminder emails
    await GoogleCalendarService.createEvent(userObj._id, saved);
    await CampaignReminderService.scheduleReminders(saved);

    // Trigger Campaign Created Email
    EmailService.sendCampaignCreatedEmail(userObj.email, userObj.name, saved.name).catch(console.error);

    await ActivityService.logAndNotify({
      user: userObj.name,
      initials: userObj.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
      action: "created campaign",
      target: saved.name,
      type: "campaign",
      workspaceId,
      notifyTitle: "Campaign Created",
      notifyDesc: `${userObj.name} created campaign "${saved.name}"`,
      notifyIcon: "system"
    });

    return saved;
  }

  static async getCampaigns(workspaceId, queryParams) {
    const filter = buildFilterQuery(queryParams, ["name", "goal"]);
    filter.workspaceId = workspaceId;

    const { page, limit, skip, sort } = getPaginationOptions(queryParams);

    const total = await Campaign.countDocuments(filter);
    const campaigns = await Campaign.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("ownerId", "name");

    const formattedCampaigns = [];
    for (const c of campaigns) {
      await CampaignService.automateCampaignStatus(c);
      formattedCampaigns.push({
        id: c._id,
        name: c.name,
        status: c.status,
        channel: c.channel,
        budget: c.budget,
        spent: c.spent,
        startDate: c.startDate.toISOString().split("T")[0],
        endDate: c.endDate.toISOString().split("T")[0],
        progress: c.progress,
        goal: c.goal,
        reach: c.reach,
        engagement: c.engagement,
        conversions: c.conversions,
        color: c.color,
        owner: { name: c.ownerId?.name || "Strategix Member", initials: (c.ownerId?.name || "SM").split(" ").map(n => n[0]).join("") },
      });
    }

    return {
      campaigns: formattedCampaigns,
      pagination: getPaginationMetadata(total, page, limit),
    };
  }

  static async getCampaignById(campaignId, workspaceId) {
    const campaign = await Campaign.findOne({ _id: campaignId, workspaceId }).populate("ownerId", "name");
    if (!campaign) {
      throw new ApiError("Campaign not found", 404);
    }
    await CampaignService.automateCampaignStatus(campaign);
    return {
      id: campaign._id,
      name: campaign.name,
      status: campaign.status,
      channel: campaign.channel,
      budget: campaign.budget,
      spent: campaign.spent,
      startDate: campaign.startDate.toISOString().split("T")[0],
      endDate: campaign.endDate.toISOString().split("T")[0],
      progress: campaign.progress,
      goal: campaign.goal,
      reach: campaign.reach,
      engagement: campaign.engagement,
      conversions: campaign.conversions,
      color: campaign.color,
      owner: { name: campaign.ownerId?.name || "Strategix Member", initials: (campaign.ownerId?.name || "SM").split(" ").map(n => n[0]).join("") },
    };
  }

  static async updateCampaign(campaignId, workspaceId, updateData, userObj) {
    CampaignService.validateCampaignData(updateData);
    const campaign = await Campaign.findOneAndUpdate(
      { _id: campaignId, workspaceId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("ownerId", "name");
    if (!campaign) {
      throw new ApiError("Campaign not found", 404);
    }
    await CampaignService.automateCampaignStatus(campaign);

    // Sync updates with Google Calendar and adjust reminder schedules
    await GoogleCalendarService.updateEvent(userObj._id, campaign);
    await CampaignReminderService.updateReminders(campaign);

    // Trigger Campaign Updated Email
    EmailService.sendCampaignUpdatedEmail(userObj.email, userObj.name, campaign.name).catch(console.error);

    return {
      id: campaign._id,
      name: campaign.name,
      status: campaign.status,
      channel: campaign.channel,
      budget: campaign.budget,
      spent: campaign.spent,
      startDate: campaign.startDate.toISOString().split("T")[0],
      endDate: campaign.endDate.toISOString().split("T")[0],
      progress: campaign.progress,
      goal: campaign.goal,
      reach: campaign.reach,
      engagement: campaign.engagement,
      conversions: campaign.conversions,
      color: campaign.color,
      owner: { name: campaign.ownerId?.name || "Strategix Member", initials: (campaign.ownerId?.name || "SM").split(" ").map(n => n[0]).join("") },
    };
  }

  static async deleteCampaign(campaignId, workspaceId, userObj) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const campaign = await Campaign.findOne({ _id: campaignId, workspaceId }).session(session);
      if (!campaign) {
        throw new ApiError("Campaign not found", 404);
      }

      // 1. Find all content items under this campaign
      const contentItems = await Content.find({ campaignId }).session(session);
      const contentIds = contentItems.map(item => item._id);

      // 2. Delete calendar events for those contents
      await CalendarEvent.deleteMany({ contentId: { $in: contentIds } }).session(session);

      // 3. Delete content items themselves
      await Content.deleteMany({ campaignId }).session(session);

      // 4. Delete AI Strategy
      await AIStrategy.findOneAndDelete({ campaignId }).session(session);

      // 5. Delete Campaign itself
      await Campaign.findByIdAndDelete(campaignId).session(session);

      await session.commitTransaction();
      session.endSession();

      // Trigger calendar deletion and reminder cancellations post-transaction commit
      await GoogleCalendarService.deleteEvent(userObj._id, campaignId);
      await CampaignReminderService.cancelReminders(campaignId);

      return true;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async getAIStrategy(campaignId, workspaceId) {
    const campaign = await Campaign.findOne({ _id: campaignId, workspaceId }).select("_id");
    if (!campaign) throw new ApiError("Campaign not found", 404);
    const strategy = await AIStrategy.findOne({ campaignId });
    if (!strategy) return null;
    return CampaignService.formatStrategyForFrontend(strategy);
  }

  static async generateAIStrategy(campaignId, workspaceId, userObj = null) {
    const campaign = await Campaign.findOne({ _id: campaignId, workspaceId });
    if (!campaign) {
      throw new ApiError("Campaign not found", 404);
    }

    const brand = await BrandProfile.findOne({ workspaceId: campaign.workspaceId });
    if (!brand) {
      throw new ApiError("Brand profile not configured yet for workspace", 400);
    }

    const prompt = campaignStrategyPrompt(brand, campaign);

    const fallbackGenerator = () => {
      return {
        objective: `Maximize awareness and conversion for ${campaign.name} by targeting the ${brand.industry} market.`,
        targetAudiencePoints: [
          "Demographics: Professionals interested in marketing and automation tools.",
          "Behavioral: SMEs looking to scale their digital content production.",
          "Customer Persona: Early adopters of productivity SaaS platforms."
        ],
        funnelPoints: [
          "TOFU (Top of Funnel): Educate target audience with values-oriented blog posts and social content.",
          "MOFU (Middle of Funnel): Address trust points with customer success studies and testimonials.",
          "BOFU (Bottom of Funnel): Drive signups with direct CTAs, free trials, and product demos."
        ],
        postingSchedulePoints: [
          "Schedule: Publish 3 main posts per week on LinkedIn and Instagram.",
          "Best Time: Send 1 newsletter email update every Thursday morning."
        ],
        budgetPoints: [
          "Allocation: Allocate 40% of budget to paid search and retargeting ads.",
          "Mitigation: Reserve 30% for content production and creation assets."
        ],
        kpiPoints: [
          "Primary: Impressions and click-through rates.",
          "Success Metrics: Conversion rates on signup landing pages.",
          "Marketing Risks: User retention during trials."
        ],
        contentPillars: [
          "Productivity Hacks & Tips",
          "Success Stories / Proof of Concept",
          "Feature Spotlights & Demos"
        ],
        predictedReach: Math.round((campaign.budget || 1000) * 12),
        predictedEngagement: Math.round((campaign.budget || 1000) * 2.5),
        predictedSignups: Math.round((campaign.budget || 1000) * 0.35),
        predictedShares: Math.round((campaign.budget || 1000) * 0.15)
        ,marketingObjectives: [`Increase qualified awareness for ${campaign.name}`, "Generate measurable demand", "Improve conversion efficiency"],
        targetAudience: [`${brand.targetAudience || "Decision-makers"} in ${brand.industry}`],
        customerPersonas: ["Growth-minded marketing leader seeking scalable execution", "Founder balancing limited budget with ambitious growth"],
        marketingFunnel: { TOFU: ["Educational short-form content"], MOFU: ["Proof-led guides and comparisons"], BOFU: ["Demo, trial, and retargeting CTAs"] },
        postingSchedule: { weeklyCadence: "3-5 posts per week", channels: campaign.channel.map(channel => ({ channel, days: ["Tue", "Thu"], time: "10:00" })) },
        budgetRecommendations: ["40% acquisition, 30% content, 20% retargeting, 10% testing"],
        kpiRecommendations: ["CTR >= 2.5%", "Conversion rate >= 3%", "CPA <= 20% of customer value"],
        marketingRisks: ["Creative fatigue — refresh winning variants every two weeks"],
        successMetrics: ["Reach >= 80% of forecast", "Conversions >= 3% of qualified clicks"]
      };
    };

    const strategyData = await AIService.generateStructuredContent(
      prompt,
      campaignStrategySchema,
      fallbackGenerator
    );

    // Update AIStrategy record in DB
    const strategy = await AIStrategy.findOneAndUpdate(
      { campaignId },
      { $set: strategyData },
      { new: true, upsert: true }
    );

    // Update Campaign with predicted metrics
    campaign.reach = strategy.predictedReach;
    campaign.engagement = strategy.predictedEngagement;
    campaign.conversions = strategy.predictedSignups;
    campaign.healthScore = campaign.calculateHealthScore();
    await campaign.save();

    const authorName = userObj ? userObj.name : "AI Assistant";
    const authorInitials = userObj ? userObj.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AI";
    await ActivityService.logAndNotify({
      user: authorName,
      initials: authorInitials,
      action: "generated AI strategy for",
      target: campaign.name,
      type: "ai",
      workspaceId,
      notifyTitle: "AI Strategy Generated",
      notifyDesc: `AI strategy has been generated for campaign "${campaign.name}"`,
      notifyIcon: "ai"
    });

    return {
      campaign,
      strategy: CampaignService.formatStrategyForFrontend(strategy),
    };
  }

  static async emailCampaignDetails(campaignId, workspaceId, userObj) {
    const campaign = await Campaign.findOne({ _id: campaignId, workspaceId });
    if (!campaign) throw new ApiError("Campaign not found", 404);

    const strategy = await AIStrategy.findOne({ campaignId });

    // Send email using new template
    await EmailService.sendCampaignDetailsReportEmail(userObj.email, userObj.name, campaign, strategy);

    return {
      success: true,
      message: "Campaign details email sent"
    };
  }
}

export default CampaignService;
