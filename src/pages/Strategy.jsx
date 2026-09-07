import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GOAL_LABELS = { fat_loss: "Fat Loss", muscle_gain: "Muscle Gain", maintenance: "Maintenance" };
const PACE_LABELS = { slow: "Slow", moderate: "Moderate", aggressive: "Aggressive" };
const RATE_PER_PACE = {
  fat_loss: { slow: -0.25, moderate: -0.5, aggressive: -0.75 },
  muscle_gain: { slow: 0.1, moderate: 0.25, aggressive: 0.4 },
  maintenance: { slow: 0, moderate: 0, aggressive: 0 },
};

export default function Strategy() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [target, setTarget] = useState(null);
  const [expenditure, setExpenditure] = useState(null);
  const [adherence, setAdherence] = useState(0);
  const [nextCheckin, setNextCheckin] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [profiles, targets, logs, checkins, estimates] = await Promise.all([
        base44.entities.Profile.filter({}, "-created_date", 1),
        base44.entities.DailyTarget.filter({ active: true }, "-created_date", 1),
        base44.entities.FoodLog.filter({}, "-created_date", 100),
        base44.entities.WeeklyCheckin.filter({}, "-created_date", 1),
        base44.entities.ExpenditureEstimate.filter({}, "-created_date", 1),
      ]);
      setProfile(profiles[0] || null);
      setTarget(targets[0] || null);
      setExpenditure(estimates[0] || null);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekDays = new Set(
        logs.filter((l) => new Date(l.created_date) >= weekAgo).map((l) => l.created_date.split("T")[0])
      ).size;
      setAdherence(Math.round((weekDays / 7) * 100));

      const lastCheckin = checkins[0];
      const base = lastCheckin ? new Date(lastCheckin.created_date) : new Date();
      const next = new Date(base);
      next.setDate(next.getDate() + 7);
      setNextCheckin(next.toISOString().split("T")[0]);

      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const targetRate = profile ? RATE_PER_PACE[profile.goal_type]?.[profile.target_pace] ?? 0 : 0;

  return (
    <div className="px-5 pt-8 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-6 h-6 text-foreground" /></button>
        <h1 className="text-lg font-heading font-bold text-foreground">Nutrition Strategy</h1>
      </div>

      <div className="glass-card rounded-[20px] p-5 mb-4">
        <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-1">Current Goal</p>
        <p className="text-xl font-bold text-foreground font-heading mb-4">{profile ? GOAL_LABELS[profile.goal_type] : "-"}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Target Calories</p>
            <p className="text-lg font-bold text-foreground font-heading">{target?.calories ?? "-"} kcal</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target Pace</p>
            <p className="text-lg font-bold text-foreground font-heading">{profile ? PACE_LABELS[profile.target_pace] : "-"}</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[20px] p-5 mb-4">
        <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-3">Macro Targets</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-protein font-heading">{target?.protein_g ?? "-"}g</p>
            <p className="text-[11px] text-muted-foreground">Protein</p>
          </div>
          <div>
            <p className="text-lg font-bold text-carbs font-heading">{target?.carbs_g ?? "-"}g</p>
            <p className="text-[11px] text-muted-foreground">Carbs</p>
          </div>
          <div>
            <p className="text-lg font-bold text-fat font-heading">{target?.fat_g ?? "-"}g</p>
            <p className="text-[11px] text-muted-foreground">Fat</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass-card rounded-[20px] p-4">
          <p className="text-xs text-muted-foreground mb-1">Estimated Expenditure</p>
          <p className="text-lg font-bold text-foreground font-heading">
            {expenditure ? `${expenditure.estimated_expenditure} kcal` : "Insufficient data"}
          </p>
        </div>
        <div className="glass-card rounded-[20px] p-4">
          <p className="text-xs text-muted-foreground mb-1">Target Rate of Change</p>
          <p className="text-lg font-bold text-foreground font-heading">{targetRate >= 0 ? "+" : ""}{targetRate} kg/week</p>
        </div>
      </div>

      <div className="glass-card rounded-[20px] p-4 mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Weekly Adherence</span>
        <span className="text-lg font-bold text-primary font-heading">{adherence}%</span>
      </div>

      <div className="glass-card rounded-[20px] p-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Next Check-in</span>
        <span className="text-sm font-semibold text-foreground">{nextCheckin}</span>
      </div>
    </div>
  );
}