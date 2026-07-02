// Mifflin-St Jeor based nutrition target calculator
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const PACE_ADJUSTMENT = {
  fat_loss: { slow: -300, moderate: -450, aggressive: -600 },
  muscle_gain: { slow: 150, moderate: 300, aggressive: 500 },
  maintenance: { slow: 0, moderate: 0, aggressive: 0 },
};

const PROTEIN_PER_KG = {
  fat_loss: 2.0,
  muscle_gain: 1.8,
  maintenance: 1.8,
};

// fat % of remaining calories after protein, by macro preference
const FAT_SHARE = {
  balanced: 0.3,
  higher_carb: 0.2,
  higher_fat: 0.4,
  high_protein: 0.25,
};

export function calculateTargets(profile) {
  const { sex, age, height_cm, current_weight_kg, activity_level, goal_type, target_pace, macro_preference } = profile;

  const bmr =
    sex === "male"
      ? 10 * current_weight_kg + 6.25 * height_cm - 5 * age + 5
      : 10 * current_weight_kg + 6.25 * height_cm - 5 * age - 161;

  const tdee = bmr * (ACTIVITY_MULTIPLIERS[activity_level] || 1.2);
  const adjustment = (PACE_ADJUSTMENT[goal_type] || {})[target_pace] ?? 0;
  const calories = Math.round(tdee + adjustment);

  const proteinPerKg = PROTEIN_PER_KG[goal_type] ?? 1.8;
  const protein_g = Math.round(current_weight_kg * proteinPerKg);

  const remainingCalories = Math.max(0, calories - protein_g * 4);
  const fatShare = FAT_SHARE[macro_preference] ?? 0.3;
  const fat_g = Math.round((remainingCalories * fatShare) / 9);
  const carbs_g = Math.max(0, Math.round((calories - protein_g * 4 - fat_g * 9) / 4));

  return { calories, protein_g, carbs_g, fat_g };
}