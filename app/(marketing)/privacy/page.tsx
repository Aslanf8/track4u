import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Track4U",
  description:
    "Track4U is built with privacy as a core principle. Your data stays yours — we don't sell, share, or monetize your information.",
};

const sections = [
  {
    id: "overview",
    title: "Privacy Overview",
    content: `Track4U is built with privacy as a core principle. We're an open-source project, which means our code is fully auditable. We don't sell your data, we don't run ads, and we don't use your information to train AI models.

The BYOK (Bring Your Own Key) model means your AI usage goes directly to your provider — we never see your API billing, usage patterns, or the images you scan.`,
  },
  {
    id: "data-collection",
    title: "What We Collect",
    content: `**Account Information**
When you create an account, we collect:
- Email address (for authentication)
- Name (optional, for personalization)
- Password (hashed, never stored in plain text)

**Food Log Data**
When you log meals, we store:
- Nutritional information (calories, protein, carbs, fat)
- Food descriptions
- Timestamps

**What We Don't Store**
- Food photos (processed and immediately discarded)
- Your OpenAI API key in plain text (encrypted with AES-256-GCM)
- Your AI usage or billing data`,
  },
  {
    id: "api-keys",
    title: "API Key Security",
    content: `Your OpenAI API key is encrypted using AES-256-GCM encryption before being stored in our database. This is the same encryption standard used by banks and government agencies.

When you make a scan request:
1. Your encrypted key is retrieved
2. Decrypted in memory only for the API call
3. The image is sent directly to OpenAI
4. Results are returned to you
5. No image data is retained

We never log, store, or have access to your plain-text API key after encryption.`,
  },
  {
    id: "image-processing",
    title: "Image Processing",
    content: `When you photograph a meal:
1. The image is sent to OpenAI's API for analysis
2. OpenAI returns nutritional estimates
3. The image is immediately discarded
4. Only the nutritional data is stored in your food log

We do not:
- Store your food photos on our servers
- Use your images to train AI models
- Share your images with third parties
- Retain any visual data after processing`,
  },
  {
    id: "data-sharing",
    title: "Data Sharing",
    content: `**We do not sell your data. Ever.**

The only third party that receives your data is:
- **OpenAI** (or your chosen AI provider): Receives your food images for analysis via your own API key. Their privacy policy governs their handling of this data.

We may disclose information if required by law or to protect the safety of our users.`,
  },
  {
    id: "data-retention",
    title: "Data Retention",
    content: `**Active Accounts**
Your food log and account data are retained as long as your account is active.

**Account Deletion**
When you delete your account:
- All your food log entries are permanently deleted
- Your encrypted API key is deleted
- Your account information is removed
- This process is irreversible

**Export Your Data**
You can export all your data at any time from your account settings. We believe in data portability — your data belongs to you.`,
  },
  {
    id: "self-hosting",
    title: "Self-Hosting",
    content: `Track4U is fully open source under the MIT license. You can:
- Clone the repository
- Deploy on your own infrastructure
- Have complete control over all data
- Modify the code as needed

Self-hosted instances operate independently and are not covered by this privacy policy. You are responsible for your own data handling practices when self-hosting.`,
  },
  {
    id: "cookies",
    title: "Cookies & Local Storage",
    content: `We use minimal cookies and local storage:

**Essential Cookies**
- Session authentication token
- Theme preference (light/dark mode)

**No Tracking**
- No analytics cookies
- No advertising cookies
- No third-party tracking pixels

We don't use Google Analytics, Facebook Pixel, or any other tracking services.`,
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    content: `Track4U is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.`,
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: `We may update this privacy policy from time to time. When we do:
- The "Last updated" date will change
- Significant changes will be announced on our GitHub repository
- Continued use of the service constitutes acceptance of the updated policy

As an open-source project, all changes to our privacy practices are public and auditable.`,
  },
  {
    id: "contact",
    title: "Contact",
    content: `For privacy-related questions or concerns:
- Open an issue on GitHub
- Email: privacy@track4u.app

For data deletion requests, use the account settings in the app or contact us directly.`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-stone-50 dark:from-blue-950/20 dark:to-zinc-950" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 mb-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Privacy First
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              Your data stays yours. We don&apos;t sell it, we don&apos;t share
              it, and we don&apos;t monetize it.
            </p>
            <p className="text-sm text-stone-500 mt-6">
              Last updated: December 2025
            </p>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-12 sm:py-16 bg-stone-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
              TL;DR — The Short Version
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: "🔐", text: "API keys encrypted with AES-256-GCM" },
                { icon: "📷", text: "Food photos never stored on our servers" },
                { icon: "🚫", text: "No selling or sharing of your data" },
                { icon: "📊", text: "No analytics or tracking cookies" },
                { icon: "💾", text: "Export your data anytime" },
                { icon: "🗑️", text: "Delete everything when you leave" },
                { icon: "👁️", text: "Open source = fully auditable" },
                { icon: "🏠", text: "Self-host for complete control" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm text-stone-600 dark:text-stone-400">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-8 bg-white dark:bg-zinc-950 border-b border-stone-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="px-3 py-1.5 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {sections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6">
                  {section.title}
                </h2>
                <div className="prose prose-stone dark:prose-invert max-w-none">
                  {section.content.split("\n\n").map((paragraph, index) => {
                    if (
                      paragraph.startsWith("**") &&
                      paragraph.includes("**\n")
                    ) {
                      const [title, ...rest] = paragraph.split("\n");
                      return (
                        <div key={index} className="mb-4">
                          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-2">
                            {title.replace(/\*\*/g, "")}
                          </h3>
                          <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                            {rest.join("\n")}
                          </p>
                        </div>
                      );
                    }
                    if (paragraph.startsWith("- ")) {
                      return (
                        <ul
                          key={index}
                          className="list-disc list-inside text-stone-600 dark:text-stone-400 space-y-1 mb-4"
                        >
                          {paragraph.split("\n").map((item, i) => (
                            <li key={i}>{item.replace("- ", "")}</li>
                          ))}
                        </ul>
                      );
                    }
                    if (paragraph.match(/^\d\./)) {
                      return (
                        <ol
                          key={index}
                          className="list-decimal list-inside text-stone-600 dark:text-stone-400 space-y-1 mb-4"
                        >
                          {paragraph.split("\n").map((item, i) => (
                            <li key={i}>{item.replace(/^\d\.\s/, "")}</li>
                          ))}
                        </ol>
                      );
                    }
                    return (
                      <p
                        key={index}
                        className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4"
                      >
                        {paragraph.split("**").map((part, i) =>
                          i % 2 === 1 ? (
                            <strong
                              key={i}
                              className="text-stone-800 dark:text-stone-200"
                            >
                              {part}
                            </strong>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-stone-50 to-stone-100 dark:from-zinc-900 dark:to-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            Questions about privacy?
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-8">
            Our code is open source — audit it yourself or reach out with
            questions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/Aslanf8/track4u"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium rounded-xl hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View Source Code
            </a>
            <Link
              href="/terms"
              className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
