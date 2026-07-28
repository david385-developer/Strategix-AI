import axios from "axios";
import GoogleConnection from "../models/googleConnection.model.js";
import CampaignCalendarLink from "../models/campaignCalendarLink.model.js";
import ContentCalendarLink from "../models/contentCalendarLink.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";

class GoogleCalendarService {
  static getOAuthClientConfig() {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/integrations/google/callback",
    };
  }

  static isConfigured() {
    const config = this.getOAuthClientConfig();
    return !!(config.clientId && config.clientSecret);
  }

  static getAuthUrl() {
    if (!this.isConfigured()) {
      const config = this.getOAuthClientConfig();
      return `${config.redirectUri}?code=sandbox_mock_code`;
    }

    const config = this.getOAuthClientConfig();
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/userinfo.email",
    ];

    return `https://accounts.google.com/o/oauth2/v2/auth?` + 
      `client_id=${encodeURIComponent(config.clientId)}&` +
      `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes.join(" "))}&` +
      `access_type=offline&` +
      `prompt=consent`;
  }

  static async handleCallback(userId, code) {
    if (!code) {
      throw new ApiError("Authorization code is required", 400);
    }

    // 1. Sandbox Simulated Flow
    if (!this.isConfigured() || code === "sandbox_mock_code") {
      const email = "sandbox-user@gmail.com";
      const connection = await GoogleConnection.findOneAndUpdate(
        { userId },
        {
          $set: {
            accessToken: "sandbox_mock_access_token",
            refreshToken: "sandbox_mock_refresh_token",
            expiryDate: Date.now() + 3600 * 1000,
            email,
          },
        },
        { upsert: true, new: true }
      );
      return connection;
    }

    // 2. Real Google OAuth Flow
    const config = this.getOAuthClientConfig();
    try {
      const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
        code,
      });

      const { access_token, refresh_token, expires_in } = tokenRes.data;

      let email = "connected-user@gmail.com";
      try {
        const profileRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        email = profileRes.data.email || email;
      } catch (err) {
        console.warn("Could not retrieve Google profile email:", err.message);
      }

      const connection = await GoogleConnection.findOneAndUpdate(
        { userId },
        {
          $set: {
            accessToken: access_token,
            expiryDate: Date.now() + expires_in * 1000,
            email,
            ...(refresh_token ? { refreshToken: refresh_token } : {}),
          },
        },
        { upsert: true, new: true }
      );

      return connection;
    } catch (error) {
      const errMsg = error.response?.data?.error_description || error.message;
      console.error("Google OAuth token exchange failed:", errMsg);
      throw new ApiError(`Google authentication failed: ${errMsg}`, 400);
    }
  }

  static async disconnect(userId) {
    const deleted = await GoogleConnection.findOneAndDelete({ userId });
    return !!deleted;
  }

  static async getStatus(userId) {
    const connection = await GoogleConnection.findOne({ userId });
    if (!connection) return { connected: false };
    return {
      connected: true,
      email: connection.email,
      isSandbox: !this.isConfigured(),
    };
  }

  static async refreshAccessToken(connection) {
    if (!this.isConfigured() || !connection.refreshToken || connection.refreshToken.startsWith("sandbox_")) {
      connection.accessToken = "sandbox_refreshed_access_token";
      connection.expiryDate = Date.now() + 3600 * 1000;
      await connection.save();
      return connection.accessToken;
    }

    const config = this.getOAuthClientConfig();
    try {
      const res = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: connection.refreshToken,
        grant_type: "refresh_token",
      });

      connection.accessToken = res.data.access_token;
      connection.expiryDate = Date.now() + res.data.expires_in * 1000;
      await connection.save();
      return connection.accessToken;
    } catch (error) {
      console.error("Failed to refresh Google access token:", error.response?.data || error.message);
      throw new ApiError("Google connection expired. Please reconnect your account.", 401);
    }
  }

  static async getValidAccessToken(userId) {
    const connection = await GoogleConnection.findOne({ userId });
    if (!connection) return null;

    const isExpired = Date.now() + 5 * 60 * 1000 >= connection.expiryDate;
    if (isExpired) {
      return await this.refreshAccessToken(connection);
    }
    return connection.accessToken;
  }

  static async createEvent(userId, campaign) {
    const userObj = await User.findById(userId);
    if (!userObj) {
      console.log(`User ${userId} not found. Skipping calendar event creation.`);
      return null;
    }

    try {
      const token = await this.getValidAccessToken(userId);
      if (!token) {
        console.log(`No Google Calendar connection found for user ${userId}. Skipping event creation.`);
        return null;
      }

      // Check if already linked to prevent duplicate events
      const existingLink = await CampaignCalendarLink.findOne({ campaignId: campaign._id });
      if (existingLink) {
        console.log(`Google Calendar event already exists for campaign ${campaign._id}. Skipping.`);
        return existingLink.googleEventId;
      }

      // Sandbox Mock Flow
      if (!this.isConfigured() || token.startsWith("sandbox_")) {
        const mockEventId = `mock_event_${Math.random().toString(36).substring(2, 11)}`;
        await CampaignCalendarLink.create({
          campaignId: campaign._id,
          googleEventId: mockEventId,
        });

        // Mark campaign as synchronized
        campaign.isSynchronized = true;
        await campaign.save().catch(console.error);

        // Send confirmation email
        const EmailService = (await import("./email.service.js")).default;
        await EmailService.sendCalendarInvitationEmail(userObj.email, userObj.name, campaign.name, new Date(campaign.startDate).toLocaleDateString()).catch(console.error);

        // Log Activity
        const Activity = (await import("../models/activity.model.js")).default;
        const initials = userObj.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
        const activity = new Activity({
          workspaceId: campaign.workspaceId,
          user: userObj.name,
          initials,
          action: "synchronized calendar event",
          target: campaign.name,
          type: "calendar",
        });
        await activity.save().catch(console.error);

        console.log(`[Google Calendar Sandbox] Created mock event ${mockEventId} for campaign ${campaign.name}`);
        return mockEventId;
      }

      // Real Google API Flow with 3x retry behavior
      const eventPayload = {
        summary: campaign.name,
        description: `${campaign.goal || ""}\n\nBudget: INR ${campaign.budget}\nChannels: ${campaign.channel.join(", ")}\nManaged via Strategix AI.`,
        start: {
          dateTime: new Date(campaign.startDate).toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: new Date(campaign.endDate).toISOString(),
          timeZone: "UTC",
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 7 * 24 * 60 }, // 7 days before
            { method: "email", minutes: 3 * 24 * 60 }, // 3 days before
            { method: "email", minutes: 24 * 60 },     // 1 day before
            { method: "popup", minutes: 60 },          // 1 hour before
          ],
        },
      };

      let attempts = 0;
      let lastError = null;
      let res = null;

      while (attempts < 3) {
        try {
          attempts++;
          res = await axios.post(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            eventPayload,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          break;
        } catch (err) {
          lastError = err;
          console.warn(`[Google Calendar API] Attempt ${attempts} failed: ${err.message || err}`);
          if (attempts < 3) {
            await new Promise(resolve => setTimeout(resolve, attempts * 2000));
          }
        }
      }

      if (!res) {
        throw lastError || new Error("Failed after 3 attempts");
      }

      const googleEventId = res.data.id;
      await CampaignCalendarLink.create({
        campaignId: campaign._id,
        googleEventId,
      });

      // Mark campaign as synchronized
      campaign.isSynchronized = true;
      await campaign.save().catch(console.error);

      // Send confirmation email
      const EmailService = (await import("./email.service.js")).default;
      await EmailService.sendCalendarInvitationEmail(userObj.email, userObj.name, campaign.name, new Date(campaign.startDate).toLocaleDateString()).catch(console.error);

      // Log Activity
      const Activity = (await import("../models/activity.model.js")).default;
      const initials = userObj.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
      const activity = new Activity({
        workspaceId: campaign.workspaceId,
        user: userObj.name,
        initials,
        action: "synchronized calendar event",
        target: campaign.name,
        type: "calendar",
      });
      await activity.save().catch(console.error);

      console.log(`Created Google Calendar event ${googleEventId} for campaign ${campaign.name}`);
      return googleEventId;
    } catch (error) {
      console.error("Failed to create Google Calendar event after all retries:", error.response?.data || error.message);
      return null;
    }
  }

  static async updateEvent(userId, campaign) {
    try {
      const token = await this.getValidAccessToken(userId);
      if (!token) return null;

      const link = await CampaignCalendarLink.findOne({ campaignId: campaign._id });
      if (!link) {
        return await this.createEvent(userId, campaign);
      }

      // Sandbox Mock Flow
      if (!this.isConfigured() || token.startsWith("sandbox_")) {
        console.log(`[Google Calendar Sandbox] Updated mock event ${link.googleEventId} for campaign ${campaign.name}`);
        return link.googleEventId;
      }

      // Real Google API Flow
      const eventPayload = {
        summary: campaign.name,
        description: `${campaign.goal || ""}\n\nBudget: INR ${campaign.budget}\nChannels: ${campaign.channel.join(", ")}\nManaged via Strategix AI.`,
        start: {
          dateTime: new Date(campaign.startDate).toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: new Date(campaign.endDate).toISOString(),
          timeZone: "UTC",
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 7 * 24 * 60 },
            { method: "email", minutes: 3 * 24 * 60 },
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 60 },
          ],
        },
      };

      await axios.put(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${link.googleEventId}`,
        eventPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(`Updated Google Calendar event ${link.googleEventId} for campaign ${campaign.name}`);
      return link.googleEventId;
    } catch (error) {
      console.error("Failed to update Google Calendar event:", error.response?.data || error.message);
      return null;
    }
  }

  static async deleteEvent(userId, campaignId) {
    try {
      const token = await this.getValidAccessToken(userId);
      if (!token) return false;

      const link = await CampaignCalendarLink.findOne({ campaignId });
      if (!link) return false;

      // Sandbox Mock Flow
      if (!this.isConfigured() || token.startsWith("sandbox_")) {
        await CampaignCalendarLink.deleteOne({ campaignId });
        console.log(`[Google Calendar Sandbox] Deleted mock event ${link.googleEventId} for campaign ${campaignId}`);
        return true;
      }

      // Real Google API Flow
      await axios.delete(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${link.googleEventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await CampaignCalendarLink.deleteOne({ campaignId });
      console.log(`Deleted Google Calendar event ${link.googleEventId} for campaign ${campaignId}`);
      return true;
    } catch (error) {
      console.error("Failed to delete Google Calendar event:", error.response?.data || error.message);
      await CampaignCalendarLink.deleteOne({ campaignId });
      return false;
    }
  }

  static async syncContentEvent(userId, content) {
    const userObj = await User.findById(userId);
    if (!userObj) return null;

    try {
      const token = await this.getValidAccessToken(userId);
      if (!token) return null;

      const link = await ContentCalendarLink.findOne({ contentId: content._id });

      // If status is not scheduled or scheduledFor is not set, delete the event if it exists
      if (content.status !== "scheduled" || !content.scheduledFor) {
        if (link) {
          if (this.isConfigured() && !token.startsWith("sandbox_")) {
            try {
              await axios.delete(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events/${link.googleEventId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
            } catch (err) {
              console.warn("Failed to delete Google Calendar event during cleanup:", err.message);
            }
          }
          await ContentCalendarLink.deleteOne({ contentId: content._id });
          console.log(`Deleted Google Calendar event for content ${content._id}`);
        }
        return null;
      }

      // Prepare Event payload
      const startDateTime = new Date(content.scheduledFor);
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30 minutes duration

      const platformFormatted = content.platform ? content.platform.charAt(0).toUpperCase() + content.platform.slice(1) : "Social Media";
      const eventPayload = {
        summary: `[${platformFormatted}] ${content.title}`,
        description: `${content.body || ""}\n\nPlatform: ${platformFormatted}\nStatus: Scheduled via Strategix AI.`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: "UTC",
        },
      };

      if (link) {
        // Update Event
        if (!this.isConfigured() || token.startsWith("sandbox_")) {
          console.log(`[Google Calendar Sandbox] Updated mock event ${link.googleEventId} for content ${content.title}`);
          return link.googleEventId;
        }

        await axios.put(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${link.googleEventId}`,
          eventPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`Updated Google Calendar event ${link.googleEventId} for content ${content.title}`);
        return link.googleEventId;
      } else {
        // Create Event
        if (!this.isConfigured() || token.startsWith("sandbox_")) {
          const mockEventId = `mock_content_event_${Math.random().toString(36).substring(2, 11)}`;
          await ContentCalendarLink.create({
            contentId: content._id,
            googleEventId: mockEventId,
          });
          console.log(`[Google Calendar Sandbox] Created mock event ${mockEventId} for content ${content.title}`);
          return mockEventId;
        }

        const res = await axios.post(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          eventPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const googleEventId = res.data.id;
        await ContentCalendarLink.create({
          contentId: content._id,
          googleEventId,
        });
        console.log(`Created Google Calendar event ${googleEventId} for content ${content.title}`);
        return googleEventId;
      }
    } catch (error) {
      console.error("Failed to sync Google Calendar event for content:", error.response?.data || error.message);
      return null;
    }
  }
}

export default GoogleCalendarService;
