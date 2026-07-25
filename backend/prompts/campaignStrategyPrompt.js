export const campaignStrategyPrompt = (brand, campaign) => {
  return `You are a Senior Marketing Architect and Business Intelligence Analyst. Generate a comprehensive, data-driven marketing strategy for the following campaign and brand profile.

Brand Profile:
- Business Name: ${brand.businessName}
- Industry: ${brand.industry}
- Brand Tone: ${brand.brandTone}
- Marketing Goals: ${brand.marketingGoals}
- Target Audience: ${brand.targetAudience}

Campaign Details:
- Campaign Name: ${campaign.name}
- Campaign Goal: ${campaign.goal}
- Channels: ${campaign.channel.join(", ")}
- Budget: $${campaign.budget}
- Start Date: ${campaign.startDate}
- End Date: ${campaign.endDate}

Your response must be a valid JSON object matching the following structure exactly (do not output any markdown code blocks, backticks, or other text outside the JSON):
{
  "objective": "A detailed, measurable marketing objective aligned with the brand goals.",
  "marketingObjectives": ["Three measurable objectives"],
  "targetAudience": ["Detailed audience segment descriptions"],
  "customerPersonas": ["Two ideal customer profiles with role, needs, and objections"],
  "targetAudiencePoints": [
    "Demographics: Detailed demographic segments matching the buyer profile.",
    "Behavioral: Online habits, preferred platforms, and tools.",
    "Customer Persona: Brief outline of the primary persona (e.g. name, role, main challenge)."
  ],
  "funnelPoints": [
    "TOFU (Top of Funnel): Specific awareness tactics (e.g. content pillars, video tutorials, social trends).",
    "MOFU (Middle of Funnel): Consideration tactics (e.g. comparison posts, success studies, educational guides).",
    "BOFU (Bottom of Funnel): Direct conversion actions, CTAs, landing page optimizations, and sign-up incentives."
  ],
  "postingSchedulePoints": [
    "Schedule: Recommended posting frequency per channel (e.g., 3x weekly on LinkedIn on Mon/Wed/Fri at 10 AM).",
    "Best Time: Peak engagement periods for target platforms."
  ],
  "budgetPoints": [
    "Allocation: Percentage distribution of the $${campaign.budget} budget across search, retargeting, and creation.",
    "Mitigation: Risk buffers and recommendations to avoid negative ROIs."
  ],
  "kpiPoints": [
    "Primary: Click-through rates, signup conversion rates, and CPC.",
    "Success Metrics: Measurable performance milestones (e.g., cost-per-lead under $5).",
    "Marketing Risks: Risk factors (e.g., ad fatigue) and key mitigations."
  ],
  "contentPillars": [
    "Core Pillar 1: Theme and details.",
    "Core Pillar 2: Theme and details.",
    "Core Pillar 3: Theme and details."
  ],
  "marketingFunnel": {"TOFU": ["awareness tactics"], "MOFU": ["consideration tactics"], "BOFU": ["conversion tactics"]},
  "postingSchedule": {"weeklyCadence": "...", "channels": [{"channel": "...", "days": ["Mon"], "time": "10:00"}]},
  "budgetRecommendations": ["Resource allocations with percentages and dollar amounts"],
  "kpiRecommendations": ["Metric benchmarks"],
  "marketingRisks": ["Risk and mitigation"],
  "successMetrics": ["Mathematical thresholds for success"],
  "predictedReach": 15000,
  "predictedEngagement": 2500,
  "predictedSignups": 350,
  "predictedShares": 120
}

Note: Predicted metrics must be numbers. Calculate these dynamically based on the campaign budget of $${campaign.budget} and channels.`;
};
