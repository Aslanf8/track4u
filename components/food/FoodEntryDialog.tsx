"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import type { FoodEntry } from "@/lib/db/schema";

interface FoodEntryDialogProps {
  entry: FoodEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (updatedEntry: FoodEntry) => void;
  onDelete?: (id: string) => void;
}

interface FormData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  description: string;
}

export function FoodEntryDialog({
  entry,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: FoodEntryDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    description: "",
  });

  // Populate form when entry changes or dialog opens
  useEffect(() => {
    if (entry && open) {
      setFormData({
        name: entry.name,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        fiber: entry.fiber ?? 0,
        description: entry.description ?? "",
      });
      setIsEditing(false);
    }
  }, [entry, open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsEditing(false);
    }
    onOpenChange(newOpen);
  };

  const handleSave = async () => {
    if (!entry) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/food/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update");

      const updatedEntry = await response.json();
      toast.success("Entry updated successfully");
      onUpdate?.(updatedEntry);
      setIsEditing(false);
      onOpenChange(false);
    } catch {
      toast.error("Failed to update entry");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    onDelete?.(entry.id);
    onOpenChange(false);
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100 text-lg">
            {isEditing ? "Edit Entry" : "Food Details"}
          </DialogTitle>
        </DialogHeader>

        {/* Image */}
        {entry.imageUrl && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={entry.imageUrl}
              alt={entry.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* View Mode */}
        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {entry.name}
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                {format(new Date(entry.consumedAt), "EEEE, MMMM d 'at' h:mm a")}
              </p>
            </div>

            {entry.description && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {entry.description}
              </p>
            )}

            {/* Nutrition Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-500/10 dark:bg-amber-500/20 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {entry.calories}
                </p>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">
                  Calories
                </p>
              </div>
              <div className="bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {entry.protein}g
                </p>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">
                  Protein
                </p>
              </div>
              <div className="bg-sky-500/10 dark:bg-sky-500/20 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                  {entry.carbs}g
                </p>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">
                  Carbs
                </p>
              </div>
              <div className="bg-rose-500/10 dark:bg-rose-500/20 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {entry.fat}g
                </p>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">
                  Fat
                </p>
              </div>
            </div>

            {entry.fiber !== null && entry.fiber !== undefined && entry.fiber > 0 && (
              <div className="bg-violet-500/10 dark:bg-violet-500/20 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
                  {entry.fiber}g Fiber
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="calories" className="text-zinc-700 dark:text-zinc-300">
                  Calories
                </Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories}
                  onChange={(e) =>
                    setFormData({ ...formData, calories: Number(e.target.value) })
                  }
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein" className="text-zinc-700 dark:text-zinc-300">
                  Protein (g)
                </Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) =>
                    setFormData({ ...formData, protein: Number(e.target.value) })
                  }
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs" className="text-zinc-700 dark:text-zinc-300">
                  Carbs (g)
                </Label>
                <Input
                  id="carbs"
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) =>
                    setFormData({ ...formData, carbs: Number(e.target.value) })
                  }
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat" className="text-zinc-700 dark:text-zinc-300">
                  Fat (g)
                </Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  value={formData.fat}
                  onChange={(e) =>
                    setFormData({ ...formData, fat: Number(e.target.value) })
                  }
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiber" className="text-zinc-700 dark:text-zinc-300">
                Fiber (g)
              </Label>
              <Input
                id="fiber"
                type="number"
                step="0.1"
                value={formData.fiber}
                onChange={(e) =>
                  setFormData({ ...formData, fiber: Number(e.target.value) })
                }
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-zinc-700 dark:text-zinc-300">
                Description
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description..."
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          {!isEditing ? (
            <>
              {onDelete && (
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="flex-1 sm:flex-none border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mr-1.5"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  Delete
                </Button>
              )}
              <Button
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-1.5"
                >
                  <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                  <path d="m15 5 4 4" />
                </svg>
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="flex-1 sm:flex-none border-zinc-300 dark:border-zinc-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 mr-1.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

