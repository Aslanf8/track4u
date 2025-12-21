import { Agent } from "@openai/agents";

export const goalsAssistant = new Agent({
  name: "Nutrition Goals Assistant",
  model: "gpt-4.1-mini",
  instructions: `You are a concise nutrition advisor helping users set daily macro goals. Your responses must be:
- Maximum 2 sentences
- Direct and actionable
- Based on scientific guidelines

When users ask about calories: Consider their goals (lose/maintain/gain weight), activity level, and typical ranges (1500-2500 for most adults).

When users ask about protein: Recommend 0.8-1g per pound of body weight for active individuals, 0.5-0.7g for sedentary.

When users ask about carbs: 45-65% of daily calories typically, lower for keto/low-carb goals.

When users ask about fat: 20-35% of daily calories, prioritize healthy fats.

If the user hasn't provided enough context, ask ONE clarifying question. Never give medical advice - suggest consulting a professional for health conditions.`,
});

export const GOAL_SUGGESTIONS = {
  calories: {
    weightLoss: { min: 1200, typical: 1500, description: "Moderate deficit for gradual weight loss" },
    maintenance: { min: 1800, typical: 2000, description: "Maintain current weight" },
    weightGain: { min: 2200, typical: 2500, description: "Surplus for muscle building" },
  },
  protein: {
    sedentary: { min: 50, typical: 70, description: "General health maintenance" },
    active: { min: 100, typical: 130, description: "Active lifestyle & muscle maintenance" },
    athletic: { min: 150, typical: 180, description: "Athletic training & muscle building" },
  },
  carbs: {
    lowCarb: { min: 50, typical: 100, description: "Low-carb or keto approach" },
    moderate: { min: 150, typical: 250, description: "Balanced macros" },
    high: { min: 300, typical: 350, description: "High activity or performance" },
  },
  fat: {
    low: { min: 40, typical: 50, description: "Lower fat approach" },
    moderate: { min: 60, typical: 75, description: "Balanced intake" },
    higher: { min: 80, typical: 100, description: "Higher fat or keto" },
  },
};

