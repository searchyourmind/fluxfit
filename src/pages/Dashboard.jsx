import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Camera, Scale, Dumbbell } from "lucide-react";
import CalorieRings from "@/components/dashboard/CalorieRings";
import MacroBar from "@/components/dashboard/MacroBar";
import FoodLogItem from "@/components/dashboard/FoodLogItem";
import ExpenditureCard from "@/components/dashboard/ExpenditureCard";
import { calculateExpenditure } from "@/lib/expenditure";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);
  const [todayLogs, setTodayLogs] = useState([]);
  const [latestWeight, setLatestWeight] = useState(null);
  const [expenditure, setExpenditure] = useState(null);

  useEffect(() => {
    const load = async () => {
      const profiles = await base44.entities.Profile.filter({}, "-created_date", 1);
      if (!profiles[0]) {
        navigate("/onboarding", { replace: true });
        return;
      }
      const [targets, logs, weights, prevEstimates] = await Promise.all([
        base44.entities.DailyTarget.filter({ active: true }, "-created_date", 1),
        base44.entities.FoodLog.filter({}, "-created_date", 200),
        base44.entities.WeightLog.filter({}, "-log_date", 30),
        base44.entities.ExpenditureEstimate.filter({}, "-created_date", 1),
      ]);
      setTarget(targets[0] || null);
      const todayStr = new Date().toISOString().split("T")[0];
      setTodayLogs(logs.filter((l) => l.created_date?.startsWith(todayStr)));
      setLatestWeight(weights[0] || null);

      const result = calculateExpenditure(logs, weights, prevEstimates[0]?.estimated_expenditure);
      setExpenditure(result);
      if (!result.insufficientData) {
        await base44.entities.ExpenditureEstimate.create(result);
      }
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

  const consumed = todayLogs.reduce((s, l) => s + (l.calories || 0), 0);
  const protein = todayLogs.reduce((s, l) => s + (l.protein_g || 0), 0);
  const carbs = todayLogs.reduce((s, l) => s + (l.carbs_g || 0), 0);
  const fat = todayLogs.reduce((s, l) => s + (l.fat_g || 0), 0);
  const remaining = target ? Math.max(0, target.calories - consumed) : 0;

  const proteinRemaining = Math.max(0, Math.round((target?.protein_g || 0) - protein));
  const summary = target
    ? `还剩 ${Math.round(remaining)} kcal${proteinRemaining > 0 ? `，蛋白质还差 ${proteinRemaining}g` : "，蛋白质已达标"}`
    : "设置目标后即可查看每日概览";

  return (
    <div className="px-5 pt-8 pb-4">
      <h1 className="text-xl font-heading font-bold text-foreground mb-0.5">今天</h1>
      <p className="text-sm text-primary/80 mb-5">{summary}</p>

      {/* Calorie Rings */}
      <div className="glass-card rounded-[20px] p-5 mb-4">
        <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
          每日热量目标 · {target?.calories?.toLocaleString() || 0} KCAL
        </p>
        <CalorieRings consumed={consumed} remaining={remaining} target={target?.calories || 1} />
      </div>

      {/* Macro Balance */}
      <div className="glass-card rounded-[20px] p-5 mb-4">
        <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-3">
          宏量营养素
        </p>
        <div className="space-y-2.5">
          <MacroBar label="碳水" current={carbs} target={target?.carbs_g || 0} color="#22C55E" />
          <MacroBar label="脂肪" current={fat} target={target?.fat_g || 0} color="#F59E0B" />
          <MacroBar label="蛋白质" current={protein} target={target?.protein_g || 0} color="#EF4444" />
        </div>
      </div>

      {/* TDEE */}
      <ExpenditureCard expenditure={expenditure} />

      {/* Weight */}
      <div className="glass-card rounded-[20px] p-5 mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-1">最新体重</p>
          <p className="text-2xl font-bold text-foreground font-heading">{latestWeight ? `${latestWeight.weight_kg} kg` : "未记录"}</p>
        </div>
        <Link to="/weight" className="text-xs font-semibold text-primary">查看趋势 →</Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link to="/food/add" className="flex flex-col items-center gap-1.5 glass-card rounded-2xl py-4">
          <Camera className="w-5 h-5 text-primary" />
          <span className="text-[11px] font-medium text-muted-foreground">记录食物</span>
        </Link>
        <Link to="/weight" className="flex flex-col items-center gap-1.5 glass-card rounded-2xl py-4">
          <Scale className="w-5 h-5 text-primary" />
          <span className="text-[11px] font-medium text-muted-foreground">记录体重</span>
        </Link>
        <Link to="/training" className="flex flex-col items-center gap-1.5 glass-card rounded-2xl py-4">
          <Dumbbell className="w-5 h-5 text-primary" />
          <span className="text-[11px] font-medium text-muted-foreground">记录训练</span>
        </Link>
      </div>

      {/* Food Log */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">今日饮食记录</p>
        <Link to="/food" className="text-xs font-semibold text-primary">查看全部 →</Link>
      </div>
      <div className="space-y-2">
        {todayLogs.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">还没有记录，去添加第一餐吧</p>}
        {todayLogs.map((log) => (
          <FoodLogItem key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}