import Link from "next/link";

export const metadata = {
  title: "Terms of Service - Track4U",
  description:
    "Terms of Service for Track4U — an open-source, AI-powered calorie tracking application.",
};

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing or using Track4U ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.

Track4U is an open-source project provided free of charge. The Service is provided "as is" without warranty of any kind.`,
  },
  {
    id: "description",
    title: "2. Description of Service",
    content: `Track4U is an AI-powered calorie and nutrition tracking application. The Service allows you to:

- Photograph meals for AI-powered nutritional analysis
- Log food entries manually
- Track daily calorie and macronutrient intake
- Set and monitor nutritional goals
- View historical data and progress

The AI analysis feature requires you to provide your own OpenAI API key (BYOK model). Track4U does not provide AI credits or process images directly.`,
  },
  {
    id: "accounts",
    title: "3. User Accounts",
    content: `**Account Creation**
To use certain features of the Service, you must create an account. You agree to:
- Provide accurate and complete information
- Maintain the security of your account credentials
- Promptly update any changes to your information
- Accept responsibility for all activities under your account

**Account Termination**
You may delete your account at any time through the app settings. We may suspend or terminate accounts that violate these Terms.`,
  },
  {
    id: "byok",
    title: "4. API Keys (BYOK)",
    content: `**Your Responsibility**
When you provide an OpenAI API key:
- You are responsible for any charges from OpenAI
- You must comply with OpenAI's terms of service
- You are responsible for securing your API key
- You accept that AI analysis accuracy is not guaranteed

**Our Handling**
- Your API key is encrypted using AES-256-GCM
- We never store your key in plain text after encryption
- We do not have access to your OpenAI billing or usage
- We are not responsible for charges incurred through your API key`,
  },
  {
    id: "acceptable-use",
    title: "5. Acceptable Use",
    content: `You agree not to:
- Use the Service for any illegal purpose
- Attempt to gain unauthorized access to the Service
- Interfere with or disrupt the Service
- Upload malicious code or content
- Impersonate others or misrepresent your affiliation
- Use the Service to harass, abuse, or harm others
- Circumvent security measures
- Scrape or collect data from other users

Violation of these terms may result in immediate termination of your account.`,
  },
  {
    id: "content",
    title: "6. User Content",
    content: `**Your Content**
You retain ownership of any content you submit to the Service (food descriptions, notes, etc.). By submitting content, you grant us a limited license to process and display that content as part of the Service.

**Content Guidelines**
Food log entries should be used for their intended purpose. We reserve the right to remove content that violates these Terms.

**No Image Retention**
Food photos are processed by OpenAI and immediately discarded. We do not store or have access to your food images.`,
  },
  {
    id: "ai-disclaimer",
    title: "7. AI Analysis Disclaimer",
    content: `**Not Medical Advice**
Track4U is not a medical device and does not provide medical advice. The nutritional estimates provided by AI analysis are approximations and should not be used for medical decision-making.

**Accuracy Limitations**
AI-powered nutritional analysis:
- Is an estimate, not an exact measurement
- May vary in accuracy depending on food type and image quality
- Should be verified for critical dietary needs
- Is provided by OpenAI, not Track4U

**Health Decisions**
Always consult healthcare professionals for medical nutrition therapy, eating disorders, allergies, or other health conditions. Track4U is a convenience tool, not a substitute for professional guidance.`,
  },
  {
    id: "intellectual-property",
    title: "8. Intellectual Property",
    content: `**Open Source License**
Track4U's source code is licensed under the MIT License. You may:
- Use, copy, modify, and distribute the code
- Use it for commercial purposes
- Include it in your own projects

The MIT License applies to the codebase, not to user data or the hosted service infrastructure.

**Trademarks**
The Track4U name and logo are trademarks. Use of these marks requires permission except as allowed by law.`,
  },
  {
    id: "privacy",
    title: "9. Privacy",
    content: `Your privacy is important to us. Our Privacy Policy describes how we collect, use, and protect your information. By using the Service, you agree to our Privacy Policy.

Key points:
- We don't sell your data
- Food photos are not stored
- API keys are encrypted
- You can export or delete your data anytime`,
  },
  {
    id: "disclaimers",
    title: "10. Disclaimers",
    content: `**As-Is Basis**
THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

**No Guarantee**
We do not guarantee that:
- The Service will be uninterrupted or error-free
- Defects will be corrected
- The Service is free of viruses or harmful components
- AI analysis will be accurate or complete

**Third-Party Services**
We are not responsible for third-party services (OpenAI, authentication providers, etc.) and their availability or performance.`,
  },
  {
    id: "limitation",
    title: "11. Limitation of Liability",
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL TRACK4U, ITS CREATOR, CONTRIBUTORS, OR AFFILIATES BE LIABLE FOR ANY:

- Indirect, incidental, special, consequential, or punitive damages
- Loss of profits, data, use, goodwill, or other intangible losses
- Damages resulting from your use or inability to use the Service
- Unauthorized access to or alteration of your data
- Third-party conduct on the Service
- AI analysis inaccuracies or errors
- API charges from your OpenAI account

This limitation applies regardless of the legal theory and even if we were advised of the possibility of such damages.`,
  },
  {
    id: "indemnification",
    title: "12. Indemnification",
    content: `You agree to indemnify and hold harmless Track4U, its creator, and contributors from any claims, damages, losses, liabilities, costs, or expenses (including attorney fees) arising from:

- Your use of the Service
- Your violation of these Terms
- Your violation of any third-party rights
- Your API key usage and associated charges
- Content you submit to the Service`,
  },
  {
    id: "modifications",
    title: "13. Modifications to Terms",
    content: `We reserve the right to modify these Terms at any time. When we do:

- The "Last updated" date will change
- Significant changes will be announced on GitHub
- Continued use constitutes acceptance of new Terms

If you disagree with changes, you should discontinue use and delete your account.`,
  },
  {
    id: "termination",
    title: "14. Termination",
    content: `**By You**
You may terminate your account at any time by deleting it through the app settings.

**By Us**
We may terminate or suspend your account immediately, without prior notice, for:
- Violation of these Terms
- Conduct that we believe is harmful to other users or the Service
- Any other reason at our sole discretion

**Effect of Termination**
Upon termination:
- Your right to use the Service ceases immediately
- Your data will be deleted per our Privacy Policy
- Provisions that should survive termination will remain in effect`,
  },
  {
    id: "governing-law",
    title: "15. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.

Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with applicable rules, except where prohibited by law.`,
  },
  {
    id: "contact",
    title: "16. Contact",
    content: `For questions about these Terms:
- Open an issue on GitHub
- Email: legal@track4u.app

For technical issues, please use the GitHub issue tracker.`,
  },
];

export default function TermsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 to-stone-50 dark:from-amber-950/20 dark:to-zinc-950" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4 text-amber-600 dark:text-amber-400"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Legal
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              Simple terms for a simple service. No legalese traps, just
              clarity.
            </p>
            <p className="text-sm text-stone-500 mt-6">
              Last updated: December 2024
            </p>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-12 sm:py-16 bg-stone-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
              TL;DR — Key Points
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: "✅", text: "Free to use, open source (MIT)" },
                {
                  icon: "🔑",
                  text: "You're responsible for your API key charges",
                },
                { icon: "⚠️", text: "AI estimates are not medical advice" },
                { icon: "🚫", text: "Don't use it for illegal purposes" },
                { icon: "📤", text: "You own your data, export anytime" },
                { icon: "🗑️", text: "Delete your account whenever you want" },
                { icon: "📝", text: "We may update these terms" },
                {
                  icon: "🤝",
                  text: "Use responsibly, we're not liable for misuse",
                },
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
                {section.title.replace(/^\d+\.\s/, "")}
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
                    // Handle ALL CAPS sections (legal disclaimers)
                    if (
                      paragraph === paragraph.toUpperCase() &&
                      paragraph.length > 50
                    ) {
                      return (
                        <p
                          key={index}
                          className="text-sm text-stone-500 dark:text-stone-500 leading-relaxed mb-4 font-medium"
                        >
                          {paragraph}
                        </p>
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
            Ready to start tracking?
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-8">
            Create a free account and start logging your meals with AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
