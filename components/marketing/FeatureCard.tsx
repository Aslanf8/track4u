import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: "amber" | "blue" | "emerald" | "purple";
}

const colorClasses = {
  amber: {
    bg: "bg-amber-100 dark:bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "group-hover:border-amber-200 dark:group-hover:border-amber-500/30",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "group-hover:border-blue-200 dark:group-hover:border-blue-500/30",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "group-hover:border-emerald-200 dark:group-hover:border-emerald-500/30",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "group-hover:border-purple-200 dark:group-hover:border-purple-500/30",
  },
};

export function FeatureCard({
  icon,
  title,
  description,
  color = "amber",
}: FeatureCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={cn(
        "group relative bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300",
        colors.border
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
          colors.bg,
          colors.text
        )}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
        {title}
      </h3>
      <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function FeaturesGrid() {
  const features = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      ),
      title: "AI Food Scanning",
      description:
        "Point, shoot, done. Vision AI identifies food items and estimates nutritional content from a single photo.",
      color: "amber" as const,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
      title: "Personalized Goals",
      description:
        "Science-backed macro calculations based on your body, activity level, and whether you want to lose, maintain, or gain.",
      color: "emerald" as const,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      ),
      title: "Progress Insights",
      description:
        "Beautiful charts show calorie trends, macro distribution, and weekly patterns. See what's working.",
      color: "blue" as const,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l4 2" />
        </svg>
      ),
      title: "Meal History",
      description:
        "Browse past meals by date, search by name, and track patterns over time. Tap any entry to edit.",
      color: "purple" as const,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-zinc-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Built for speed and simplicity. Track your nutrition without the
            complexity of traditional apps.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

