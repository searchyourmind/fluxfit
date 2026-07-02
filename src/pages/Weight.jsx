import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Weight() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await base44.entities.WeightLog.filter({}, "-log_date", 60);
    setLogs(data);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.WeightLog.create({ weight_kg: Number(weight), log_date: new Date().toISOString().split("T")[0] });
    setWeight("");
    setSaving(false);
    load();
  };

  const sorted = [...logs].sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
  const chartData = sorted.map((l) => ({ date: l.log_date.slice(5), weight: l.weight_kg }));
  const latest = logs[0];
  const last7 = logs.slice(0, 7);
  const avg7 = last7.length ? (last7.reduce((s, l) => s + l.weight_kg, 0) / last7.length).toFixed(1) : null;
  const last14 = logs.slice(0, 14);
  const trend = last14.length >= 2 ? (last14[0].weight_kg - last14[last14.length - 1].weight_kg).toFixed(1) : null;

  return (
    <div className="px-5 pt-8 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-6 h-6 text-slate-700" /></button>
        <h1 className="text-lg font-bold text-slate-900">体重记录</h1>
      </div>

      <form onSubmit={handleSave} className="flex gap-2 mb-6">
        <Input type="number" step="0.1" placeholder="今日体重 (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} required />
        <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 shrink-0">保存</Button>
      </form>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-3 border border-black/5 text-center">
          <p className="text-lg font-bold text-slate-900">{latest ? latest.weight_kg : "-"}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">最新体重</p>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-black/5 text-center">
          <p className="text-lg font-bold text-slate-900">{avg7 ?? "-"}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">7天平均</p>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-black/5 text-center">
          <p className={`text-lg font-bold ${trend < 0 ? "text-emerald-600" : "text-slate-900"}`}>{trend ?? "-"}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">14天变化</p>
        </div>
      </div>

      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-black/5 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" fontSize={11} stroke="#94a3b8" />
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} fontSize={11} stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#059669" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}