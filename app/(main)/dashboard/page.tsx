"use client";

import { useState, useEffect, useCallback } from "react";
import { DailyProgress } from "@/components/dashboard/DailyProgress";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { FoodEntryCard } from "@/components/food/FoodEntryCard";
import { FoodEntryDialog } from "@/components/food/FoodEntryDialog";
import { GoalsWizard } from "@/components/onboarding/GoalsWizard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useTodayEntries } from "@/lib/hooks/use-food-entries";
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
  const {
    entries,
    totals,
    isLoading: entriesLoading,
    updateEntry,
    removeEntry,
    streak,
  } = useTodayEntries();
  const [goals, setGoals] = useState<Goals | null>(null);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<FoodEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchGoals = useCallback(async () => {
    const response = await fetch("/api/goals");
    const data = await response.json();

    if (!data || (!data.dailyCalories && !data.dailyProtein)) {
      setShowOnboarding(true);
      setGoals(null);
    } else {
      setGoals(data);
    }
    setGoalsLoading(false);
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const isLoading = entriesLoading || goalsLoading;

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/food/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      removeEntry(id);
      toast.success("Entry deleted");
    }
  };

  const handleEntryClick = (entry: FoodEntry) => {
    setSelectedEntry(entry);
    setDialogOpen(true);
  };

  const handleEntryUpdate = (updatedEntry: FoodEntry) => {
    updateEntry(updatedEntry);
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
      <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 px-0.5 sm:px-1">
        <Skeleton className="h-7 sm:h-8 w-36 sm:w-48 bg-zinc-200 dark:bg-zinc-800" />
        <Skeleton className="h-64 sm:h-80 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Skeleton className="h-20 sm:h-28 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <Skeleton className="h-20 sm:h-28 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <Skeleton className="h-20 sm:h-28 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 px-0.5 sm:px-1">
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
        streak={streak}
      />

      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Today&apos;s Meals
          </h2>
          {entries.length > 0 && (
            <span className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500">
              {entries.length} {entries.length === 1 ? "meal" : "meals"}
            </span>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-10 sm:py-14 text-zinc-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 opacity-40"
            >
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              <path d="M8.5 8.5v.01" />
              <path d="M16 15.5v.01" />
              <path d="M12 12v.01" />
              <path d="M11 17v.01" />
              <path d="M7 14v.01" />
            </svg>
            <p className="text-sm sm:text-base font-medium">
              No meals logged yet
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Tap the camera to scan your first meal!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
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
