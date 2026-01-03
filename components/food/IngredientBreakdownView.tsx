"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Ingredient,
  IngredientBreakdown,
  calculateTotalsFromIngredients,
  recalculateIngredientQuantity,
} from "@/lib/types/ingredients";
import { Loader2, Plus, Trash2, Calculator } from "lucide-react";

interface IngredientBreakdownViewProps {
  breakdown: IngredientBreakdown | null;
  onBreakdownChange: (breakdown: IngredientBreakdown | null) => void;
  onTotalsChange: (totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }) => void;
  readOnly?: boolean;
}

export function IngredientBreakdownView({
  breakdown,
  onBreakdownChange,
  onTotalsChange,
  readOnly = false,
}: IngredientBreakdownViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    breakdown?.ingredients || []
  );
  const [contextNotes, setContextNotes] = useState<string>(
    breakdown?.contextNotes || ""
  );
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [needsRecalculation, setNeedsRecalculation] = useState(false);
  const [hasStructuralChanges, setHasStructuralChanges] = useState(false);

  // Use a ref to track previous totals and only update if changed
  const prevTotalsRef = useRef<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  } | null>(null);

  // Track previous breakdown to prevent unnecessary updates
  const prevBreakdownRef = useRef<string | null>(null);

  // Update local state when breakdown prop changes
  useEffect(() => {
    if (breakdown) {
      // Deep comparison: only update if breakdown actually changed
      const breakdownStr = JSON.stringify(breakdown);
      if (prevBreakdownRef.current === breakdownStr) {
        return; // No change, skip update
      }
      prevBreakdownRef.current = breakdownStr;

      setIngredients(breakdown.ingredients);
      setContextNotes(breakdown.contextNotes || "");
      setHasStructuralChanges(false);
      setNeedsRecalculation(false);
      // Reset prevTotalsRef when breakdown changes
      prevTotalsRef.current = null;
    } else {
      prevBreakdownRef.current = null;
    }
  }, [breakdown]);

  useEffect(() => {
    if (ingredients.length > 0) {
      const totals = calculateTotalsFromIngredients(ingredients);

      // Only call onTotalsChange if totals actually changed
      if (
        !prevTotalsRef.current ||
        prevTotalsRef.current.calories !== totals.calories ||
        prevTotalsRef.current.protein !== totals.protein ||
        prevTotalsRef.current.carbs !== totals.carbs ||
        prevTotalsRef.current.fat !== totals.fat ||
        prevTotalsRef.current.fiber !== totals.fiber
      ) {
        prevTotalsRef.current = totals;
        onTotalsChange(totals);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingredients]); // onTotalsChange is a callback, don't include in deps

  // Client-side quantity recalculation (instant, no API call)
  const handleQuantityChange = (ingredientId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    const updated = ingredients.map((ing) =>
      ing.id === ingredientId
        ? recalculateIngredientQuantity(ing, newQuantity)
        : ing
    );
    setIngredients(updated);
    setNeedsRecalculation(false); // Quantity changes don't need AI recalculation
  };

  // Handle name change - triggers need for AI recalculation
  const handleNameChange = (ingredientId: string, newName: string) => {
    const updated = ingredients.map((ing) =>
      ing.id === ingredientId ? { ...ing, name: newName } : ing
    );
    setIngredients(updated);
    setHasStructuralChanges(true);
    setNeedsRecalculation(true);
  };

  // Handle unit change - triggers need for AI recalculation
  const handleUnitChange = (ingredientId: string, newUnit: string) => {
    const updated = ingredients.map((ing) =>
      ing.id === ingredientId ? { ...ing, unit: newUnit } : ing
    );
    setIngredients(updated);
    setHasStructuralChanges(true);
    setNeedsRecalculation(true);
  };

  // Delete ingredient
  const handleDeleteIngredient = (ingredientId: string) => {
    const updated = ingredients.filter((ing) => ing.id !== ingredientId);
    setIngredients(updated);
    if (updated.length === 0) {
      onBreakdownChange(null);
    } else {
      // Recalculate totals locally after deletion
      setNeedsRecalculation(false);
    }
  };

  // Add new ingredient - triggers need for AI recalculation
  const handleAddIngredient = () => {
    const newIngredient: Ingredient = {
      id: crypto.randomUUID(),
      name: "",
      quantity: 1,
      unit: "g",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    setIngredients([...ingredients, newIngredient]);
    setHasStructuralChanges(true);
    setNeedsRecalculation(true);
  };

  // AI recalculation (only for structural changes)
  const handleRecalculate = async () => {
    if (ingredients.length === 0) return;

    setIsRecalculating(true);
    try {
      const response = await fetch("/api/food/recalculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          context: contextNotes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to recalculate");
      }

      const data = await response.json();

      // Update ingredients and totals from AI response
      if (data.ingredientBreakdown) {
        const updatedBreakdown: IngredientBreakdown = {
          ...data.ingredientBreakdown,
          contextNotes: contextNotes.trim() || undefined,
        };
        setIngredients(data.ingredientBreakdown.ingredients);
        onBreakdownChange(updatedBreakdown);
      }

      // Update totals
      onTotalsChange({
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber || 0,
      });

      setHasStructuralChanges(false);
      setNeedsRecalculation(false);
    } catch (err) {
      console.error("Recalculation error:", err);
      alert(err instanceof Error ? err.message : "Failed to recalculate");
    } finally {
      setIsRecalculating(false);
    }
  };

  // Update breakdown when context notes change
  const handleContextNotesChange = (notes: string) => {
    setContextNotes(notes);
    if (breakdown) {
      onBreakdownChange({
        ...breakdown,
        contextNotes: notes.trim() || undefined,
      });
    }
  };

  // Don't show if no breakdown and no ingredients
  if (!breakdown && ingredients.length === 0) {
    return null;
  }

  // If breakdown exists but ingredients array is empty, don't show
  if (breakdown && breakdown.ingredients.length === 0) {
    return null;
  }

  const totals = calculateTotalsFromIngredients(ingredients);

  return (
    <Card className="bg-gradient-to-br from-zinc-50 to-zinc-100/50 dark:from-zinc-900/50 dark:to-zinc-800/30 border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Header with toggle */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all group"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:bg-amber-600 transition-colors" />
              <span>Ingredient Breakdown</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {!readOnly && hasStructuralChanges && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              Recalculation needed
            </span>
          )}
        </div>

        {isExpanded && (
          <div className="space-y-4 lg:space-y-5 pt-3 border-t border-zinc-200/60 dark:border-zinc-700/60">
            {/* Ingredients List - Improved Layout */}
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div
                  key={ingredient.id}
                  className="group relative p-4 lg:p-5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    {/* Ingredient Number Badge */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {index + 1}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        {/* Name - Larger, more prominent */}
                        <div className="lg:col-span-4">
                          <Label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 block font-medium">
                            Ingredient
                          </Label>
                          {readOnly ? (
                            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                              {ingredient.name}
                            </p>
                          ) : (
                            <Input
                              value={ingredient.name}
                              onChange={(e) =>
                                handleNameChange(ingredient.id, e.target.value)
                              }
                              placeholder="Ingredient name"
                              className="h-9 text-sm font-medium bg-zinc-50 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-700 focus:border-amber-400 dark:focus:border-amber-500"
                            />
                          )}
                        </div>

                        {/* Quantity & Unit - Better spacing */}
                        <div className="lg:col-span-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 block font-medium">
                                Quantity
                              </Label>
                              {readOnly ? (
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                  {ingredient.quantity % 1 === 0
                                    ? ingredient.quantity
                                    : Math.round(ingredient.quantity * 10) / 10}
                                </p>
                              ) : (
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={ingredient.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      ingredient.id,
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="h-9 text-sm bg-zinc-50 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-700 focus:border-amber-400 dark:focus:border-amber-500"
                                />
                              )}
                            </div>
                            <div>
                              <Label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 block font-medium">
                                Unit
                              </Label>
                              {readOnly ? (
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                  {ingredient.unit}
                                </p>
                              ) : (
                                <Input
                                  value={ingredient.unit}
                                  onChange={(e) =>
                                    handleUnitChange(
                                      ingredient.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="g"
                                  className="h-9 text-sm bg-zinc-50 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-700 focus:border-amber-400 dark:focus:border-amber-500"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Macros - Better visual hierarchy */}
                        <div className="lg:col-span-4">
                          <Label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 block font-medium">
                            Nutritional Values
                          </Label>
                          <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                                {Math.round(ingredient.calories)}
                              </span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                kcal
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
                                P: {Math.round(ingredient.protein * 10) / 10}g
                              </span>
                              <span className="px-2.5 py-1 rounded-md bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 font-semibold text-xs">
                                C: {Math.round(ingredient.carbs * 10) / 10}g
                              </span>
                              <span className="px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-semibold text-xs">
                                F: {Math.round(ingredient.fat * 10) / 10}g
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Delete button */}
                        {!readOnly && (
                          <div className="lg:col-span-1 flex justify-end lg:justify-start">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteIngredient(ingredient.id)
                              }
                              className="h-9 w-9 p-0 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Ingredient Button */}
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddIngredient}
                className="w-full border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Ingredient
              </Button>
            )}

            {/* Context Notes */}
            <div>
              <Label className="text-xs text-zinc-500 mb-1 block">
                Context Notes
              </Label>
              {readOnly ? (
                contextNotes ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {contextNotes}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 italic">No notes</p>
                )
              ) : (
                <Input
                  value={contextNotes}
                  onChange={(e) => handleContextNotesChange(e.target.value)}
                  placeholder="e.g. Used protein powder, low-fat version..."
                  className="h-9 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                />
              )}
            </div>

            {/* Totals Display - Enhanced */}
            <div className="pt-4 border-t-2 border-zinc-200/60 dark:border-zinc-700/60 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-800/50 dark:to-zinc-900/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Total Nutritional Values
                </Label>
                {!readOnly && !hasStructuralChanges && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                    Auto-calculated
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-zinc-800/80 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700">
                  <div className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                    Calories
                  </div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {Math.round(totals.calories)}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-800/80 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700">
                  <div className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                    Protein
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(totals.protein * 10) / 10}g
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-800/80 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700">
                  <div className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                    Carbs
                  </div>
                  <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                    {Math.round(totals.carbs * 10) / 10}g
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-800/80 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700">
                  <div className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                    Fat
                  </div>
                  <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {Math.round(totals.fat * 10) / 10}g
                  </div>
                </div>
              </div>
            </div>

            {/* Recalculate Button */}
            {!readOnly && needsRecalculation && (
              <Button
                type="button"
                onClick={handleRecalculate}
                disabled={isRecalculating || ingredients.length === 0}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                {isRecalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Recalculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Recalculate with AI
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
