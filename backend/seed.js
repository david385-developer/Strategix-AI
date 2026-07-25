import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Models
import User from "./models/user.model.js";
import Workspace from "./models/workspace.model.js";
import BrandProfile from "./models/brandProfile.model.js";
import Campaign from "./models/campaign.model.js";
import Content from "./models/content.model.js";
import CalendarEvent from "./models/calendarEvent.model.js";
import Notification from "./models/notification.model.js";
import Activity from "./models/activity.model.js";
import Task from "./models/task.model.js";

dotenv.config();

const seed = async () => {
  try {
    console.log("Connecting to database for seeding...");
    await mongoose.connect(process.env.DATABASE_URL || "");
    console.log("Connected successfully. Flushing existing tables...");

    // Clear all existing data
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await BrandProfile.deleteMany({});
    await Campaign.deleteMany({});
    await Content.deleteMany({});
    await CalendarEvent.deleteMany({});
    await Notification.deleteMany({});
    await Activity.deleteMany({});
    await Task.deleteMany({});

    console.log("Collections cleared. Seeding user data...");

    // 1. Seed default user (Sarah Chen)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const user = new User({
      name: "Sarah Chen",
      email: "sarah@strategix.io",
      password: hashedPassword,
      role: "owner",
      phone: "+1 (555) 019-2834",
      bio: "Senior Marketing Director at Strategix. Obsessed with content optimization and scalable growth loops.",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    });
    await user.save();

    console.log(`User created: ${user.email}`);

    // 2. Seed default workspace (Strategix HQ)
    const workspace = new Workspace({
      name: "Strategix HQ",
      urlSlug: "strategix-hq",
      ownerId: user._id,
    });
    await workspace.save();

    // Link user to workspace
    user.activeWorkspaceId = workspace._id;
    await user.save();

    console.log(`Workspace created: ${workspace.name}`);

    // 3. Seed default brand profile
    const brandProfile = new BrandProfile({
      workspaceId: workspace._id,
      businessName: "Strategix AI",
      industry: "B2B SaaS",
      targetAudience: "Marketing managers and growth leaders in mid-sized tech companies (50-500 employees).",
      products: "Strategix AI Platform",
      services: "Marketing operations automation, AI generation content suite, metrics analytics dashboards",
      brandTone: "Professional, authoritative, yet innovative and modern",
      marketingGoals: "Increase brand awareness in the B2B tech sector, acquire 100 new trial users monthly",
      preferredPlatforms: ["linkedin", "twitter", "email", "blog"],
      website: "https://strategix.ai",
      brandGuidelines: "Use clean formatting, actionable advice, and statistics in posts. Avoid hype-heavy buzzwords.",
      defaultHashtags: "#MarketingOps #SaaSGrowth #AIAutomation #Productivity",
      primaryColor: "hsl(243 75% 59%)",
    });
    await brandProfile.save();

    console.log("Brand profile created.");

    // 4. Seed Campaigns
    const campaignData = [
      {
        name: "Summer Launch 2025",
        status: "active",
        channel: ["instagram", "facebook", "email"],
        budget: 12000,
        spent: 7400,
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-08-31"),
        progress: 62,
        goal: "Drive 5,000 signups for new product line",
        reach: 248000,
        engagement: 6.8,
        conversions: 1820,
        color: "hsl(243 75% 59%)",
      },
      {
        name: "Brand Awareness Q3",
        status: "active",
        channel: ["linkedin", "twitter", "blog"],
        budget: 8000,
        spent: 3200,
        startDate: new Date("2026-07-01"),
        endDate: new Date("2026-09-30"),
        progress: 28,
        goal: "Increase brand mentions by 40%",
        reach: 156000,
        engagement: 4.2,
        conversions: 640,
        color: "hsl(158 64% 52%)",
      },
      {
        name: "Holiday Email Series",
        status: "scheduled",
        channel: ["email"],
        budget: 4000,
        spent: 0,
        startDate: new Date("2026-12-01"),
        endDate: new Date("2026-12-25"),
        progress: 15,
        goal: "Reactivate 2,000 dormant subscribers",
        reach: 0,
        engagement: 0,
        conversions: 0,
        color: "hsl(38 92% 50%)",
      },
      {
        name: "Webinar Promotion",
        status: "active",
        channel: ["linkedin", "email", "twitter"],
        budget: 5000,
        spent: 4100,
        startDate: new Date("2026-07-10"),
        endDate: new Date("2026-07-30"),
        progress: 82,
        goal: "Register 800 attendees for AI marketing webinar",
        reach: 92000,
        engagement: 8.1,
        conversions: 612,
        color: "hsl(262 83% 58%)",
      },
      {
        name: "Influencer Collab Drop",
        status: "draft",
        channel: ["instagram", "facebook"],
        budget: 15000,
        spent: 0,
        startDate: new Date("2026-09-15"),
        endDate: new Date("2026-10-15"),
        progress: 8,
        goal: "Generate 10M impressions via creator network",
        reach: 0,
        engagement: 0,
        conversions: 0,
        color: "hsl(199 89% 48%)",
      },
      {
        name: "Customer Spotlight Series",
        status: "completed",
        channel: ["linkedin", "blog"],
        budget: 3000,
        spent: 2900,
        startDate: new Date("2026-04-01"),
        endDate: new Date("2026-05-31"),
        progress: 100,
        goal: "Publish 6 case studies",
        reach: 78000,
        engagement: 5.4,
        conversions: 230,
        color: "hsl(142 71% 45%)",
      },
    ];

    const campaignMap = {};
    for (const cData of campaignData) {
      const c = new Campaign({
        ...cData,
        ownerId: user._id,
        workspaceId: workspace._id,
      });
      await c.save();
      campaignMap[cData.name] = c._id;
    }

    console.log(`Seeded ${Object.keys(campaignMap).length} campaigns.`);

    // 5. Seed Content Items
    const contentData = [
      {
        type: "instagram",
        platform: "Instagram",
        title: "Summer Launch Teaser",
        body: "Something big is coming. ☀️ Our most anticipated launch yet arrives in 48 hours. Set your reminders — you won't want to miss this.",
        caption: "The wait is almost over. Tap the link in bio to be the first to know. 🚀",
        hashtags: ["#SummerLaunch", "#NewDrop", "#StayTuned", "#BrandName"],
        cta: "Link in bio",
        status: "scheduled",
        scheduledFor: new Date("2026-07-26T10:00:00Z"),
        campaignName: "Summer Launch 2025",
        favorite: true,
      },
      {
        type: "linkedin",
        platform: "LinkedIn",
        title: "Thought Leadership Post",
        body: "Marketing in 2026 isn't about more channels. It's about smarter orchestration.\n\nAfter working with 200+ brands, we noticed one pattern: teams that align their content pillars with funnel stages see 3x higher conversion.\n\nHere's the framework we use ↓",
        cta: "Read the full breakdown in comments",
        status: "draft",
        campaignName: "Brand Awareness Q3",
        favorite: false,
      },
      {
        type: "email",
        platform: "Email",
        title: "Webinar Reminder — Tomorrow",
        body: "Hi {first_name},\n\nJust a quick reminder that our live session 'AI-Powered Marketing Operations' starts tomorrow at 2 PM EST.\n\nWe'll cover:\n• How to automate content workflows\n• Building a single source of truth for campaigns\n• Measuring what actually matters\n\nSee you there!",
        cta: "Join the webinar",
        status: "approval",
        scheduledFor: new Date("2026-07-25T14:00:00Z"),
        campaignName: "Webinar Promotion",
        favorite: false,
      },
      {
        type: "twitter",
        platform: "Twitter / X",
        title: "Product Thread",
        body: "We analyzed 10,000 marketing campaigns. Here's what the top 1% do differently 🧵",
        hashtags: ["#MarketingOps", "#GrowthHacking"],
        status: "published",
        campaignName: "Brand Awareness Q3",
        favorite: true,
      },
      {
        type: "blog",
        platform: "Blog",
        title: "The Complete Guide to AI Marketing Operations",
        body: "Marketing teams today manage more complexity than ever before. Between fragmented channels, rising content demands, and pressure to prove ROI, traditional workflows are breaking down. In this guide, we explore how AI-native operations reshape the way teams plan, produce, and measure...",
        status: "draft",
        campaignName: "Brand Awareness Q3",
        favorite: false,
      },
      {
        type: "facebook",
        platform: "Facebook",
        title: "Community Story",
        body: "Behind every great product is a community that believed in it early. Today we're celebrating 10,000 of you who've been with us since day one. 🎉",
        status: "scheduled",
        scheduledFor: new Date("2026-07-28T15:00:00Z"),
        campaignName: "Summer Launch 2025",
        favorite: false,
      },
    ];

    const contentMap = {};
    for (const cItem of contentData) {
      const content = new Content({
        type: cItem.type,
        platform: cItem.platform,
        title: cItem.title,
        body: cItem.body,
        caption: cItem.caption,
        hashtags: cItem.hashtags,
        cta: cItem.cta,
        status: cItem.status,
        scheduledFor: cItem.scheduledFor,
        favorite: cItem.favorite,
        campaignId: campaignMap[cItem.campaignName],
        createdById: user._id,
        workspaceId: workspace._id,
      });
      await content.save();
      contentMap[cItem.title] = content;
    }

    console.log(`Seeded ${Object.keys(contentMap).length} content items.`);

    // 6. Seed Calendar Events
    const calendarEventsData = [
      { title: "Summer teaser post", date: new Date("2026-07-26"), platform: "instagram", status: "scheduled", time: "10:00", contentTitle: "Summer Launch Teaser" },
      { title: "Webinar reminder email", date: new Date("2026-07-25"), platform: "email", status: "approval", time: "14:00", contentTitle: "Webinar Reminder — Tomorrow" },
      { title: "LinkedIn thought post", date: new Date("2026-07-27"), platform: "linkedin", status: "draft", contentTitle: "Thought Leadership Post" },
      { title: "Product thread", date: new Date("2026-07-24"), platform: "twitter", status: "published", time: "09:00", contentTitle: "Product Thread" },
      { title: "Community story", date: new Date("2026-07-28"), platform: "facebook", status: "scheduled", time: "15:00", contentTitle: "Community Story" },
      { title: "Blog guide publish", date: new Date("2026-07-30"), platform: "blog", status: "draft", contentTitle: "The Complete Guide to AI Marketing Operations" },
    ];

    for (const e of calendarEventsData) {
      const calEvent = new CalendarEvent({
        title: e.title,
        date: e.date,
        platform: e.platform,
        status: e.status,
        time: e.time,
        contentId: contentMap[e.contentTitle]?._id,
        workspaceId: workspace._id,
      });
      await calEvent.save();
    }

    console.log("Seeded calendar events.");

    // 7. Seed Tasks
    const taskData = [
      { title: "Approve Instagram teaser copy", status: "review", assignee: "Sarah Chen", dueDate: new Date("2026-07-25"), campaignName: "Summer Launch 2025" },
      { title: "Draft Q3 blog guide outline", status: "in-progress", assignee: "Marcus Reid", dueDate: new Date("2026-07-28"), campaignName: "Brand Awareness Q3" },
      { title: "Design webinar landing page", status: "todo", assignee: "Priya Patel", dueDate: new Date("2026-07-26"), campaignName: "Webinar Promotion" },
      { title: "Schedule influencer outreach", status: "todo", assignee: "James Wong", dueDate: new Date("2026-08-01"), campaignName: "Influencer Collab Drop" },
      { title: "Review email sequence performance", status: "done", assignee: "Sarah Chen", dueDate: new Date("2026-07-20"), campaignName: "Webinar Promotion" },
      { title: "Finalize holiday email calendar", status: "in-progress", assignee: "Priya Patel", dueDate: new Date("2026-08-05"), campaignName: "Holiday Email Series" },
    ];

    for (const t of taskData) {
      const task = new Task({
        title: t.title,
        status: t.status,
        assignee: t.assignee,
        dueDate: t.dueDate,
        campaign: t.campaignName,
        campaignId: campaignMap[t.campaignName],
        workspaceId: workspace._id,
      });
      await task.save();
    }

    console.log("Seeded tasks.");

    // 8. Seed Activities
    const activityData = [
      { user: "Priya Patel", initials: "PP", action: "submitted content for approval", target: "Webinar Reminder Email", type: "created" },
      { user: "Sarah Chen", initials: "SC", action: "approved", target: "Instagram Teaser Copy", type: "approved" },
      { user: "Marcus Reid", initials: "MR", action: "published", target: "Product Thread on Twitter", type: "published" },
      { user: "AI Assistant", initials: "AI", action: "generated strategy for", target: "Summer Launch 2025", type: "created" },
      { user: "James Wong", initials: "JW", action: "commented on", target: "Influencer Collab brief", type: "commented" },
      { user: "Marcus Reid", initials: "MR", action: "updated budget for", target: "Brand Awareness Q3", type: "updated" },
    ];

    for (const a of activityData) {
      const act = new Activity({
        user: a.user,
        initials: a.initials,
        action: a.action,
        target: a.target,
        type: a.type,
        workspaceId: workspace._id,
      });
      await act.save();
    }

    console.log("Seeded activity logs.");

    // 9. Seed Notifications
    const notificationData = [
      { icon: "approval", title: "Content awaiting approval", description: "Priya Patel submitted 'Webinar Reminder Email' for your review.", read: false, group: "today" },
      { icon: "ai", title: "AI strategy ready", description: "Your campaign strategy for 'Summer Launch 2025' has been generated.", read: false, group: "today" },
      { icon: "published", title: "Post published successfully", description: "'Product Thread' is now live on Twitter.", read: true, group: "today" },
      { icon: "comment", title: "New comment", description: "James Wong commented on the Influencer Collab brief.", read: true, group: "today" },
      { icon: "mention", title: "You were mentioned", description: "Marcus Reid mentioned you in Brand Awareness Q3.", read: true, group: "yesterday" },
      { icon: "system", title: "Weekly report ready", description: "Your marketing performance summary for this week is available.", read: true, group: "yesterday" },
      { icon: "approval", title: "2 items need review", description: "You have 2 content pieces pending approval.", read: true, group: "this-week" },
      { icon: "ai", title: "AI insights updated", description: "New performance insights are available in Analytics.", read: true, group: "this-week" },
    ];

    for (const n of notificationData) {
      const notif = new Notification({
        userId: user._id,
        icon: n.icon,
        title: n.title,
        description: n.description,
        read: n.read,
        group: n.group,
      });
      await notif.save();
    }

    console.log("Seeded notifications successfully.");
    console.log("Database seeding completed. Exiting...");
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seed();
