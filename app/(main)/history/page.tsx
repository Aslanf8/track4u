"use client";

import { useState, useEffect } from "react";
import { FoodEntryCard } from "@/components/food/FoodEntryCard";
import { FoodEntryDialog } from "@/components/food/FoodEntryDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format, parseISO, isToday, isYesterday, startOfDay } from "date-fns";
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

export default function HistoryPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<FoodEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadEntries = async () => {
    const response = await fetch("/api/food");
    const data = await response.json();
    setEntries(data);
    setIsLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    loadEntries();
  }, []);

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

  const filteredEntries = entries.filter((entry) =>
    entry.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group entries by date
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = startOfDay(new Date(entry.consumedAt)).toISOString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, FoodEntry[]>);

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
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        History
      </h1>

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
        <div className="space-y-5 sm:space-y-6">
          {Object.entries(groupedEntries)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, dayEntries]) => {
              const totals = getDayTotals(dayEntries);
              return (
                <div key={date} className="space-y-2 sm:space-y-3">
                  {/* Day Header */}
                  <div className="flex items-center justify-between gap-2 pb-1">
                    <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatDateHeader(date)}
                    </h2>
                    <DaySummary totals={totals} />
                  </div>

                  {/* Entries */}
                  <div className="space-y-2">
                    {dayEntries.map((entry) => (
                      <FoodEntryCard
                        key={entry.id}
                        entry={entry}
                        onDelete={handleDelete}
                        onClick={handleEntryClick}
                      />
                    ))}
                  </div>
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
