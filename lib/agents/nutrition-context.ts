// Comprehensive nutrition context builder for agent tools
// Aggregates all relevant user data for nutrition insights

import { db } from "@/lib/db";
import { userGoals, foodEntries } from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { calculateBMR, calculateTDEE, calculateMetabolicMetrics } from "@/lib/calculations";

export interface NutritionContext {
  profile: {
    age: number | null;
    sex: "male" | "female" | null;
    weight: number | null; // kg
    height: number | null; // cm
    activityLevel: string | null;
    goalType: "lose" | "maintain" | "gain" | null;
  };
  goals: {
    dailyCalories: number;
    dailyProtein: number;
    dailyCarbs: number;
    dailyFat: number;
  };
  today: {
    date: string;
    totals: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
    remaining: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    entryCount: number;
  };
  last7Days: {
    startDate: string;
    endDate: string;
    averages: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    totalEntries: number;
    consistency: number; // Percentage of days with entries
  };
  last30Days: {
    startDate: string;
    endDate: string;
    averages: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    totalEntries: number;
    consistency: number;
  };
  metabolic: {
    bmr: number;
    tdee: number;
    deficit: number;
    projectedLoss: number; // lbs per week
  };
  recentEntries: Array<{
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    consumedAt: string;
  }>;
  streak: {
    current: number; // days
    longest: number; // days
  };
}

/**
 * Get complete nutrition context for a user
 * Aggregates all relevant data in a single call
 */
export async function getNutritionContext(userId: string): Promise<NutritionContext> {
  // Fetch user goals
  const goals = await db.query.userGoals.findFirst({
    where: eq(userGoals.userId, userId),
  });

  // Get today's date boundaries
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  // Get last 7 days
  const last7DaysStart = new Date(today);
  last7DaysStart.setDate(last7DaysStart.getDate() - 6);

  // Get last 30 days
  const last30DaysStart = new Date(today);
  last30DaysStart.setDate(last30DaysStart.getDate() - 29);

  // Fetch today's entries
  const todayEntries = await db.query.foodEntries.findMany({
    where: and(
      eq(foodEntries.userId, userId),
      gte(foodEntries.consumedAt, today),
      lte(foodEntries.consumedAt, todayEnd)
    ),
    orderBy: [desc(foodEntries.consumedAt)],
  });

  // Fetch last 7 days entries
  const last7DaysEntries = await db.query.foodEntries.findMany({
    where: and(
      eq(foodEntries.userId, userId),
      gte(foodEntries.consumedAt, last7DaysStart),
      lte(foodEntries.consumedAt, todayEnd)
    ),
  });

  // Fetch last 30 days entries
  const last30DaysEntries = await db.query.foodEntries.findMany({
    where: and(
      eq(foodEntries.userId, userId),
      gte(foodEntries.consumedAt, last30DaysStart),
      lte(foodEntries.consumedAt, todayEnd)
    ),
  });

  // Fetch recent entries (last 10)
  const recentEntries = await db.query.foodEntries.findMany({
    where: eq(foodEntries.userId, userId),
    orderBy: [desc(foodEntries.consumedAt)],
    limit: 10,
  });

  // Calculate today's totals
  const todayTotals = todayEntries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
      fiber: acc.fiber + (entry.fiber || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  // Calculate remaining targets
  const dailyCalories = goals?.dailyCalories || 2000;
  const dailyProtein = goals?.dailyProtein || 50;
  const dailyCarbs = goals?.dailyCarbs || 250;
  const dailyFat = goals?.dailyFat || 65;

  const remaining = {
    calories: Math.max(0, dailyCalories - todayTotals.calories),
    protein: Math.max(0, dailyProtein - todayTotals.protein),
    carbs: Math.max(0, dailyCarbs - todayTotals.carbs),
    fat: Math.max(0, dailyFat - todayTotals.fat),
  };

  // Calculate last 7 days averages
  const last7DaysTotals = last7DaysEntries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Get unique days with entries in last 7 days
  const uniqueDays7 = new Set(
    last7DaysEntries.map((e) => e.consumedAt.toISOString().split("T")[0])
  ).size;

  const last7DaysAverages = {
    calories: last7DaysEntries.length > 0 ? Math.round(last7DaysTotals.calories / 7) : 0,
    protein: last7DaysEntries.length > 0 ? Math.round((last7DaysTotals.protein / 7) * 10) / 10 : 0,
    carbs: last7DaysEntries.length > 0 ? Math.round((last7DaysTotals.carbs / 7) * 10) / 10 : 0,
    fat: last7DaysEntries.length > 0 ? Math.round((last7DaysTotals.fat / 7) * 10) / 10 : 0,
  };

  // Calculate last 30 days averages
  const last30DaysTotals = last30DaysEntries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Get unique days with entries in last 30 days
  const uniqueDays30 = new Set(
    last30DaysEntries.map((e) => e.consumedAt.toISOString().split("T")[0])
  ).size;

  const last30DaysAverages = {
    calories: last30DaysEntries.length > 0 ? Math.round(last30DaysTotals.calories / 30) : 0,
    protein: last30DaysEntries.length > 0 ? Math.round((last30DaysTotals.protein / 30) * 10) / 10 : 0,
    carbs: last30DaysEntries.length > 0 ? Math.round((last30DaysTotals.carbs / 30) * 10) / 10 : 0,
    fat: last30DaysEntries.length > 0 ? Math.round((last30DaysTotals.fat / 30) * 10) / 10 : 0,
  };

  // Calculate metabolic metrics
  const profile = {
    age: goals?.age || null,
    sex: (goals?.sex as "male" | "female") || null,
    weight: goals?.weight || null,
    height: goals?.height || null,
    activityLevel: (goals?.activityLevel as "sedentary" | "light" | "moderate" | "active" | "very_active" | null) || null,
    goalType: (goals?.goalType as "lose" | "maintain" | "gain") || null,
  };

  const metabolic = goals
    ? calculateMetabolicMetrics(profile, dailyCalories)
    : { bmr: 0, tdee: 0, deficit: 0, projectedLoss: 0 };

  // Calculate streak
  const allEntries = await db.query.foodEntries.findMany({
    where: eq(foodEntries.userId, userId),
    orderBy: [desc(foodEntries.consumedAt)],
  });

  const streak = calculateStreak(allEntries);

  return {
    profile,
    goals: {
      dailyCalories,
      dailyProtein,
      dailyCarbs,
      dailyFat,
    },
    today: {
      date: today.toISOString().split("T")[0],
      totals: {
        calories: todayTotals.calories,
        protein: Math.round(todayTotals.protein * 10) / 10,
        carbs: Math.round(todayTotals.carbs * 10) / 10,
        fat: Math.round(todayTotals.fat * 10) / 10,
        fiber: Math.round(todayTotals.fiber * 10) / 10,
      },
      remaining,
      entryCount: todayEntries.length,
    },
    last7Days: {
      startDate: last7DaysStart.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
      averages: last7DaysAverages,
      totalEntries: last7DaysEntries.length,
      consistency: Math.round((uniqueDays7 / 7) * 100),
    },
    last30Days: {
      startDate: last30DaysStart.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
      averages: last30DaysAverages,
      totalEntries: last30DaysEntries.length,
      consistency: Math.round((uniqueDays30 / 30) * 100),
    },
    metabolic,
    recentEntries: recentEntries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      calories: entry.calories,
      protein: Math.round(entry.protein * 10) / 10,
      carbs: Math.round(entry.carbs * 10) / 10,
      fat: Math.round(entry.fat * 10) / 10,
      consumedAt: entry.consumedAt.toISOString(),
    })),
    streak,
  };
}

