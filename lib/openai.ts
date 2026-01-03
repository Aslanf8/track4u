import OpenAI from "openai";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import {
  Ingredient,
  IngredientBreakdown,
  IngredientBreakdownSchemaAI,
} from "@/lib/types/ingredients";
import { z } from "zod";
import { analyzeFoodImageWithAgents } from "./agents/food-analysis-agents";

export interface FoodAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  description: string;
  confidence: "low" | "medium" | "high";
  ingredientBreakdown?: IngredientBreakdown; // Optional for backward compatibility
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
  context?: string,
  includeBreakdown: boolean = true
): Promise<FoodAnalysisResult> {
  // Use the new two-step agent system only if breakdown is requested
  if (includeBreakdown) {
    try {
      return await analyzeFoodImageWithAgents(images, userId, context, 3);
    } catch (error) {
      // Fallback to original method if agent system fails
      console.warn("Two-step agent system failed, falling back to original method:", error);
      return await analyzeFoodImageOriginal(images, userId, context, includeBreakdown);
    }
  } else {
    // Use faster, simpler method when breakdown not needed
    return await analyzeFoodImageOriginal(images, userId, context, includeBreakdown);
  }
}

// Original implementation kept as fallback
async function analyzeFoodImageOriginal(
  images: string[],
  userId: string,
  context?: string,
  includeBreakdown: boolean = true
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

  // Build prompt conditionally based on includeBreakdown
  const breakdownSection = includeBreakdown ? `
  "ingredientBreakdown": {
    "ingredients": [
      {
        "name": "Ingredient name",
        "quantity": estimated quantity as a number,
        "unit": "unit of measurement (g, tbsp, cup, piece, etc.)",
        "calories": calories contributed by this ingredient,
        "protein": protein in grams,
        "carbs": carbs in grams,
        "fat": fat in grams,
        "fiber": fiber in grams (optional)
      }
    ]
  }

Note: Do not include "id" or "lastCalculatedAt" fields in ingredientBreakdown - these are auto-generated.` : "";

  const consistencyNote = includeBreakdown ? `
CRITICAL CONSISTENCY REQUIREMENT: The sum of the calories/macros of the individual ingredients MUST match the total calories/macros for the meal. Calculate the ingredient totals first, then set the meal totals to equal the sum of ingredients. If there is any discrepancy, adjust the meal totals to match the ingredient sum.

For ingredientBreakdown, list all detected components with their estimated portions and nutritional contributions.` : "";

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
  "confidence": "low" or "medium" or "high"${breakdownSection}
}${consistencyNote}${contextLine}`,
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

    const parsedJson = JSON.parse(jsonMatch[0]);

    // Validate structure with Zod (using lenient schema for AI responses)
    const AnalysisSchema = z.object({
      name: z.string(),
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
      fiber: z.number().optional(),
      description: z.string(),
      confidence: z.enum(["low", "medium", "high"]),
      ingredientBreakdown: IngredientBreakdownSchemaAI.optional(),
    });

    // Validate and parse
    const validated = AnalysisSchema.parse(parsedJson);

    // Normalize ingredient breakdown: add missing IDs and lastCalculatedAt
    if (validated.ingredientBreakdown?.ingredients) {
      validated.ingredientBreakdown.ingredients = validated.ingredientBreakdown.ingredients.map(
        (ing) => ({
          ...ing,
          id: ing.id || crypto.randomUUID(),
        })
      );
      // Set lastCalculatedAt if missing
      if (!validated.ingredientBreakdown.lastCalculatedAt) {
        validated.ingredientBreakdown.lastCalculatedAt = new Date().toISOString();
      }
    }

    return validated as FoodAnalysisResult;
  } catch (error) {
    // Re-throw NoApiKeyError as-is
    if (error instanceof NoApiKeyError) {
      throw error;
    }
    const categorized = categorizeOpenAIError(error);
    throw new Error(categorized.message);
  }
}

// Recalculate totals from modified ingredients
export async function recalculateFromIngredients(
  ingredients: Ingredient[],
  userId: string,
  context?: string
): Promise<FoodAnalysisResult> {
  const { client } = await getOpenAIClient(userId);

  // Format ingredients as a text description
  const ingredientsList = ingredients
    .map(
      (ing) =>
        `- ${ing.name}: ${ing.quantity} ${ing.unit} (${ing.calories} kcal, ${ing.protein}g protein, ${ing.carbs}g carbs, ${ing.fat}g fat)`
    )
    .join("\n");

  const contextLine = context?.trim() ? `\n\nAdditional context: "${context.trim()}"` : "";

  const prompt = `Given these ingredients, calculate the total nutrition values. Return ONLY a valid JSON object with no additional text or markdown:

Ingredients:
${ingredientsList}${contextLine}

Return a JSON object with these exact fields:
{
  "name": "Meal name based on ingredients",
  "calories": total calories as a number,
  "protein": total protein in grams as a number,
  "carbs": total carbs in grams as a number,
  "fat": total fat in grams as a number,
  "fiber": total fiber in grams as a number,
  "description": "Brief description of the meal",
  "confidence": "high",
  "ingredientBreakdown": {
    "ingredients": [
      {
        "name": "Ingredient name",
        "quantity": quantity as a number,
        "unit": "unit of measurement",
        "calories": calories as a number,
        "protein": protein in grams as a number,
        "carbs": carbs in grams as a number,
        "fat": fat in grams as a number,
        "fiber": fiber in grams as a number (optional)
      }
    ]
  }

Note: Do not include "id" or "lastCalculatedAt" fields in ingredientBreakdown - these are auto-generated.
}

CRITICAL CONSISTENCY REQUIREMENT: The sum of the calories/macros of the individual ingredients MUST match the total calories/macros for the meal. Calculate the ingredient totals first, then set the meal totals to equal the sum of ingredients.`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_completion_tokens: 1000,
    });

    const text = response.choices[0]?.message?.content || "";

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse recalculation response");
    }

    const parsedJson = JSON.parse(jsonMatch[0]);

    // Validate structure with Zod (using lenient schema for AI responses)
    const AnalysisSchema = z.object({
      name: z.string(),
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
      fiber: z.number().optional(),
      description: z.string(),
      confidence: z.enum(["low", "medium", "high"]),
      ingredientBreakdown: IngredientBreakdownSchemaAI.optional(),
    });

    // Validate and parse
    const validated = AnalysisSchema.parse(parsedJson);

    // Normalize ingredient breakdown: add missing IDs and lastCalculatedAt
    if (validated.ingredientBreakdown?.ingredients) {
      validated.ingredientBreakdown.ingredients = validated.ingredientBreakdown.ingredients.map(
        (ing) => ({
          ...ing,
          id: ing.id || crypto.randomUUID(),
        })
      );
      // Set lastCalculatedAt if missing
      if (!validated.ingredientBreakdown.lastCalculatedAt) {
        validated.ingredientBreakdown.lastCalculatedAt = new Date().toISOString();
      }
    }

    return validated as FoodAnalysisResult;
  } catch (error) {
    if (error instanceof NoApiKeyError) {
      throw error;
    }
    const categorized = categorizeOpenAIError(error);
    throw new Error(categorized.message);
  }
}
