import OpenAI from "openai";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";

export interface FoodAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  description: string;
  confidence: "low" | "medium" | "high";
}

export interface OpenAIClientResult {
  client: OpenAI;
  isUserKey: boolean;
}

export interface OpenAIError {
  code: string;
  message: string;
  status?: number;
}

// Custom error for missing API key
export class NoApiKeyError extends Error {
  constructor() {
    super("NO_API_KEY");
    this.name = "NoApiKeyError";
  }
}

// Get OpenAI client for a specific user
// REQUIRES user to have their own API key - no fallback
export async function getOpenAIClient(userId: string): Promise<OpenAIClientResult> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user?.encryptedApiKey) {
    throw new NoApiKeyError();
  }

  try {
    const decryptedKey = decrypt(user.encryptedApiKey);
    return {
      client: new OpenAI({ apiKey: decryptedKey }),
      isUserKey: true,
    };
  } catch (decryptError) {
    console.error("Failed to decrypt user API key:", decryptError);
    throw new NoApiKeyError();
  }
}

// Check if user has their own API key
export async function userHasApiKey(userId: string): Promise<boolean> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    return !!user?.encryptedApiKey;
  } catch {
    return false;
  }
}

// Categorize OpenAI errors for user-friendly messages
export function categorizeOpenAIError(error: unknown): OpenAIError {
  const err = error as { status?: number; message?: string; code?: string };
  
  if (err.status === 401) {
    return {
      code: "INVALID_KEY",
      message: "Your API key is invalid or has been revoked. Please update it in Settings.",
      status: 401,
    };
  }
  
  if (err.status === 429) {
    return {
      code: "RATE_LIMIT",
      message: "Rate limit exceeded. Please wait a moment and try again.",
      status: 429,
    };
  }
  
  if (err.code === "insufficient_quota") {
    return {
      code: "QUOTA_EXCEEDED",
      message: "Your OpenAI account has run out of credits. Please add more credits.",
      status: 402,
    };
  }
  
  if (err.message?.includes("network") || err.message?.includes("ECONNREFUSED")) {
    return {
      code: "NETWORK_ERROR",
      message: "Unable to connect to OpenAI. Please check your internet connection.",
      status: 503,
    };
  }
  
  return {
    code: "UNKNOWN",
    message: err.message || "An unexpected error occurred with OpenAI.",
    status: 500,
  };
}

export async function analyzeFoodImage(
  images: string[],
  userId: string,
  context?: string
): Promise<FoodAnalysisResult> {
  // Get user's OpenAI client - throws NoApiKeyError if user hasn't added their key
  const { client } = await getOpenAIClient(userId);

  // Build prompt with optional context
  const contextLine = context?.trim() 
    ? `\n\nUser context: "${context.trim()}"`
    : "";

  // Ensure all images are strings (flatten if nested arrays somehow got through)
  const flatImages = images.flat().filter((img): img is string => typeof img === "string");

  if (flatImages.length === 0) {
    throw new Error("No valid images provided");
  }

  // Build content array: text prompt first, then all images
  const textContent = {
    type: "text" as const,
    text: `Analyze these food images and return ONLY a valid JSON object with no additional text or markdown. The JSON should have these exact fields:
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

If there are multiple food items, estimate totals for the entire meal. Be as accurate as possible with portion sizes visible in the images. Use all provided images to get better context about the meal.${contextLine}`,
  };

  // Build image content items - ensure each url is a string
  const imageContents = flatImages.map((image) => {
    // Double-check: ensure image is a string
    if (Array.isArray(image)) {
      throw new Error("Invalid image format: nested array detected");
    }
    const imageUrl = typeof image === "string" ? image : String(image);
    return {
      type: "image_url" as const,
      image_url: {
        url: imageUrl,
        detail: "high" as const,
      },
    };
  });

  // Combine text and images
  const content = [textContent, ...imageContents];

  try {
    const response = await client.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        {
          role: "user",
          content,
        },
      ],
      max_completion_tokens: 500,
    });

    const text = response.choices[0]?.message?.content || "";
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse food analysis response");
    }

    return JSON.parse(jsonMatch[0]) as FoodAnalysisResult;
  } catch (error) {
    // Re-throw NoApiKeyError as-is
    if (error instanceof NoApiKeyError) {
      throw error;
    }
    const categorized = categorizeOpenAIError(error);
    throw new Error(categorized.message);
  }
}
