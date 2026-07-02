import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Camera, Type, PenLine, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import EstimateResult from "@/components/food/EstimateResult";

const MODES = [
  { key: "photo", label: "拍照上传", icon: Camera },
  { key: "text", label: "文字描述", icon: Type },
  { key: "manual", label: "手动输入", icon: PenLine },
];

const EMPTY_ESTIMATE = { description: "", calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, coaching_note: "", image_url: "" };

export default function FoodAdd() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mealType, setMealType] = useState("lunch");
  const [estimate, setEstimate] = useState(null);
  const [textInput, setTextInput] = useState("");

  const analyzePhoto = async (file) => {
    setAnalyzing(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const result = await base44.integrations.Core.InvokeLLM({
      prompt:
        "你是一名营养师。请分析这张食物照片（可能是中餐、外卖、奶茶、火锅、寿司、蛋白粉或家常菜），估算食物名称、总热量范围、蛋白质、碳水、脂肪含量（单位克），置信度（low/medium/high），并给出一句简短的中文教练建议。",
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          food_name: { type: "string" },
          calories: { type: "number" },
          protein_g: { type: "number" },
          carbs_g: { type: "number" },
          fat_g: { type: "number" },
          confidence: { type: "string", enum: ["low", "medium", "high"] },
          coaching_note: { type: "string" },
        },
      },
    });
    setEstimate({
      description: result.food_name,
      calories: result.calories,
      protein_g: result.protein_g,
      carbs_g: result.carbs_g,
      fat_g: result.fat_g,
      confidence: result.confidence,
      coaching_note: result.coaching_note,
      image_url: file_url,
    });
    setAnalyzing(false);
  };

  const analyzeText = async () => {
    setAnalyzing(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `你是一名营养师。请分析以下饮食描述（可能包含中餐、外卖、奶茶、火锅、寿司、蛋白粉等），估算总热量、蛋白质、碳水、脂肪含量（单位克），置信度（low/medium/high），并给出一句简短的中文教练建议。\n\n饮食描述："${textInput}"`,
      response_json_schema: {
        type: "object",
        properties: {
          food_name: { type: "string" },
          calories: { type: "number" },
          protein_g: { type: "number" },
          carbs_g: { type: "number" },
          fat_g: { type: "number" },
          confidence: { type: "string", enum: ["low", "medium", "high"] },
          coaching_note: { type: "string" },
        },
      },
    });
    setEstimate({
      description: result.food_name || textInput,
      calories: result.calories,
      protein_g: result.protein_g,
      carbs_g: result.carbs_g,
      fat_g: result.fat_g,
      confidence: result.confidence,
      coaching_note: result.coaching_note,
      image_url: "",
    });
    setAnalyzing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.FoodLog.create({ ...estimate, meal_type: mealType });
    navigate("/dashboard");
  };

  return (
    <div className="px-5 pt-8 pb-10 min-h-screen bg-[#0B0F0E]">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => (mode || estimate ? (setMode(null), setEstimate(null)) : navigate(-1))}>
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">添加食物</h1>
      </div>

      {!mode && !estimate && (
        <div className="grid grid-cols-1 gap-3">
          {MODES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className="flex items-center gap-4 bg-[#151A19] rounded-2xl p-4 border border-white/5"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-medium text-white">{label}</span>
            </button>
          ))}
        </div>
      )}

      {mode === "photo" && !estimate && (
        <div>
          {analyzing ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-4 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
              <p className="text-sm text-slate-500">AI 正在识别中...</p>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-emerald-500/20 rounded-2xl py-16 cursor-pointer">
              <Camera className="w-8 h-8 text-emerald-400" />
              <span className="text-sm font-medium text-slate-400">点击上传食物照片</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files[0] && analyzePhoto(e.target.files[0])}
              />
            </label>
          )}
        </div>
      )}

      {mode === "text" && !estimate && (
        <div className="space-y-4">
          <Textarea
            rows={5}
            placeholder="例如：我吃了两个鸡腿，一碗米饭，一杯蛋白粉"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <Button onClick={analyzeText} disabled={analyzing || !textInput.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 rounded-2xl">
            {analyzing ? "AI 分析中..." : "开始分析"}
          </Button>
        </div>
      )}

      {mode === "text" && !estimate && null}

      {mode === "manual" && !estimate && (
        <Button
          onClick={() => setEstimate({ ...EMPTY_ESTIMATE })}
          className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 rounded-2xl"
        >
          填写详情
        </Button>
      )}

      {estimate && (
        <EstimateResult
          estimate={estimate}
          setEstimate={setEstimate}
          mealType={mealType}
          setMealType={setMealType}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}