import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TYPES = [
  { value: "chest", label: "Chest" }, { value: "back", label: "Back" }, { value: "legs", label: "Legs" },
  { value: "shoulders", label: "Shoulders" }, { value: "arms", label: "Arms" }, { value: "cardio", label: "Cardio" },
  { value: "swimming", label: "Swimming" }, { value: "rest", label: "Rest" },
];

export default function Training() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ training_type: "chest", duration_min: "", steps: "", notes: "" });

  const load = async () => setLogs(await base44.entities.TrainingLog.filter({}, "-log_date", 20));
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.TrainingLog.create({
      training_type: form.training_type,
      duration_min: form.duration_min ? Number(form.duration_min) : undefined,
      steps: form.steps ? Number(form.steps) : undefined,
      notes: form.notes,
      log_date: new Date().toISOString().split("T")[0],
    });
    setForm({ training_type: "chest", duration_min: "", steps: "", notes: "" });
    setSaving(false);
    load();
  };

  return (
    <div className="px-5 pt-8 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-6 h-6 text-foreground" /></button>
        <h1 className="text-lg font-heading font-bold text-foreground">Training Log</h1>
      </div>

      <form onSubmit={handleSave} className="glass-card rounded-[20px] p-5 space-y-4 mb-6">
        <div>
          <Label className="text-muted-foreground">Training Type</Label>
          <div className="grid grid-cols-4 gap-2 mt-1.5">
            {TYPES.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => setForm((f) => ({ ...f, training_type: t.value }))}
                className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                  form.training_type === t.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
                style={form.training_type !== t.value ? { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" } : {}}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Duration (min)</Label>
            <Input type="number" value={form.duration_min} onChange={(e) => setForm((f) => ({ ...f, duration_min: e.target.value }))} className="mt-1.5 bg-transparent border-white/10 text-foreground" />
          </div>
          <div>
            <Label className="text-muted-foreground">Steps</Label>
            <Input type="number" value={form.steps} onChange={(e) => setForm((f) => ({ ...f, steps: e.target.value }))} className="mt-1.5 bg-transparent border-white/10 text-foreground" />
          </div>
        </div>
        <div>
          <Label className="text-muted-foreground">Notes</Label>
          <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="mt-1.5 bg-transparent border-white/10 text-foreground" />
        </div>
        <Button type="submit" disabled={saving} className="w-full rounded-xl">Save Entry</Button>
      </form>

      <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-3">Recent Entries</p>
      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="glass-card rounded-2xl p-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-foreground">{TYPES.find((t) => t.value === log.training_type)?.label}</p>
              <p className="text-xs text-muted-foreground">{log.log_date} {log.duration_min ? `· ${log.duration_min} min` : ""} {log.steps ? `· ${log.steps} steps` : ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}