import { Button } from "@/components/ui/button";

export function OpenSourceSection() {
  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-zinc-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-stone-900 to-zinc-900 dark:from-zinc-800 dark:to-zinc-900 p-5 sm:p-8 lg:p-12 xl:p-16">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          {/* Gradient orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />

          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-white"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-sm text-white/90">MIT Licensed</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Built in the open
              </h2>
              <p className="text-base sm:text-lg text-stone-300 mb-6 sm:mb-8 leading-relaxed">
                I enjoy building practical tools and sharing them. Every line of
                code is public. Fork it, self-host it, learn from it — it&apos;s
                all there. No vendor lock-in, no hidden agendas.
              </p>

              <a
                href="https://github.com/Aslanf8/track4u"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-white text-stone-900 hover:bg-stone-100"
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

            {/* Code preview */}
            <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-900 border-b border-zinc-800">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[10px] sm:text-xs text-zinc-500 ml-2">
                  terminal
                </span>
              </div>
              <div className="p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                <p className="text-zinc-500"># Clone the repository</p>
                <p className="text-emerald-400 mb-2 sm:mb-3 whitespace-nowrap">
                  $ git clone github.com/Aslanf8/track4u
                </p>

                <p className="text-zinc-500"># Install dependencies</p>
                <p className="text-emerald-400 mb-2 sm:mb-3">$ npm install</p>

                <p className="text-zinc-500"># Set up environment</p>
                <p className="text-emerald-400 mb-2 sm:mb-3 whitespace-nowrap">
                  $ cp .env.example .env.local
                </p>

                <p className="text-zinc-500"># Run locally</p>
                <p className="text-emerald-400">$ npm run dev</p>
                <p className="text-zinc-400 mt-2 text-[11px] sm:text-sm">
                  → Ready on localhost:3000
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
