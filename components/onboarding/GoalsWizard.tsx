"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoalsAssistant } from "./GoalsAssistant";
import { cn } from "@/lib/utils";

type Sex = "male" | "female";
type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
type GoalType = "lose" | "maintain" | "gain";
type WeightUnit = "lbs" | "kg";
type HeightUnit = "imperial" | "metric";

// Conversion functions
const lbsToKg = (lbs: number) => lbs * 0.453592;
const kgToLbs = (kg: number) => kg / 0.453592;
const feetInchesToCm = (feet: number, inches: number) =>
  (feet * 12 + inches) * 2.54;
const cmToFeetInches = (cm: number): { feet: number; inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

interface ProfileData {
  age: number;
  sex: Sex;
  weight: number; // kg
  height: number; // cm
  activityLevel: ActivityLevel;
  goalType: GoalType;
}

interface MacroGoals {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
}

interface GoalsWizardProps {
  open: boolean;
  onComplete: (data: ProfileData & MacroGoals) => void;
  initialData?: Partial<ProfileData & MacroGoals>; // Optional initial values for recalibration
  onClose?: () => void; // Optional close handler
}

const steps = [
  {
    id: "welcome",
    title: "Welcome",
    description: "Let's set up your nutrition goals",
  },
  { id: "basics", title: "Basics", description: "Tell us about yourself" },
  { id: "body", title: "Body", description: "Your measurements" },
  { id: "activity", title: "Activity", description: "How active are you?" },
  { id: "goal", title: "Goal", description: "What's your objective?" },
  { id: "macros", title: "Macros", description: "Your personalized targets" },
  {
    id: "openai",
    title: "AI Setup",
    description: "Connect your OpenAI account (optional)",
  },
  { id: "confirm", title: "Confirm", description: "Review your plan" },
];

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const ACTIVITY_LABELS: Record<ActivityLevel, { label: string; desc: string }> =
  {
    sedentary: { label: "Sedentary", desc: "Little or no exercise, desk job" },
    light: { label: "Lightly Active", desc: "Light exercise 1-3 days/week" },
    moderate: {
      label: "Moderately Active",
      desc: "Moderate exercise 3-5 days/week",
    },
    active: { label: "Active", desc: "Hard exercise 6-7 days/week" },
    very_active: {
      label: "Very Active",
      desc: "Very hard exercise, physical job",
    },
  };

const GOAL_CONFIG: Record<
  GoalType,
  { label: string; desc: string; calorieAdjust: number; color: string }
> = {
  lose: {
    label: "Lose Weight",
    desc: "Caloric deficit for fat loss",
    calorieAdjust: -500,
    color: "rose",
  },
  maintain: {
    label: "Maintain",
    desc: "Keep your current weight",
    calorieAdjust: 0,
    color: "amber",
  },
  gain: {
    label: "Gain Muscle",
    desc: "Caloric surplus for muscle growth",
    calorieAdjust: 300,
    color: "emerald",
  },
};

function calculateBMR(
  weight: number,
  height: number,
  age: number,
  sex: Sex
): number {
  // Mifflin-St Jeor Equation
  if (sex === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

function calculateMacros(profile: ProfileData): MacroGoals {
  const bmr = calculateBMR(
    profile.weight,
    profile.height,
    profile.age,
    profile.sex
  );
  const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel];
  const dailyCalories = Math.round(
    tdee + GOAL_CONFIG[profile.goalType].calorieAdjust
  );

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
}

export function GoalsWizard({
  open,
  onComplete,
  initialData,
  onClose,
}: GoalsWizardProps) {
  // Determine if this is a recalibration (has initial data) or first-time setup
  const isRecalibration = !!initialData;

  // Start at step 1 (basics) if recalibration, step 0 (welcome) if first-time
  const [currentStep, setCurrentStep] = useState(isRecalibration ? 1 : 0);

  // Unit preferences (default to imperial)
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("lbs");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("imperial");

  // Display values in user's preferred unit
  const [displayWeight, setDisplayWeight] = useState(154); // ~70kg in lbs
  const [displayFeet, setDisplayFeet] = useState(5);
  const [displayInches, setDisplayInches] = useState(9); // ~175cm

  // Profile stores metric internally for calculations
  const [profile, setProfile] = useState<ProfileData>({
    age: initialData?.age ?? 25,
    sex: initialData?.sex ?? "male",
    weight: initialData?.weight ?? lbsToKg(154), // Convert default lbs to kg
    height: initialData?.height ?? feetInchesToCm(5, 9), // Convert default feet/inches to cm
    activityLevel: initialData?.activityLevel ?? "moderate",
    goalType: initialData?.goalType ?? "maintain",
  });
  const [macros, setMacros] = useState<MacroGoals>({
    dailyCalories: initialData?.dailyCalories ?? 2000,
    dailyProtein: initialData?.dailyProtein ?? 120,
    dailyCarbs: initialData?.dailyCarbs ?? 250,
    dailyFat: initialData?.dailyFat ?? 65,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize display values from initialData when dialog opens
  useEffect(() => {
    if (open && initialData) {
      // Initialize weight display
      if (initialData.weight) {
        setDisplayWeight(Math.round(kgToLbs(initialData.weight)));
      }

      // Initialize height display
      if (initialData.height) {
        const { feet, inches } = cmToFeetInches(initialData.height);
        setDisplayFeet(feet);
        setDisplayInches(inches);
      }

      // Reset to step 1 (basics) when opening for recalibration
      setCurrentStep(1);
    } else if (open && !initialData) {
      // Reset to step 0 (welcome) for first-time setup
      setCurrentStep(0);
    }
  }, [open, initialData]);

  // Update profile when display values change
  const updateWeight = (value: number, unit: WeightUnit) => {
    setDisplayWeight(value);
    const weightKg = unit === "lbs" ? lbsToKg(value) : value;
    setProfile((prev) => ({ ...prev, weight: weightKg }));
  };

  const updateHeight = (feet: number, inches: number) => {
    setDisplayFeet(feet);
    setDisplayInches(inches);
    const heightCm = feetInchesToCm(feet, inches);
    setProfile((prev) => ({ ...prev, height: heightCm }));
  };

  const updateHeightCm = (cm: number) => {
    const { feet, inches } = cmToFeetInches(cm);
    setDisplayFeet(feet);
    setDisplayInches(inches);
    setProfile((prev) => ({ ...prev, height: cm }));
  };

  // Handle unit toggle
  const toggleWeightUnit = () => {
    if (weightUnit === "lbs") {
      setWeightUnit("kg");
      setDisplayWeight(Math.round(profile.weight * 10) / 10);
    } else {
      setWeightUnit("lbs");
      setDisplayWeight(Math.round(kgToLbs(profile.weight)));
    }
  };

  const toggleHeightUnit = () => {
    if (heightUnit === "imperial") {
      setHeightUnit("metric");
    } else {
      setHeightUnit("imperial");
      const { feet, inches } = cmToFeetInches(profile.height);
      setDisplayFeet(feet);
      setDisplayInches(inches);
    }
  };

  // API Key state for wizard
  const [wizardApiKey, setWizardApiKey] = useState("");
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);
  const [apiKeySkipped, setApiKeySkipped] = useState(false);

  // Recalculate macros when profile changes and we're on the macros step
  useEffect(() => {
    if (steps[currentStep]?.id === "macros") {
      const calculated = calculateMacros(profile);
      setMacros(calculated);
    }
  }, [currentStep, profile]);

  const handleTestApiKey = async () => {
    if (!wizardApiKey.trim()) return;
    setIsTestingKey(true);
    setKeyTestResult(null);

    try {
      const response = await fetch("/api/openai-key/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: wizardApiKey }),
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
      } else {
        setKeyTestResult({
          valid: false,
          message: data.error || "Invalid API key",
        });
      }
    } catch {
      setKeyTestResult({
        valid: false,
        message: "Failed to test API key",
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!wizardApiKey.trim()) return;
    setIsSavingKey(true);

    try {
      const response = await fetch("/api/openai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: wizardApiKey }),
      });

      if (response.ok) {
        handleNext();
      } else {
        const data = await response.json();
        setKeyTestResult({
          valid: false,
          message: data.error || "Failed to save API key",
        });
      }
    } catch {
      setKeyTestResult({
        valid: false,
        message: "Failed to save API key",
      });
    } finally {
      setIsSavingKey(false);
    }
  };

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      let nextStep = currentStep + 1;

      // Skip the "openai" step if this is a recalibration (user already has API keys in settings)
      if (isRecalibration && steps[nextStep]?.id === "openai") {
        nextStep = nextStep + 1;
      }

      // Make sure we don't go beyond the last step
      if (nextStep < steps.length) {
        setCurrentStep(nextStep);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      let prevStep = currentStep - 1;

      // Skip the "openai" step when going back during recalibration
      if (isRecalibration && steps[prevStep]?.id === "openai") {
        prevStep = prevStep - 1;
      }

      // Don't go back before the first step (or step 1 for recalibration)
      if (prevStep >= (isRecalibration ? 1 : 0)) {
        setCurrentStep(prevStep);
      }
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete({ ...profile, ...macros });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = (): boolean => {
    switch (step.id) {
      case "basics":
        return profile.age >= 13 && profile.age <= 100;
      case "body":
        return (
          profile.weight >= 30 &&
          profile.weight <= 300 &&
          profile.height >= 100 &&
          profile.height <= 250
        );
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (step.id) {
      case "welcome":
        return (
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 sm:w-10 sm:h-10 text-white"
              >
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                <path d="M8.5 8.5v.01" />
                <path d="M16 15.5v.01" />
                <path d="M12 12v.01" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Welcome to Track4U!
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
              We&apos;ll ask a few questions to calculate your personalized
              nutrition targets. This takes about 2 minutes.
            </p>
            <p className="text-xs sm:text-sm text-zinc-500">
              Need help? Ask the AI assistant!
            </p>
          </div>
        );

      case "basics":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                >
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                About You
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Basic info to calculate your needs
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-700 dark:text-zinc-300 text-sm">
                  Age
                </Label>
                <Input
                  type="number"
                  min={13}
                  max={100}
                  value={profile.age}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      age: parseInt(e.target.value) || 0,
                    })
                  }
                  className="text-center text-xl font-bold h-12 bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-700 dark:text-zinc-300 text-sm">
                  Biological Sex
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["male", "female"] as Sex[]).map((sex) => (
                    <Button
                      key={sex}
                      type="button"
                      variant="outline"
                      onClick={() => setProfile({ ...profile, sex })}
                      className={cn(
                        "h-12 border-zinc-300 dark:border-zinc-700 capitalize",
                        profile.sex === sex &&
                          "bg-violet-500/20 border-violet-500 text-violet-600 dark:text-violet-400"
                      )}
                    >
                      {sex}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 text-center">
                  Used for metabolic calculations
                </p>
              </div>
            </div>
          </div>
        );

      case "body":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                >
                  <path d="M12 22v-5" />
                  <path d="M9 8V2" />
                  <path d="M15 8V2" />
                  <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Measurements
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Your current weight and height
              </p>
            </div>

            <div className="space-y-4">
              {/* Weight Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-700 dark:text-zinc-300 text-sm">
                    Weight
                  </Label>
                  <button
                    type="button"
                    onClick={toggleWeightUnit}
                    className="text-xs px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {weightUnit === "lbs" ? "Switch to kg" : "Switch to lbs"}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min={weightUnit === "lbs" ? 66 : 30}
                    max={weightUnit === "lbs" ? 660 : 300}
                    step={weightUnit === "lbs" ? 1 : 0.5}
                    value={displayWeight}
                    onChange={(e) =>
                      updateWeight(parseFloat(e.target.value) || 0, weightUnit)
                    }
                    className="text-center text-xl font-bold h-12 bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium">
                    {weightUnit}
                  </span>
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                  {(weightUnit === "lbs"
                    ? [130, 150, 170, 200]
                    : [60, 70, 80, 90]
                  ).map((val) => (
                    <Button
                      key={val}
                      variant="outline"
                      size="sm"
                      onClick={() => updateWeight(val, weightUnit)}
                      className={cn(
                        "border-zinc-300 dark:border-zinc-700 text-xs",
                        displayWeight === val &&
                          "bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                      )}
                    >
                      {val} {weightUnit}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Height Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-700 dark:text-zinc-300 text-sm">
                    Height
                  </Label>
                  <button
                    type="button"
                    onClick={toggleHeightUnit}
                    className="text-xs px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {heightUnit === "imperial"
                      ? "Switch to cm"
                      : "Switch to ft/in"}
                  </button>
                </div>

                {heightUnit === "imperial" ? (
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        type="number"
                        min={4}
                        max={7}
                        value={displayFeet}
                        onChange={(e) =>
                          updateHeight(
                            parseInt(e.target.value) || 0,
                            displayInches
                          )
                        }
                        className="text-center text-xl font-bold h-12 bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium">
                        ft
                      </span>
                    </div>
                    <div className="flex-1 relative">
                      <Input
                        type="number"
                        min={0}
                        max={11}
                        value={displayInches}
                        onChange={(e) =>
                          updateHeight(
                            displayFeet,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="text-center text-xl font-bold h-12 bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium">
                        in
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      type="number"
                      min={100}
                      max={250}
                      value={Math.round(profile.height)}
                      onChange={(e) =>
                        updateHeightCm(parseInt(e.target.value) || 0)
                      }
                      className="text-center text-xl font-bold h-12 bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium">
                      cm
                    </span>
                  </div>
                )}

                <div className="flex justify-center gap-2 flex-wrap">
                  {heightUnit === "imperial" ? (
                    <>
                      {[
                        { ft: 5, in: 4 },
                        { ft: 5, in: 8 },
                        { ft: 6, in: 0 },
                        { ft: 6, in: 2 },
                      ].map((h) => (
                        <Button
                          key={`${h.ft}-${h.in}`}
                          variant="outline"
                          size="sm"
                          onClick={() => updateHeight(h.ft, h.in)}
                          className={cn(
                            "border-zinc-300 dark:border-zinc-700 text-xs",
                            displayFeet === h.ft &&
                              displayInches === h.in &&
                              "bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                          )}
                        >
                          {h.ft}&apos;{h.in}&quot;
                        </Button>
                      ))}
                    </>
                  ) : (
                    <>
                      {[160, 170, 180, 190].map((val) => (
                        <Button
                          key={val}
                          variant="outline"
                          size="sm"
                          onClick={() => updateHeightCm(val)}
                          className={cn(
                            "border-zinc-300 dark:border-zinc-700 text-xs",
                            Math.round(profile.height) === val &&
                              "bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                          )}
                        >
                          {val}cm
                        </Button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "activity":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                >
                  <path d="M18.5 4a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1 0-5Z" />
                  <path d="M12 13v8" />
                  <path d="m9 19 3 3 3-3" />
                  <path d="M12 9V1l3 3-3 3Z" />
                  <circle cx="6" cy="11" r="4" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Activity Level
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                How active are you on a typical week?
              </p>
            </div>

            <div className="space-y-2">
              {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map(
                (level) => (
                  <button
                    key={level}
                    onClick={() =>
                      setProfile({ ...profile, activityLevel: level })
                    }
                    className={cn(
                      "w-full p-3 rounded-xl border text-left transition-all",
                      profile.activityLevel === level
                        ? "bg-green-500/10 border-green-500 dark:border-green-400"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                    )}
                  >
                    <p
                      className={cn(
                        "font-medium text-sm",
                        profile.activityLevel === level
                          ? "text-green-600 dark:text-green-400"
                          : "text-zinc-900 dark:text-zinc-100"
                      )}
                    >
                      {ACTIVITY_LABELS[level].label}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {ACTIVITY_LABELS[level].desc}
                    </p>
                  </button>
                )
              )}
            </div>
          </div>
        );

      case "goal":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Your Goal
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                What do you want to achieve?
              </p>
            </div>

            <div className="space-y-2">
              {(Object.keys(GOAL_CONFIG) as GoalType[]).map((goalType) => {
                const config = GOAL_CONFIG[goalType];
                return (
                  <button
                    key={goalType}
                    onClick={() => setProfile({ ...profile, goalType })}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all",
                      profile.goalType === goalType
                        ? `bg-${config.color}-500/10 border-${config.color}-500 dark:border-${config.color}-400`
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600",
                      profile.goalType === goalType &&
                        goalType === "lose" &&
                        "bg-rose-500/10 border-rose-500",
                      profile.goalType === goalType &&
                        goalType === "maintain" &&
                        "bg-amber-500/10 border-amber-500",
                      profile.goalType === goalType &&
                        goalType === "gain" &&
                        "bg-emerald-500/10 border-emerald-500"
                    )}
                  >
                    <p
                      className={cn(
                        "font-medium",
                        profile.goalType === goalType &&
                          goalType === "lose" &&
                          "text-rose-600 dark:text-rose-400",
                        profile.goalType === goalType &&
                          goalType === "maintain" &&
                          "text-amber-600 dark:text-amber-400",
                        profile.goalType === goalType &&
                          goalType === "gain" &&
                          "text-emerald-600 dark:text-emerald-400",
                        profile.goalType !== goalType &&
                          "text-zinc-900 dark:text-zinc-100"
                      )}
                    >
                      {config.label}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {config.desc}
                    </p>
                    <p className="text-xs mt-1 font-medium text-zinc-400">
                      {config.calorieAdjust > 0 ? "+" : ""}
                      {config.calorieAdjust} cal/day
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "macros":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                >
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Your Targets
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Calculated based on your profile. Adjust if needed.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Calories
                  </span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {macros.dailyCalories}
                  </span>
                </div>
                <Input
                  type="range"
                  min={1200}
                  max={4000}
                  step={50}
                  value={macros.dailyCalories}
                  onChange={(e) =>
                    setMacros({
                      ...macros,
                      dailyCalories: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 accent-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Protein
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {macros.dailyProtein}g
                  </span>
                </div>
                <Input
                  type="range"
                  min={50}
                  max={300}
                  step={5}
                  value={macros.dailyProtein}
                  onChange={(e) =>
                    setMacros({
                      ...macros,
                      dailyProtein: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 accent-green-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Carbs
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {macros.dailyCarbs}g
                  </span>
                </div>
                <Input
                  type="range"
                  min={50}
                  max={500}
                  step={5}
                  value={macros.dailyCarbs}
                  onChange={(e) =>
                    setMacros({
                      ...macros,
                      dailyCarbs: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 accent-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Fat
                  </span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {macros.dailyFat}g
                  </span>
                </div>
                <Input
                  type="range"
                  min={20}
                  max={200}
                  step={5}
                  value={macros.dailyFat}
                  onChange={(e) =>
                    setMacros({ ...macros, dailyFat: parseInt(e.target.value) })
                  }
                  className="w-full h-2 accent-purple-500"
                />
              </div>
            </div>
          </div>
        );

      case "openai":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                >
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Connect OpenAI
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Use your own API key for AI features (optional)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
              <p>
                <strong className="text-zinc-900 dark:text-zinc-100">
                  Why add your own key?
                </strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>You&apos;re billed directly by OpenAI — no markup</li>
                <li>Full control over your usage and spending</li>
                <li>Your key is encrypted and never logged</li>
              </ul>
            </div>

            {!apiKeySkipped ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-zinc-700 dark:text-zinc-300 text-sm">
                    OpenAI API Key
                  </Label>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={wizardApiKey}
                    onChange={(e) => {
                      setWizardApiKey(e.target.value);
                      setKeyTestResult(null);
                    }}
                    className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 font-mono text-sm"
                  />
                  <p className="text-xs text-zinc-500">
                    Get your key at{" "}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      platform.openai.com/api-keys
                    </a>
                  </p>
                </div>

                {keyTestResult && (
                  <div
                    className={`p-3 rounded-lg text-xs ${
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
                    onClick={handleTestApiKey}
                    disabled={isTestingKey || !wizardApiKey.trim()}
                    className="flex-1 border-zinc-300 dark:border-zinc-700 text-sm"
                  >
                    {isTestingKey ? "Testing..." : "Test Key"}
                  </Button>
                  <Button
                    onClick={handleSaveApiKey}
                    disabled={isSavingKey || !wizardApiKey.trim()}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm"
                  >
                    {isSavingKey ? "Saving..." : "Save & Continue"}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setApiKeySkipped(true);
                    handleNext();
                  }}
                  className="w-full text-zinc-500 text-sm"
                >
                  Skip for now
                </Button>
              </div>
            ) : (
              <div className="text-center text-sm text-zinc-500">
                <p>You can add your API key later in Settings.</p>
              </div>
            )}
          </div>
        );

      case "confirm":
        return (
          <div className="space-y-4 sm:space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Your Plan
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Review and start tracking
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Age</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {profile.age} years
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Sex</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                  {profile.sex}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Weight</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {weightUnit === "lbs"
                    ? `${Math.round(kgToLbs(profile.weight))} lbs`
                    : `${Math.round(profile.weight * 10) / 10} kg`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Height</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {heightUnit === "imperial"
                    ? `${displayFeet}'${displayInches}"`
                    : `${Math.round(profile.height)} cm`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Activity</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {ACTIVITY_LABELS[profile.activityLevel].label}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Goal</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {GOAL_CONFIG[profile.goalType].label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Calories
                </p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {macros.dailyCalories}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Protein
                </p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {macros.dailyProtein}g
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Carbs
                </p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {macros.dailyCarbs}g
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Fat</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {macros.dailyFat}g
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && onClose) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="w-[98vw] max-w-[98vw] lg:max-w-[1100px] h-[95vh] max-h-[95vh] lg:h-auto lg:max-h-[90vh] p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden"
        showCloseButton={true}
      >
        <DialogTitle className="sr-only">
          Set Up Your Nutrition Goals
        </DialogTitle>
        <div className="flex flex-col lg:flex-row h-full lg:min-h-[650px] overflow-hidden">
          {/* Main content */}
          <div className="flex-1 w-full p-4 sm:p-6 lg:p-10 flex flex-col min-h-0 overflow-y-auto">
            {/* Progress indicators */}
            <div className="flex justify-center gap-1 sm:gap-1.5 mb-4 sm:mb-8 flex-shrink-0">
              {steps.map((s, i) => (
                <div
                  key={s.id}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === currentStep
                      ? "w-5 sm:w-8 bg-gradient-to-r from-amber-500 to-orange-600"
                      : i < currentStep
                      ? "w-2.5 sm:w-4 bg-amber-500/50"
                      : "w-2.5 sm:w-4 bg-zinc-200 dark:bg-zinc-700"
                  )}
                />
              ))}
            </div>

            {/* Step content */}
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div className="w-full max-w-md">{renderStepContent()}</div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-4 sm:mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800 lg:border-t-0 lg:pt-0 flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === (isRecalibration ? 1 : 0)}
                className="border-zinc-300 dark:border-zinc-700 text-sm sm:text-base"
              >
                Back
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm sm:text-base"
                >
                  {isSubmitting
                    ? "Saving..."
                    : isRecalibration
                    ? "Update Plan"
                    : "Start Tracking"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm sm:text-base"
                >
                  Continue
                </Button>
              )}
            </div>
          </div>

          {/* AI Assistant sidebar */}
          <div className="w-full lg:w-[38%] lg:max-w-[420px] h-[35vh] lg:h-auto flex-shrink-0 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 overflow-hidden">
            <GoalsAssistant
              currentStep={step.id}
              currentGoal={
                step.id !== "welcome" && step.id !== "confirm"
                  ? step.id
                  : undefined
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
