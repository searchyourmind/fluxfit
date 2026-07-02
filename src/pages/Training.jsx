import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TYPES = [
  { value: "chest", label: "胸" }, { value: "back", label: "背" }, { value: "legs", label: "腿" },
  { value: "shoulders", label: "肩" }, { value: "arms", label: "手臂" }, { value: "cardio", label: "有氧" },
  { value: "swimming", label: "游泳" }, { value: "rest", label: "休息" },
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
    <div className="px-5 pt-8 pb-10 min-h-screen bg-[#0E1117]">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-6 h-6 text-white" /></button>
        <h1 className="text-lg font-bold text-white">训练记录</h1>
      </div>

      <form onSubmit={handleSave} className="bg-[#171B22] rounded-2xl p-4 border border-white/5 space-y-4 mb-6">
        <div>
          <Label className="text-slate-300">训练类型</Label>
          <div className="grid grid-cols-4 gap-2 mt-1.5">
            {TYPES.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => setForm((f) => ({ ...f, training_type: t.value }))}
                className={`py-2 rounded-xl text-xs font-medium border ${
                  form.training_type === t.value ? "bg-emerald-600 text-white border-emerald-600" : "border-white/10 text-slate-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300">时长 (分钟)</Label>
            <Input type="number" value={form.duration_min} onChange={(e) => setForm((f) => ({ ...f, duration_min: e.target.value }))} className="mt-1.5 bg-[#0E1117] border-white/10 text-white" />
          </div>
          <div>
            <Label className="text-slate-300">步数</Label>
            <Input type="number" value={form.steps} onChange={(e) => setForm((f) => ({ ...f, steps: e.target.value }))} className="mt-1.5 bg-[#0E1117] border-white/10 text-white" />
          </div>
        </div>
        <div>
          <Label className="text-slate-300">备注</Label>
          <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="mt-1.5 bg-[#0E1117] border-white/10 text-white" />
        </div>
        <Button type="submit" disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl">保存记录</Button>
      </form>

      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="bg-[#171B22] rounded-2xl p-3 border border-white/5 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-white">{TYPES.find((t) => t.value === log.training_type)?.label}</p>
              <p className="text-xs text-slate-500">{log.log_date} {log.duration_min ? `· ${log.duration_min}分钟` : ""} {log.steps ? `· ${log.steps}步` : ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}