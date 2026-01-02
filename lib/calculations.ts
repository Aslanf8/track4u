// TDEE and BMR calculation utilities

export interface ProfileData {
  age?: number | null;
  sex?: "male" | "female" | null;
  weight?: number | null; // in kg
  height?: number | null; // in cm
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active" | null;
}

export interface MetabolicMetrics {
  bmr: number;
  tdee: number;
  deficit: number;
  projectedLoss: number; // lbs per week
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Calculate BMR using Mifflin-St Jeor equation
export function calculateBMR(profile: ProfileData): number {
  if (!profile.age || !profile.sex || !profile.weight || !profile.height) {
    return 0;
  }

  // Mifflin-St Jeor: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + sex
  const base = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  const sexAdjustment = profile.sex === "male" ? 5 : -161;

  return base + sexAdjustment;
}

// Calculate TDEE (Total Daily Energy Expenditure)
export function calculateTDEE(profile: ProfileData): number {
  const bmr = calculateBMR(profile);
  if (bmr === 0) return 0;

  const multiplier = profile.activityLevel
    ? ACTIVITY_MULTIPLIERS[profile.activityLevel] || 1.2
    : 1.2;

  return bmr * multiplier;
}

// Calculate metabolic metrics
export function calculateMetabolicMetrics(
  profile: ProfileData,
  targetCalories: number
): MetabolicMetrics {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(profile);
  const deficit = tdee - targetCalories;
  
  // 3500 calories ≈ 1 lb fat
  // Weekly deficit = deficit × 7
  // Projected loss = weekly deficit / 3500
  const projectedLoss = (deficit * 7) / 3500;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    deficit: Math.round(deficit),
    projectedLoss: Math.round(projectedLoss * 10) / 10, // Round to 1 decimal
  };
}

// Unit conversion helpers
export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

export function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

