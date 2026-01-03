"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { IngredientBreakdownView } from "./IngredientBreakdownView";
import type { IngredientBreakdown } from "@/lib/types/ingredients";

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
  const [ingredientBreakdown, setIngredientBreakdown] =
    useState<IngredientBreakdown | null>(null);

  // Reanalyze state
  const [reanalyzeExpanded, setReanalyzeExpanded] = useState(false);
  const [reanalyzeContext, setReanalyzeContext] = useState("");
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const reanalyzeInputRef = useRef<HTMLInputElement>(null);
  const reanalyzeFileInputRef = useRef<HTMLInputElement>(null);
  const reanalyzeVideoRef = useRef<HTMLVideoElement>(null);
  const reanalyzeStreamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [localImages, setLocalImages] = useState<string[]>([]);

  // Assign stream to video element when camera becomes active
  useEffect(() => {
    if (
      cameraActive &&
      reanalyzeVideoRef.current &&
      reanalyzeStreamRef.current
    ) {
      reanalyzeVideoRef.current.srcObject = reanalyzeStreamRef.current;
    }
  }, [cameraActive]);

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
      // Parse ingredientBreakdown from entry
      if (entry.ingredientBreakdown) {
        try {
          const parsed = JSON.parse(entry.ingredientBreakdown);
          setIngredientBreakdown(parsed);
        } catch {
          setIngredientBreakdown(null);
        }
      } else {
        setIngredientBreakdown(null);
      }
      setIsEditing(false);
      setReanalyzeExpanded(false);
      setReanalyzeContext("");
      setAdditionalImages([]);
      setShowCamera(false);
      // Cleanup camera if active
      if (reanalyzeStreamRef.current) {
        reanalyzeStreamRef.current.getTracks().forEach((track) => track.stop());
        reanalyzeStreamRef.current = null;
      }
      setCameraActive(false);

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
      setAdditionalImages([]);
      setShowCamera(false);
      // Cleanup camera if active
      if (reanalyzeStreamRef.current) {
        reanalyzeStreamRef.current.getTracks().forEach((track) => track.stop());
        reanalyzeStreamRef.current = null;
      }
      setCameraActive(false);
    }
    onOpenChange(newOpen);
  };

  // Camera functions for reanalyze
  const startReanalyzeCamera = async () => {
    try {
      // Stop existing stream if any
      if (reanalyzeStreamRef.current) {
        reanalyzeStreamRef.current.getTracks().forEach((track) => track.stop());
        reanalyzeStreamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      reanalyzeStreamRef.current = stream;

      if (reanalyzeVideoRef.current) {
        reanalyzeVideoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setShowCamera(true);
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Unable to access camera. Please use file upload instead.");
      setCameraActive(false);
      setShowCamera(false);
    }
  };

  const captureReanalyzePhoto = () => {
    if (!reanalyzeVideoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = reanalyzeVideoRef.current.videoWidth;
    canvas.height = reanalyzeVideoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(reanalyzeVideoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

    const existingImages = parseImageUrl(entry?.imageUrl);
    const MAX_IMAGES = 5;
    if (existingImages.length + additionalImages.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setAdditionalImages([...additionalImages, dataUrl]);

    // Stop camera
    if (reanalyzeStreamRef.current) {
      reanalyzeStreamRef.current.getTracks().forEach((track) => track.stop());
      reanalyzeStreamRef.current = null;
    }
    setCameraActive(false);
    setShowCamera(false);
  };

  // Helper to parse imageUrl - supports both single string (backward compatible) and JSON array
  const parseImageUrl = (imageUrl: string | null | undefined): string[] => {
    if (!imageUrl) return [];

    // Try to parse as JSON array first
    try {
      const parsed = JSON.parse(imageUrl);
      if (
        Array.isArray(parsed) &&
        parsed.every((img: unknown) => typeof img === "string")
      ) {
        return parsed;
      }
    } catch {
      // Not JSON, treat as single image string
    }

    // Single image string (backward compatible)
    return [imageUrl];
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_IMAGES = 5;
    const existingImages = parseImageUrl(entry?.imageUrl);
    if (existingImages.length + additionalImages.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAdditionalImages([...additionalImages, dataUrl]);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  const handleDeleteImageClick = (imageIndex: number) => {
    setImageToDelete(imageIndex);
    setDeleteDialogOpen(true);
  };

  const handleDeleteImageConfirm = async () => {
    if (!entry || imageToDelete === null) return;

    const originalImages = parseImageUrl(entry.imageUrl);
    const imageIndex = imageToDelete;

    // Optimistic update: remove image from local state immediately
    if (imageIndex < originalImages.length) {
      // Deleting from original images
      const updatedLocalImages = localImages.filter((_, i) => i !== imageIndex);
      setLocalImages(updatedLocalImages);
    } else {
      // Deleting from additional images
      const additionalIndex = imageIndex - originalImages.length;
      setAdditionalImages(
        additionalImages.filter((_, i) => i !== additionalIndex)
      );
    }

    setDeleteDialogOpen(false);

    // If deleting from original images, update database
    if (imageIndex < originalImages.length) {
      const updatedImages = originalImages.filter((_, i) => i !== imageIndex);

      // Update the entry with remaining images
      const imageUrlToSave =
        updatedImages.length === 0
          ? null
          : updatedImages.length === 1
          ? updatedImages[0]
          : JSON.stringify(updatedImages);

      try {
        const response = await fetch(`/api/food/${entry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: imageUrlToSave,
          }),
        });

        if (!response.ok) {
          // Revert optimistic update on error
          const images = parseImageUrl(entry.imageUrl);
          setLocalImages(images);
          throw new Error("Failed to delete image");
        }

        const updatedEntry = await response.json();
        // Update localImages to match the updated entry
        const updatedImages = parseImageUrl(updatedEntry.imageUrl);
        setLocalImages(updatedImages);
        toast.success("Image deleted");
        onUpdate?.(updatedEntry);
      } catch (err) {
        console.error("Delete image error:", err);
        toast.error("Failed to delete image");
      }
    } else {
      // Additional image - already removed from state
      toast.success("Image removed");
    }

    setImageToDelete(null);
  };

  const handleReanalyze = async () => {
    if (!entry?.imageUrl) return;

    const existingImages = parseImageUrl(entry.imageUrl);
    const allImages = [...existingImages, ...additionalImages];

    if (allImages.length === 0) return;

    setIsReanalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: allImages,
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

      // Update ingredient breakdown if present
      if (data.ingredientBreakdown) {
        setIngredientBreakdown(data.ingredientBreakdown);
      }

      // Switch to edit mode so user can review and save
      // Keep additionalImages so they're visible and will be saved
      setIsEditing(true);
      setReanalyzeExpanded(false);
      setReanalyzeContext("");
      // Don't clear additionalImages - keep them so user can see and save them
      toast.success("Reanalysis complete - review and save changes");
    } catch (err) {
      console.error("Reanalyze error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to reanalyze");
    } finally {
      setIsReanalyzing(false);
    }
  };

  // Memoize callbacks to prevent infinite loops
  const handleBreakdownChange = useCallback(
    (breakdown: IngredientBreakdown | null) => {
      setIngredientBreakdown(breakdown);
      if (breakdown) {
        // Update form data totals from breakdown
        const totals = breakdown.ingredients.reduce(
          (acc, ing) => ({
            calories: acc.calories + ing.calories,
            protein: acc.protein + ing.protein,
            carbs: acc.carbs + ing.carbs,
            fat: acc.fat + ing.fat,
            fiber: acc.fiber + (ing.fiber || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
        );
        setFormData((prev) => ({
          ...prev,
          calories: totals.calories,
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat,
          fiber: totals.fiber,
        }));
      }
    },
    []
  );

  const handleTotalsChange = useCallback(
    (totals: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    }) => {
      setFormData((prev) => {
        // Only update if values actually changed
        if (
          prev.calories !== totals.calories ||
          prev.protein !== totals.protein ||
          prev.carbs !== totals.carbs ||
          prev.fat !== totals.fat ||
          prev.fiber !== totals.fiber
        ) {
          return {
            ...prev,
            calories: totals.calories,
            protein: totals.protein,
            carbs: totals.carbs,
            fat: totals.fat,
            fiber: totals.fiber,
          };
        }
        return prev;
      });
    },
    []
  );

  const handleSave = async () => {
    if (!entry) return;

    setIsSaving(true);
    try {
      // Combine original images with additional images
      const existingImages = parseImageUrl(entry.imageUrl);
      const allImages = [...existingImages, ...additionalImages];

      // Save all images (single string if one image, JSON array if multiple)
      const imageUrlToSave =
        allImages.length > 1
          ? JSON.stringify(allImages)
          : allImages[0] || entry.imageUrl || undefined;

      const response = await fetch(`/api/food/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrl: imageUrlToSave,
          ingredientBreakdown: ingredientBreakdown || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      const updatedEntry = await response.json();
      toast.success("Entry updated successfully");
      onUpdate?.(updatedEntry);
      setIsEditing(false);
      setAdditionalImages([]); // Clear additional images after save
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

        {/* Images - Show original + additional images in real-time */}
        {(() => {
          // Use localImages for optimistic updates, fallback to parsed entry images
          const originalImages =
            localImages.length > 0
              ? localImages
              : parseImageUrl(entry.imageUrl);
          const allImages = [...originalImages, ...additionalImages];

          return (
            <div className="space-y-2">
              {allImages.length > 0 && (
                <div
                  className={`grid gap-3 ${
                    allImages.length === 1
                      ? "grid-cols-1"
                      : allImages.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-2 sm:grid-cols-3"
                  }`}
                >
                  {originalImages.map((img, index) => (
                    <div
                      key={`original-${index}`}
                      className="relative w-full h-32 sm:h-48 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 group"
                    >
                      <Image
                        src={img}
                        alt={`${entry.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {index === 0 && allImages.length > 1 && (
                        <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                          <span className="text-xs text-white font-medium">
                            Primary
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImageClick(index);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 hover:bg-red-600/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        aria-label="Delete image"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 text-white"
                        >
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {additionalImages.map((img, index) => {
                    const imageIndex = originalImages.length + index;
                    return (
                      <div
                        key={`additional-${index}-${img.substring(0, 20)}`}
                        className="relative w-full h-32 sm:h-48 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-amber-500/50 shadow-lg ring-2 ring-amber-500/30 group"
                      >
                        <Image
                          src={img}
                          alt={`${entry.name} new ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm shadow-md">
                          <span className="text-xs text-white font-medium">
                            New
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImageClick(imageIndex);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 hover:bg-red-600/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          aria-label="Delete image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 text-white"
                          >
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {additionalImages.length > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {additionalImages.length} new image
                  {additionalImages.length > 1 ? "s" : ""} added - will be saved
                  with entry
                </p>
              )}
            </div>
          );
        })()}

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
                    {((entry.protein / goals.dailyProtein) * 100).toFixed(1)}%
                    of daily
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
                    {((entry.carbs / goals.dailyCarbs) * 100).toFixed(1)}% of
                    daily
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
                    {((entry.fat / goals.dailyFat) * 100).toFixed(1)}% of daily
                  </p>
                )}
              </div>
            </div>

            {entry.fiber !== null &&
              entry.fiber !== undefined &&
              entry.fiber > 0 && (
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

            {/* Ingredient Breakdown - View Mode */}
            {ingredientBreakdown && (
              <IngredientBreakdownView
                breakdown={ingredientBreakdown}
                onBreakdownChange={setIngredientBreakdown}
                onTotalsChange={() => {
                  // In view mode, totals are read-only
                }}
                readOnly={true}
              />
            )}

            {/* Reanalyze with AI - only show if entry has image */}
            {parseImageUrl(entry.imageUrl).length > 0 && (
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
                  <div className="space-y-3">
                    {/* Additional images only (originals shown above) */}
                    {(() => {
                      const existingImages = parseImageUrl(entry.imageUrl);
                      const allImages = [
                        ...existingImages,
                        ...additionalImages,
                      ];
                      const MAX_IMAGES = 5;

                      return (
                        <>
                          {additionalImages.length > 0 && (
                            <div
                              className={`grid gap-2 ${
                                additionalImages.length === 1
                                  ? "grid-cols-1"
                                  : additionalImages.length === 2
                                  ? "grid-cols-2"
                                  : "grid-cols-2 sm:grid-cols-3"
                              }`}
                            >
                              {additionalImages.map((img, index) => (
                                <div
                                  key={`additional-${index}`}
                                  className="relative aspect-[4/3] rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 group"
                                >
                                  <Image
                                    src={img}
                                    alt={`Additional ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeAdditionalImage(index)}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="w-3 h-3 text-white"
                                    >
                                      <path d="M18 6 6 18M6 6l12 12" />
                                    </svg>
                                  </button>
                                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
                                    <span className="text-[10px] text-white font-medium">
                                      New
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Camera view */}
                          {showCamera && cameraActive && (
                            <div className="space-y-3">
                              <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
                                <video
                                  ref={reanalyzeVideoRef}
                                  autoPlay
                                  playsInline
                                  muted
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  className="flex-1 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                                  onClick={() => {
                                    if (reanalyzeStreamRef.current) {
                                      reanalyzeStreamRef.current
                                        .getTracks()
                                        .forEach((track) => track.stop());
                                      reanalyzeStreamRef.current = null;
                                    }
                                    setCameraActive(false);
                                    setShowCamera(false);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
                                  onClick={captureReanalyzePhoto}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-5 h-5 mr-2"
                                  >
                                    <circle cx="12" cy="12" r="10" />
                                  </svg>
                                  Capture
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Add image options */}
                          {!showCamera && allImages.length < MAX_IMAGES && (
                            <div className="grid gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="h-20 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-500/50 bg-zinc-100/30 dark:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300 flex flex-col gap-2"
                                onClick={startReanalyzeCamera}
                                disabled={isReanalyzing}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="w-6 h-6 text-amber-500"
                                >
                                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                                  <circle cx="12" cy="13" r="3" />
                                </svg>
                                <span>Take Photo</span>
                              </Button>

                              <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                  <span className="w-full border-t border-zinc-300 dark:border-zinc-700" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                  <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">
                                    or
                                  </span>
                                </div>
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                className="h-20 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-500/50 bg-zinc-100/30 dark:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300 flex flex-col gap-2"
                                onClick={() =>
                                  reanalyzeFileInputRef.current?.click()
                                }
                                disabled={isReanalyzing}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="w-6 h-6 text-amber-500"
                                >
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="17 8 12 3 7 8" />
                                  <line x1="12" x2="12" y1="3" y2="15" />
                                </svg>
                                <span>Upload Image</span>
                              </Button>
                            </div>
                          )}

                          <input
                            ref={reanalyzeFileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAddImage}
                          />
                        </>
                      );
                    })()}

                    {/* Context input */}
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
                        disabled={
                          isReanalyzing ||
                          (parseImageUrl(entry.imageUrl).length === 0 &&
                            additionalImages.length === 0)
                        }
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
                            setAdditionalImages([]);
                            setShowCamera(false);
                            // Cleanup camera if active
                            if (reanalyzeStreamRef.current) {
                              reanalyzeStreamRef.current
                                .getTracks()
                                .forEach((track) => track.stop());
                              reanalyzeStreamRef.current = null;
                            }
                            setCameraActive(false);
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
                      Add photos or context to refine the analysis
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
              <Label
                htmlFor="name"
                className="text-zinc-700 dark:text-zinc-300"
              >
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
                <Label
                  htmlFor="calories"
                  className="text-zinc-700 dark:text-zinc-300"
                >
                  Calories
                </Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      calories: Number(e.target.value),
                    })
                  }
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="protein"
                  className="text-zinc-700 dark:text-zinc-300"
                >
                  Protein (g)
                </Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      protein: Number(e.target.value),
                    })
                  }
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="carbs"
                  className="text-zinc-700 dark:text-zinc-300"
                >
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
                <Label
                  htmlFor="fat"
                  className="text-zinc-700 dark:text-zinc-300"
                >
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
              <Label
                htmlFor="fiber"
                className="text-zinc-700 dark:text-zinc-300"
              >
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
              <Label
                htmlFor="description"
                className="text-zinc-700 dark:text-zinc-300"
              >
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

            {/* Ingredient Breakdown - Edit Mode */}
            {ingredientBreakdown && (
              <IngredientBreakdownView
                breakdown={ingredientBreakdown}
                onBreakdownChange={handleBreakdownChange}
                onTotalsChange={handleTotalsChange}
                readOnly={false}
              />
            )}
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

      {/* Delete Image Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-zinc-100">
              Delete Image?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete this image? This action cannot be
              undone.
            </p>
          </div>
          <DialogFooter className="flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setImageToDelete(null);
              }}
              className="flex-1 sm:flex-none border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteImageConfirm}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 mr-2"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
