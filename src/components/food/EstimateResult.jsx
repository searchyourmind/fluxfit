import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const MEAL_OPTIONS = [
  { value: "breakfast", label: "早餐" },
  { value: "lunch", label: "午餐" },
  { value: "dinner", label: "晚餐" },
  { value: "snack", label: "加餐" },
];

export default function EstimateResult({ estimate, setEstimate, mealType, setMealType, onSave, saving }) {
  const update = (key, value) => setEstimate((e) => ({ ...e, [key]: value }));

  return (
    <div className="space-y-4">
      {estimate.coaching_note && (
        <div className="bg-primary/10 text-primary text-sm rounded-2xl p-4 leading-relaxed">
          {estimate.coaching_note}
        </div>
      )}
      <div>
        <Label className="text-muted-foreground">餐次</Label>
        <div className="grid grid-cols-4 gap-2 mt-1.5">
          {MEAL_OPTIONS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMealType(m.value)}
              className={`py-2 rounded-xl text-xs font-medium border ${
                mealType === m.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-muted-foreground">食物描述</Label>
        <Input value={estimate.description} onChange={(e) => update("description", e.target.value)} className="mt-1.5 bg-card border-border text-foreground" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-muted-foreground">热量 (kcal)</Label>
          <Input type="number" value={estimate.calories} onChange={(e) => update("calories", Number(e.target.value))} className="mt-1.5 bg-card border-border text-foreground" />
        </div>
        <div>
          <Label className="text-muted-foreground">蛋白质 (g)</Label>
          <Input type="number" value={estimate.protein_g} onChange={(e) => update("protein_g", Number(e.target.value))} className="mt-1.5 bg-card border-border text-foreground" />
        </div>
        <div>
          <Label className="text-muted-foreground">碳水 (g)</Label>
          <Input type="number" value={estimate.carbs_g} onChange={(e) => update("carbs_g", Number(e.target.value))} className="mt-1.5 bg-card border-border text-foreground" />
        </div>
        <div>
          <Label className="text-muted-foreground">脂肪 (g)</Label>
          <Input type="number" value={estimate.fat_g} onChange={(e) => update("fat_g", Number(e.target.value))} className="mt-1.5 bg-card border-border text-foreground" />
        </div>
      </div>
      <Button onClick={onSave} disabled={saving} className="w-full py-6 rounded-2xl">
        {saving ? "保存中..." : "保存记录"}
      </Button>
    </div>
  );
}