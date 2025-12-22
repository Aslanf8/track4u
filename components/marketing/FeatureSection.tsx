import { cn } from "@/lib/utils";

interface FeatureSectionProps {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  color: "amber" | "emerald" | "blue" | "purple";
  reversed?: boolean;
  mockup: React.ReactNode;
}

const colorClasses = {
  amber: {
    bg: "bg-amber-100 dark:bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    badge:
      "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
    check: "text-amber-500",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    badge:
      "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    check: "text-emerald-500",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
    check: "text-blue-500",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    badge:
      "bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400",
    check: "text-purple-500",
  },
};

export function FeatureSection({
  title,
  subtitle,
  description,
  features,
  icon,
  color,
  reversed = false,
  mockup,
}: FeatureSectionProps) {
  const colors = colorClasses[color];

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "grid lg:grid-cols-2 gap-12 lg:gap-16 items-center",
            reversed && "lg:flex-row-reverse"
          )}
        >
          {/* Content */}
          <div className={cn(reversed && "lg:order-2")}>
            <div
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4",
                colors.badge
              )}
            >
              <span className={cn("w-5 h-5", colors.text)}>{icon}</span>
              {subtitle}
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4">
              {title}
            </h2>

            <p className="text-lg text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
              {description}
            </p>

            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn("w-5 h-5 mt-0.5 shrink-0", colors.check)}
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                  <span className="text-stone-700 dark:text-stone-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mockup */}
          <div className={cn(reversed && "lg:order-1")}>{mockup}</div>
        </div>
      </div>
    </section>
  );
}
