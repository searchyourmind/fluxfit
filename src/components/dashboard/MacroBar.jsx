export default function MacroBar({ label, current, target, color }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-9 rounded-full relative overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: color }}
        />
        <div className="relative h-full flex items-center px-4">
          <span className="text-xs font-medium text-white whitespace-nowrap drop-shadow-sm">
            {label}: {Math.round(current)}g / {Math.round(target)}g
          </span>
        </div>
      </div>
      <span className="text-sm font-semibold text-foreground w-10 text-right">{pct}%</span>
    </div>
  );
}