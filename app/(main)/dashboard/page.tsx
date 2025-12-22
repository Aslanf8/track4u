"use client";

import { useState, useEffect, useCallback } from "react";
import { DailyProgress } from "@/components/dashboard/DailyProgress";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { FoodEntryCard } from "@/components/food/FoodEntryCard";
import { FoodEntryDialog } from "@/components/food/FoodEntryDialog";
import { GoalsWizard } from "@/components/onboarding/GoalsWizard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { startOfDay, endOfDay } from "date-fns";
import type { FoodEntry } from "@/lib/db/schema";

interface Goals {
  age?: number;
  sex?: string;
  weight?: number;
  height?: number;
  activityLevel?: string;
  goalType?: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<FoodEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    const today = new Date();
    const start = startOfDay(today).toISOString();
    const end = endOfDay(today).toISOString();

    const [entriesRes, goalsRes] = await Promise.all([
      fetch(`/api/food?startDate=${start}&endDate=${end}`),
      fetch("/api/goals"),
    ]);

    const entriesData = await entriesRes.json();
    const goalsData = await goalsRes.json();

    setEntries(entriesData);

    // Check if user has goals set
    if (!goalsData || (!goalsData.dailyCalories && !goalsData.dailyProtein)) {
      setShowOnboarding(true);
      setGoals(null);
    } else {
      setGoals(goalsData);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/food/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setEntries(entries.filter((e) => e.id !== id));
      toast.success("Entry deleted");
    }
  };

  const handleEntryClick = (entry: FoodEntry) => {
    setSelectedEntry(entry);
    setDialogOpen(true);
  };

  const handleEntryUpdate = (updatedEntry: FoodEntry) => {
    setEntries(
      entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    );
  };

  const handleOnboardingComplete = async (newGoals: Goals) => {
    try {
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoals),
      });

      if (!response.ok) {
        throw new Error("Failed to save goals");
      }

      setGoals(newGoals);
      setShowOnboarding(false);
      toast.success("Goals saved! You're all set to start tracking.");
    } catch {
      toast.error("Failed to save goals. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 px-1">
        <Skeleton className="h-7 sm:h-8 w-36 sm:w-48 bg-zinc-200 dark:bg-zinc-800" />
        <Skeleton className="h-64 sm:h-80 w-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3">
          <Skeleton className="h-24 sm:h-32 bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-24 sm:h-32 bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-24 sm:h-32 bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 px-1">
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Dashboard
      </h1>

      <DailyProgress
        calories={{
          current: totals.calories,
          goal: goals?.dailyCalories || 2000,
        }}
        protein={{ current: totals.protein, goal: goals?.dailyProtein || 50 }}
        carbs={{ current: totals.carbs, goal: goals?.dailyCarbs || 250 }}
        fat={{ current: totals.fat, goal: goals?.dailyFat || 65 }}
      />

      <QuickStats
        mealsLogged={entries.length}
        remainingCalories={(goals?.dailyCalories || 2000) - totals.calories}
        streak={1}
      />

      <div className="space-y-2 sm:space-y-3">
        <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Today&apos;s Meals
        </h2>
        {entries.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-zinc-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50"
            >
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              <path d="M8.5 8.5v.01" />
              <path d="M16 15.5v.01" />
              <path d="M12 12v.01" />
              <path d="M11 17v.01" />
              <path d="M7 14v.01" />
            </svg>
            <p className="text-sm sm:text-base">No meals logged yet today</p>
            <p className="text-xs sm:text-sm mt-1">
              Tap the camera button to scan your first meal!
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {entries.map((entry) => (
              <FoodEntryCard
                key={entry.id}
                entry={entry}
                onDelete={handleDelete}
                onClick={handleEntryClick}
              />
            ))}
          </div>
        )}
      </div>

      <GoalsWizard
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      <FoodEntryDialog
        entry={selectedEntry}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUpdate={handleEntryUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
