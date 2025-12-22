"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import type { FoodEntry } from "@/lib/db/schema";

interface FoodEntriesContextValue {
  // State
  entries: FoodEntry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  refetch: () => Promise<void>;
  addEntry: (entry: FoodEntry) => void;
  updateEntry: (entry: FoodEntry) => void;
  removeEntry: (id: string) => void;
  triggerRefresh: () => void;

  // Filtered views
  todayEntries: FoodEntry[];
  last30DaysEntries: FoodEntry[];
  
  // Stats
  streak: number;
  
  // Refresh trigger for external sync
  refreshKey: number;
}

const FoodEntriesContext = createContext<FoodEntriesContextValue | null>(null);

interface FoodEntriesProviderProps {
  children: ReactNode;
}

export function FoodEntriesProvider({ children }: FoodEntriesProviderProps) {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchEntries = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/food");

      if (!response.ok) {
        throw new Error("Failed to fetch entries");
      }

      const data = await response.json();
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Refetch when refreshKey changes (except initial)
  useEffect(() => {
    if (refreshKey > 0) {
      fetchEntries();
    }
  }, [refreshKey, fetchEntries]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchEntries();
  }, [fetchEntries]);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Optimistic updates
  const addEntry = useCallback((entry: FoodEntry) => {
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const updateEntry = useCallback((updatedEntry: FoodEntry) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    );
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Computed filtered views
  const todayEntries = useMemo(() => {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    return entries.filter((entry) => {
      const entryDate = new Date(entry.consumedAt);
      return entryDate >= start && entryDate <= end;
    });
  }, [entries]);

  const last30DaysEntries = useMemo(() => {
    const start = subDays(new Date(), 30);
    
    return entries.filter((entry) => {
      const entryDate = new Date(entry.consumedAt);
      return entryDate >= start;
    });
  }, [entries]);

  // Calculate streak - consecutive days with at least one meal logged
  const streak = useMemo(() => {
    if (entries.length === 0) return 0;

    // Get unique dates with entries (as "yyyy-MM-dd" strings)
    const datesWithEntries = new Set(
      entries.map((entry) => format(new Date(entry.consumedAt), "yyyy-MM-dd"))
    );

    // Start counting from today
    let currentStreak = 0;
    let checkDate = new Date();

    // If today has no entries, check if yesterday has entries to start the streak
    const todayStr = format(checkDate, "yyyy-MM-dd");
    const hasTodayEntry = datesWithEntries.has(todayStr);

    if (!hasTodayEntry) {
      // If no entry today, start from yesterday
      checkDate = subDays(checkDate, 1);
      const yesterdayStr = format(checkDate, "yyyy-MM-dd");

      // If yesterday also has no entries, streak is 0
      if (!datesWithEntries.has(yesterdayStr)) {
        return 0;
      }
    }

    // Count consecutive days going backwards
    while (datesWithEntries.has(format(checkDate, "yyyy-MM-dd"))) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);

      // Safety limit - max 365 days
      if (currentStreak >= 365) break;
    }

    return currentStreak;
  }, [entries]);

  const value: FoodEntriesContextValue = {
    entries,
    isLoading,
    error,
    refetch,
    addEntry,
    updateEntry,
    removeEntry,
    triggerRefresh,
    todayEntries,
    last30DaysEntries,
    streak,
    refreshKey,
  };

  return (
    <FoodEntriesContext.Provider value={value}>
      {children}
    </FoodEntriesContext.Provider>
  );
}

export function useFoodEntries() {
  const context = useContext(FoodEntriesContext);

  if (!context) {
    throw new Error("useFoodEntries must be used within FoodEntriesProvider");
  }

  return context;
}

// Hook for today's data specifically (dashboard)
export function useTodayEntries() {
  const {
    todayEntries,
    isLoading,
    error,
    updateEntry,
    removeEntry,
    triggerRefresh,
    streak,
  } = useFoodEntries();

  const totals = useMemo(() => {
    return todayEntries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [todayEntries]);

  return {
    entries: todayEntries,
    totals,
    isLoading,
    error,
    updateEntry,
    removeEntry,
    triggerRefresh,
    streak,
  };
}

// Hook for all history
export function useHistoryEntries() {
  const {
    entries,
    isLoading,
    error,
    updateEntry,
    removeEntry,
    triggerRefresh,
  } = useFoodEntries();

  return {
    entries,
    isLoading,
    error,
    updateEntry,
    removeEntry,
    triggerRefresh,
  };
}

// Hook for progress/analytics data
export function useProgressEntries() {
  const { last30DaysEntries, isLoading, error, triggerRefresh } =
    useFoodEntries();

  return {
    entries: last30DaysEntries,
    isLoading,
    error,
    triggerRefresh,
  };
}
