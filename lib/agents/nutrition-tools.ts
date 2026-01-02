// Agent tools for nutrition data access
// Uses OpenAI Agents SDK tool() helper with Zod schemas

import { tool } from "@openai/agents";
import { z } from "zod";
import type { RunContext } from "@openai/agents";
import {
  getNutritionContext,
  getTodayTotals,
  getHistoricalData,
} from "./nutrition-context";
import { db } from "@/lib/db";
import { foodEntries } from "@/lib/db/schema";
import { eq, and, gte, lte, desc, like } from "drizzle-orm";

// Context type for agent tools
interface UserContext {
  userId: string;
}

/**
 * Get complete nutrition snapshot
 * Returns comprehensive context including goals, today's progress, trends, and metabolic metrics
 */
export const getNutritionContextTool = tool({
  name: "get_nutrition_context",
  description:
    "Get complete nutrition snapshot including goals, today's progress, recent trends (7 and 30 days), metabolic metrics (BMR, TDEE, deficit), recent food entries, and streak information. Use this as the primary tool to understand the user's overall nutrition status.",
  parameters: z.object({}),
  execute: async (_args, runContext?: RunContext<UserContext>) => {
    const userId = runContext?.context?.userId;
    if (!userId) {
      return JSON.stringify({ error: "User ID not found in context" });
    }

    try {
      const context = await getNutritionContext(userId);
      return JSON.stringify(context, null, 2);
    } catch (error) {
      console.error("Error getting nutrition context:", error);
      return JSON.stringify({ error: "Failed to fetch nutrition context" });
    }
  },
});

/**
 * Get today's consumption totals and remaining targets
 */
export const getTodayTotalsTool = tool({
  name: "get_today_totals",
  description:
    "Get today's consumption totals (calories, protein, carbs, fat) and remaining amounts needed to reach daily goals. Useful for answering questions like 'How much protein do I need today?' or 'What can I eat to reach my goals?'",
  parameters: z.object({}),
  execute: async (_args, runContext?: RunContext<UserContext>) => {
    const userId = runContext?.context?.userId;
    if (!userId) {
      return JSON.stringify({ error: "User ID not found in context" });
    }

    try {
      const data = await getTodayTotals(userId);
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Error getting today's totals:", error);
      return JSON.stringify({ error: "Failed to fetch today's totals" });
    }
  },
});

/**
 * Get historical data for a date range
 */
export const getHistoricalDataTool = tool({
  name: "get_historical_data",
  description:
    "Get aggregated nutrition data for a specific date range. Returns totals, averages, consistency, and all entries. Use for comparing periods, analyzing trends, or answering questions about past consumption.",
  parameters: z.object({
    startDate: z
      .string()
      .describe("Start date in YYYY-MM-DD format"),
    endDate: z
      .string()
      .describe("End date in YYYY-MM-DD format (inclusive)"),
  }),
  execute: async (
    { startDate, endDate },
    runContext?: RunContext<UserContext>
  ) => {
    const userId = runContext?.context?.userId;
    if (!userId) {
      return JSON.stringify({ error: "User ID not found in context" });
    }

    try {
      const data = await getHistoricalData(userId, startDate, endDate);
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Error getting historical data:", error);
      return JSON.stringify({ error: "Failed to fetch historical data" });
    }
  },
});

/**
 * Get food entries with optional filtering
 */
