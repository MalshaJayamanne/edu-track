import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI;

function getClient() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing. Check your .env file.");
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Send prompt to Gemini AI, with automatic retry on transient overload (503).
 */
export const generateGeminiResponse = async (prompt, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const model = getClient().getGenerativeModel({ model: "gemini-flash-latest" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      console.error(`Gemini API error (attempt ${attempt + 1}/${retries + 1}):`, err.message);

      const isOverloaded = err.message?.includes("503") || err.message?.includes("high demand");
      const isQuota = err.message?.includes("quota") || err.status === 429;

      // Retry only on overload, and only if we have attempts left
      if (isOverloaded && attempt < retries) {
        await sleep(1200 * (attempt + 1)); // 1.2s, then 2.4s
        continue;
      }

      if (isQuota) {
        throw new Error("Daily AI usage limit reached. Please try again tomorrow, or ask your admin to upgrade the API plan.");
      }
      if (isOverloaded) {
        throw new Error("Google's AI servers are experiencing high demand right now. Please try again in a moment.");
      }
      throw new Error("AI service is temporarily unavailable. Please try again.");
    }
  }
};