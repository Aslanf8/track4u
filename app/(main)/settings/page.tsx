"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Goals {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
}

interface ApiKeyStatus {
  hasKey: boolean;
  maskedKey: string | null;
  addedAt: string | null;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [goals, setGoals] = useState<Goals>({
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyCarbs: 200,
    dailyFat: 65,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // API Key state
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>({
    hasKey: false,
    maskedKey: null,
    addedAt: null,
  });
  const [newApiKey, setNewApiKey] = useState("");
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isRemovingKey, setIsRemovingKey] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchGoals();
    fetchApiKeyStatus();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/goals");
      const data = await response.json();
      if (data) {
        setGoals(data);
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApiKeyStatus = async () => {
    try {
      const response = await fetch("/api/openai-key");
      const data = await response.json();
      setApiKeyStatus(data);
    } catch (error) {
      console.error("Failed to fetch API key status:", error);
    }
  };

  const handleSaveGoals = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goals),
      });

      if (response.ok) {
        toast.success("Goals updated successfully!");
      } else {
        throw new Error("Failed to save");
      }
    } catch {
      toast.error("Failed to update goals");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestKey = async () => {
    if (!newApiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsTestingKey(true);
    setKeyTestResult(null);

    try {
      const response = await fetch("/api/openai-key/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: newApiKey }),
      });

      const data = await response.json();

      if (data.valid) {
        setKeyTestResult({
          valid: true,
          message: `Key is valid! ${
            data.hasGpt5Access
              ? "GPT-5.2 access confirmed."
              : data.hasGpt4Access
              ? "GPT-4 access confirmed."
              : ""
          }`,
        });
        toast.success("API key is valid!");
      } else {
        setKeyTestResult({
          valid: false,
          message: data.error || "Invalid API key",
        });
        toast.error(data.error || "Invalid API key");
      }
    } catch {
      setKeyTestResult({
        valid: false,
        message: "Failed to test API key",
      });
      toast.error("Failed to test API key");
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveKey = async () => {
    if (!newApiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsSavingKey(true);

    try {
      const response = await fetch("/api/openai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: newApiKey }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("API key saved successfully!");
        setNewApiKey("");
        setShowKeyInput(false);
        setShowPassword(false);
        setKeyTestResult(null);
        fetchApiKeyStatus();
      } else {
        toast.error(data.error || "Failed to save API key");
      }
    } catch {
      toast.error("Failed to save API key");
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Account deleted successfully");
        // Sign out and redirect
        await signOut({ callbackUrl: "/" });
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete account");
      }
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeleteConfirmText("");
    }
  };

  const handleRemoveKey = async () => {
    if (!confirm("Are you sure you want to remove your API key?")) {
      return;
    }

    setIsRemovingKey(true);

    try {
      const response = await fetch("/api/openai-key", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("API key removed");
        setApiKeyStatus({ hasKey: false, maskedKey: null, addedAt: null });
      } else {
        toast.error("Failed to remove API key");
      }
    } catch {
      toast.error("Failed to remove API key");
    } finally {
      setIsRemovingKey(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6 px-1">
        <Skeleton className="h-7 sm:h-8 w-36 sm:w-48 bg-zinc-200 dark:bg-zinc-800" />
        <Skeleton className="h-48 sm:h-64 w-full bg-zinc-200 dark:bg-zinc-800" />
        <Skeleton className="h-36 sm:h-48 w-full bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6 px-1">
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Settings
      </h1>

      {/* Profile Section */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
            Profile
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-500">
            Your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl sm:text-2xl font-bold text-white shrink-0">
              {session?.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-500 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OpenAI API Key Section */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 sm:w-5 sm:h-5"
            >
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
            OpenAI API Key
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-500">
            Use your own OpenAI API key to be billed directly to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          {apiKeyStatus.hasKey && !showKeyInput ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-green-600 dark:text-green-400"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      Connected
                    </p>
                    <p className="text-xs text-zinc-500">
                      {apiKeyStatus.maskedKey}
                    </p>
                  </div>
                </div>
                {apiKeyStatus.addedAt && (
                  <p className="text-xs text-zinc-500">
                    Added {new Date(apiKeyStatus.addedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowKeyInput(true)}
                  className="flex-1 h-9 sm:h-10 text-sm border-zinc-300 dark:border-zinc-700"
                >
                  Update Key
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRemoveKey}
                  disabled={isRemovingKey}
                  className="h-9 sm:h-10 text-sm border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                >
                  {isRemovingKey ? "Removing..." : "Remove"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="apiKey"
                  className="text-zinc-700 dark:text-zinc-300"
                >
                  API Key
                </Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showPassword ? "text" : "password"}
                    placeholder="sk-..."
                    value={newApiKey}
                    onChange={(e) => {
                      setNewApiKey(e.target.value);
                      setKeyTestResult(null);
                    }}
                    className="bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" x2="23" y1="1" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-500">
                  Get your API key from{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    platform.openai.com/api-keys
                  </a>
                </p>
              </div>

              {keyTestResult && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    keyTestResult.valid
                      ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                      : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                  }`}
                >
                  {keyTestResult.message}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleTestKey}
                  disabled={isTestingKey || !newApiKey.trim()}
                  className="flex-1 h-9 sm:h-10 text-sm border-zinc-300 dark:border-zinc-700"
                >
                  {isTestingKey ? "Testing..." : "Test Key"}
                </Button>
                <Button
                  onClick={handleSaveKey}
                  disabled={isSavingKey || !newApiKey.trim()}
                  className="flex-1 h-9 sm:h-10 text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  {isSavingKey ? "Saving..." : "Save Key"}
                </Button>
              </div>

              {apiKeyStatus.hasKey && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowKeyInput(false);
                    setNewApiKey("");
                    setShowPassword(false);
                    setKeyTestResult(null);
                  }}
                  className="w-full text-zinc-500"
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Goals Section */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
            Daily Goals
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-500">
            Set your daily nutrition targets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="calories"
                className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300"
              >
                Calories
              </Label>
              <Input
                id="calories"
                type="number"
                value={goals.dailyCalories}
                onChange={(e) =>
                  setGoals({
                    ...goals,
                    dailyCalories: parseInt(e.target.value) || 0,
                  })
                }
                className="h-9 sm:h-10 text-sm bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="protein"
                className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300"
              >
                Protein (g)
              </Label>
              <Input
                id="protein"
                type="number"
                value={goals.dailyProtein}
                onChange={(e) =>
                  setGoals({
                    ...goals,
                    dailyProtein: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-9 sm:h-10 text-sm bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="carbs"
                className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300"
              >
                Carbs (g)
              </Label>
              <Input
                id="carbs"
                type="number"
                value={goals.dailyCarbs}
                onChange={(e) =>
                  setGoals({
                    ...goals,
                    dailyCarbs: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-9 sm:h-10 text-sm bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="fat"
                className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300"
              >
                Fat (g)
              </Label>
              <Input
                id="fat"
                type="number"
                value={goals.dailyFat}
                onChange={(e) =>
                  setGoals({
                    ...goals,
                    dailyFat: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-9 sm:h-10 text-sm bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveGoals}
            disabled={isSaving}
            className="w-full h-9 sm:h-10 text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            {isSaving ? "Saving..." : "Save Goals"}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 border-red-200 dark:border-red-900/50">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg text-red-600 dark:text-red-400">
            Danger Zone
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-500">
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="h-9 sm:h-10 text-sm border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 mr-2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Sign Out
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="h-9 sm:h-10 text-sm border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 mr-2"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-zinc-600 dark:text-zinc-400">
              This action cannot be undone. This will permanently delete your
              account and all associated data including:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-4">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                All your food entries and history
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Your nutrition goals and preferences
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Your stored API key (if any)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Your account and profile information
              </li>
            </ul>

            <div className="space-y-2">
              <Label
                htmlFor="confirmDelete"
                className="text-sm text-zinc-700 dark:text-zinc-300"
              >
                Type{" "}
                <span className="font-mono font-bold text-red-600 dark:text-red-400">
                  DELETE
                </span>{" "}
                to confirm
              </Label>
              <Input
                id="confirmDelete"
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) =>
                  setDeleteConfirmText(e.target.value.toUpperCase())
                }
                className="bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmText("");
              }}
              className="flex-1 sm:flex-none border-zinc-300 dark:border-zinc-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE" || isDeleting}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Deleting...
                </span>
              ) : (
                "Delete My Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