export const getFoodEntriesTool = tool({
  name: "get_food_entries",
  description:
    "Get food entries with optional filtering by date range or search term. Returns detailed information about each entry including name, macros, and consumption time. Use for finding specific foods or analyzing eating patterns.",
  strict: false,
  parameters: {
    type: "object",
    properties: {
      startDate: {
        type: "string",
        description: "Optional start date in YYYY-MM-DD format",
      },
      endDate: {
        type: "string",
        description: "Optional end date in YYYY-MM-DD format (inclusive)",
      },
      searchTerm: {
        type: "string",
        description: "Optional search term to filter by food name",
      },
      limit: {
        type: "number",
        description: "Maximum number of entries to return (1-100, default 50)",
        minimum: 1,
        maximum: 100,
      },
    },
    required: [],
    additionalProperties: true,
  },
  execute: async (input: unknown, runContext?: RunContext<UserContext>) => {
    const params = (input as {
      startDate?: string;
      endDate?: string;
      searchTerm?: string;
      limit?: number;
    }) || {};
    const { startDate, endDate, searchTerm, limit } = params;
    const actualLimit = limit ?? 50; // Default to 50 if not provided
    const userId = runContext?.context?.userId;
    if (!userId) {
      return JSON.stringify({ error: "User ID not found in context" });
    }

    try {
      const conditions = [eq(foodEntries.userId, userId)];

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        conditions.push(gte(foodEntries.consumedAt, start));
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        conditions.push(lte(foodEntries.consumedAt, end));
      }

      if (searchTerm) {
        conditions.push(like(foodEntries.name, `%${searchTerm}%`));
      }

      const entries = await db.query.foodEntries.findMany({
        where: and(...conditions),
        orderBy: [desc(foodEntries.consumedAt)],
        limit: actualLimit,
      });

      const result = entries.map((entry) => ({
        id: entry.id,
        name: entry.name,
        calories: entry.calories,
        protein: Math.round(entry.protein * 10) / 10,
        carbs: Math.round(entry.carbs * 10) / 10,
        fat: Math.round(entry.fat * 10) / 10,
        fiber: Math.round((entry.fiber || 0) * 10) / 10,
        description: entry.description || null,
        consumedAt: entry.consumedAt.toISOString(),
      }));

      return JSON.stringify({ entries: result, count: result.length }, null, 2);
    } catch (error) {
      console.error("Error getting food entries:", error);
      return JSON.stringify({ error: "Failed to fetch food entries" });
    }
  },
});

/**
 * Calculate remaining macros needed to hit goals
 */
export const calculateRemainingMacrosTool = tool({
  name: "calculate_remaining_macros",
  description:
    "Calculate exactly how much of each macro (calories, protein, carbs, fat) the user needs to consume to reach their daily goals. Returns remaining amounts and suggestions. Use when user asks 'What do I need to eat?' or 'How much more protein do I need?'",
  parameters: z.object({}),
  execute: async (_args, runContext?: RunContext<UserContext>) => {
    const userId = runContext?.context?.userId;
    if (!userId) {
      return JSON.stringify({ error: "User ID not found in context" });
    }

    try {
      const todayData = await getTodayTotals(userId);
      const remaining = todayData.remaining;

      // Calculate percentages
      const proteinPercent = Math.round(
        ((todayData.goals.dailyProtein - remaining.protein) /
          todayData.goals.dailyProtein) *
          100
      );
      const carbsPercent = Math.round(
        ((todayData.goals.dailyCarbs - remaining.carbs) /
          todayData.goals.dailyCarbs) *
          100
      );
      const fatPercent = Math.round(
        ((todayData.goals.dailyFat - remaining.fat) / todayData.goals.dailyFat) *
          100
      );
      const caloriesPercent = Math.round(
        ((todayData.goals.dailyCalories - remaining.calories) /
          todayData.goals.dailyCalories) *
          100
      );

      return JSON.stringify(
        {
          remaining,
          goals: todayData.goals,
          progress: {
            calories: caloriesPercent,
            protein: proteinPercent,
            carbs: carbsPercent,
            fat: fatPercent,
          },
          suggestions: {
            protein:
              remaining.protein > 0
                ? `Need ${remaining.protein.toFixed(1)}g more protein. Good sources: chicken breast (~30g per 100g), Greek yogurt (~10g per 100g), eggs (~6g each)`
                : "Protein goal met!",
            carbs:
              remaining.carbs > 0
                ? `Need ${remaining.carbs.toFixed(1)}g more carbs. Good sources: rice (~45g per cup), pasta (~43g per cup), sweet potato (~27g per medium)`
                : "Carbs goal met!",
            fat:
              remaining.fat > 0
                ? `Need ${remaining.fat.toFixed(1)}g more fat. Good sources: avocado (~21g per fruit), nuts (~14g per oz), olive oil (~14g per tbsp)`
                : "Fat goal met!",
            calories:
              remaining.calories > 0
                ? `Need ${remaining.calories} more calories. Consider: ${Math.round(remaining.calories * 0.3)}g protein, ${Math.round(remaining.calories * 0.4)}g carbs, ${Math.round(remaining.calories * 0.3 / 9)}g fat`
                : "Calorie goal met!",
          },
        },
        null,
        2
      );
    } catch (error) {
      console.error("Error calculating remaining macros:", error);
      return JSON.stringify({ error: "Failed to calculate remaining macros" });
    }
  },
});

