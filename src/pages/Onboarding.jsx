import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateTargets } from "@/lib/nutrition";

const GOAL_TYPES = [
  { value: "fat_loss", label: "Fat Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "maintenance", label: "Maintenance" },
];
const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Lightly Active" },
  { value: "moderate", label: "Moderately Active" },
  { value: "active", label: "Very Active" },
  { value: "very_active", label: "Extra Active" },
];
const PACES = [
  { value: "slow", label: "Slow" },
  { value: "moderate", label: "Moderate" },
  { value: "aggressive", label: "Aggressive" },
];
const MACRO_PREFS = [
  { value: "balanced", label: "Balanced" },
  { value: "higher_carb", label: "Higher Carb" },
  { value: "higher_fat", label: "Higher Fat" },
  { value: "high_protein", label: "High Protein" },
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
    await base44.entities.DailyTarget.create({ ...targets, active: true, reason: "Initial target" });
    await base44.entities.WeightLog.create({
      weight_kg: profileData.current_weight_kg,
      log_date: new Date().toISOString().split("T")[0],
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Complete Your Profile</h1>
        <p className="text-muted-foreground text-sm mb-8">Help us generate your personalized targets</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="text-muted-foreground">Name</Label>
            <Input required value={form.name} onChange={(e) => update("name", e.target.value)} className="mt-1.5 bg-card border-border text-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Age</Label>
              <Input required type="number" value={form.age} onChange={(e) => update("age", e.target.value)} className="mt-1.5 bg-card border-border text-foreground" />
            </div>
            <div>
              <Label className="text-muted-foreground">Sex</Label>
              <select
                value={form.sex}
                onChange={(e) => update("sex", e.target.value)}
                className="mt-1.5 w-full h-10 rounded-md border border-border bg-card text-foreground px-3 text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Height (cm)</Label>
              <Input required type="number" value={form.height_cm} onChange={(e) => update("height_cm", e.target.value)} className="mt-1.5 bg-card border-border text-foreground" />
            </div>
            <div>
              <Label className="text-muted-foreground">Current Weight (kg)</Label>
              <Input required type="number" value={form.current_weight_kg} onChange={(e) => update("current_weight_kg", e.target.value)} className="mt-1.5 bg-card border-border text-foreground" />
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Target Weight (kg)</Label>
            <Input required type="number" value={form.goal_weight_kg} onChange={(e) => update("goal_weight_kg", e.target.value)} className="mt-1.5 bg-card border-border text-foreground" />
          </div>
          <div>
            <Label className="text-muted-foreground">Goal Type</Label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {GOAL_TYPES.map((g) => (
                <button
                  type="button"
                  key={g.value}
                  onClick={() => update("goal_type", g.value)}
                  className={`py-2.5 rounded-xl text-sm font-medium border ${
                    form.goal_type === g.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Activity Level</Label>
            <select
              value={form.activity_level}
              onChange={(e) => update("activity_level", e.target.value)}
              className="mt-1.5 w-full h-10 rounded-md border border-border bg-card text-foreground px-3 text-sm"
            >
              {ACTIVITY_LEVELS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Workouts / Week</Label>
              <Input required type="number" value={form.training_frequency} onChange={(e) => update("training_frequency", e.target.value)} className="mt-1.5 bg-card border-border text-foreground" />
            </div>
            <div>
              <Label className="text-muted-foreground">Target Pace</Label>
              <select
                value={form.target_pace}
                onChange={(e) => update("target_pace", e.target.value)}
                className="mt-1.5 w-full h-10 rounded-md border border-border bg-card text-foreground px-3 text-sm"
              >
                {PACES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Macro Preference</Label>
            <div className="grid grid-cols-4 gap-2 mt-1.5">
              {MACRO_PREFS.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => update("macro_preference", m.value)}
                  className={`py-2 rounded-xl text-xs font-medium border ${
                    form.macro_preference === m.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={saving} className="w-full py-6 rounded-2xl text-base">
            {saving ? "Generating..." : "Generate My Targets"}
          </Button>
        </form>
      </div>
    </div>
  );
}