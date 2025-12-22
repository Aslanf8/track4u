export function SecuritySection() {
  const securityFeatures = [
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
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      title: "Encrypted Storage",
      description:
        "Your API key is encrypted with AES-256-GCM before it ever touches the database. It can't be read — only you can use it.",
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
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
      ),
      title: "Your Key, Your Control",
      description:
        "Bring your own API key. You're billed directly by the AI provider — no usage tracking or markups.",
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
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
      ),
      title: "Data Stays Private",
      description:
        "Food images are processed and discarded. Only nutritional data is stored, not photos. Your diet is your business.",
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
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      ),
      title: "Fully Open Source",
      description:
        "Every line of code is public. Audit it yourself, self-host it, or contribute improvements. No black boxes.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-stone-100 to-stone-50 dark:from-zinc-900 dark:to-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">
              Privacy & Security
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-6">
              Your data. Your API key.{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Your control.
              </span>
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
              Most apps lock you into subscriptions and harvest your data.
              Track4U flips the model — you bring your own AI key, pay only for
              what you use, with no billing visibility on this end.
            </p>

            {/* BYOK highlight */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-stone-200 dark:border-zinc-700 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 text-white"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                    <path d="M12 18V6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                    BYOK = Bring Your Own Key
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    Use your own AI API key. Average cost: ~$0.01 per food scan
                    with GPT-5.2. That&apos;s ~$5/year at 10 meals/week — vs
                    $40-80/year for subscription apps. No commitment required.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-zinc-800/50 rounded-xl p-5 border border-stone-200 dark:border-zinc-700/50"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1.5 text-sm">
                  {feature.title}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
