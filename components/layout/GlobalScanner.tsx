"use client";

import { useState } from "react";
import { FloatingCameraButton } from "./FloatingCameraButton";
import { FoodScanner } from "@/components/food/FoodScanner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function GlobalScanner() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const router = useRouter();

  const handleSave = async (data: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    description: string;
    imageUrl?: string;
  }) => {
    const response = await fetch("/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to save entry");
    }

    toast.success("Meal logged!");
    router.refresh();
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

