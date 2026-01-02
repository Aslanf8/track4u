"use client";

import { useState, useEffect, useRef } from "react";
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
  const [goals, setGoals] = useState<{
    dailyProtein?: number;
    dailyCarbs?: number;
    dailyFat?: number;
  } | null>(null);

  // Reanalyze state
  const [reanalyzeExpanded, setReanalyzeExpanded] = useState(false);
  const [reanalyzeContext, setReanalyzeContext] = useState("");
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const reanalyzeInputRef = useRef<HTMLInputElement>(null);

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
      setReanalyzeExpanded(false);
      setReanalyzeContext("");
      
      // Fetch goals for percentage display
      fetch("/api/goals")
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setGoals({
              dailyProtein: data.dailyProtein,
              dailyCarbs: data.dailyCarbs,
              dailyFat: data.dailyFat,
            });
          }
        })
        .catch((err) => console.error("Failed to fetch goals:", err));
    }
  }, [entry, open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsEditing(false);
      setReanalyzeExpanded(false);
      setReanalyzeContext("");
    }
    onOpenChange(newOpen);
  };

  const handleReanalyze = async () => {
    if (!entry?.imageUrl) return;

    setIsReanalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: entry.imageUrl,
          context: reanalyzeContext.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "NO_API_KEY") {
          toast.error("Please add your OpenAI API key in Settings");
          return;
        }
        throw new Error(data.error || "Failed to reanalyze");
      }

      // Update form data with new analysis
      setFormData({
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber ?? 0,
        description: data.description ?? "",
      });

      // Switch to edit mode so user can review and save
      setIsEditing(true);
      setReanalyzeExpanded(false);
      setReanalyzeContext("");
      toast.success("Reanalysis complete - review and save changes");
    } catch (err) {
      console.error("Reanalyze error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to reanalyze");
    } finally {
      setIsReanalyzing(false);
    }
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
          <div className="relative w-full h-32 sm:h-48 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
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

            {/* Nutrition Grid - Monochrome with dot indicators */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {entry.calories}
                </p>
                <p className="text-xs text-zinc-500 uppercase tracking-wide flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Calories
                </p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {entry.protein}g
                </p>
                <p className="text-xs text-zinc-500 uppercase tracking-wide flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Protein
                </p>
                {goals?.dailyProtein && entry.protein > 0 && (
                  <p className="text-xs text-zinc-400 mt-1">
                    {(entry.protein / goals.dailyProtein * 100).toFixed(1)}% of daily
                  </p>
                )}
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {entry.carbs}g
                </p>
                <p className="text-xs text-zinc-500 uppercase tracking-wide flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  Carbs
                </p>
                {goals?.dailyCarbs && entry.carbs > 0 && (
                  <p className="text-xs text-zinc-400 mt-1">
                    {(entry.carbs / goals.dailyCarbs * 100).toFixed(1)}% of daily
                  </p>
                )}
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {entry.fat}g
                </p>
                <p className="text-xs text-zinc-500 uppercase tracking-wide flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Fat
                </p>
                {goals?.dailyFat && entry.fat > 0 && (
                  <p className="text-xs text-zinc-400 mt-1">
                    {(entry.fat / goals.dailyFat * 100).toFixed(1)}% of daily
                  </p>
                )}
              </div>
            </div>

            {entry.fiber !== null && entry.fiber !== undefined && entry.fiber > 0 && (
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {entry.fiber}g
                </p>
                <p className="text-xs text-zinc-500 uppercase tracking-wide flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  Fiber
                </p>
              </div>
            )}

            {/* Reanalyze with AI - only show if entry has image */}
            {entry.imageUrl && (
              <div className="pt-2">
                {!reanalyzeExpanded ? (
                  <button
                    type="button"
                    onClick={() => {
                      setReanalyzeExpanded(true);
                      setTimeout(() => reanalyzeInputRef.current?.focus(), 50);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 16h5v5" />
                    </svg>
                    Reanalyze with AI
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        ref={reanalyzeInputRef}
                        value={reanalyzeContext}
                        onChange={(e) => setReanalyzeContext(e.target.value)}
                        placeholder="e.g. half portion, no sauce, 2 servings..."
                        className="flex-1 h-9 text-sm bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                        disabled={isReanalyzing}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleReanalyze();
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={handleReanalyze}
                        disabled={isReanalyzing}
                        className="h-9 px-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                      >
                        {isReanalyzing ? (
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                          >
                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                            <path d="M16 16h5v5" />
                          </svg>
                        )}
                      </Button>
                      {!isReanalyzing && (
                        <button
                          type="button"
                          onClick={() => {
                            setReanalyzeContext("");
                            setReanalyzeExpanded(false);
                          }}
                          className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                          >
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Add context to refine the analysis
                    </p>
                  </div>
                )}
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

