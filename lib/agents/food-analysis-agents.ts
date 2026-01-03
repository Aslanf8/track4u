// Two-Step Food Analysis System
// Step 1: Comprehensive Analysis (no strict structure, focuses on accuracy)
// Step 2: Formatting & Validation (ensures correct format with Zod validation and retries)

import type { FoodAnalysisResult } from "../openai";
import { getOpenAIClient, NoApiKeyError } from "../openai";
import { z } from "zod";

// Analysis Schema for Agent 1 (lenient, comprehensive)
const ComprehensiveAnalysisSchema = z.object({
  name: z.string(),
  description: z.string(),
  estimatedCalories: z.number().optional(),
  estimatedProtein: z.number().optional(),
  estimatedCarbs: z.number().optional(),
  estimatedFat: z.number().optional(),
  estimatedFiber: z.number().optional(),
  confidence: z.enum(["low", "medium", "high"]),
  detectedIngredients: z.array(
    z.object({
      name: z.string(),
      estimatedQuantity: z.number().optional(),
      estimatedUnit: z.string().optional(),
      notes: z.string().optional(),
    })
  ).optional(),
  cookingMethod: z.string().optional(),
  portionSize: z.string().optional(),
  additionalNotes: z.string().optional(),
});

// Final Output Schema for Agent 2 (strict, validated)
const FinalOutputSchema = z.object({
  name: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number().optional(),
  description: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
  ingredientBreakdown: z.object({
    ingredients: z.array(
      z.object({
        name: z.string(),
        quantity: z.number().positive(),
        unit: z.string().min(1),
        calories: z.number().nonnegative(),
        protein: z.number().nonnegative(),
        carbs: z.number().nonnegative(),
        fat: z.number().nonnegative(),
        fiber: z.number().nonnegative().optional(),
      })
    ),
    contextNotes: z.string().optional(),
  }).optional(),
});

/**
 * Step 1: Comprehensive Analysis
 * Uses OpenAI API directly for image analysis with lenient output
 */
async function performComprehensiveAnalysis(
  client: any,
  images: any[],
  context?: string
): Promise<z.infer<typeof ComprehensiveAnalysisSchema>> {
  const contextLine = context?.trim() 
    ? `\n\nUser context: "${context.trim()}"`
    : "";

  const prompt = `You are an expert nutritionist and food analyst. Analyze these food images comprehensively and provide detailed information.

Focus on:
1. Food identification (name, type, cuisine)
2. Visual assessment (portion size, cooking method, presentation)
3. Ingredient detection (all visible components with estimated quantities)
4. Nutritional estimation (calories, protein, carbs, fat, fiber)
5. Confidence assessment (how certain you are)

Be thorough and detailed. Don't worry about strict formatting - focus on accuracy and completeness.${contextLine}

Return your analysis as a JSON object with this structure:
{
  "name": "Food name",
  "description": "Detailed description",
  "estimatedCalories": number,
  "estimatedProtein": number,
  "estimatedCarbs": number,
  "estimatedFat": number,
  "estimatedFiber": number (optional),
  "confidence": "low" | "medium" | "high",
  "detectedIngredients": [
    {
      "name": "Ingredient name",
      "estimatedQuantity": number,
      "estimatedUnit": "g" | "tbsp" | "cup" | "piece" | etc.,
      "notes": "Any relevant notes"
    }
  ] (optional),
  "cookingMethod": "string" (optional),
  "portionSize": "string" (optional),
  "additionalNotes": "string" (optional)
}`;

  const response = await client.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          ...images,
        ],
      },
    ],
    max_completion_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content || "";
  const parsed = JSON.parse(text);
  return ComprehensiveAnalysisSchema.parse(parsed);
}

/**
 * Step 2: Formatting & Validation
 * Takes comprehensive analysis and formats it with strict validation
 */
