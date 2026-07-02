// Simplified MacroFactor-style dynamic expenditure estimator.
// Uses 7700 kcal ≈ 1kg bodyweight change as conversion factor.
const KCAL_PER_KG = 7700;

export function calculateExpenditure(foodLogs, weightLogs, previousEstimate) {
  const uniqueFoodDays = new Set(foodLogs.map((l) => (l.created_date || "").split("T")[0]));

  if (uniqueFoodDays.size < 7 || weightLogs.length < 7) {
    return { insufficientData: true };
  }

  const sortedWeights = [...weightLogs].sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
  const windowDays = 14;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowDays);
  const windowWeights = sortedWeights.filter((w) => new Date(w.log_date) >= cutoff);
  const usableWeights = windowWeights.length >= 2 ? windowWeights : sortedWeights;

  const first = usableWeights[0];
  const last = usableWeights[usableWeights.length - 1];
  const daySpan = Math.max(1, (new Date(last.log_date) - new Date(first.log_date)) / (1000 * 60 * 60 * 24));
  const weightChangeKg = last.weight_kg - first.weight_kg;
  const weeklyChangeKg = (weightChangeKg / daySpan) * 7;

  const windowFoodLogs = foodLogs.filter((l) => new Date(l.created_date) >= cutoff);
  const days = new Set(windowFoodLogs.map((l) => l.created_date.split("T")[0])).size || uniqueFoodDays.size;
  const avgCalories = windowFoodLogs.reduce((s, l) => s + (l.calories || 0), 0) / days;

  const rawEstimate = avgCalories - (weeklyChangeKg * KCAL_PER_KG) / 7;

  // Smooth against previous estimate to avoid aggressive jumps
  const smoothed = previousEstimate
    ? Math.round(previousEstimate * 0.6 + rawEstimate * 0.4)
    : Math.round(rawEstimate);

  const confidence = uniqueFoodDays.size >= 14 && sortedWeights.length >= 14 ? "high" : "medium";

  return {
    insufficientData: false,
    estimated_expenditure: smoothed,
    confidence,
    method: "intake_vs_weight_trend",
  };
}