"use client";

import { Card } from "@/components/ui/card";

interface QuickStatsProps {
  mealsLogged: number;
  remainingCalories: number;
  streak: number;
}

export function QuickStats({ mealsLogged, remainingCalories, streak }: QuickStatsProps) {
  const stats = [
    {
      label: "Meals Today",
      value: mealsLogged,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
          <path d="M8.5 8.5v.01" />
          <path d="M16 15.5v.01" />
          <path d="M12 12v.01" />
          <path d="M11 17v.01" />
          <path d="M7 14v.01" />
        </svg>
      ),
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Remaining",
      value: `${remainingCalories > 0 ? remainingCalories : 0} cal`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      ),
      color: "from-amber-500 to-orange-600",
    },
    {
      label: "Day Streak",
      value: streak,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      color: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="p-2.5 sm:p-4 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
        >
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-2 sm:mb-3`}>
            <div className="w-4 h-4 sm:w-5 sm:h-5">{stat.icon}</div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 truncate">{stat.value}</p>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-500 truncate">{stat.label}</p>
        </Card>
      ))}
    </div>
  );
}