async function formatAndValidate(
  client: any,
  analysisData: z.infer<typeof ComprehensiveAnalysisSchema>,
  maxRetries: number = 3
): Promise<z.infer<typeof FinalOutputSchema>> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const prompt = `You are a data formatting specialist. Format this comprehensive food analysis into the required structure.

ANALYSIS DATA:
${JSON.stringify(analysisData, null, 2)}

CRITICAL REQUIREMENTS:
1. Extract all nutritional values from the analysis
2. Calculate ingredient breakdown with accurate portions and macros
3. ENSURE CONSISTENCY: The sum of ingredient macros MUST equal the total meal macros
4. If there's any discrepancy, adjust the meal totals to match the ingredient sum
5. Use standard units (g, tbsp, cup, piece, etc.)
6. Round numbers appropriately (calories to whole numbers, macros to 1 decimal)
7. Generate valid JSON that will pass strict Zod validation

OUTPUT FORMAT (JSON):
{
  "name": "string",
  "calories": number (sum of ingredient calories),
  "protein": number (sum of ingredient protein),
  "carbs": number (sum of ingredient carbs),
  "fat": number (sum of ingredient fat),
  "fiber": number (optional, sum of ingredient fiber),
  "description": "string",
  "confidence": "low" | "medium" | "high",
  "ingredientBreakdown": {
    "ingredients": [
      {
        "name": "string",
        "quantity": number (positive),
        "unit": "string",
        "calories": number (non-negative),
        "protein": number (non-negative),
        "carbs": number (non-negative),
        "fat": number (non-negative),
        "fiber": number (optional, non-negative)
      }
    ],
    "contextNotes": "string" (optional)
  } (optional)
}

DO NOT include "id" or "lastCalculatedAt" fields - these are auto-generated.

CRITICAL: Calculate ingredient totals first, then set meal totals to match exactly.`;

      const response = await client.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_completion_tokens: 1500,
        response_format: { type: "json_object" },
      });

      const text = response.choices[0]?.message?.content || "";
      const parsed = JSON.parse(text);
      const validated = FinalOutputSchema.parse(parsed);

      return validated;
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(
          `Formatting failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`
        );
      }
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error("Formatting failed");
}

/**
 * Two-Agent Food Analysis with Retry Logic
 */
export async function analyzeFoodImageWithAgents(
  images: string[],
  userId: string,
  context?: string,
  maxRetries: number = 3
): Promise<FoodAnalysisResult> {
  const { client } = await getOpenAIClient(userId);

  // Ensure all images are strings
  const flatImages = images.flat().filter((img): img is string => typeof img === "string");

  if (flatImages.length === 0) {
    throw new Error("No valid images provided");
  }

  // Build image content for OpenAI API
  const imageContents = flatImages.map((image) => {
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

  let lastError: Error | null = null;

  // Retry loop for the entire process
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Step 1: Comprehensive Analysis
      const analysisData = await performComprehensiveAnalysis(
        client,
        imageContents,
        context
      );

      // Step 2: Formatting & Validation (with its own retry logic)
      const validated = await formatAndValidate(client, analysisData, 3);

      // Normalize ingredient breakdown: add missing IDs and lastCalculatedAt
      let normalizedBreakdown: FoodAnalysisResult["ingredientBreakdown"] = undefined;
      
      if (validated.ingredientBreakdown?.ingredients) {
        normalizedBreakdown = {
          ingredients: validated.ingredientBreakdown.ingredients.map(
            (ing) => ({
              ...ing,
              id: crypto.randomUUID(),
            })
          ),
          contextNotes: validated.ingredientBreakdown.contextNotes,
          lastCalculatedAt: new Date().toISOString(),
        };
      }

      // Convert to FoodAnalysisResult format
      const result: FoodAnalysisResult = {
        name: validated.name,
        calories: validated.calories,
        protein: validated.protein,
        carbs: validated.carbs,
        fat: validated.fat,
        fiber: validated.fiber ?? 0,
        description: validated.description,
        confidence: validated.confidence,
        ingredientBreakdown: normalizedBreakdown,
      };

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on NoApiKeyError
      if (error instanceof NoApiKeyError) {
        throw error;
      }

      // Log error for debugging
      console.error(`Food analysis attempt ${attempt}/${maxRetries} failed:`, error);

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(
          `Failed to analyze food after ${maxRetries} attempts. Last error: ${lastError.message}`
        );
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error("Unknown error in food analysis");
}

