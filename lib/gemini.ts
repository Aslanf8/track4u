// Server-only file - do not import on client
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import { FoodAnalysisResult, NoApiKeyError } from "./openai";
import { GEMINI_MODELS, type GeminiModelId } from "./gemini-models";
import {
  Ingredient,
  IngredientBreakdownSchemaAI,
} from "@/lib/types/ingredients";
import { z } from "zod";

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
  images: string[],
  userId: string,
  context?: string,
  modelId?: string,
  includeBreakdown: boolean = true
): Promise<FoodAnalysisResult> {
  const client = await getGeminiClient(userId);
  const selectedModel = modelId || (await getUserGeminiModel(userId));

  // Clean base64 strings (remove data:image/jpeg;base64, prefix if present)
  const base64Images = images.map((img) =>
    img.replace(/^data:image\/\w+;base64,/, "")
  );

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

  const prompt = `Analyze these food images and return ONLY a valid JSON object with no additional text or markdown. The JSON should have these exact fields:
{
  "name": "Food name as a string",
  "calories": estimated calories as a number,
  "protein": grams of protein as a number,
  "carbs": grams of carbohydrates as a number,
  "fat": grams of fat as a number,
  "fiber": grams of fiber as a number,
  "description": "Brief description of the meal",
  "confidence": "low" or "medium" or "high"${breakdownSection}
}${consistencyNote}${context?.trim() ? `\n\nUser context: "${context.trim()}"` : ""}`;

  try {
    const model = client.getGenerativeModel({
      model: selectedModel,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // Build parts array: all images first, then text prompt
    const parts = [
      ...base64Images.map((base64Data) => ({
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg" as const,
        },
      })),
      { text: prompt },
    ];

    const result = await model.generateContent(parts);

    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const parsedJson = JSON.parse(text);

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

// Recalculate totals from modified ingredients
export async function recalculateFromIngredientsGemini(
  ingredients: Ingredient[],
  userId: string,
  context?: string,
  modelId?: string
): Promise<FoodAnalysisResult> {
  const client = await getGeminiClient(userId);
  const selectedModel = modelId || (await getUserGeminiModel(userId));

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
    const model = client.getGenerativeModel({
      model: selectedModel,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const parsedJson = JSON.parse(text);

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
    console.error("Gemini Recalculation Error:", error);
    if (error instanceof NoApiKeyError) {
      throw error;
    }
    throw new Error("Failed to recalculate with Gemini");
  }
}

