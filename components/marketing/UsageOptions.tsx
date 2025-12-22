"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function UsageOptions() {
  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            Two ways to use Track4U
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Pick the option that fits your style. Both are free. Both give you full control.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Option 1: Hosted */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500" />
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-8 h-full flex flex-col">
              {/* Badge */}
              <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-6">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                  Recommended
                </span>
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/10 dark:to-orange-500/10 flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-7 h-7 text-amber-600 dark:text-amber-400"
                >
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
                Create an Account
              </h3>
              <p className="text-stone-600 dark:text-stone-400 mb-6 flex-grow">
                Sign up and start tracking in under a minute. I handle the database, authentication, 
                and hosting — all free. You just bring your own AI API key.
              </p>

              {/* What's included */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-300">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Free hosting & database</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-300">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Automatic updates</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-300">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>No technical setup required</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-300">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>BYOK — pay AI provider directly</span>
                </div>
              </div>

              <Link href="/sign-up" className="w-full">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                >
                  Create Free Account
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>

          {/* Option 2: Self-Hosted */}
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-8 h-full flex flex-col">
            {/* Badge */}
            <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 mb-6">
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wide">
                For Developers
              </span>
            </div>

            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-7 h-7 text-stone-600 dark:text-stone-400"
              >
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
              Self-Host It
            </h3>
            <p className="text-stone-600 dark:text-stone-400 mb-6 flex-grow">
              Clone the repo and run Track4U on your own infrastructure. Complete independence — 
              no dependency on anyone else. Perfect for privacy purists and tinkerers.
            </p>

            {/* What's included */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-300">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>100% open source (MIT)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-300">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Full control over your data</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-300">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Customize & extend freely</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-300">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Zero dependency on this project</span>
              </div>
            </div>

            <a
              href="https://github.com/Aslanf8/track4u"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full border-stone-300 dark:border-zinc-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </Button>
            </a>
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-stone-500 dark:text-stone-500">
            Both options are 100% free. The only cost is AI usage, which you pay directly to OpenAI.
          </p>
        </div>
      </div>
    </section>
  );
}

