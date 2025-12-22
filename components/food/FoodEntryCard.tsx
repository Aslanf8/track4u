"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import type { FoodEntry } from "@/lib/db/schema";

interface FoodEntryCardProps {
  entry: FoodEntry;
  onDelete?: (id: string) => void;
  onClick?: (entry: FoodEntry) => void;
}

interface MacroItemProps {
  label: string;
  value: number;
  unit?: string;
  color: string;
}

function MacroItem({ label, value, unit = "g", color }: MacroItemProps) {
  return (
    <div className="flex flex-col items-center min-w-0">
      <span
        className={`text-[11px] sm:text-sm font-semibold tabular-nums ${color}`}
      >
        {Math.round(value)}
        {unit}
      </span>
      <span className="text-[8px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide font-medium">
        {label}
      </span>
    </div>
  );
}

export function FoodEntryCard({
  entry,
  onDelete,
  onClick,
}: FoodEntryCardProps) {
  const handleCardClick = () => {
    onClick?.(entry);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(entry.id);
  };

  const hasFiber = entry.fiber !== null && entry.fiber > 0;

  return (
    <Card
      onClick={handleCardClick}
      className={`group overflow-hidden bg-white dark:bg-zinc-900/80 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 ${
        onClick
          ? "cursor-pointer hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 active:scale-[0.995]"
          : ""
      }`}
    >
      <div className="flex">
        {/* Image Section */}
        {entry.imageUrl && (
          <div className="relative w-[72px] h-[72px] sm:w-24 sm:h-24 flex-shrink-0">
            <Image
              src={entry.imageUrl}
              alt={entry.name}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 dark:to-zinc-900/20" />
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 min-w-0 p-2.5 sm:p-4 flex flex-col justify-between">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-[13px] sm:text-base font-semibold text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-2">
                {entry.name}
              </h3>
              <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium">
                {format(new Date(entry.consumedAt), "h:mm a")}
              </p>
            </div>

            {/* Calories Badge + Delete */}
            <div className="flex items-center gap-1 shrink-0">
              <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20">
                <span className="text-[13px] sm:text-base font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {entry.calories}
                </span>
                <span className="text-[9px] sm:text-xs text-amber-500/80 dark:text-amber-400/70 ml-0.5 font-medium">
                  cal
                </span>
              </div>

              {onDelete && (
                <button
                  onClick={handleDeleteClick}
                  className="opacity-0 group-hover:opacity-100 sm:text-zinc-300 sm:dark:text-zinc-600 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-all p-1.5 -mr-1 touch-manipulation"
                  aria-label="Delete entry"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Macros Row */}
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className="flex items-center justify-around">
              <MacroItem
                label="Protein"
                value={entry.protein}
                color="text-emerald-600 dark:text-emerald-400"
              />
              <div className="w-px h-5 sm:h-6 bg-zinc-200/80 dark:bg-zinc-700/50" />
              <MacroItem
                label="Carbs"
                value={entry.carbs}
                color="text-blue-600 dark:text-blue-400"
              />
              <div className="w-px h-5 sm:h-6 bg-zinc-200/80 dark:bg-zinc-700/50" />
              <MacroItem
                label="Fat"
                value={entry.fat}
                color="text-orange-600 dark:text-orange-400"
              />
              {hasFiber && (
                <>
                  <div className="w-px h-5 sm:h-6 bg-zinc-200/80 dark:bg-zinc-700/50" />
                  <MacroItem
                    label="Fiber"
                    value={entry.fiber!}
                    color="text-violet-600 dark:text-violet-400"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
