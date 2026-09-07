export default function ExpenditureCard({ expenditure }) {
  return (
    <div className="glass-card rounded-[20px] p-5 mb-4">
      <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-1">Estimated Daily Expenditure (TDEE)</p>
      {expenditure?.insufficientData ? (
        <p className="text-sm text-muted-foreground mt-1">Insufficient data — keep logging weight and food for at least 7 days</p>
      ) : (
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-foreground font-heading">{expenditure?.estimated_expenditure}</p>
          <p className="text-xs text-muted-foreground">kcal/day · Confidence {expenditure?.confidence === "high" ? "High" : "Medium"}</p>
        </div>
      )}
    </div>
  );
}