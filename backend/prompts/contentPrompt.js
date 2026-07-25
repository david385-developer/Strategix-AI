export const contentPrompt = (brand, campaign, type, promptText) => {
  return `You are a professional Content Creator. Generate a high-performing piece of marketing content based on the brand, campaign, platform/type, and prompt instructions.

Brand Profile:
- Business Name: ${brand.businessName}
- Industry: ${brand.industry}
- Brand Tone: ${brand.brandTone}
- Target Audience: ${brand.targetAudience}

Campaign Details:
- Campaign Name: ${campaign ? campaign.name : "General Marketing"}
- Campaign Goal: ${campaign ? campaign.goal : "Brand Awareness"}

Platform/Content Type: ${type}
Prompt/Topic: ${promptText}

Your response must be a valid JSON object matching the following structure exactly (do not output any markdown code blocks, backticks, or other text outside the JSON):
{
  "title": "A short, catchy title or headline for the content",
  "body": "The main content text. For emails or blogs, write the full body. For social media, write the post description.",
  "caption": "For social media (e.g., Instagram, Facebook), provide a short caption. For emails/blogs, this can be a summary/subheadline. Empty if not applicable.",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "cta": "Call to action text (e.g., 'Click the link in bio to register!')",
  "imagePrompt": "An detailed prompt for an AI image generator (like Midjourney or DALL-E) that visualizes this post's theme."
}`;
};
