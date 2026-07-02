import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateTargets } from "@/lib/nutrition";

const GOAL_TYPES = [
  { value: "fat_loss", label: "减脂" },
  { value: "muscle_gain", label: "增肌" },
  { value: "maintenance", label: "维持" },
];
const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "久坐不动" },
  { value: "light", label: "轻度活动" },
  { value: "moderate", label: "中度活动" },
  { value: "active", label: "积极活动" },
  { value: "very_active", label: "非常活跃" },
];
const PACES = [
  { value: "slow", label: "缓慢" },
  { value: "moderate", label: "适中" },
  { value: "aggressive", label: "激进" },
];
const MACRO_PREFS = [
  { value: "balanced", label: "均衡" },
  { value: "higher_carb", label: "高碳水" },
  { value: "higher_fat", label: "高脂肪" },
  { value: "high_protein", label: "高蛋白" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    sex: "male",
    height_cm: "",
    current_weight_kg: "",
    goal_weight_kg: "",
    goal_type: "fat_loss",
    activity_level: "moderate",
    training_frequency: "3",
    target_pace: "moderate",
    macro_preference: "balanced",
  });

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const profileData = {
      name: form.name,
      age: Number(form.age),
      sex: form.sex,
      height_cm: Number(form.height_cm),
      current_weight_kg: Number(form.current_weight_kg),
      goal_weight_kg: Number(form.goal_weight_kg),
      goal_type: form.goal_type,
      activity_level: form.activity_level,
      training_frequency: Number(form.training_frequency),
      target_pace: form.target_pace,
      macro_preference: form.macro_preference,
      onboarding_completed: true,
    };
    await base44.entities.Profile.create(profileData);
    const targets = calculateTargets(profileData);
    await base44.entities.DailyTarget.create({ ...targets, active: true, reason: "初始目标" });
    await base44.entities.WeightLog.create({
      weight_kg: profileData.current_weight_kg,
      log_date: new Date().toISOString().split("T")[0],
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0E1117] px-6 py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1">完善你的资料</h1>
        <p className="text-slate-400 text-sm mb-8">帮助我们生成你的个性化目标</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="text-slate-300">姓名</Label>
            <Input required value={form.name} onChange={(e) => update("name", e.target.value)} className="mt-1.5 bg-[#171B22] border-white/10 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">年龄</Label>
              <Input required type="number" value={form.age} onChange={(e) => update("age", e.target.value)} className="mt-1.5 bg-[#171B22] border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-slate-300">性别</Label>
              <select
                value={form.sex}
                onChange={(e) => update("sex", e.target.value)}
                className="mt-1.5 w-full h-10 rounded-md border border-white/10 bg-[#171B22] text-white px-3 text-sm"
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">身高 (cm)</Label>
              <Input required type="number" value={form.height_cm} onChange={(e) => update("height_cm", e.target.value)} className="mt-1.5 bg-[#171B22] border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-slate-300">当前体重 (kg)</Label>
              <Input required type="number" value={form.current_weight_kg} onChange={(e) => update("current_weight_kg", e.target.value)} className="mt-1.5 bg-[#171B22] border-white/10 text-white" />
            </div>
          </div>
          <div>
            <Label className="text-slate-300">目标体重 (kg)</Label>
            <Input required type="number" value={form.goal_weight_kg} onChange={(e) => update("goal_weight_kg", e.target.value)} className="mt-1.5 bg-[#171B22] border-white/10 text-white" />
          </div>
          <div>
            <Label className="text-slate-300">目标类型</Label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {GOAL_TYPES.map((g) => (
                <button
                  type="button"
                  key={g.value}
                  onClick={() => update("goal_type", g.value)}
                  className={`py-2.5 rounded-xl text-sm font-medium border ${
                    form.goal_type === g.value ? "bg-emerald-500 text-[#0E1117] border-emerald-500" : "border-white/10 text-slate-300"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-slate-300">活动水平</Label>
            <select
              value={form.activity_level}
              onChange={(e) => update("activity_level", e.target.value)}
              className="mt-1.5 w-full h-10 rounded-md border border-white/10 bg-[#171B22] text-white px-3 text-sm"
            >
              {ACTIVITY_LEVELS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">每周训练次数</Label>
              <Input required type="number" value={form.training_frequency} onChange={(e) => update("training_frequency", e.target.value)} className="mt-1.5 bg-[#171B22] border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-slate-300">目标节奏</Label>
              <select
                value={form.target_pace}
                onChange={(e) => update("target_pace", e.target.value)}
                className="mt-1.5 w-full h-10 rounded-md border border-white/10 bg-[#171B22] text-white px-3 text-sm"
              >
                {PACES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label className="text-slate-300">宏量营养偏好</Label>
            <div className="grid grid-cols-4 gap-2 mt-1.5">
              {MACRO_PREFS.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => update("macro_preference", m.value)}
                  className={`py-2 rounded-xl text-xs font-medium border ${
                    form.macro_preference === m.value ? "bg-emerald-500 text-[#0E1117] border-emerald-500" : "border-white/10 text-slate-300"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#0E1117] py-6 rounded-2xl text-base">
            {saving ? "生成中..." : "生成我的目标"}
          </Button>
        </form>
      </div>
    </div>
  );
}