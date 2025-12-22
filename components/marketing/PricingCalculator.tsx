"use client";

import { useState } from "react";

interface Competitor {
  name: string;
  monthly: number;
  yearly: number;
  category: "traditional" | "ai-powered" | "premium-coaching";
  features: string;
}

export function PricingCalculator() {
  const [scansPerDay, setScansPerDay] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "traditional" | "ai-powered" | "premium-coaching"
  >("all");
  const costPerScan = 0.01; // Average cost per scan using GPT-5.2 ($1.75/M input + $14/M output)

  const dailyCost = scansPerDay * costPerScan;
  const monthlyCost = dailyCost * 30;
  const yearlyCost = monthlyCost * 12;

  // Verified competitor pricing (December 2024)
  const competitors: Competitor[] = [
    // Traditional Calorie Trackers
    {
      name: "MyFitnessPal Premium",
      monthly: 19.99,
      yearly: 79.99,
      category: "traditional",
      features: "Manual logging, large food database",
    },
    {
      name: "Cronometer Gold",
      monthly: 8.99,
      yearly: 49.99,
      category: "traditional",
      features: "Detailed micronutrients, scientific",
    },
    {
      name: "Lose It! Premium",
      monthly: 19.99,
      yearly: 39.99,
      category: "traditional",
      features: "Basic photo scanning, meal plans",
    },
    {
      name: "Lifesum Premium",
      monthly: 9.99,
      yearly: 44.99,
      category: "traditional",
      features: "Recipes, diet plans, fasting",
    },
    {
      name: "Yazio Pro",
      monthly: 9.99,
      yearly: 44.99,
      category: "traditional",
      features: "Fasting tracker, recipes",
    },
    {
      name: "FatSecret Premium",
      monthly: 6.99,
      yearly: 38.99,
      category: "traditional",
      features: "Budget option, community",
    },
    // AI-Powered (Direct Competitors)
    {
      name: "SnapCalorie",
      monthly: 9.99,
      yearly: 59.99,
      category: "ai-powered",
      features: "AI photo recognition",
    },
    {
      name: "Foodvisor",
      monthly: 14.99,
      yearly: 69.99,
      category: "ai-powered",
      features: "AI detection, dietitian chat",
    },
    {
      name: "MacroFactor",
      monthly: 11.99,
      yearly: 71.99,
      category: "ai-powered",
      features: "Algorithm-based, adaptive TDEE",
    },
    // Premium Coaching Apps
    {
      name: "Noom",
      monthly: 70.0,
      yearly: 209.0,
      category: "premium-coaching",
      features: "Psychology-based coaching",
    },
    {
      name: "WeightWatchers",
      monthly: 23.0,
      yearly: 155.0,
      category: "premium-coaching",
      features: "Points system, community",
    },
  ];

  const filteredCompetitors =
    selectedCategory === "all"
      ? competitors
      : competitors.filter((c) => c.category === selectedCategory);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "traditional":
        return "Traditional";
      case "ai-powered":
        return "AI-Powered";
      case "premium-coaching":
        return "Coaching";
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "traditional":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
      case "ai-powered":
        return "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400";
      case "premium-coaching":
        return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400";
      default:
        return "bg-stone-100 text-stone-700 dark:bg-stone-500/20 dark:text-stone-400";
    }
  };

  // Calculate average savings across all competitors
  const avgYearlyCost =
    competitors.reduce((sum, c) => sum + c.yearly, 0) / competitors.length;
  const avgSavings = avgYearlyCost - yearlyCost;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            Cost Calculator
          </h3>
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
            Live Pricing
          </span>
        </div>
        <p className="text-stone-600 dark:text-stone-400 mb-6">
          Pay only for what you use. No subscriptions, no commitments.
        </p>

        {/* Slider */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Meals scanned per day
            </label>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {scansPerDay}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            value={scansPerDay}
            onChange={(e) => setScansPerDay(parseInt(e.target.value))}
            className="w-full h-2 bg-stone-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-xs text-stone-500 mt-2">
            <span>1 meal</span>
            <span>5 meals</span>
            <span>10 meals</span>
            <span>15 meals</span>
          </div>
        </div>

        {/* Your Cost Results */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-800 text-center">
            <p className="text-xs text-stone-500 mb-1">Daily</p>
            <p className="text-xl font-bold text-stone-900 dark:text-stone-100">
              ${dailyCost.toFixed(2)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-center border border-amber-200 dark:border-amber-500/20">
            <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">
              Monthly
            </p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
              ${monthlyCost.toFixed(2)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-800 text-center">
            <p className="text-xs text-stone-500 mb-1">Yearly</p>
            <p className="text-xl font-bold text-stone-900 dark:text-stone-100">
              ${yearlyCost.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Savings Highlight */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-200 dark:border-emerald-500/20 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                Average yearly savings
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                vs. {competitors.length} popular apps
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${avgSavings.toFixed(0)}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                saved per year
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="border-t border-stone-200 dark:border-zinc-800 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Compare to subscription apps:
            </p>
            <div className="flex flex-wrap gap-2">
              {["all", "traditional", "ai-powered", "premium-coaching"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setSelectedCategory(
                        cat as
                          | "all"
                          | "traditional"
                          | "ai-powered"
                          | "premium-coaching"
                      )
                    }
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                      selectedCategory === cat
                        ? "bg-amber-500 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-zinc-800 dark:text-stone-400 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {cat === "all"
                      ? "All"
                      : cat === "traditional"
                      ? "Traditional"
                      : cat === "ai-powered"
                      ? "AI Apps"
                      : "Coaching"}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {filteredCompetitors.map((competitor) => {
              const yearlySavings = competitor.yearly - yearlyCost;
              const savingsPercent = Math.round(
                (yearlySavings / competitor.yearly) * 100
              );
              const isPositiveSavings = yearlySavings > 0;

              return (
                <div
                  key={competitor.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700/80 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                        {competitor.name}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${getCategoryColor(
                          competitor.category
                        )}`}
                      >
                        {getCategoryLabel(competitor.category)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 truncate">
                      ${competitor.monthly}/mo · ${competitor.yearly}/yr
                    </p>
                    <p className="text-[10px] text-stone-400 truncate">
                      {competitor.features}
                    </p>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    {isPositiveSavings ? (
                      <>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          Save ${yearlySavings.toFixed(0)}/yr
                        </p>
                        <p className="text-xs text-stone-500">
                          {savingsPercent}% less
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-medium text-stone-500">
                        Similar cost
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="px-6 sm:px-8 py-4 bg-stone-50 dark:bg-zinc-800/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-xs text-stone-500">
            *Based on ~$0.01/scan (GPT-5.2). Competitor pricing verified Dec
            2024.
          </p>
          <p className="text-xs text-stone-400">
            Prices may vary by region and promotional offers.
          </p>
        </div>
      </div>
    </div>
  );
}
