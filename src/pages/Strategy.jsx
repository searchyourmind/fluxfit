import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GOAL_LABELS = { fat_loss: "减脂", muscle_gain: "增肌", maintenance: "维持" };
const PACE_LABELS = { slow: "缓慢", moderate: "适中", aggressive: "激进" };
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const targetRate = profile ? RATE_PER_PACE[profile.goal_type]?.[profile.target_pace] ?? 0 : 0;

  return (
    <div className="px-5 pt-8 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-6 h-6 text-foreground" /></button>
        <h1 className="text-lg font-heading font-bold text-foreground">营养策略</h1>
      </div>

      <div className="bg-card rounded-3xl p-5 border border-border mb-4">
        <p className="text-xs text-muted-foreground mb-1">当前目标</p>
        <p className="text-xl font-bold text-foreground mb-4">{profile ? GOAL_LABELS[profile.goal_type] : "-"}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">目标热量</p>
            <p className="text-lg font-bold text-foreground">{target?.calories ?? "-"} kcal</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">目标节奏</p>
            <p className="text-lg font-bold text-foreground">{profile ? PACE_LABELS[profile.target_pace] : "-"}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl p-5 border border-border mb-4">
        <p className="text-xs text-muted-foreground mb-3">宏量营养素目标</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-protein">{target?.protein_g ?? "-"}g</p>
            <p className="text-[11px] text-muted-foreground">蛋白质</p>
          </div>
          <div>
            <p className="text-lg font-bold text-carbs">{target?.carbs_g ?? "-"}g</p>
            <p className="text-[11px] text-muted-foreground">碳水</p>
          </div>
          <div>
            <p className="text-lg font-bold text-fat">{target?.fat_g ?? "-"}g</p>
            <p className="text-[11px] text-muted-foreground">脂肪</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card rounded-2xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">预估消耗</p>
          <p className="text-lg font-bold text-foreground">
            {expenditure ? `${expenditure.estimated_expenditure} kcal` : "数据不足"}
          </p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">目标变化速度</p>
          <p className="text-lg font-bold text-foreground">{targetRate >= 0 ? "+" : ""}{targetRate} kg/周</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">本周记录依从度</span>
        <span className="text-lg font-bold text-primary">{adherence}%</span>
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between">
        <span className="text-sm text-muted-foreground">下次检查时间</span>
        <span className="text-sm font-semibold text-foreground">{nextCheckin}</span>
      </div>
    </div>
  );
}