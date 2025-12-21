import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { GlobalScanner } from "@/components/layout/GlobalScanner";
import { SessionProvider } from "next-auth/react";

// Type workaround for React 19 compatibility
const Provider = SessionProvider as unknown as React.FC<{
  session: unknown;
  children: React.ReactNode;
}>;

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <Provider session={session}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
            {children}
          </main>
        </div>
        <MobileNav />
        <GlobalScanner />
      </div>
    </Provider>
  );
}
