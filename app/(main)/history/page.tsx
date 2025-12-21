"use client";

import { useState, useEffect } from "react";
import { FoodEntryCard } from "@/components/food/FoodEntryCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, isToday, isYesterday, startOfDay } from "date-fns";
import type { FoodEntry } from "@/lib/db/schema";

export default function HistoryPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadEntries = async () => {
    const response = await fetch("/api/food");
    const data = await response.json();
    setEntries(data);
    setIsLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadEntries(); }, []);

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/food/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setEntries(entries.filter((e) => e.id !== id));
    }
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
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800" />
        <Skeleton className="h-10 w-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-3">
          <Skeleton className="h-24 w-full bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-24 w-full bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-24 w-full bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">History</h1>

      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <Input
          placeholder="Search meals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500"
        />
      </div>

      {Object.keys(groupedEntries).length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mx-auto mb-4 opacity-50">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
          </svg>
          <p>No meals found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEntries)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, dayEntries]) => {
              const totals = getDayTotals(dayEntries);
              return (
                <div key={date} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatDateHeader(date)}
                    </h2>
                    <span className="text-sm text-zinc-500">
                      {totals.calories} cal | P: {Math.round(totals.protein)}g | C: {Math.round(totals.carbs)}g | F: {Math.round(totals.fat)}g
                    </span>
                  </div>
                  <div className="space-y-3">
                    {dayEntries.map((entry) => (
                      <FoodEntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
