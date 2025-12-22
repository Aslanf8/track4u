"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { FoodEntry } from "@/lib/db/schema";

interface FoodEntryCardProps {
  entry: FoodEntry;
  onDelete?: (id: string) => void;
  onClick?: (entry: FoodEntry) => void;
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

  return (
    <Card
      onClick={handleCardClick}
      className={`p-3 sm:p-4 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all ${
        onClick
          ? "cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 hover:shadow-md active:scale-[0.99]"
          : ""
      }`}
    >
      <div className="flex gap-2.5 sm:gap-4">
        {entry.imageUrl && (
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
            <Image
              src={entry.imageUrl}
              alt={entry.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1.5 sm:gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {entry.name}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500">
                {format(new Date(entry.consumedAt), "h:mm a")}
              </p>
            </div>
            <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold text-xs sm:text-sm shrink-0">
              {entry.calories} cal
            </Badge>
          </div>

          <div className="mt-1.5 sm:mt-2 flex gap-2 sm:gap-3 text-[10px] sm:text-xs text-zinc-500">
            <span>P: {entry.protein}g</span>
            <span>C: {entry.carbs}g</span>
            <span>F: {entry.fat}g</span>
          </div>
        </div>

        {onDelete && (
          <button
            onClick={handleDeleteClick}
            className="text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-0.5 sm:p-1 self-start"
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
    </Card>
  );
}
