import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PricingCalculator } from "@/components/marketing/PricingCalculator";

export const metadata = {
  title: "Pricing - Track4U",
  description:
    "Track4U uses a BYOK model. No subscriptions, no hidden fees — just pay for AI usage.",
};

const faqs = [
  {
    question: "Why don't you charge a subscription?",
    answer:
      "Subscriptions create misaligned incentives. Apps like MyFitnessPal ($79.99/yr), Noom ($209/yr), and SnapCalorie ($59.99/yr) charge whether you use them or not. With BYOK, you only pay for what you use — and you pay the AI provider directly with no markup.",
  },
  {
    question: "What's an API key and how do I get one?",
    answer:
      "An API key is like a password that lets you use AI services directly. You can get one from AI providers like OpenAI. Go to their platform, create an account, and generate a key. There's a step-by-step guide in the app.",
  },
  {
    question: "How much does each scan actually cost?",
    answer:
      "Each food scan costs approximately $0.01 using GPT-5.2 ($1.75/M input tokens + $14/M output tokens). A typical user scanning 5 meals per day would spend around $1.50/month — that's just $18/year compared to $39-80/year for traditional apps or $60-72/year for AI competitors.",
  },
  {
    question: "How does this compare to other AI food scanning apps?",
    answer:
      "AI-powered apps like SnapCalorie ($9.99/mo, $59.99/yr), Foodvisor ($14.99/mo, $69.99/yr), and MacroFactor ($11.99/mo, $71.99/yr) all use subscription models. Track4U uses GPT-5.2 Vision and lets you pay only for actual scans — typically 70-85% cheaper annually.",
  },
  {
    question: "Is there a free tier?",
    answer:
      "Track4U itself is completely free. The only cost is AI usage, which you pay directly to the AI provider. OpenAI offers free credits when you sign up, so you can try it at no cost.",
  },
  {
    question: "What if I don't want to use AI scanning?",
    answer:
      "You can use Track4U without an API key for manual logging. The AI scanning is optional — you can still log meals by typing in the nutritional info yourself.",
  },
  {
    question: "Can I self-host Track4U?",
    answer:
      "Yes! Track4U is 100% open source under the MIT license. You can clone the repo, deploy to your own infrastructure, and run it completely independently — no dependency on this project whatsoever.",
  },
  {
    question: "What's the difference between hosted and self-hosted?",
    answer:
      "With the hosted version, you create an account and I handle the database, authentication, and hosting for free — you just bring your API key. With self-hosted, you run everything yourself on your own infrastructure with complete independence.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-stone-50 dark:from-emerald-950/20 dark:to-zinc-950" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
              <path d="M12 18V6" />
            </svg>
            <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
              No subscriptions
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 dark:text-stone-100 mb-6">
            Pay for what you use.{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Nothing more.
            </span>
          </h1>
          <p className="text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Track4U is free. You only pay for AI usage, billed directly by your AI
            provider. No markup, no hidden fees, no subscription.
          </p>
        </div>
      </section>

      {/* Main Pricing Section */}
      <section className="py-16 sm:py-24 bg-stone-50 dark:bg-zinc-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: BYOK Explanation */}
            <div>
              <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-6">
                The BYOK Model
              </h2>
              <p className="text-lg text-stone-600 dark:text-stone-400 mb-8">
                BYOK stands for &quot;Bring Your Own Key.&quot; Instead of us charging
                you a monthly fee, you use your own AI API key and pay the AI
                provider directly.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                      Zero markup
                    </h3>
                    <p className="text-stone-600 dark:text-stone-400">
                      Track4U doesn&apos;t touch your billing. What the AI provider
                      charges is what you pay.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                      Full control
                    </h3>
                    <p className="text-stone-600 dark:text-stone-400">
                      Set spending limits directly with the AI provider. Cancel
                      or pause anytime.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                      Privacy by design
                    </h3>
                    <p className="text-stone-600 dark:text-stone-400">
                      Your API key is encrypted. Track4U never sees your usage or
                      billing data.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                      Use-based pricing
                    </h3>
                    <p className="text-stone-600 dark:text-stone-400">
                      Only pay when you scan. Skip a week? Pay nothing that
                      week.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Calculator */}
            <div>
              <PricingCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4">
              The subscription trap
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-400">
              Apps like MyFitnessPal ($19.99/mo), Noom ($70/mo), and AI competitors ($10-15/mo) lock you into subscriptions.
              <br className="hidden sm:block" />
              Track4U flips the model — pay only when you scan.
            </p>
          </div>

          <div className="bg-stone-50 dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 dark:border-zinc-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Traditional Apps
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-stone-900 dark:text-stone-100">
                    AI Competitors
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-amber-600 dark:text-amber-400">
                    Track4U
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-zinc-800">
                {[
                  {
                    feature: "Monthly cost",
                    traditional: "$7-20/mo",
                    ai: "$10-15/mo",
                    track4u: "$0-3/mo*",
                  },
                  {
                    feature: "Yearly cost",
                    traditional: "$39-80/yr",
                    ai: "$60-72/yr",
                    track4u: "$0-18/yr*",
                  },
                  { feature: "AI food scanning", traditional: "Limited", ai: "✓", track4u: "✓" },
                  { feature: "GPT-5.2 Vision", traditional: "✗", ai: "✗", track4u: "✓" },
                  { feature: "Goal setting", traditional: "✓", ai: "✓", track4u: "✓" },
                  { feature: "Progress charts", traditional: "✓", ai: "✓", track4u: "✓" },
                  { feature: "No ads", traditional: "Premium only", ai: "✓", track4u: "✓" },
                  { feature: "Open source", traditional: "✗", ai: "✗", track4u: "✓" },
                  { feature: "Self-hostable", traditional: "✗", ai: "✗", track4u: "✓" },
                  { feature: "Pay when inactive", traditional: "✓", ai: "✓", track4u: "✗" },
                  { feature: "Data privacy", traditional: "Varies", ai: "Their servers", track4u: "Your API key" },
                ].map((row) => (
                  <tr key={row.feature}>
                    <td className="px-6 py-4 text-sm text-stone-700 dark:text-stone-300">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-stone-500">
                      {row.traditional}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-stone-500">
                      {row.ai}
                    </td>
                    <td className="px-6 py-4 text-sm text-center font-medium text-stone-900 dark:text-stone-100">
                      {row.track4u}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-stone-100 dark:bg-zinc-800/50 text-xs text-stone-500 text-center">
              *Based on typical usage of 3-5 scans per day at ~$0.01/scan with GPT-5.2. Traditional: MyFitnessPal, Cronometer, Lose It!, etc. AI: SnapCalorie, Foodvisor, MacroFactor
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-stone-50 dark:bg-zinc-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-6"
              >
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  {faq.question}
                </h3>
                <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-white to-stone-100 dark:from-zinc-950 dark:to-zinc-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-6">
            Ready to ditch the subscription?
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-10">
            Create a free account and start tracking with AI. No credit card
            required.
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
