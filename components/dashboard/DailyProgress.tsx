"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MacroRing } from "./MacroRing";

interface DailyProgressProps {
  calories: { current: number; goal: number };
  protein: { current: number; goal: number };
  carbs: { current: number; goal: number };
  fat: { current: number; goal: number };
}

export function DailyProgress({ calories, protein, carbs, fat }: DailyProgressProps) {
  const caloriePercentage = Math.min((calories.current / calories.goal) * 100, 100);

  return (
    <Card className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-zinc-900 dark:text-zinc-100">Today&apos;s Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main calorie ring */}
        <div className="flex justify-center mb-6">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-zinc-200 dark:text-zinc-800"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="url(#calorieGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 - (caloriePercentage / 100) * 2 * Math.PI * 42}
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{Math.round(calories.current)}</span>
              <span className="text-sm text-zinc-500">of {calories.goal} cal</span>
            </div>
          </div>
        </div>

        {/* Macro rings */}
        <div className="grid grid-cols-3 gap-4">
          <MacroRing
            label="Protein"
            current={protein.current}
            goal={protein.goal}
            color="#22c55e"
          />
          <MacroRing
            label="Carbs"
            current={carbs.current}
            goal={carbs.goal}
            color="#3b82f6"
          />
          <MacroRing
            label="Fat"
            current={fat.current}
            goal={fat.goal}
            color="#a855f7"
          />
        </div>
      </CardContent>
    </Card>
  );
}
