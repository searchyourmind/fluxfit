import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Copy, Trash2, ChevronLeft, BookmarkPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MEAL_TYPES = [
  { value: "breakfast", label: "早餐" },
  { value: "lunch", label: "午餐" },
  { value: "dinner", label: "晚餐" },
  { value: "snack", label: "加餐" },
];

export default function Food() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await base44.entities.FoodLog.filter({}, "-created_date", 100);
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    await base44.entities.FoodLog.delete(id);
    load();
  };

  const handleCopyToToday = async (log) => {
    const { id, created_date, updated_date, created_by_id, ...rest } = log;
    await base44.entities.FoodLog.create(rest);
    load();
  };

  const handleSaveAsMeal = async (log) => {
    await base44.entities.SavedMeal.create({
      name: log.description,
      calories: log.calories,
      protein_g: log.protein_g,
      carbs_g: log.carbs_g,
      fat_g: log.fat_g,
    });
  };

  const groupedByDate = logs.reduce((acc, log) => {
    const date = (log.created_date || "").split("T")[0];
    acc[date] = acc[date] || [];
    acc[date].push(log);
    return acc;
  }, {});

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
        <h1 className="text-lg font-heading font-bold text-foreground">饮食记录</h1>
      </div>

      {Object.keys(groupedByDate).length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">还没有饮食记录</p>
      )}

      {Object.entries(groupedByDate).map(([date, dayLogs]) => (
        <div key={date} className="mb-6">
          <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-2">{date}</p>
          {MEAL_TYPES.map(({ value, label }) => {
            const mealLogs = dayLogs.filter((l) => l.meal_type === value);
            if (mealLogs.length === 0) return null;
            return (
              <div key={value} className="mb-3">
                <p className="text-xs text-muted-foreground mb-1.5 ml-1">{label}</p>
                <div className="space-y-2">
                  {mealLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 glass-card rounded-2xl p-3">
                      {log.image_url ? (
                        <img src={log.image_url} alt={log.description} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-primary text-[10px]" style={{ background: "rgba(58,134,255,0.12)" }}>
                          {label}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{log.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {Math.round(log.calories)} kcal · 蛋白 {Math.round(log.protein_g || 0)}g · 碳水 {Math.round(log.carbs_g || 0)}g · 脂肪 {Math.round(log.fat_g || 0)}g
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleSaveAsMeal(log)} title="存为常用餐食" className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <BookmarkPlus className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleCopyToToday(log)} title="复制到今天" className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(log.id)} title="删除" className="w-8 h-8 flex items-center justify-center rounded-lg text-destructive" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}