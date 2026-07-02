const MEAL_LABELS = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐" };

export default function FoodLogItem({ log, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 bg-[#171B22] rounded-2xl p-3 border border-white/5 ${onClick ? "cursor-pointer active:opacity-70" : ""}`}
    >
      {log.image_url ? (
        <img src={log.image_url} alt={log.description} className="w-14 h-14 rounded-xl object-cover shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-400 text-xs font-medium">
          {MEAL_LABELS[log.meal_type] || "食物"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{log.description}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {Math.round(log.calories)} kcal · 蛋白 {Math.round(log.protein_g || 0)}g
        </p>
      </div>
    </div>
  );
}