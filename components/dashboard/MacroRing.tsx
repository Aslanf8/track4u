"use client";

interface MacroRingProps {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  color: string;
}

export function MacroRing({ label, current, goal, unit = "g", color }: MacroRingProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-zinc-200 dark:text-zinc-800"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{Math.round(current)}</span>
          <span className="text-xs text-zinc-500">{unit}</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      <span className="text-xs text-zinc-500 dark:text-zinc-600">of {goal}{unit}</span>
    </div>
  );
}
