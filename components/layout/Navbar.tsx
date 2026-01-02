"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Home } from "lucide-react";
import Link from "next/link";
import { GEMINI_MODELS, type GeminiModelId } from "@/lib/gemini-models";

export function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // AI Model switcher state
  const [preferredProvider, setPreferredProvider] = useState<
    "openai" | "google"
  >("openai");
  const [preferredGeminiModel, setPreferredGeminiModel] =
    useState<GeminiModelId>("gemini-2.5-flash");
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [hasGoogleKey, setHasGoogleKey] = useState(false);

  // Fetch provider settings and API key status
  useEffect(() => {
    Promise.all([
      fetch("/api/settings/provider").then((r) => r.json()),
      fetch("/api/settings/gemini-model").then((r) => r.json()),
      fetch("/api/openai-key").then((r) => r.json()),
      fetch("/api/google-key").then((r) => r.json()),
    ])
      .then(([providerData, modelData, openaiKeyData, googleKeyData]) => {
        setPreferredProvider(providerData.provider || "openai");
        setPreferredGeminiModel(modelData.model || "gemini-2.5-flash");
        setHasOpenAIKey(openaiKeyData.hasKey || false);
        setHasGoogleKey(googleKeyData.hasKey || false);
      })
      .catch((err) => {
        console.error("Failed to fetch provider settings:", err);
      });
  }, []);

  const handleUpdateProvider = async (provider: "openai" | "google") => {
    try {
      const response = await fetch("/api/settings/provider", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      if (response.ok) {
        setPreferredProvider(provider);
      }
    } catch (error) {
      console.error("Failed to update provider:", error);
    }
  };

  const handleUpdateGeminiModel = async (model: GeminiModelId) => {
    try {
      const response = await fetch("/api/settings/gemini-model", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model }),
      });

      if (response.ok) {
        setPreferredGeminiModel(model);
      }
    } catch (error) {
      console.error("Failed to update model:", error);
    }
  };

  const currentProviderHasKey =
    preferredProvider === "openai" ? hasOpenAIKey : hasGoogleKey;
  const currentModelName =
    preferredProvider === "openai"
      ? "GPT-5.2"
      : GEMINI_MODELS.find((m) => m.id === preferredGeminiModel)?.name ||
        "Gemini";

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
            >
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              <path d="M8.5 8.5v.01" />
              <path d="M16 15.5v.01" />
              <path d="M12 12v.01" />
              <path d="M11 17v.01" />
              <path d="M7 14v.01" />
            </svg>
          </div>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Track4U
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* AI Model Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={!currentProviderHasKey}
                className={`
                  h-8 px-3 text-xs border-zinc-300 dark:border-zinc-700
                  ${
                    currentProviderHasKey
                      ? "bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                      : "bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-60"
                  }
                  transition-all duration-200
                `}
              >
                <span className="flex items-center gap-1.5">
                  {currentProviderHasKey ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className="font-medium">{currentModelName}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>No API Key</span>
                    </>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3 h-3 ml-1"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            >
              <DropdownMenuLabel className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-2 py-1.5">
                AI Provider
              </DropdownMenuLabel>

              {/* OpenAI Option */}
              <DropdownMenuItem
                onClick={() => handleUpdateProvider("openai")}
                disabled={!hasOpenAIKey}
                className={`
                  flex items-center justify-between px-3 py-2.5 cursor-pointer
                  ${
                    preferredProvider === "openai"
                      ? "bg-amber-50 dark:bg-amber-950/20"
                      : ""
                  }
                  ${
                    !hasOpenAIKey
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hasOpenAIKey ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  ></span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      OpenAI
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      GPT-5.2
                    </span>
                  </div>
                </div>
                {preferredProvider === "openai" && (
                  <Badge
                    variant="outline"
                    className="text-xs border-amber-500 text-amber-600 dark:text-amber-400"
                  >
                    Active
                  </Badge>
                )}
              </DropdownMenuItem>

              {/* Google/Gemini Options */}
              <DropdownMenuItem
                onClick={() => handleUpdateProvider("google")}
                disabled={!hasGoogleKey}
                className={`
                  flex items-center justify-between px-3 py-2.5 cursor-pointer
                  ${
                    preferredProvider === "google"
                      ? "bg-amber-50 dark:bg-amber-950/20"
                      : ""
                  }
                  ${
                    !hasGoogleKey
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hasGoogleKey ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  ></span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Google Gemini
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {GEMINI_MODELS.find((m) => m.id === preferredGeminiModel)
                        ?.name || "Select Model"}
                    </span>
                  </div>
                </div>
                {preferredProvider === "google" && (
                  <Badge
                    variant="outline"
                    className="text-xs border-amber-500 text-amber-600 dark:text-amber-400"
                  >
                    Active
                  </Badge>
                )}
              </DropdownMenuItem>

              {preferredProvider === "google" && hasGoogleKey && (
                <>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuLabel className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-2 py-1.5">
                    Gemini Models
                  </DropdownMenuLabel>
                  {GEMINI_MODELS.map((model) => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => handleUpdateGeminiModel(model.id)}
                      className={`
                        flex items-start justify-between px-3 py-2.5 cursor-pointer
                        ${
                          preferredGeminiModel === model.id
                            ? "bg-amber-50 dark:bg-amber-950/20"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }
                      `}
                    >
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {model.name}
                          </span>
                          {preferredGeminiModel === model.id && (
                            <Badge
                              variant="outline"
                              className="text-xs border-amber-500 text-amber-600 dark:text-amber-400 ml-1"
                            >
                              Active
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {model.description}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                          ${model.inputPrice.toFixed(2)}/$
                          {model.outputPrice.toFixed(2)} per 1M tokens
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </>
              )}

              {/* No Key Warning */}
              {(!hasOpenAIKey || !hasGoogleKey) && (
                <>
                  <DropdownMenuSeparator className="my-1" />
                  <div className="px-3 py-2.5">
                    <div className="flex items-start gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
                      >
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-1">
                          {!hasOpenAIKey && !hasGoogleKey
                            ? "No API keys configured"
                            : preferredProvider === "openai" && !hasOpenAIKey
                            ? "OpenAI key required"
                            : preferredProvider === "google" && !hasGoogleKey
                            ? "Google key required"
                            : "Some providers missing keys"}
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
                          onClick={() => router.push("/settings")}
                        >
                          Go to Settings →
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          {status === "loading" ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10 border-2 border-zinc-300 dark:border-zinc-700">
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {session?.user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
                <DropdownMenuItem
                  asChild
                  className="text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-zinc-900 dark:focus:text-zinc-100 cursor-pointer"
                >
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-zinc-900 dark:focus:text-zinc-100 cursor-pointer"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/sign-in" })}
                  className="text-red-500 dark:text-red-400 focus:bg-red-500/10 focus:text-red-500 dark:focus:text-red-400 cursor-pointer"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
