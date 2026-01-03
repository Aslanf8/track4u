"use client";

import { useState } from "react";
import { FloatingCameraButton } from "./FloatingCameraButton";
import { FoodScanner } from "@/components/food/FoodScanner";
import { toast } from "sonner";
import { useFoodEntries } from "@/lib/hooks/use-food-entries";
import type { FoodEntry } from "@/lib/db/schema";

export function GlobalScanner() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const { addEntry, triggerRefresh } = useFoodEntries();

  const handleSave = async (data: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    description: string;
    imageUrl?: string;
    ingredientBreakdown?: unknown;
  }) => {
    const response = await fetch("/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to save entry");
    }

    const savedEntry: FoodEntry = await response.json();
    
    // Optimistically add the entry to the shared state
    addEntry(savedEntry);
    
    // Also trigger a full refresh to ensure consistency
    triggerRefresh();

    toast.success("Meal logged!");
  };

  return (
    <>
      <FloatingCameraButton onClick={() => setScannerOpen(true)} />
      <FoodScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onSave={handleSave}
      />
    </>
  );
}
