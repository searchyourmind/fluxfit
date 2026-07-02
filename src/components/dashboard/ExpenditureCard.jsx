export default function ExpenditureCard({ expenditure }) {
  return (
    <div className="bg-card rounded-3xl p-5 border border-border mb-4">
      <p className="text-xs text-muted-foreground mb-1">预估每日消耗 (TDEE)</p>
      {expenditure?.insufficientData ? (
        <p className="text-sm text-muted-foreground mt-1">数据不足，继续记录体重和饮食至少 7 天</p>
      ) : (
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-foreground">{expenditure?.estimated_expenditure}</p>
          <p className="text-xs text-muted-foreground">kcal/天 · 置信度 {expenditure?.confidence === "high" ? "高" : "中"}</p>
        </div>
      )}
    </div>
  );
}