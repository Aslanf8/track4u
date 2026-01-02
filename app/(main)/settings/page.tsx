"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  calculateMetabolicMetrics,
  calculateBMR,
  calculateTDEE,
  kgToLbs,
  lbsToKg,
  cmToFeetInches,
  feetInchesToCm,
  type ProfileData,
} from "@/lib/calculations";
import { GEMINI_MODELS, type GeminiModelId } from "@/lib/gemini-models";
import { GoalsWizard } from "@/components/onboarding/GoalsWizard";

interface Goals {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  age?: number | null;
  sex?: "male" | "female" | null;
  weight?: number | null;
  height?: number | null;
  activityLevel?:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very_active"
    | null;
  goalType?: "lose" | "maintain" | "gain" | null;
}

interface ApiKeyStatus {
  hasKey: boolean;
  maskedKey: string | null;
  addedAt: string | null;
}

interface GoogleKeyStatus {
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
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Profile & Physics state - separate edit state from saved state
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("lbs");
  const [heightUnit, setHeightUnit] = useState<"metric" | "imperial">(
    "imperial"
  );
  const [displayWeight, setDisplayWeight] = useState(154); // Default to ~70kg in lbs
  const [displayFeet, setDisplayFeet] = useState(5);
  const [displayInches, setDisplayInches] = useState(9);

  // Separate edit state for profile (doesn't affect energy balance until saved)
  const [profileEdit, setProfileEdit] = useState<{
    age?: number | null;
    sex?: "male" | "female" | null;
    weight?: number | null;
    height?: number | null;
    activityLevel?:
      | "sedentary"
      | "light"
      | "moderate"
      | "active"
      | "very_active"
      | null;
  }>({});

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

