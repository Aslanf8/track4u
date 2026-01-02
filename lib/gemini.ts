// Server-only file - do not import on client
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import { FoodAnalysisResult, NoApiKeyError } from "./openai";
import { GEMINI_MODELS, type GeminiModelId } from "./gemini-models";

// Re-export for convenience (but prefer importing from gemini-models on client)
export { GEMINI_MODELS, type GeminiModelId };

// Get Gemini client for a specific user
export async function getGeminiClient(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user?.encryptedGoogleKey) {
    throw new NoApiKeyError();
  }

  try {
    const decryptedKey = decrypt(user.encryptedGoogleKey);
    return new GoogleGenerativeAI(decryptedKey);
  } catch (decryptError) {
    console.error("Failed to decrypt Google API key:", decryptError);
    throw new NoApiKeyError();
  }
}

// Get user's preferred Gemini model
export async function getUserGeminiModel(userId: string): Promise<string> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { preferredGeminiModel: true },
  });

  return user?.preferredGeminiModel || "gemini-2.5-flash";
}

export async function analyzeFoodImageGemini(
  imageBase64: string,
  userId: string,
  context?: string,
  modelId?: string
): Promise<FoodAnalysisResult> {
  const client = await getGeminiClient(userId);
  const selectedModel = modelId || (await getUserGeminiModel(userId));

  // Clean base64 string (remove data:image/jpeg;base64, prefix if present)
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const prompt = `Analyze this food image and return ONLY a valid JSON object with no additional text or markdown. The JSON should have these exact fields:
{
  "name": "Food name as a string",
  "calories": estimated calories as a number,
  "protein": grams of protein as a number,
  "carbs": grams of carbohydrates as a number,
  "fat": grams of fat as a number,
  "fiber": grams of fiber as a number,
  "description": "Brief description of the meal",
  "confidence": "low" or "medium" or "high"
}

If there are multiple food items, estimate totals for the entire meal. Be as accurate as possible with portion sizes visible in the image.${context?.trim() ? `\n\nUser context: "${context.trim()}"` : ""}`;

  try {
    const model = client.getGenerativeModel({
      model: selectedModel,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
      { text: prompt },
    ]);

    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(text) as FoodAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    if (error instanceof NoApiKeyError) {
      throw error;
    }
    throw new Error("Failed to analyze with Gemini");
  }
}

export async function generateChatCompletion(
  userId: string,
  systemPrompt: string,
  userMessage: string,
  modelId?: string
): Promise<string> {
  const client = await getGeminiClient(userId);
  const selectedModel = modelId || (await getUserGeminiModel(userId));

  try {
    const model = client.getGenerativeModel({
      model: selectedModel,
      generationConfig: {
        maxOutputTokens: 1000, // Increased to allow full responses
      },
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat();

    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    
    // Get the full text response
    let text = "";
    for (const candidate of response.candidates || []) {
      if (candidate.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            text += part.text;
          }
        }
      }
    }
    
    // Fallback to response.text() if candidates parsing didn't work
    if (!text) {
      text = response.text() || "";
    }

    return text.trim() || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    if (error instanceof NoApiKeyError) {
      throw error;
    }
    throw new Error("Failed to generate chat completion with Gemini");
  }
}

