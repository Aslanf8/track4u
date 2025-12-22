"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { useProgressEntries } from "@/lib/hooks/use-food-entries";

export default function ProgressPage() {
  const { entries, isLoading } = useProgressEntries();

  // Aggregate data by day for the last 7 days
  const last7Days = useMemo(() => 
    Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const dayEntries = entries.filter((e) => {
        const entryDate = new Date(e.consumedAt);
        return entryDate >= dayStart && entryDate <= dayEnd;
      });

      const totals = dayEntries.reduce(
        (acc, entry) => ({
          calories: acc.calories + entry.calories,
          protein: acc.protein + entry.protein,
          carbs: acc.carbs + entry.carbs,
          fat: acc.fat + entry.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      return {
        date: format(date, "EEE"),
        ...totals,
      };
    }),
    [entries]
  );

  // Calculate macro distribution for pie chart
  const totalMacros = useMemo(() => 
    entries.reduce(
      (acc, entry) => ({
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat,
      }),
      { protein: 0, carbs: 0, fat: 0 }
    ),
    [entries]
  );

  const pieData = useMemo(() => [
    { name: "Protein", value: totalMacros.protein, color: "#22c55e" },
    { name: "Carbs", value: totalMacros.carbs, color: "#3b82f6" },
    { name: "Fat", value: totalMacros.fat, color: "#a855f7" },
  ], [totalMacros]);

  // Calculate averages
  const avgCalories = useMemo(() => 
    Math.round(last7Days.reduce((sum, day) => sum + day.calories, 0) / 7),
    [last7Days]
  );

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 px-1">
        <Skeleton className="h-7 sm:h-8 w-36 sm:w-48 bg-zinc-200 dark:bg-zinc-800" />
        <Skeleton className="h-64 sm:h-80 w-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Skeleton className="h-48 sm:h-64 bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-48 sm:h-64 bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 px-1">
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Progress</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <Card className="p-2.5 sm:p-4 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-500">Avg Daily Cal</p>
          <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">{avgCalories}</p>
        </Card>
        <Card className="p-2.5 sm:p-4 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-500">Total Entries</p>
          <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">{entries.length}</p>
        </Card>
        <Card className="p-2.5 sm:p-4 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-500">Days Logged</p>
          <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {new Set(entries.map((e) => format(new Date(e.consumedAt), "yyyy-MM-dd"))).size}
          </p>
        </Card>
        <Card className="p-2.5 sm:p-4 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-500">This Week</p>
          <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {last7Days.reduce((sum, d) => sum + d.calories, 0)} cal
          </p>
        </Card>
      </div>

      <Card className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
        <CardHeader className="px-3 sm:px-6 pb-2">
          <CardTitle className="text-base sm:text-lg text-zinc-900 dark:text-zinc-100">Calorie Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days} margin={{ left: -20, right: 5 }}>
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg, #18181b)",
                    border: "1px solid var(--tooltip-border, #27272a)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "var(--tooltip-label, #fafafa)" }}
                  itemStyle={{ color: "#f59e0b" }}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", strokeWidth: 0, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Card className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="px-3 sm:px-6 pb-2">
            <CardTitle className="text-base sm:text-lg text-zinc-900 dark:text-zinc-100">Macro Distribution</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="h-36 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--tooltip-bg, #18181b)",
                      border: "1px solid var(--tooltip-border, #27272a)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [`${Math.round(value as number)}g`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3 sm:gap-6 mt-3 sm:mt-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 sm:gap-2">
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="px-3 sm:px-6 pb-2">
            <CardTitle className="text-base sm:text-lg text-zinc-900 dark:text-zinc-100">Weekly Macros</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <Tabs defaultValue="protein" className="w-full">
              <TabsList className="w-full bg-zinc-100 dark:bg-zinc-800/50 h-8 sm:h-10">
                <TabsTrigger value="protein" className="flex-1 text-xs sm:text-sm data-[state=active]:bg-green-500/20 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400">Protein</TabsTrigger>
                <TabsTrigger value="carbs" className="flex-1 text-xs sm:text-sm data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">Carbs</TabsTrigger>
                <TabsTrigger value="fat" className="flex-1 text-xs sm:text-sm data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400">Fat</TabsTrigger>
              </TabsList>
              {["protein", "carbs", "fat"].map((macro) => (
                <TabsContent key={macro} value={macro} className="h-32 sm:h-40 mt-3 sm:mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={last7Days} margin={{ left: -20, right: 5 }}>
                      <XAxis
                        dataKey="date"
                        stroke="#71717a"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#71717a"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        width={35}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--tooltip-bg, #18181b)",
                          border: "1px solid var(--tooltip-border, #27272a)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value) => [`${Math.round(value as number)}g`, macro]}
                      />
                      <Line
                        type="monotone"
                        dataKey={macro}
                        stroke={
                          macro === "protein" ? "#22c55e" :
                          macro === "carbs" ? "#3b82f6" : "#a855f7"
                        }
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