  // Google Key state
  const [googleKeyStatus, setGoogleKeyStatus] = useState<GoogleKeyStatus>({
    hasKey: false,
    maskedKey: null,
    addedAt: null,
  });
  const [newGoogleKey, setNewGoogleKey] = useState("");
  const [isTestingGoogleKey, setIsTestingGoogleKey] = useState(false);
  const [isSavingGoogleKey, setIsSavingGoogleKey] = useState(false);
  const [isRemovingGoogleKey, setIsRemovingGoogleKey] = useState(false);
  const [showGoogleKeyInput, setShowGoogleKeyInput] = useState(false);
  const [showGooglePassword, setShowGooglePassword] = useState(false);
  const [googleKeyTestResult, setGoogleKeyTestResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  // Provider & Model state
  const [preferredProvider, setPreferredProvider] = useState<
    "openai" | "google"
  >("openai");
  const [preferredGeminiModel, setPreferredGeminiModel] =
    useState<GeminiModelId>("gemini-2.5-flash");
  const [availableModels, setAvailableModels] = useState(GEMINI_MODELS);

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Goals Wizard state
  const [showGoalsWizard, setShowGoalsWizard] = useState(false);

  useEffect(() => {
    fetchGoals();
    fetchApiKeyStatus();
    fetchGoogleKeyStatus();
    fetchProviderSettings();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/goals");
      const data = await response.json();
      if (data) {
        setGoals(data);
        // Initialize edit state with saved values
        const editState = {
          age: data.age,
          sex: data.sex,
          weight: data.weight ? Math.round(data.weight * 10) / 10 : null, // Round to 1 decimal
          height: data.height,
          activityLevel: data.activityLevel,
        };
        setProfileEdit(editState);
        // Set display values for weight/height (default to lbs and feet/inches)
        if (data.weight) {
          // Default to lbs display
          setWeightUnit("lbs");
          const weightLbs = Math.round(kgToLbs(data.weight));
          setDisplayWeight(weightLbs);
        } else {
          // Set default if no weight exists
          setDisplayWeight(154);
        }
        if (data.height) {
          // Default to feet/inches display
          setHeightUnit("imperial");
          const { feet, inches } = cmToFeetInches(data.height);
          setDisplayFeet(feet);
          setDisplayInches(inches);
        } else {
          // Set defaults if no height exists
          setDisplayFeet(5);
          setDisplayInches(9);
        }
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

  const fetchGoogleKeyStatus = async () => {
    try {
      const response = await fetch("/api/google-key");
      const data = await response.json();
      setGoogleKeyStatus(data);
    } catch (error) {
      console.error("Failed to fetch Google key status:", error);
    }
  };

  const fetchProviderSettings = async () => {
    try {
      const [providerRes, modelRes] = await Promise.all([
        fetch("/api/settings/provider"),
        fetch("/api/settings/gemini-model"),
      ]);
      const providerData = await providerRes.json();
      const modelData = await modelRes.json();
      setPreferredProvider(providerData.provider || "openai");
      setPreferredGeminiModel(modelData.model || "gemini-2.5-flash");
      if (modelData.availableModels) {
        setAvailableModels(modelData.availableModels);
      }
    } catch (error) {
      console.error("Failed to fetch provider settings:", error);
    }
  };

  // Calculate metabolic metrics based on SAVED goals only (not edit state)
  const metrics = useMemo(() => {
    const profile: ProfileData = {
      age: goals.age,
      sex: goals.sex,
      weight: goals.weight,
      height: goals.height,
      activityLevel: goals.activityLevel,
    };
    return calculateMetabolicMetrics(profile, goals.dailyCalories);
  }, [
    goals.age,
    goals.sex,
    goals.weight,
    goals.height,
    goals.activityLevel,
    goals.dailyCalories,
  ]);

  // Update edit state (doesn't affect energy balance until saved)
  const updateWeight = (value: number, unit: "kg" | "lbs") => {
    if (value <= 0) {
      setDisplayWeight(0);
      setProfileEdit((prev) => ({ ...prev, weight: null }));
      return;
    }
    const weightKg = unit === "lbs" ? lbsToKg(value) : value;
    // Round to 1 decimal place for kg
    const roundedWeightKg = Math.round(weightKg * 10) / 10;
    setProfileEdit((prev) => ({ ...prev, weight: roundedWeightKg }));
    // Update display weight for the current unit
    setDisplayWeight(unit === "kg" ? roundedWeightKg : Math.round(value));
  };

  const updateHeight = (feet: number, inches: number) => {
    if (feet < 0 || inches < 0 || inches >= 12) return;
    setDisplayFeet(feet);
    setDisplayInches(inches);
    const heightCm = feetInchesToCm(feet, inches);
    setProfileEdit((prev) => ({ ...prev, height: heightCm }));
  };

  const updateHeightCm = (cm: number) => {
    if (cm <= 0) {
      setProfileEdit((prev) => ({ ...prev, height: null }));
      return;
    }
    const { feet, inches } = cmToFeetInches(cm);
    setDisplayFeet(feet);
    setDisplayInches(inches);
    setProfileEdit((prev) => ({ ...prev, height: cm }));
  };

  // Calculate macros based on profile (similar to GoalsWizard)
  const calculateMacrosFromProfile = (profile: {
    age?: number | null;
    sex?: "male" | "female" | null;
    weight?: number | null;
    height?: number | null;
    activityLevel?:
      | "sedentary"
      | "light"
      | "moderate"
      | "active"
      | "very_active"
      | null;
    goalType?: "lose" | "maintain" | "gain" | null;
  }) => {
    if (
      !profile.age ||
      !profile.sex ||
      !profile.weight ||
      !profile.height ||
      !profile.activityLevel
    ) {
      return null;
    }

    const bmr = calculateBMR(profile as ProfileData);
    const tdee = calculateTDEE(profile as ProfileData);

    // Goal type adjustments (same as GoalsWizard)
    const goalAdjustments: Record<string, number> = {
      lose: -500,
      maintain: 0,
      gain: 300,
    };
    const calorieAdjust = goalAdjustments[profile.goalType || "maintain"] || 0;
    const dailyCalories = Math.round(tdee + calorieAdjust);

    // Protein: 1.6-2.2g per kg (higher for muscle gain/weight loss)
    const proteinMultiplier = profile.goalType === "maintain" ? 1.6 : 2.0;
    const dailyProtein = Math.round(profile.weight * proteinMultiplier);

    // Fat: 25-30% of calories (9 cal/g)
    const fatCalories = dailyCalories * 0.28;
    const dailyFat = Math.round(fatCalories / 9);

    // Carbs: remaining calories (4 cal/g)
    const proteinCalories = dailyProtein * 4;
    const remainingCalories = dailyCalories - proteinCalories - fatCalories;
    const dailyCarbs = Math.round(remainingCalories / 4);

    return { dailyCalories, dailyProtein, dailyCarbs, dailyFat };
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const response = await fetch("/api/settings/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: profileEdit.weight,
          height: profileEdit.height,
          age: profileEdit.age,
          sex: profileEdit.sex,
          activityLevel: profileEdit.activityLevel,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();

        // Recalculate macros based on updated profile
        const updatedProfile = {
          age: updatedData.age,
          sex: updatedData.sex,
          weight: updatedData.weight,
          height: updatedData.height,
          activityLevel: updatedData.activityLevel,
          goalType: goals.goalType || "maintain",
        };

        const newMacros = calculateMacrosFromProfile(updatedProfile);

        // Update the saved goals state with both profile and recalculated macros
        setGoals((prev) => ({
          ...prev,
          age: updatedData.age,
          sex: updatedData.sex,
          weight: updatedData.weight,
          height: updatedData.height,
          activityLevel: updatedData.activityLevel,
          // Update macros if calculation succeeded
          ...(newMacros
            ? {
                dailyCalories: newMacros.dailyCalories,
                dailyProtein: newMacros.dailyProtein,
                dailyCarbs: newMacros.dailyCarbs,
                dailyFat: newMacros.dailyFat,
              }
            : {}),
        }));

        // Also save the updated macros to the backend
        if (newMacros) {
          try {
            await fetch("/api/goals", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...updatedProfile,
                ...newMacros,
              }),
            });
          } catch (err) {
            console.error("Failed to save recalculated macros:", err);
          }
        }

        toast.success("Profile updated and macros recalculated!");
      } else {
        throw new Error("Failed to save");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
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

  const handleTestGoogleKey = async () => {
    if (!newGoogleKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsTestingGoogleKey(true);
    setGoogleKeyTestResult(null);

    try {
      const response = await fetch("/api/google-key/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: newGoogleKey }),
      });

      const data = await response.json();

      if (data.valid) {
        setGoogleKeyTestResult({
          valid: true,
          message: data.message || "Google API key is valid!",
        });
        toast.success("Google API key is valid!");
      } else {
        setGoogleKeyTestResult({
          valid: false,
          message: data.error || "Invalid API key",
        });
        toast.error(data.error || "Invalid API key");
      }
    } catch {
      setGoogleKeyTestResult({
        valid: false,
        message: "Failed to test API key",
      });
      toast.error("Failed to test API key");
    } finally {
      setIsTestingGoogleKey(false);
    }
  };

  const handleSaveGoogleKey = async () => {
    if (!newGoogleKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsSavingGoogleKey(true);

    try {
      const response = await fetch("/api/google-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: newGoogleKey }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Google API key saved successfully!");
        setNewGoogleKey("");
        setShowGoogleKeyInput(false);
        setShowGooglePassword(false);
        setGoogleKeyTestResult(null);
        fetchGoogleKeyStatus();
      } else {
        toast.error(data.error || "Failed to save API key");
      }
    } catch {
      toast.error("Failed to save API key");
    } finally {
      setIsSavingGoogleKey(false);
    }
  };

  const handleRemoveGoogleKey = async () => {
    if (!confirm("Are you sure you want to remove your Google API key?")) {
      return;
    }

    setIsRemovingGoogleKey(true);

    try {
      const response = await fetch("/api/google-key", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Google API key removed");
        setGoogleKeyStatus({ hasKey: false, maskedKey: null, addedAt: null });
      } else {
        toast.error("Failed to remove API key");
      }
    } catch {
      toast.error("Failed to remove API key");
    } finally {
      setIsRemovingGoogleKey(false);
    }
  };

  const handleUpdateProvider = async (provider: "openai" | "google") => {
    try {
      const response = await fetch("/api/settings/provider", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      if (response.ok) {
        setPreferredProvider(provider);
        toast.success(
          `Switched to ${provider === "openai" ? "OpenAI" : "Google"}`
        );
      } else {
        toast.error("Failed to update provider");
      }
    } catch {
      toast.error("Failed to update provider");
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
        toast.success("Model updated");
      } else {
        toast.error("Failed to update model");
      }
    } catch {
      toast.error("Failed to update model");
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

  const handleGoalsWizardComplete = async (wizardData: {
    age: number;
    sex: "male" | "female";
    weight: number;
    height: number;
    activityLevel:
      | "sedentary"
      | "light"
      | "moderate"
      | "active"
      | "very_active";
    goalType: "lose" | "maintain" | "gain";
    dailyCalories: number;
    dailyProtein: number;
    dailyCarbs: number;
    dailyFat: number;
  }) => {
    try {
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wizardData),
      });

      if (!response.ok) {
        throw new Error("Failed to save goals");
      }

      const updatedGoals = await response.json();

      // Update all goals state (including profile data and macros)
      setGoals(updatedGoals);

      // Update profile edit state
      setProfileEdit({
        age: updatedGoals.age,
        sex: updatedGoals.sex,
        weight: updatedGoals.weight,
        height: updatedGoals.height,
        activityLevel: updatedGoals.activityLevel,
      });

      // Update display values
      if (updatedGoals.weight) {
        setDisplayWeight(Math.round(updatedGoals.weight * 10) / 10);
      }
      if (updatedGoals.height) {
        const { feet, inches } = cmToFeetInches(updatedGoals.height);
        setDisplayFeet(feet);
        setDisplayInches(inches);
      }

      setShowGoalsWizard(false);
      toast.success(
        "Goals updated successfully! Your energy balance has been recalculated."
      );
    } catch {
      toast.error("Failed to save goals. Please try again.");
    }
  };

  // Get warning messages for targets
  const getTargetWarnings = () => {
    const warnings: string[] = [];
    if (metrics.tdee > 0) {
      if (goals.dailyCalories > metrics.tdee) {
        const surplus = goals.dailyCalories - metrics.tdee;
        warnings.push(
          `⚠️ You are in a surplus of +${surplus} cal (Weight Gain)`
        );
      }
      if (goals.dailyCalories < metrics.bmr) {
        warnings.push("⚠️ Warning: Below BMR - consult a professional");
      }
      if (metrics.deficit > 1000) {
        warnings.push("⚠️ Extreme deficit - may be unsustainable");
      }
    }
    return warnings;
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-6 px-1">
        <Skeleton className="h-7 sm:h-8 w-36 sm:w-48 bg-zinc-200 dark:bg-zinc-800" />
        <Skeleton className="h-48 sm:h-64 w-full bg-zinc-200 dark:bg-zinc-800" />
        <Skeleton className="h-36 sm:h-48 w-full bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-6 px-1">
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Settings & Preferences
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

      {/* A. Profile & Physics Section */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
            Profile & Physics
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-500">
            Edit your body stats and save to update your energy balance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                  Weight
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    const currentWeight = profileEdit.weight ?? goals.weight;
                    if (currentWeight) {
                      if (weightUnit === "kg") {
                        // Switching to lbs - convert and update display
                        setDisplayWeight(Math.round(kgToLbs(currentWeight)));
                      } else {
                        // Switching to kg - use the stored kg value, round to 1 decimal
                        setDisplayWeight(Math.round(currentWeight * 10) / 10);
                      }
                    } else {
                      // No weight set, use defaults
                      setDisplayWeight(weightUnit === "kg" ? 70 : 154);
                    }
                    setWeightUnit(weightUnit === "kg" ? "lbs" : "kg");
                  }}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                >
                  {weightUnit === "kg" ? "Switch to lbs" : "Switch to kg"}
                </button>
              </div>
              <Input
                type="number"
                step={weightUnit === "kg" ? "0.1" : "1"}
                value={
                  weightUnit === "kg"
                    ? profileEdit.weight !== undefined && profileEdit.weight !== null
                      ? profileEdit.weight.toFixed(1)
                      : goals.weight
                      ? goals.weight.toFixed(1)
                      : ""
                    : displayWeight || ""
                }
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  updateWeight(value, weightUnit);
                }}
                className="h-9 sm:h-10 text-sm"
              />
              <p className="text-xs text-zinc-500">
                {weightUnit === "kg" ? "kg" : "lbs"}
              </p>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                  Height
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    const currentHeight = profileEdit.height ?? goals.height;
                    if (currentHeight) {
                      if (heightUnit === "metric") {
                        // Switching to imperial - convert to feet/inches
                        const { feet, inches } = cmToFeetInches(currentHeight);
                        setDisplayFeet(feet);
                        setDisplayInches(inches);
                      }
                      // If switching to metric, the input will show the cm value directly
                    } else {
                      // No height set, use defaults
                      if (heightUnit === "metric") {
                        setDisplayFeet(5);
                        setDisplayInches(9);
                      }
                    }
                    setHeightUnit(
                      heightUnit === "metric" ? "imperial" : "metric"
                    );
                  }}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                >
                  {heightUnit === "metric" ? "Switch to ft/in" : "Switch to cm"}
                </button>
              </div>
              {heightUnit === "metric" ? (
                <Input
                  type="number"
                  value={
                    profileEdit.height !== undefined && profileEdit.height !== null
                      ? Math.round(profileEdit.height)
                      : goals.height
                      ? Math.round(goals.height)
                      : ""
                  }
                  onChange={(e) => {
                    const cm = parseFloat(e.target.value) || 0;
                    if (cm > 0) {
                      updateHeightCm(cm);
                    } else {
                      setProfileEdit((prev) => ({ ...prev, height: null }));
                    }
                  }}
                  className="h-9 sm:h-10 text-sm"
                  placeholder="cm"
                />
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={displayFeet || ""}
                    onChange={(e) => {
                      const feet = parseInt(e.target.value) || 0;
                      updateHeight(feet, displayInches);
                    }}
                    className="h-9 sm:h-10 text-sm"
                    placeholder="ft"
                  />
                  <Input
                    type="number"
                    value={displayInches || ""}
                    onChange={(e) => {
                      const inches = parseInt(e.target.value) || 0;
                      updateHeight(displayFeet, inches);
                    }}
                    className="h-9 sm:h-10 text-sm"
                    placeholder="in"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                Age
              </Label>
              <Input
                type="number"
                value={profileEdit.age || ""}
                onChange={(e) =>
                  setProfileEdit({
                    ...profileEdit,
                    age: parseInt(e.target.value) || null,
                  })
                }
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                Sex
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={profileEdit.sex === "male" ? "default" : "outline"}
                  onClick={() =>
                    setProfileEdit({ ...profileEdit, sex: "male" })
                  }
                  className="flex-1 h-9 sm:h-10 text-sm"
                >
                  Male
                </Button>
                <Button
                  type="button"
                  variant={profileEdit.sex === "female" ? "default" : "outline"}
                  onClick={() =>
                    setProfileEdit({ ...profileEdit, sex: "female" })
                  }
                  className="flex-1 h-9 sm:h-10 text-sm"
                >
                  Female
                </Button>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2 col-span-2">
              <Label className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                Activity Level
              </Label>
              <select
                value={profileEdit.activityLevel || "moderate"}
                onChange={(e) =>
                  setProfileEdit({
                    ...profileEdit,
                    activityLevel: e.target
                      .value as ProfileData["activityLevel"],
                  })
                }
                className="w-full h-9 sm:h-10 text-sm bg-zinc-100/50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-md px-3 text-zinc-900 dark:text-zinc-100"
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="very_active">Very Active</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="w-full h-9 sm:h-10 text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            {isSavingProfile ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* B. Energy Balance Calculator */}
      {metrics.bmr > 0 && (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/50">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
              📊 Your Energy Balance
              <Badge variant="outline" className="font-normal text-xs">
                Transparent Calculation
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-500">
              How we calculated your targets based on the Mifflin-St Jeor
              equation.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 px-4 sm:px-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Maintenance (TDEE)
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {metrics.tdee} kcal
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
                <span className="text-sm">Target Intake</span>
                <span className="font-mono font-bold">
                  {goals.dailyCalories} kcal
                </span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                BMR ({metrics.bmr}) × Activity (
                {goals.activityLevel || "moderate"}) = TDEE ({metrics.tdee})
              </div>
            </div>
            <div className="flex flex-col justify-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
              <span className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mb-1">
                Estimated Outcome
              </span>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {metrics.projectedLoss > 0.1
                  ? `-${Math.abs(metrics.projectedLoss).toFixed(1)} lbs / week`
                  : metrics.projectedLoss < -0.1
                  ? `+${Math.abs(metrics.projectedLoss).toFixed(1)} lbs / week`
                  : "Maintenance Mode"}
              </div>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-2">
                *Estimates based on your activity level. Adjust your goal if
                results differ after 2 weeks.
              </p>
            </div>
          </CardContent>
          <CardFooter className="px-4 sm:px-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowGoalsWizard(true)}
            >
              Recalibrate My Plan
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* C. Targets Section */}
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
          {getTargetWarnings().length > 0 && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              {getTargetWarnings().map((warning, idx) => (
                <p
                  key={idx}
                  className="text-sm text-amber-600 dark:text-amber-400"
                >
                  {warning}
                </p>
              ))}
            </div>
          )}
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

      {/* D. AI Provider Switcher */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
            AI Provider
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-500">
            Choose your AI provider and manage API keys
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-4">
            {/* Provider Selector */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <Label className="text-sm text-zinc-700 dark:text-zinc-300">
                Preferred Provider:
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={
                    preferredProvider === "openai" ? "default" : "outline"
                  }
                  onClick={() => handleUpdateProvider("openai")}
                  className="h-8 text-xs"
                >
                  OpenAI
                </Button>
                <Button
                  type="button"
                  variant={
                    preferredProvider === "google" ? "default" : "outline"
                  }
                  onClick={() => handleUpdateProvider("google")}
                  className="h-8 text-xs"
                >
                  Google
                </Button>
              </div>
            </div>

            <Tabs defaultValue="openai" value={preferredProvider}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="openai">OpenAI (GPT)</TabsTrigger>
                <TabsTrigger value="google">Google (Gemini)</TabsTrigger>
              </TabsList>

              <TabsContent value="openai" className="space-y-4 mt-4">
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
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowKeyInput(true)}
                        className="flex-1 h-9 text-sm"
                      >
                        Update Key
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleRemoveKey}
                        disabled={isRemovingKey}
                        className="h-9 text-sm border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400"
                      >
                        {isRemovingKey ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="openaiKey"
                        className="text-zinc-700 dark:text-zinc-300"
                      >
                        API Key
                      </Label>
                      <div className="relative">
                        <Input
                          id="openaiKey"
                          type={showPassword ? "text" : "password"}
                          placeholder="sk-..."
                          value={newApiKey}
                          onChange={(e) => {
                            setNewApiKey(e.target.value);
                            setKeyTestResult(null);
                          }}
                          className="bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 font-mono pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                        >
                          {showPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Get your key from{" "}
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
                        className="flex-1 h-9 text-sm"
                      >
                        {isTestingKey ? "Testing..." : "Test Key"}
                      </Button>
                      <Button
                        onClick={handleSaveKey}
                        disabled={isSavingKey || !newApiKey.trim()}
                        className="flex-1 h-9 text-sm bg-gradient-to-r from-amber-500 to-orange-600"
                      >
                        {isSavingKey ? "Saving..." : "Save Key"}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="google" className="space-y-4 mt-4">
                {/* Model Selector */}
                <div className="space-y-2">
                  <Label className="text-zinc-700 dark:text-zinc-300">
                    Gemini Model
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {availableModels.find(
                          (m) => m.id === preferredGeminiModel
                        )?.name || "Select Model"}
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
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80">
                      {availableModels.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          onClick={() => handleUpdateGeminiModel(model.id)}
                          className={
                            preferredGeminiModel === model.id
                              ? "bg-zinc-100 dark:bg-zinc-800"
                              : ""
                          }
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{model.name}</span>
                            <span className="text-xs text-zinc-500">
                              {model.description}
                            </span>
                            <span className="text-xs text-zinc-400">
                              ${model.inputPrice}/${model.outputPrice} per 1M
                              tokens
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <p className="text-xs text-zinc-500">
                    Current:{" "}
                    {
                      availableModels.find((m) => m.id === preferredGeminiModel)
                        ?.name
                    }
                  </p>
                </div>

                {googleKeyStatus.hasKey && !showGoogleKeyInput ? (
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
                            {googleKeyStatus.maskedKey}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowGoogleKeyInput(true)}
                        className="flex-1 h-9 text-sm"
                      >
                        Update Key
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleRemoveGoogleKey}
                        disabled={isRemovingGoogleKey}
                        className="h-9 text-sm border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400"
                      >
                        {isRemovingGoogleKey ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="googleKey"
                        className="text-zinc-700 dark:text-zinc-300"
                      >
                        Google API Key
                      </Label>
                      <div className="relative">
                        <Input
                          id="googleKey"
                          type={showGooglePassword ? "text" : "password"}
                          placeholder="AIza..."
                          value={newGoogleKey}
                          onChange={(e) => {
                            setNewGoogleKey(e.target.value);
                            setGoogleKeyTestResult(null);
                          }}
                          className="bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 font-mono pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowGooglePassword(!showGooglePassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                        >
                          {showGooglePassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Get your key from{" "}
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 dark:text-amber-400 hover:underline"
                        >
                          Google AI Studio
                        </a>
                      </p>
                    </div>
                    {googleKeyTestResult && (
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          googleKeyTestResult.valid
                            ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        }`}
                      >
                        {googleKeyTestResult.message}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleTestGoogleKey}
                        disabled={isTestingGoogleKey || !newGoogleKey.trim()}
                        className="flex-1 h-9 text-sm"
                      >
                        {isTestingGoogleKey ? "Testing..." : "Test Key"}
                      </Button>
                      <Button
                        onClick={handleSaveGoogleKey}
                        disabled={isSavingGoogleKey || !newGoogleKey.trim()}
                        className="flex-1 h-9 text-sm bg-gradient-to-r from-amber-500 to-orange-600"
                      >
                        {isSavingGoogleKey ? "Saving..." : "Save Key"}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
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
              className="h-9 sm:h-10 text-sm border-zinc-300 dark:border-zinc-700"
            >
              Sign Out
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="h-9 sm:h-10 text-sm border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirmDelete" className="text-sm">
                Type{" "}
                <span className="font-mono font-bold text-red-600">DELETE</span>{" "}
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
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE" || isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete My Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goals Wizard */}
      <GoalsWizard
        open={showGoalsWizard}
        onComplete={handleGoalsWizardComplete}
        onClose={() => setShowGoalsWizard(false)}
        initialData={{
          age: goals.age ?? undefined,
          sex: goals.sex ?? undefined,
          weight: goals.weight ?? undefined,
          height: goals.height ?? undefined,
          activityLevel: goals.activityLevel ?? undefined,
          goalType: goals.goalType ?? undefined,
          dailyCalories: goals.dailyCalories,
          dailyProtein: goals.dailyProtein,
          dailyCarbs: goals.dailyCarbs,
          dailyFat: goals.dailyFat,
        }}
      />
    </div>
  );
}
