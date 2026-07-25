export const insightsPrompt = (brand, campaignsSummary, analyticsSummary) => {
  return `You are a Senior Data Analyst. Analyze the following marketing performance data and generate key actionable insights for the brand.

Brand Profile:
- Business Name: ${brand.businessName}
- Industry: ${brand.industry}
- Marketing Goals: ${brand.marketingGoals}

Campaign Performance Summary:
${campaignsSummary}

Analytics Metrics Summary:
${analyticsSummary}

Your response must be a valid JSON object matching the following structure exactly (do not output any markdown code blocks, backticks, or other text outside the JSON):
{
  "healthScore": 85,
  "insights": [
    {
      "type": "positive | negative | neutral",
      "title": "Insight title",
      "description": "Short explanation of the trend or discovery.",
      "metric": "e.g., +12.4% reach"
    },
    {
      "type": "positive | negative | neutral",
      "title": "Insight title 2",
      "description": "Short explanation of the trend or discovery.",
      "metric": "e.g., -3.2% CPC"
    }
  ]
}

Note: Limit the insights array to exactly 3 high-impact insights.`;
};
