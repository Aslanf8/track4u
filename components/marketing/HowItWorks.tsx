export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Snap a photo",
      description:
        "Point your camera at any meal — breakfast, lunch, dinner, or snacks. The AI handles everything from a single apple to a full dinner plate.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
        >
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      ),
      color: "amber",
    },
    {
      number: "02",
      title: "AI analyzes instantly",
      description:
        "Advanced vision AI identifies every item, estimates portions, and calculates accurate nutritional data — calories, protein, carbs, fat, and fiber.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
        >
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
      ),
      color: "blue",
    },
    {
      number: "03",
      title: "Track your progress",
      description:
        "Review the results, make adjustments if needed, and save. Watch your daily totals update in real-time on your personalized dashboard.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      ),
      color: "emerald",
    },
  ];

  const colorClasses = {
    amber: {
      bg: "bg-amber-100 dark:bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-500/20",
      number: "text-amber-500/30 dark:text-amber-500/20",
    },
    blue: {
      bg: "bg-blue-100 dark:bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-500/20",
      number: "text-blue-500/30 dark:text-blue-500/20",
    },
    emerald: {
      bg: "bg-emerald-100 dark:bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-500/20",
      number: "text-emerald-500/30 dark:text-emerald-500/20",
    },
  };

  return (
    <section className="py-20 sm:py-28 bg-stone-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            From photo to macros in seconds
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Three simple steps. No searching food databases. No measuring cups. 
            Just point, shoot, and track.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const colors = colorClasses[step.color as keyof typeof colorClasses];
            return (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-stone-300 dark:from-zinc-700 to-transparent" />
                )}

                <div className="relative bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-shadow">
                  {/* Step number */}
                  <span className={`absolute -top-4 -right-2 text-7xl font-bold ${colors.number} select-none`}>
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center mb-6`}>
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

