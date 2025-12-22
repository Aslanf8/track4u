import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About - Track4U",
  description:
    "Built by Aslan Farboud. The technology finally made this obvious to build, and I cared enough about the problem to build it properly.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 to-stone-50 dark:from-purple-950/20 dark:to-zinc-950" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-6 text-center">
            Why I built this
          </h1>
          <p className="text-xl text-stone-600 dark:text-stone-400 text-center max-w-2xl mx-auto">
            The technology finally made this obvious to build, and I cared enough
            about the problem to build it properly.
          </p>
        </div>
      </section>

      {/* Personal Story */}
      <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-6">
            Hi, I&apos;m Aslan Farboud
          </h2>
          <div className="prose prose-stone dark:prose-invert max-w-none">
            <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
              I&apos;m a builder. I love shipping clean, useful software that solves
              real problems. Since 2022, I&apos;ve specialized in LLM-based applications —
              and I&apos;ve watched the technology get dramatically better and cheaper.
            </p>
            <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
              Track4U came from a personal need. I wanted to track my food intake,
              but every existing app felt painfully slow. Search a database, scroll
              through results, estimate portions, repeat. The friction was killing me.
            </p>
            <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
              Then I realized: GPT-5.2 Vision is now incredibly good at analyzing food
              photos, and it costs about a penny per scan. The software to tie it
              together isn&apos;t rocket science. So I built what I wanted to use.
            </p>
          </div>
        </div>
      </section>

      {/* The Timing */}
      <section className="py-16 sm:py-24 bg-stone-50 dark:bg-zinc-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-6">
            Why now?
          </h2>
          <div className="prose prose-stone dark:prose-invert max-w-none">
            <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
              This project only makes sense because of where AI is today. A year ago,
              vision models were either too expensive or not accurate enough. Now,
              GPT-5.2 can identify a plate of food and estimate macros with impressive
              accuracy — for roughly $0.01.
            </p>
            <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
              The underlying software problem here isn&apos;t complicated. It&apos;s a
              camera, an API call, and a clean interface. What matters is the execution:
              making it fast, making it reliable, and not overcomplicating it.
            </p>
            <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
              I built Track4U because the technology finally made it obvious,
              and I genuinely wanted this tool for myself.
            </p>
          </div>
        </div>
      </section>

      {/* Design Principles */}
      <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-10 text-center">
            How I built it
          </h2>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="bg-stone-50 dark:bg-zinc-900 rounded-2xl p-6 border border-stone-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-6 h-6 text-amber-600 dark:text-amber-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                Optimized for speed
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm">
                I wanted to log meals in seconds, not minutes. Every interaction
                is designed to minimize friction. Photo → macros → done.
              </p>
            </div>

            <div className="bg-stone-50 dark:bg-zinc-900 rounded-2xl p-6 border border-stone-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                Good enough accuracy
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm">
                80% accurate estimates you actually log beat 99% accurate entries
                you skip. I optimized for consistency over perfection.
              </p>
            </div>

            <div className="bg-stone-50 dark:bg-zinc-900 rounded-2xl p-6 border border-stone-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                No business model games
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm">
                You bring your own API key, you pay OpenAI directly. I don&apos;t take a
                cut. The software is free. That&apos;s the whole deal.
              </p>
            </div>

            <div className="bg-stone-50 dark:bg-zinc-900 rounded-2xl p-6 border border-stone-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                Open source
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm">
                I enjoy building in the open. Every line of code is public. Fork
                it, self-host it, learn from it — it&apos;s all there.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 sm:py-24 bg-stone-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-6 text-center">
            Built with modern tech
          </h2>
          <p className="text-center text-stone-600 dark:text-stone-400 mb-10 max-w-2xl mx-auto">
            Track4U is built on a modern, robust stack designed for performance,
            developer experience, and ease of self-hosting.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { name: "Next.js 16", desc: "React framework" },
              { name: "TypeScript", desc: "Type safety" },
              { name: "Tailwind CSS", desc: "Styling" },
              { name: "shadcn/ui", desc: "Components" },
              { name: "Drizzle ORM", desc: "Database" },
              { name: "Turso", desc: "SQLite edge DB" },
              { name: "NextAuth.js", desc: "Authentication" },
              { name: "Recharts", desc: "Visualizations" },
            ].map((tech) => (
              <div
                key={tech.name}
                className="bg-white dark:bg-zinc-900 rounded-xl p-3 sm:p-4 border border-stone-200 dark:border-zinc-800 text-center"
              >
                <p className="font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                  {tech.name}
                </p>
                <p className="text-[10px] sm:text-xs text-stone-500">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect */}
      <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-stone-900 to-zinc-900 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-white"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Built in the open
            </h3>
            <p className="text-stone-300 mb-8 max-w-lg mx-auto">
              The code is MIT licensed. Check it out, fork it, self-host it, or
              contribute. I enjoy building practical tools and sharing them.
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
                View on GitHub
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-stone-50 to-stone-100 dark:from-zinc-900 dark:to-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-6">
            Give it a try
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-10">
            The app is free. You just need an OpenAI API key for the AI features.
            Takes about 2 minutes to set up.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-10"
              >
                Get Started
              </Button>
            </Link>
            <Link href="/features">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-stone-300 dark:border-stone-700"
              >
                See Features
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
