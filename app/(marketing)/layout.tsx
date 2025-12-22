import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { ThemeProvider } from "@/components/theme-provider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex flex-col">
        <MarketingNav />
        <main className="flex-1 pt-16 sm:pt-20">{children}</main>
        <MarketingFooter />
      </div>
    </ThemeProvider>
  );
}

