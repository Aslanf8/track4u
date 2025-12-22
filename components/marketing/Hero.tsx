import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-stone-50 to-stone-50 dark:from-amber-950/20 dark:via-zinc-950 dark:to-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/40 dark:from-amber-900/10 via-transparent to-transparent" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/30 dark:bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-20 sm:pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/80 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
              100% Open Source — MIT Licensed
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mb-6">
            Track calories in{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              seconds
            </span>
            , not minutes
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Snap a photo of your meal. AI analyzes the nutritional content instantly. 
            No manual searching, no tedious logging — just results.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold px-8 py-6 text-lg shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300"
              >
                Get Started — It&apos;s Free
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 ml-2"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Button>
            </Link>
            <Link href="/features">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 px-8 py-6 text-lg"
              >
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Value props */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-stone-500 dark:text-stone-500">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-emerald-500"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </svg>
              <span>Free hosted version</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-emerald-500"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </svg>
              <span>Self-host option available</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-emerald-500"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </svg>
              <span>Bring your own AI key</span>
            </div>
          </div>
        </div>

        {/* App Preview */}
        <div className="mt-16 sm:mt-20 relative">
          <div className="relative mx-auto max-w-4xl">
            {/* Floating elements */}
            <div className="absolute -top-6 -left-6 sm:-left-12 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl shadow-xl rotate-6 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">2s</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Avg scan</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 sm:-right-8 w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl shadow-xl -rotate-6 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">$0</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">/month</p>
              </div>
            </div>

            {/* Main app preview */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
              <div className="bg-stone-100 dark:bg-zinc-800 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-white dark:bg-zinc-900 rounded-lg text-xs text-stone-500 dark:text-stone-400">
                    track4u.app/dashboard
                  </div>
                </div>
              </div>
              <div className="aspect-[16/10] bg-gradient-to-br from-stone-100 to-stone-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center p-4 sm:p-8">
                {/* Mockup dashboard content */}
                <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                  {/* Calorie ring mockup */}
                  <div className="col-span-2 bg-white dark:bg-zinc-800 rounded-xl p-3 sm:p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <span className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300">Today&apos;s Progress</span>
                      <span className="text-[10px] sm:text-xs text-stone-500 hidden xs:block">1,847 / 2,200 cal</span>
                    </div>
                    <div className="flex justify-center">
                      <div className="relative w-20 h-20 sm:w-32 sm:h-32">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="10" className="dark:stroke-zinc-700" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke="url(#heroGradient)" strokeWidth="10" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="44" />
                          <defs>
                            <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#f59e0b" />
                              <stop offset="100%" stopColor="#ea580c" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg sm:text-2xl font-bold text-stone-900 dark:text-stone-100">84%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Stats mockup - hidden on very small, shown as row on small, column on sm+ */}
                  <div className="col-span-2 sm:col-span-1 flex sm:flex-col gap-2 sm:gap-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-xl p-2 sm:p-4 shadow-lg flex-1">
                      <p className="text-[10px] sm:text-xs text-stone-500 mb-0.5 sm:mb-1">Protein</p>
                      <p className="text-sm sm:text-lg font-bold text-emerald-600">142g</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 rounded-xl p-2 sm:p-4 shadow-lg flex-1">
                      <p className="text-[10px] sm:text-xs text-stone-500 mb-0.5 sm:mb-1">Meals</p>
                      <p className="text-sm sm:text-lg font-bold text-blue-600">4</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

