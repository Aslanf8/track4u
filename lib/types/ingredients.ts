import { z } from "zod";

// Lenient schemas for AI responses (id and lastCalculatedAt optional)
export const IngredientSchemaAI = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  fiber: z.number().nonnegative().optional(),
});

export const IngredientBreakdownSchemaAI = z.object({
  ingredients: z.array(IngredientSchemaAI),
  contextNotes: z.string().optional(),
  lastCalculatedAt: z.string().datetime().optional(),
});

// Strict schemas for internal use (all fields required)
export const IngredientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  fiber: z.number().nonnegative().optional(),
});

export const IngredientBreakdownSchema = z.object({
  ingredients: z.array(IngredientSchema),
  contextNotes: z.string().optional(),
  lastCalculatedAt: z.string().datetime(),
});

// TypeScript Types (inferred from Zod)
export type Ingredient = z.infer<typeof IngredientSchema>;
export type IngredientBreakdown = z.infer<typeof IngredientBreakdownSchema>;

// Helper function to calculate totals from ingredients
export function calculateTotalsFromIngredients(ingredients: Ingredient[]): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
} {
  return ingredients.reduce(
    (acc, ing) => ({
      calories: acc.calories + ing.calories,
      protein: acc.protein + ing.protein,
      carbs: acc.carbs + ing.carbs,
      fat: acc.fat + ing.fat,
      fiber: acc.fiber + (ing.fiber || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

// Helper function for client-side quantity recalculation
export function recalculateIngredientQuantity(
  ingredient: Ingredient,
  newQuantity: number
): Ingredient {
  const ratio = newQuantity / ingredient.quantity;
  return {
    ...ingredient,
    quantity: Math.round(newQuantity * 10) / 10, // Round quantity to 1 decimal
    calories: Math.round(ingredient.calories * ratio), // Calories are whole numbers
    protein: Math.round(ingredient.protein * ratio * 10) / 10, // Round to 1 decimal
    carbs: Math.round(ingredient.carbs * ratio * 10) / 10, // Round to 1 decimal
    fat: Math.round(ingredient.fat * ratio * 10) / 10, // Round to 1 decimal
    fiber: ingredient.fiber
      ? Math.round(ingredient.fiber * ratio * 10) / 10 // Round to 1 decimal
      : undefined,
  };
}

