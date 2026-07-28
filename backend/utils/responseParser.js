import { z } from "zod";

export const campaignStrategySchema = z.object({
  objective: z.string().min(1, "Objective is required"),
  marketingObjectives: z.array(z.string()).default([]),
  targetAudience: z.array(z.string()).default([]),
  customerPersonas: z.array(z.string()).default([]),
  targetAudiencePoints: z.array(z.string()).min(1),
  funnelPoints: z.array(z.string()).min(1),
  postingSchedulePoints: z.array(z.string()).min(1),
  budgetPoints: z.array(z.string()).min(1),
  kpiPoints: z.array(z.string()).min(1),
  contentPillars: z.array(z.string()).min(1),
  marketingFunnel: z.object({
    TOFU: z.array(z.string()).default([]),
    MOFU: z.array(z.string()).default([]),
    BOFU: z.array(z.string()).default([]),
  }).default({ TOFU: [], MOFU: [], BOFU: [] }),
  postingSchedule: z.object({
    weeklyCadence: z.string().default(""),
    channels: z.array(
      z.object({
        channel: z.string(),
        days: z.array(z.string()),
        time: z.string(),
      })
    ).default([]),
  }).default({ weeklyCadence: "", channels: [] }),
  budgetRecommendations: z.array(z.string()).default([]),
  kpiRecommendations: z.array(z.string()).default([]),
  marketingRisks: z.array(z.string()).default([]),
  successMetrics: z.array(z.string()).default([]),
  predictedReach: z.number().default(0),
  predictedEngagement: z.number().default(0),
  predictedSignups: z.number().default(0),
  predictedShares: z.number().default(0),
});

export const contentGeneratedSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  caption: z.string().optional().default(""),
  hashtags: z.array(z.string()).optional().default([]),
  cta: z.string().optional().default(""),
  imagePrompt: z.string().optional().default(""),
});

export const chatResponseSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

export const insightsResponseSchema = z.object({
  healthScore: z.number().default(80),
  insights: z.array(
    z.object({
      type: z.enum(["positive", "negative", "neutral"]),
      title: z.string().min(1),
      description: z.string().min(1),
      metric: z.string().min(1),
    })
  ).max(3),
});

export const cleanAndParseJson = (text, schema) => {
  try {
    // Regex matches the first '{' and last '}' and everything in between
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("No JSON object found in text response");
    }
    const rawJson = JSON.parse(match[0]);

    // Generic string array normalization helper to parse objects if returned by LLMs
    const normalizeStringArray = (arr) => {
      if (!Array.isArray(arr)) return [];
      return arr.map(item => {
        if (typeof item === "object" && item !== null) {
          const name = item.name || item.title || item.role || item.point || "";
          const desc = item.description || item.desc || item.profile || item.text || "";
          return name && desc ? `${name}: ${desc}` : name || desc || JSON.stringify(item);
        }
        return String(item);
      });
    };

    const stringArrayKeys = [
      "customerPersonas", 
      "targetAudience", 
      "marketingObjectives", 
      "targetAudiencePoints", 
      "funnelPoints", 
      "postingSchedulePoints", 
      "budgetPoints", 
      "kpiPoints", 
      "contentPillars",
      "budgetRecommendations",
      "kpiRecommendations",
      "marketingRisks",
      "successMetrics"
    ];

    for (const key of stringArrayKeys) {
      if (rawJson[key]) {
        rawJson[key] = normalizeStringArray(rawJson[key]);
      }
    }

    // Key normalization for campaign strategy responses
    if (rawJson.audience && !rawJson.targetAudiencePoints) {
      rawJson.targetAudiencePoints = Array.isArray(rawJson.audience) ? rawJson.audience : [rawJson.audience];
    }
    if (rawJson.funnel && !rawJson.funnelPoints) {
      rawJson.funnelPoints = Array.isArray(rawJson.funnel) ? rawJson.funnel : [rawJson.funnel];
    }
    if (rawJson.schedule && !rawJson.postingSchedulePoints) {
      rawJson.postingSchedulePoints = Array.isArray(rawJson.schedule) ? rawJson.schedule : [rawJson.schedule];
    }
    if (rawJson.budget && !rawJson.budgetPoints) {
      rawJson.budgetPoints = Array.isArray(rawJson.budget) ? rawJson.budget : [rawJson.budget];
    }
    if (rawJson.kpis && !rawJson.kpiPoints) {
      rawJson.kpiPoints = Array.isArray(rawJson.kpis) ? rawJson.kpis : [rawJson.kpis];
    }
    if (rawJson.pillars && !rawJson.contentPillars) {
      rawJson.contentPillars = Array.isArray(rawJson.pillars) ? rawJson.pillars : [rawJson.pillars];
    }

    return schema.parse(rawJson);
  } catch (error) {
    console.error("JSON parsing/validation error details:", error);
    throw error;
  }
};