/**
 * Get trend analysis over time periods
 */
export const getTrendAnalysisTool = tool({
  name: "get_trend_analysis",
  description:
    "Analyze trends in nutrition consumption over different time periods. Compares averages, consistency, and patterns. Use for answering questions like 'How am I doing this week vs last week?' or 'What's my trend over the last month?'",
  strict: false,
  parameters: {
    type: "object",
    properties: {
      period: {
        type: "string",
        enum: ["7days", "30days", "custom"],
        description: "Time period to analyze: '7days', '30days', or 'custom'. Defaults to '7days'",
      },
      startDate: {
        type: "string",
        description: "Required if period is 'custom', in YYYY-MM-DD format",
      },
      endDate: {
        type: "string",
        description: "Required if period is 'custom', in YYYY-MM-DD format",
      },
    },
    required: [],
    additionalProperties: true,
  },
  execute: async (input: unknown, runContext?: RunContext<UserContext>) => {
    const params = (input as {
      period?: "7days" | "30days" | "custom";
      startDate?: string;
      endDate?: string;
    }) || {};
    const { period = "7days", startDate, endDate } = params;
    const userId = runContext?.context?.userId;
    if (!userId) {
      return JSON.stringify({ error: "User ID not found in context" });
    }

    try {
      const context = await getNutritionContext(userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let data;
      if (period === "7days") {
        const last7DaysStart = new Date(today);
        last7DaysStart.setDate(last7DaysStart.getDate() - 6);
        data = await getHistoricalData(
          userId,
          last7DaysStart.toISOString().split("T")[0],
          today.toISOString().split("T")[0]
        );
      } else if (period === "30days") {
        const last30DaysStart = new Date(today);
        last30DaysStart.setDate(last30DaysStart.getDate() - 29);
        data = await getHistoricalData(
          userId,
          last30DaysStart.toISOString().split("T")[0],
          today.toISOString().split("T")[0]
        );
      } else if (period === "custom" && startDate && endDate) {
        data = await getHistoricalData(userId, startDate, endDate);
      } else {
        return JSON.stringify({
          error: "startDate and endDate required for custom period",
        });
      }

      // Compare with goals
      const goals = context.goals;
      const comparison = {
        calories: {
          average: data.averages.calories,
          goal: goals.dailyCalories,
          difference: data.averages.calories - goals.dailyCalories,
          percentOfGoal: Math.round(
            (data.averages.calories / goals.dailyCalories) * 100
          ),
        },
        protein: {
          average: data.averages.protein,
          goal: goals.dailyProtein,
          difference: data.averages.protein - goals.dailyProtein,
          percentOfGoal: Math.round(
            (data.averages.protein / goals.dailyProtein) * 100
          ),
        },
        carbs: {
          average: data.averages.carbs,
          goal: goals.dailyCarbs,
          difference: data.averages.carbs - goals.dailyCarbs,
          percentOfGoal: Math.round(
            (data.averages.carbs / goals.dailyCarbs) * 100
          ),
        },
        fat: {
          average: data.averages.fat,
          goal: goals.dailyFat,
          difference: data.averages.fat - goals.dailyFat,
          percentOfGoal: Math.round((data.averages.fat / goals.dailyFat) * 100),
        },
      };

      return JSON.stringify(
        {
          period,
          dateRange: {
            start: data.startDate,
            end: data.endDate,
          },
          consistency: data.consistency,
          totalEntries: data.totalEntries,
          averages: data.averages,
          comparison,
          insights: {
            calories:
              comparison.calories.difference > 0
                ? `Averaging ${comparison.calories.difference} calories above goal`
                : comparison.calories.difference < 0
                ? `Averaging ${Math.abs(comparison.calories.difference)} calories below goal`
                : "Averaging exactly at goal",
            protein:
              comparison.protein.difference > 0
                ? `Averaging ${comparison.protein.difference.toFixed(1)}g above protein goal`
                : comparison.protein.difference < 0
                ? `Averaging ${Math.abs(comparison.protein.difference).toFixed(1)}g below protein goal`
                : "Averaging exactly at protein goal",
            consistency:
              data.consistency >= 80
                ? "Excellent consistency - logging most days"
                : data.consistency >= 60
                ? "Good consistency - logging regularly"
                : data.consistency >= 40
                ? "Moderate consistency - could improve logging frequency"
                : "Low consistency - consider logging more frequently",
          },
        },
        null,
        2
      );
    } catch (error) {
      console.error("Error getting trend analysis:", error);
      return JSON.stringify({ error: "Failed to analyze trends" });
    }
  },
});

/**
 * Get metabolic metrics (BMR, TDEE, deficit, projected weight change)
 */
export const getMetabolicMetricsTool = tool({
  name: "get_metabolic_metrics",
  description:
    "Get metabolic calculations including BMR (Basal Metabolic Rate), TDEE (Total Daily Energy Expenditure), current calorie deficit/surplus, and projected weight change. Use for answering questions about metabolism, weight loss projections, or energy balance.",
  parameters: z.object({}),
  execute: async (_args, runContext?: RunContext<UserContext>) => {
    const userId = runContext?.context?.userId;
    if (!userId) {
      return JSON.stringify({ error: "User ID not found in context" });
    }

    try {
      const context = await getNutritionContext(userId);
      const metabolic = context.metabolic;
      const profile = context.profile;
      const goals = context.goals;

      return JSON.stringify(
        {
          profile: {
            age: profile.age,
            sex: profile.sex,
            weight: profile.weight ? `${profile.weight} kg` : null,
            height: profile.height ? `${profile.height} cm` : null,
            activityLevel: profile.activityLevel,
            goalType: profile.goalType,
          },
          metabolic,
          goals: {
            targetCalories: goals.dailyCalories,
            targetProtein: goals.dailyProtein,
            targetCarbs: goals.dailyCarbs,
            targetFat: goals.dailyFat,
          },
          interpretation: {
            deficit:
              metabolic.deficit > 0
                ? `You're in a ${metabolic.deficit} calorie deficit. This is good for weight loss.`
                : metabolic.deficit < 0
                ? `You're in a ${Math.abs(metabolic.deficit)} calorie surplus. This will lead to weight gain.`
                : "You're at maintenance calories.",
            projectedLoss:
              metabolic.projectedLoss > 0
                ? `Projected weight loss: ${metabolic.projectedLoss} lbs per week`
                : metabolic.projectedLoss < 0
                ? `Projected weight gain: ${Math.abs(metabolic.projectedLoss)} lbs per week`
                : "No projected weight change",
            tdee:
              metabolic.tdee > 0
                ? `Your TDEE is ${metabolic.tdee} calories. This is how many calories you burn daily based on your activity level.`
                : "TDEE cannot be calculated - missing profile information",
          },
        },
        null,
        2
      );
    } catch (error) {
      console.error("Error getting metabolic metrics:", error);
      return JSON.stringify({ error: "Failed to calculate metabolic metrics" });
    }
  },
});

// Export all tools as an array for easy use
export const nutritionTools = [
  getNutritionContextTool,
  getTodayTotalsTool,
  getHistoricalDataTool,
  getFoodEntriesTool,
  calculateRemainingMacrosTool,
  getTrendAnalysisTool,
  getMetabolicMetricsTool,
];

