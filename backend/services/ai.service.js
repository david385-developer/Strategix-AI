import axios from "axios";
import dotenv from "dotenv";
import { cleanAndParseJson } from "../utils/responseParser.js";
import logger from "../utils/logger.js";

dotenv.config();

class AIService {
  static async callGroq(prompt) {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    if (!apiKey || apiKey === "dummy-groq-key") {
      throw new Error("Invalid or missing GROQ_API_KEY");
    }

    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "system",
              content: "You are a professional marketing AI. You must return JSON output only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 15000, // 15s timeout
        }
      );

      return response.data?.choices?.[0]?.message?.content || "";
    } catch (error) {
      logger.error("Groq API Call Error", error.message);
      throw error;
    }
  }

  // Orchestrator method with single-retry and fallback logic
  static async generateStructuredContent(prompt, zodSchema, fallbackGenerator) {
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        logger.info(`AI Generation Attempt ${attempts}/${maxAttempts}`);
        const responseText = await this.callGroq(prompt);
        const parsedData = cleanAndParseJson(responseText, zodSchema);
        return parsedData;
      } catch (error) {
        logger.warn(`AI Generation Attempt ${attempts} failed. Error: ${error.message}`);
        if (attempts >= maxAttempts) {
          logger.error("All AI attempts failed. Executing fallback local generator.");
          return fallbackGenerator();
        }
      }
    }
  }
}

export default AIService;
