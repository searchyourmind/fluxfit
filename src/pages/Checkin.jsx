import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Checkin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState(null);
  const [profile, setProfile] = useState(null);
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const load = async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const [profiles, targets, logs, weights, trainings] = await Promise.all([
        base44.entities.Profile.filter({}, "-created_date", 1),
        base44.entities.DailyTarget.filter({ active: true }, "-created_date", 1),
        base44.entities.FoodLog.filter({}, "-created_date", 200),
        base44.entities.WeightLog.filter({}, "-log_date", 30),
        base44.entities.TrainingLog.filter({}, "-log_date", 30),
      ]);
      const prof = profiles[0];
      const curTarget = targets[0];
      setProfile(prof);
      setTarget(curTarget);

      const weekLogs = logs.filter((l) => new Date(l.created_date) >= weekAgo);
      const days = new Set(weekLogs.map((l) => l.created_date.split("T")[0])).size || 1;
      const avgCalories = weekLogs.reduce((s, l) => s + (l.calories || 0), 0) / days;
      const avgProtein = weekLogs.reduce((s, l) => s + (l.protein_g || 0), 0) / days;

      const weekWeights = weights.filter((w) => new Date(w.log_date) >= weekAgo).sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
      const weightChange = weekWeights.length >= 2 ? weekWeights[weekWeights.length - 1].weight_kg - weekWeights[0].weight_kg : 0;

      const twoWeekWeights = weights.filter((w) => new Date(w.log_date) >= twoWeeksAgo);
      const twoWeekChange = twoWeekWeights.length >= 2
        ? twoWeekWeights[0].weight_kg - twoWeekWeights[twoWeekWeights.length - 1].weight_kg
        : null;

      const trainingSessions = trainings.filter((t) => new Date(t.log_date) >= weekAgo && t.training_type !== "rest").length;

      let adjustment = 0;
      const notes = [];
      const goalType = prof?.goal_type;

      if (goalType === "fat_loss") {
        if (twoWeekChange !== null && twoWeekChange > -0.2) {
          adjustment -= 150;
          notes.push("Weight loss has been slow over the past two weeks — daily target reduced by 150 kcal.");
        } else if (weightChange < -1) {
          adjustment += 125;
          notes.push("Weight dropped too fast this week — daily target increased by 125 kcal to preserve muscle.");
        } else {
          notes.push("Weight loss pace is on track — maintaining current target.");
        }
      } else if (goalType === "muscle_gain") {
        if (weightChange < 0.1) {
          adjustment += 150;
          notes.push("Weight gain is insufficient — daily target increased by 150 kcal.");
        } else {
          notes.push("Weight gain progress is on track — maintaining current target.");
        }
      } else {
        notes.push("Maintenance phase — target unchanged.");
      }

      const proteinTargetPerKg = 1.6;
      if (prof && avgProtein < prof.current_weight_kg * proteinTargetPerKg) {
        notes.push("Protein intake is low this week — consider adding more lean meat, protein powder, or legumes.");
      }

      if (trainingSessions < (prof?.training_frequency || 3)) {
        notes.push("Training sessions are below target this week — consider adding more carbs on training days to boost performance.");
      }

      setResult({
        avgCalories: Math.round(avgCalories),
        avgProtein: Math.round(avgProtein),
        weightChange: weightChange.toFixed(1),
        trainingSessions,
        adjustment,
        notes,
      });
      setLoading(false);
    };
    load();
  }, []);

  const handleApply = async () => {
    if (!target || !result) return;
    setApplying(true);
    await base44.entities.DailyTarget.update(target.id, { active: false });
    await base44.entities.DailyTarget.create({
      calories: target.calories + result.adjustment,
      protein_g: target.protein_g,
      carbs_g: target.carbs_g,
      fat_g: target.fat_g,
      active: true,
      reason: `Weekly check-in adjustment ${result.adjustment >= 0 ? "+" : ""}${result.adjustment} kcal`,
    });
    await base44.entities.WeeklyCheckin.create({
      week_start: new Date().toISOString().split("T")[0],
      avg_calories: result.avgCalories,
      avg_protein: result.avgProtein,
      weight_change_kg: Number(result.weightChange),
      training_sessions: result.trainingSessions,
      adjustment_kcal: result.adjustment,
      recommendation: result.notes.join(" "),
    });
    setApplying(false);
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-6 h-6 text-foreground" /></button>
        <h1 className="text-lg font-heading font-bold text-foreground">Weekly Check-in</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass-card rounded-[20px] p-4">
          <p className="text-xs text-muted-foreground mb-1">Avg Daily Calories</p>
          <p className="text-xl font-bold text-foreground font-heading">{result.avgCalories} kcal</p>
        </div>
        <div className="glass-card rounded-[20px] p-4">
          <p className="text-xs text-muted-foreground mb-1">Avg Protein</p>
          <p className="text-xl font-bold text-foreground font-heading">{result.avgProtein} g</p>
        </div>
        <div className="glass-card rounded-[20px] p-4">
          <p className="text-xs text-muted-foreground mb-1">Weight Change</p>
          <p className="text-xl font-bold text-foreground font-heading">{result.weightChange} kg</p>
        </div>
        <div className="glass-card rounded-[20px] p-4">
          <p className="text-xs text-muted-foreground mb-1">Training Sessions</p>
          <p className="text-xl font-bold text-foreground font-heading">{result.trainingSessions}</p>
        </div>
      </div>

      <div className="glass-card rounded-[20px] p-4 mb-4 space-y-2" style={{ background: "rgba(58,134,255,0.08)" }}>
        {result.notes.map((n, i) => (
          <p key={i} className="text-sm text-primary leading-relaxed">• {n}</p>
        ))}
      </div>

      <div className="glass-card rounded-[20px] p-4 mb-6 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Recommended Adjustment</span>
        <span className={`text-lg font-bold font-heading ${result.adjustment > 0 ? "text-primary" : result.adjustment < 0 ? "text-destructive" : "text-foreground"}`}>
          {result.adjustment >= 0 ? "+" : ""}{result.adjustment} kcal
        </span>
      </div>

      <Button onClick={handleApply} disabled={applying} className="w-full py-6 rounded-2xl">
        {applying ? "Applying..." : "Confirm & Apply New Target"}
      </Button>
    </div>
  );
}