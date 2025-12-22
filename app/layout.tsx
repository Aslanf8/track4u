import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Track4U - AI-Powered Food & Nutrition Tracking",
    template: "%s | Track4U",
  },
  description:
    "Track your nutrition with AI-powered food analysis. Snap a photo, get instant macro breakdowns, and achieve your health goals effortlessly.",
  keywords: [
    "food tracker",
    "nutrition app",
    "calorie counter",
    "macro tracker",
    "AI food analysis",
    "diet app",
    "health tracking",
    "meal logging",
    "fitness nutrition",
  ],
  authors: [{ name: "Track4U" }],
  creator: "Track4U",
  publisher: "Track4U",
  metadataBase: new URL("https://track4u.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://track4u.vercel.app",
    siteName: "Track4U",
    title: "Track4U - AI-Powered Food & Nutrition Tracking",
    description:
      "Track your nutrition with AI-powered food analysis. Snap a photo, get instant macro breakdowns, and achieve your health goals.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Track4U - AI-Powered Food Tracking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Track4U - AI-Powered Food & Nutrition Tracking",
    description:
      "Track your nutrition with AI-powered food analysis. Snap a photo, get instant macro breakdowns.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/apple-icon",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Track4U",
  },
  formatDetection: {
    telephone: false,
  },
  category: "health",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
