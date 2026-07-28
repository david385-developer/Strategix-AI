import CampaignReminder from "../models/campaignReminder.model.js";
import Campaign from "../models/campaign.model.js";
import Workspace from "../models/workspace.model.js";
import User from "../models/user.model.js";
import EmailService from "./email.service.js";

class CampaignReminderService {
  static getTimingsConfig(startDate) {
    const startMs = new Date(startDate).getTime();
    return [
      { type: "7_days_before", offset: 7 * 24 * 60 * 60 * 1000 },
      { type: "3_days_before", offset: 3 * 24 * 60 * 60 * 1000 },
      { type: "1_day_before", offset: 24 * 60 * 60 * 1000 },
      { type: "1_hour_before", offset: 60 * 60 * 1000 },
    ].map(t => ({
      type: t.type,
      time: new Date(startMs - t.offset),
    }));
  }

  static async scheduleReminders(campaign) {
    try {
      const timings = this.getTimingsConfig(campaign.startDate);
      const now = new Date();

      for (const t of timings) {
        if (t.time > now) {
          await CampaignReminder.findOneAndUpdate(
            { campaignId: campaign._id, timingType: t.type },
            {
              $set: {
                workspaceId: campaign.workspaceId,
                scheduledTime: t.time,
                status: "pending",
              },
            },
            { upsert: true, new: true }
          );
        }
      }
      console.log(`Scheduled reminder tasks for campaign: ${campaign.name}`);
    } catch (error) {
      console.error("Failed to schedule reminders:", error.message);
    }
  }

  static async updateReminders(campaign) {
    try {
      const timings = this.getTimingsConfig(campaign.startDate);
      const now = new Date();

      for (const t of timings) {
        if (t.time > now) {
          // Re-enable or update pending reminders
          await CampaignReminder.findOneAndUpdate(
            { campaignId: campaign._id, timingType: t.type },
            {
              $set: {
                workspaceId: campaign.workspaceId,
                scheduledTime: t.time,
                status: "pending",
              },
            },
            { upsert: true, new: true }
          );
        } else {
          // Mark as cancelled if the new timing falls in the past and is still pending
          await CampaignReminder.findOneAndUpdate(
            { campaignId: campaign._id, timingType: t.type, status: "pending" },
            { $set: { status: "cancelled" } }
          );
        }
      }
      console.log(`Updated scheduled reminder tasks for campaign: ${campaign.name}`);
    } catch (error) {
      console.error("Failed to update reminders:", error.message);
    }
  }

  static async cancelReminders(campaignId) {
    try {
      await CampaignReminder.updateMany(
        { campaignId, status: "pending" },
        { $set: { status: "cancelled" } }
      );
      console.log(`Cancelled all pending reminders for campaign: ${campaignId}`);
    } catch (error) {
      console.error("Failed to cancel reminders:", error.message);
    }
  }

  static async sendDueReminders() {
    try {
      const now = new Date();
      const dueReminders = await CampaignReminder.find({
        status: "pending",
        scheduledTime: { $lte: now },
      });

      if (dueReminders.length === 0) return;

      console.log(`Found ${dueReminders.length} campaign reminders to dispatch.`);

      for (const reminder of dueReminders) {
        const campaign = await Campaign.findById(reminder.campaignId);
        // Only send if campaign exists and is active/scheduled
        if (!campaign || (campaign.status !== "active" && campaign.status !== "scheduled")) {
          reminder.status = "cancelled";
          await reminder.save();
          continue;
        }

        const workspace = await Workspace.findById(reminder.workspaceId);
        const owner = await User.findById(campaign.ownerId);
        
        const recipientEmail = owner?.email || workspace?.customerEmail || "member@strategix.ai";
        const recipientName = owner?.name || workspace?.customerName || "Campaign Manager";

        const scheduledDate = new Date(campaign.startDate).toLocaleDateString();
        const scheduledTime = new Date(campaign.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        await EmailService.sendCampaignReminderEmail(recipientEmail, recipientName, {
          campaignName: campaign.name,
          scheduledDate,
          scheduledTime,
          description: campaign.goal,
          workspaceName: workspace?.name,
        });

        reminder.status = "sent";
        await reminder.save();
        console.log(`Sent reminder "${reminder.timingType}" for campaign "${campaign.name}" to ${recipientEmail}`);
      }
    } catch (error) {
      console.error("Error processing due reminders cron job:", error.message);
    }
  }
}

export default CampaignReminderService;
