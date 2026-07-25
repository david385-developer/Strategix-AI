export const rewritePrompt = (brand, contentItem, instruction) => {
  let actionGuideline = "";
  const instrLower = (instruction || "").toLowerCase();

  if (instrLower.includes("expand")) {
    actionGuideline = "Elaborate on the key concepts, add interesting details, and expand sentences while maintaining brand voice.";
  } else if (instrLower.includes("shorten") || instrLower.includes("condense")) {
    actionGuideline = "Condense the content, remove fluff, make sentences punchy, concise, and straight to the point.";
  } else if (instrLower.includes("tone")) {
    actionGuideline = "Polish the tone to be highly engaging, professional, and matching the brand tone: " + brand.brandTone;
  } else if (instrLower.includes("seo")) {
    actionGuideline = "Optimize key headers and text layout for search engine visibility, naturally weaving in keywords relevant to the " + brand.industry + " industry.";
  } else if (instrLower.includes("platform") || instrLower.includes("adapt")) {
    actionGuideline = "Re-format and optimize the layout, length, and style specifically to excel on the " + contentItem.platform + " platform.";
  } else if (instrLower.includes("cta") || instrLower.includes("call to action")) {
    actionGuideline = "Make the Call To Action (CTA) highly conversion-focused, encouraging immediate sign-ups or clicks.";
  } else if (instrLower.includes("hashtag")) {
    actionGuideline = "Generate a highly relevant, trending set of 5 to 15 hashtags aligned with the post and the industry.";
  } else {
    actionGuideline = `Optimize following these custom instructions: "${instruction}".`;
  }

  return `You are an expert Copywriter and Social Media Marketer.
Optimize the following content item based on this action guideline:

Guideline: ${actionGuideline}

Brand Profile:
- Business Name: ${brand.businessName}
- Industry: ${brand.industry}
- Brand Tone: ${brand.brandTone}

Original Content Details:
- Platform: ${contentItem.platform}
- Title: ${contentItem.title}
- Body: ${contentItem.body}
- Caption: ${contentItem.caption || ""}
- Hashtags: ${(contentItem.hashtags || []).join(", ")}
- CTA: ${contentItem.cta || ""}
- Image Prompt: ${contentItem.imagePrompt || ""}

Your response must be a valid JSON object matching the following structure exactly (do not output any markdown code blocks, backticks, or other text outside the JSON):
{
  "title": "Optimized headline/title",
  "body": "Optimized main body text",
  "caption": "Optimized platform caption or summary",
  "hashtags": ["opttag1", "opttag2", "opttag3"],
  "cta": "Optimized CTA text",
  "imagePrompt": "Optimized description of image to generate"
}`;
};
