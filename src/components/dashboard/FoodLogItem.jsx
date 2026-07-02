const MEAL_LABELS = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐" };

export default function FoodLogItem({ log, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 glass-card rounded-2xl p-3 ${onClick ? "cursor-pointer active:opacity-70" : ""}`}
    >
      {log.image_url ? (
        <img src={log.image_url} alt={log.description} className="w-12 h-12 rounded-xl object-cover shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: "rgba(58,134,255,0.12)" }}>
          🍽️
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{log.description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {Math.round(log.calories)} kcal · 蛋白 {Math.round(log.protein_g || 0)}g
        </p>
      </div>
    </div>
  );
}