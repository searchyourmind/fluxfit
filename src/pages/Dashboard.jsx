import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Camera, Scale, Dumbbell } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-[#0E1117]">
        <div className="w-8 h-8 border-4 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
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
    ? `今天还剩 ${Math.round(remaining)} kcal${proteinRemaining > 0 ? `，蛋白质还差 ${proteinRemaining}g` : "，蛋白质已达标"}。`
    : "设置目标后即可查看每日概览。";

  return (
    <div className="px-5 pt-8">
      <h1 className="text-xl font-bold text-white mb-1">今天</h1>
      <p className="text-sm text-emerald-400 mb-5">{summary}</p>

      <div className="bg-[#171B22] rounded-3xl p-5 border border-white/5 mb-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-3xl font-bold text-white">{Math.round(consumed)}</p>
            <p className="text-xs text-slate-500">已摄入 kcal</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-emerald-400">{Math.round(remaining)}</p>
            <p className="text-xs text-slate-500">剩余 kcal</p>
          </div>
        </div>
        <div className="space-y-3">
          <MacroBar label="蛋白质" current={protein} target={target?.protein_g || 0} color="hsl(258 80% 68%)" />
          <MacroBar label="碳水" current={carbs} target={target?.carbs_g || 0} color="hsl(38 92% 55%)" />
          <MacroBar label="脂肪" current={fat} target={target?.fat_g || 0} color="hsl(340 82% 62%)" />
        </div>
      </div>

      <ExpenditureCard expenditure={expenditure} />

      <div className="bg-[#171B22] rounded-3xl p-5 border border-white/5 mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">最新体重</p>
          <p className="text-xl font-bold text-white">{latestWeight ? `${latestWeight.weight_kg} kg` : "未记录"}</p>
        </div>
        <Link to="/weight" className="text-xs font-semibold text-emerald-400">查看趋势 →</Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link to="/food/add" className="flex flex-col items-center gap-1.5 bg-[#171B22] rounded-2xl py-4 border border-white/5">
          <Camera className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-medium text-slate-300">记录食物</span>
        </Link>
        <Link to="/weight" className="flex flex-col items-center gap-1.5 bg-[#171B22] rounded-2xl py-4 border border-white/5">
          <Scale className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-medium text-slate-300">记录体重</span>
        </Link>
        <Link to="/training" className="flex flex-col items-center gap-1.5 bg-[#171B22] rounded-2xl py-4 border border-white/5">
          <Dumbbell className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-medium text-slate-300">记录训练</span>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">今日饮食记录</h2>
        <Link to="/food" className="text-xs font-semibold text-emerald-400">查看全部 →</Link>
      </div>
      <div className="space-y-2">
        {todayLogs.length === 0 && <p className="text-sm text-slate-500 text-center py-6">还没有记录，去添加第一餐吧</p>}
        {todayLogs.map((log) => (
          <FoodLogItem key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}