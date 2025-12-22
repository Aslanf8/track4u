import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Hero } from "@/components/marketing/Hero";
import { TrustBar } from "@/components/marketing/TrustBar";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FeaturesGrid } from "@/components/marketing/FeatureCard";
import { SecuritySection } from "@/components/marketing/SecuritySection";
import { OpenSourceSection } from "@/components/marketing/OpenSourceSection";
import { CTASection } from "@/components/marketing/CTASection";
import { UsageOptions } from "@/components/marketing/UsageOptions";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      <MarketingNav />
      <main className="pt-16 sm:pt-20">
        <Hero />
        <TrustBar />
        <UsageOptions />
        <HowItWorks />
        <FeaturesGrid />
        <SecuritySection />
        <OpenSourceSection />
        <CTASection />
      </main>
      <MarketingFooter />
    </div>
  );
}
