"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { FoodEntry } from "@/lib/db/schema";

interface FoodEntryCardProps {
  entry: FoodEntry;
  onDelete?: (id: string) => void;
}

export function FoodEntryCard({ entry, onDelete }: FoodEntryCardProps) {
  return (
    <Card className="p-4 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      <div className="flex gap-4">
        {entry.imageUrl && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
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
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{entry.name}</h3>
              <p className="text-sm text-zinc-500">
                {format(new Date(entry.consumedAt), "h:mm a")}
              </p>
            </div>
            <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold">
              {entry.calories} cal
            </Badge>
          </div>
          
          <div className="mt-2 flex gap-3 text-xs text-zinc-500">
            <span>P: {entry.protein}g</span>
            <span>C: {entry.carbs}g</span>
            <span>F: {entry.fat}g</span>
          </div>
        </div>
        
        {onDelete && (
          <button
            onClick={() => onDelete(entry.id)}
            className="text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
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
