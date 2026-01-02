"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { FoodEntryCard } from "@/components/food/FoodEntryCard";
import { FoodEntryDialog } from "@/components/food/FoodEntryDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format, parseISO, isToday, isYesterday, startOfDay, subDays } from "date-fns";
import type { FoodEntry } from "@/lib/db/schema";

interface DaySummaryProps {
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

function DaySummary({ totals }: DaySummaryProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
      <span className="font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
        {totals.calories} cal
      </span>
      <span className="text-zinc-300 dark:text-zinc-600">•</span>
      <div className="flex items-center gap-1.5 sm:gap-2 text-zinc-500 dark:text-zinc-400">
        <span className="tabular-nums">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {Math.round(totals.protein)}g
          </span>
          <span className="text-zinc-400 dark:text-zinc-500 ml-0.5">P</span>
        </span>
        <span className="tabular-nums">
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            {Math.round(totals.carbs)}g
          </span>
          <span className="text-zinc-400 dark:text-zinc-500 ml-0.5">C</span>
        </span>
        <span className="tabular-nums">
          <span className="text-orange-600 dark:text-orange-400 font-medium">
            {Math.round(totals.fat)}g
          </span>
          <span className="text-zinc-400 dark:text-zinc-500 ml-0.5">F</span>
        </span>
      </div>
    </div>
  );
}

type DateRange = "7" | "30" | "90" | "all";

export default function HistoryPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("30");
  const [selectedEntry, setSelectedEntry] = useState<FoodEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(false);

  // Fetch entries with date range
  const fetchEntries = useCallback(async (range: DateRange, append = false) => {
    try {
      setIsLoading(!append);
      let startDate: Date | null = null;
      
      if (range !== "all") {
        const days = parseInt(range);
        startDate = subDays(new Date(), days);
      }

      const params = new URLSearchParams();
      if (startDate) {
        params.set("startDate", startDate.toISOString());
      }

      const response = await fetch(`/api/food?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch entries");

      const data = await response.json();
      
      if (append) {
        setEntries((prev) => [...prev, ...data]);
      } else {
        setEntries(data);
        // Auto-expand first 3 dates
        const grouped = data.reduce((groups: Record<string, FoodEntry[]>, entry: FoodEntry) => {
          const date = startOfDay(new Date(entry.consumedAt)).toISOString();
          if (!groups[date]) groups[date] = [];
          groups[date].push(entry);
          return groups;
        }, {});
        const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        setExpandedDates(new Set(sortedDates.slice(0, 3)));
      }
      
      setHasMore(data.length >= 50); // Assume more if we got 50+ entries
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load entries");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries(dateRange);
  }, [dateRange, fetchEntries]);

  const updateEntry = useCallback((updatedEntry: FoodEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)));
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/food/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      removeEntry(id);
      toast.success("Entry deleted");
    }
  };

  const toggleDateExpanded = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const handleEntryClick = (entry: FoodEntry) => {
    setSelectedEntry(entry);
    setDialogOpen(true);
  };

  const handleEntryUpdate = (updatedEntry: FoodEntry) => {
    updateEntry(updatedEntry);
  };

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) =>
        entry.name.toLowerCase().includes(search.toLowerCase())
      ),
    [entries, search]
  );

  // Group entries by date
  const groupedEntries = useMemo(
    () =>
      filteredEntries.reduce((groups, entry) => {
        const date = startOfDay(new Date(entry.consumedAt)).toISOString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(entry);
        return groups;
      }, {} as Record<string, FoodEntry[]>),
    [filteredEntries]
  );

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM d");
  };

  const getDayTotals = (dayEntries: FoodEntry[]) => {
    return dayEntries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 px-0.5 sm:px-1">
        <Skeleton className="h-7 sm:h-8 w-36 sm:w-48 bg-zinc-200 dark:bg-zinc-800" />
        <Skeleton className="h-10 w-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-2 sm:space-y-3">
          <Skeleton className="h-[72px] sm:h-24 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <Skeleton className="h-[72px] sm:h-24 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <Skeleton className="h-[72px] sm:h-24 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 px-0.5 sm:px-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          History
        </h1>
        
        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant={dateRange === "7" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange("7")}
            className="h-8 px-2.5 sm:px-3 text-xs flex-1 sm:flex-none"
          >
            7d
          </Button>
          <Button
            variant={dateRange === "30" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange("30")}
            className="h-8 px-2.5 sm:px-3 text-xs flex-1 sm:flex-none"
          >
            30d
          </Button>
          <Button
            variant={dateRange === "90" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange("90")}
            className="h-8 px-2.5 sm:px-3 text-xs flex-1 sm:flex-none"
          >
            90d
          </Button>
          <Button
            variant={dateRange === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange("all")}
            className="h-8 px-2.5 sm:px-3 text-xs flex-1 sm:flex-none"
          >
            All
          </Button>
        </div>
      </div>

      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <Input
          placeholder="Search meals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 sm:h-11 bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl"
        />
      </div>

      {Object.keys(groupedEntries).length === 0 ? (
        <div className="text-center py-12 sm:py-16 text-zinc-500">
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
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
          </svg>
          <p className="text-sm sm:text-base font-medium">No meals found</p>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Your food history will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {Object.entries(groupedEntries)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, dayEntries]) => {
              const totals = getDayTotals(dayEntries);
              const isExpanded = expandedDates.has(date);
              const entryCount = dayEntries.length;
              
              return (
                <div key={date} className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900/50">
                  {/* Day Header - Clickable */}
                  <button
                    onClick={() => toggleDateExpanded(date)}
                    className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 text-left">
                          {formatDateHeader(date)}
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {entryCount} meal{entryCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <DaySummary totals={totals} />
                  </button>

                  {/* Entries - Collapsible */}
                  {isExpanded && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                      {dayEntries.map((entry) => (
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
              );
            })}
        </div>
      )}

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
