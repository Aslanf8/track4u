import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeatureSection } from "@/components/marketing/FeatureSection";

export const metadata = {
  title: "Features - Track4U",
  description:
    "Discover all the features that make Track4U the fastest way to track your nutrition.",
};

function ScannerMockup() {
  return (
    <div className="relative">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
        <div className="bg-stone-100 dark:bg-zinc-800 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Scan Your Food
          </span>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
        </div>
        <div className="p-6">
          {/* Camera preview */}
          <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-stone-200 to-stone-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center mb-4 relative overflow-hidden">
            <div className="absolute inset-4 border-2 border-dashed border-amber-500/50 rounded-lg" />
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-8 h-8 text-amber-600"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
          </div>

          {/* Results preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-900 dark:text-stone-100">
                Grilled Salmon Salad
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                High confidence
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Cal", value: "485" },
                { label: "Protein", value: "42g" },
                { label: "Carbs", value: "18g" },
                { label: "Fat", value: "28g" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-2 rounded-lg bg-stone-100 dark:bg-zinc-800 text-center"
                >
                  <p className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    {item.value}
                  </p>
                  <p className="text-xs text-stone-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -top-4 -right-4 px-3 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium shadow-lg">
        ~5 seconds
      </div>
    </div>
  );
}

function GoalsMockup() {
  return (
    <div className="relative">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
        <div className="bg-stone-100 dark:bg-zinc-800 px-4 py-3">
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Your Targets
          </span>
        </div>
        <div className="p-6 space-y-4">
          {/* Profile summary */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-stone-500 mb-1">Age</p>
                <p className="font-bold text-stone-900 dark:text-stone-100">
                  28
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Weight</p>
                <p className="font-bold text-stone-900 dark:text-stone-100">
                  165 lbs
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Goal</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  Maintain
                </p>
              </div>
            </div>
          </div>

          {/* Macro targets */}
          {[
            { label: "Calories", value: 2200, color: "bg-amber-500" },
            { label: "Protein", value: "165g", color: "bg-emerald-500" },
            { label: "Carbs", value: "220g", color: "bg-blue-500" },
            { label: "Fat", value: "73g", color: "bg-purple-500" },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600 dark:text-stone-400">
                  {item.label}
                </span>
                <span className="font-medium text-stone-900 dark:text-stone-100">
                  {item.value}
                </span>
              </div>
              <div className="h-2 rounded-full bg-stone-200 dark:bg-zinc-700">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressMockup() {
  return (
    <div className="relative">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
        <div className="bg-stone-100 dark:bg-zinc-800 px-4 py-3">
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Weekly Progress
          </span>
        </div>
        <div className="p-6">
          {/* Chart mockup */}
          <div className="h-40 flex items-end justify-between gap-2 mb-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day, index) => {
                const heights = [65, 80, 72, 90, 85, 60, 45];
                return (
                  <div key={day} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-amber-500 to-orange-400 transition-all hover:from-amber-400 hover:to-orange-300"
                      style={{ height: `${heights[index]}%` }}
                    />
                    <span className="text-xs text-stone-500 mt-2">{day}</span>
                  </div>
                );
              }
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-stone-100 dark:bg-zinc-800 text-center">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">
                1,847
              </p>
              <p className="text-xs text-stone-500">Avg daily</p>
            </div>
            <div className="p-3 rounded-lg bg-stone-100 dark:bg-zinc-800 text-center">
              <p className="text-lg font-bold text-emerald-600">7</p>
              <p className="text-xs text-stone-500">Day streak</p>
            </div>
            <div className="p-3 rounded-lg bg-stone-100 dark:bg-zinc-800 text-center">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">
                28
              </p>
              <p className="text-xs text-stone-500">Meals logged</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryMockup() {
  return (
    <div className="relative">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
        <div className="bg-stone-100 dark:bg-zinc-800 px-4 py-3 flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 text-stone-400"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="text-sm text-stone-500">Search meals...</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-stone-900 dark:text-stone-100">
              Today
            </span>
            <span className="text-stone-500">1,420 cal</span>
          </div>

          {[
            { name: "Oatmeal with Berries", time: "8:30 AM", cal: 320 },
            { name: "Grilled Chicken Wrap", time: "12:45 PM", cal: 580 },
            { name: "Greek Yogurt", time: "3:00 PM", cal: 150 },
            { name: "Salmon & Vegetables", time: "7:15 PM", cal: 520 },
          ].map((meal) => (
            <div
              key={meal.name}
              className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 dark:bg-zinc-800/50 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                <span className="text-amber-600 dark:text-amber-400 text-lg">
                  🍽️
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                  {meal.name}
                </p>
                <p className="text-xs text-stone-500">{meal.time}</p>
              </div>
              <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                {meal.cal} cal
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 to-stone-50 dark:from-amber-950/20 dark:to-zinc-950" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 dark:text-stone-100 mb-6">
            Features that make tracking{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              effortless
            </span>
          </h1>
          <p className="text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto mb-10">
            GPT-5.2 Vision made this possible. Less friction, more insights —
            the technology finally caught up with what calorie tracking should
            be.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Sections */}
      <FeatureSection
        subtitle="AI Food Scanning"
        title="Point. Shoot. Done."
        description="Vision AI identifies food items, estimates portions, and calculates nutritional data from a single photo. No more searching databases or guessing serving sizes."
        features={[
          "Recognizes complex multi-item meals",
          "Estimates portion sizes automatically",
          "Returns calories, protein, carbs, fat, and fiber",
          "Add context like 'half portion' for better accuracy",
          "Confidence scores so you know when to adjust",
        ]}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-5 h-5"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        }
        color="amber"
        mockup={<ScannerMockup />}
      />

      <div className="bg-stone-100 dark:bg-zinc-900/50">
        <FeatureSection
          subtitle="Smart Goal Setup"
          title="Personalized macro targets in minutes"
          description="The onboarding wizard uses the Mifflin-St Jeor equation to calculate your ideal calories and macros based on your body composition, activity level, and goals."
          features={[
            "Science-backed metabolic calculations",
            "Support for lose, maintain, or gain goals",
            "Activity level adjustments from sedentary to very active",
            "AI assistant to answer nutrition questions",
            "Fully adjustable targets — your body, your rules",
          ]}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          }
          color="emerald"
          reversed
          mockup={<GoalsMockup />}
        />
      </div>

      <FeatureSection
        subtitle="Progress Analytics"
        title="See your trends at a glance"
        description="Beautiful charts show calorie trends, macro distribution, and weekly patterns. Understand what's working and adjust your approach."
        features={[
          "7-day and 30-day calorie trend charts",
          "Macro distribution pie charts",
          "Daily averages and streak tracking",
          "Days logged and total entries stats",
          "Mobile-optimized responsive design",
        ]}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-5 h-5"
          >
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
        }
        color="blue"
        mockup={<ProgressMockup />}
      />

      <div className="bg-stone-100 dark:bg-zinc-900/50">
        <FeatureSection
          subtitle="Meal History"
          title="Every meal, organized and searchable"
          description="Browse past meals grouped by date, search by food name, and tap any entry to edit. Track patterns over time and learn from your eating habits."
          features={[
            "Grouped by Today, Yesterday, or date",
            "Daily calorie totals per group",
            "Quick search by food name",
            "Tap any entry to edit or delete",
            "Full CRUD operations on all entries",
          ]}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M12 7v5l4 2" />
            </svg>
          }
          color="purple"
          reversed
          mockup={<HistoryMockup />}
        />
      </div>

      {/* Additional Features Grid */}
      <section className="py-20 sm:py-28 bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4">
              Plus everything else you&apos;d expect
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-400">
              The details that make Track4U a complete solution.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🌙",
                title: "Dark Mode",
                description:
                  "Full dark theme support that respects your system preferences.",
              },
              {
                icon: "📱",
                title: "Mobile First",
                description:
                  "Designed for phones first, with a responsive desktop experience.",
              },
              {
                icon: "🔐",
                title: "AES-256 Encryption",
                description:
                  "Your API key is encrypted before it ever touches the database.",
              },
              {
                icon: "⚡",
                title: "Real-time Updates",
                description:
                  "Dashboard and totals update instantly as you log meals.",
              },
              {
                icon: "🎯",
                title: "Editable Entries",
                description:
                  "Made a mistake? Tap any entry to edit or delete it.",
              },
              {
                icon: "🔓",
                title: "Open Source",
                description:
                  "MIT licensed. Fork it, self-host it, or contribute improvements.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-500/30 transition-colors"
              >
                <span className="text-3xl mb-4 block">{feature.icon}</span>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-stone-50 to-stone-100 dark:from-zinc-900 dark:to-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-6">
            Ready to start tracking smarter?
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-10">
            Create a free account and experience AI-powered nutrition tracking.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-10"
              >
                Get Started Free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-stone-300 dark:border-stone-700"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