/**
 * Calculate current and longest streak of consecutive days with food entries
 */
function calculateStreak(entries: Array<{ consumedAt: Date }>): { current: number; longest: number } {
  if (entries.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Get unique dates (YYYY-MM-DD)
  const uniqueDates = new Set(
    entries.map((e) => {
      const date = new Date(e.consumedAt);
      date.setHours(0, 0, 0, 0);
      return date.toISOString().split("T")[0];
    })
  );

  const sortedDates = Array.from(uniqueDates).sort().reverse(); // Most recent first

  // Calculate current streak (from today backwards)
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  let checkDate = new Date(today);
  for (const dateStr of sortedDates) {
    const checkDateStr = checkDate.toISOString().split("T")[0];
    if (dateStr === checkDateStr) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateStr < checkDateStr) {
      // Gap found, stop counting
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.floor(
      (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return { current: currentStreak, longest: longestStreak };
}

/**
 * Get today's totals and remaining targets
 */
export async function getTodayTotals(userId: string) {
  const context = await getNutritionContext(userId);
  return {
    date: context.today.date,
    totals: context.today.totals,
    remaining: context.today.remaining,
    goals: context.goals,
  };
}

/**
 * Get historical data for a date range
 */
export async function getHistoricalData(
  userId: string,
  startDate: string,
  endDate: string
) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const entries = await db.query.foodEntries.findMany({
    where: and(
      eq(foodEntries.userId, userId),
      gte(foodEntries.consumedAt, start),
      lte(foodEntries.consumedAt, end)
    ),
    orderBy: [desc(foodEntries.consumedAt)],
  });

  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
      fiber: acc.fiber + (entry.fiber || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const uniqueDays = new Set(
    entries.map((e) => e.consumedAt.toISOString().split("T")[0])
  ).size;

  const daysInRange = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return {
    startDate,
    endDate,
    totalEntries: entries.length,
    uniqueDays,
    consistency: Math.round((uniqueDays / daysInRange) * 100),
    totals: {
      calories: totals.calories,
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10,
    },
    averages: {
      calories: uniqueDays > 0 ? Math.round(totals.calories / uniqueDays) : 0,
      protein: uniqueDays > 0 ? Math.round((totals.protein / uniqueDays) * 10) / 10 : 0,
      carbs: uniqueDays > 0 ? Math.round((totals.carbs / uniqueDays) * 10) / 10 : 0,
      fat: uniqueDays > 0 ? Math.round((totals.fat / uniqueDays) * 10) / 10 : 0,
    },
    entries: entries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      calories: entry.calories,
      protein: Math.round(entry.protein * 10) / 10,
      carbs: Math.round(entry.carbs * 10) / 10,
      fat: Math.round(entry.fat * 10) / 10,
      consumedAt: entry.consumedAt.toISOString(),
    })),
  };
}

