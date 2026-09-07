import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Camera, Type, PenLine, ChevronLeft, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import EstimateResult from "@/components/food/EstimateResult";

const MODES = [
  { key: "photo", label: "Photo Recognition", icon: Camera },
  { key: "text", label: "Text Entry", icon: Type },
  { key: "manual", label: "Manual Entry", icon: PenLine },
  { key: "saved", label: "Saved Meals", icon: BookmarkCheck },
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
  const [savedMeals, setSavedMeals] = useState([]);

  const loadSavedMeals = async () => {
    setSavedMeals(await base44.entities.SavedMeal.list("-created_date", 30));
  };

  const analyzePhoto = async (file) => {
    setAnalyzing(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const result = await base44.integrations.Core.InvokeLLM({
      prompt:
        "You are a nutritionist. Analyze this food photo (it may be any cuisine, takeout, bubble tea, hotpot, sushi, protein shake, or home-cooked meal). Estimate the food name, total calories, protein, carbs, and fat content (in grams), confidence level (low/medium/high), and provide a brief coaching tip in English.",
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
      prompt: `You are a nutritionist. Analyze the following food description (it may include any cuisine, takeout, bubble tea, hotpot, sushi, protein shakes, etc.). Estimate total calories, protein, carbs, and fat content (in grams), confidence level (low/medium/high), and provide a brief coaching tip in English.\n\nFood description: "${textInput}"`,
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
    <div className="px-5 pt-8 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => (mode || estimate ? (setMode(null), setEstimate(null)) : navigate(-1))}>
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-heading font-bold text-foreground">Add Food</h1>
      </div>

      {!mode && !estimate && (
        <div className="grid grid-cols-1 gap-3">
          {MODES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => (key === "saved" ? (loadSavedMeals(), setMode(key)) : setMode(key))}
              className="flex items-center gap-4 glass-card rounded-2xl p-4"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(58,134,255,0.12)" }}>
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">{label}</span>
            </button>
          ))}
        </div>
      )}

      {mode === "photo" && !estimate && (
        <div>
          {analyzing ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">AI is analyzing...</p>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-3 rounded-2xl py-16 cursor-pointer" style={{ border: "2px dashed rgba(58,134,255,0.2)" }}>
              <Camera className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Tap to upload a food photo</span>
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
            placeholder="e.g., I had two chicken thighs, a bowl of rice, and a protein shake"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="bg-transparent border-white/10"
          />
          <Button onClick={analyzeText} disabled={analyzing || !textInput.trim()} className="w-full py-6 rounded-2xl">
            {analyzing ? "AI analyzing..." : "Analyze"}
          </Button>
        </div>
      )}

      {mode === "text" && !estimate && null}

      {mode === "saved" && !estimate && (
        <div className="space-y-2">
          {savedMeals.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No saved meals yet — save one from your food log first</p>}
          {savedMeals.map((meal) => (
            <button
              key={meal.id}
              onClick={() => setEstimate({
                description: meal.name,
                calories: meal.calories,
                protein_g: meal.protein_g,
                carbs_g: meal.carbs_g,
                fat_g: meal.fat_g,
                confidence: "high",
                coaching_note: "",
                image_url: "",
              })}
              className="w-full flex items-center justify-between glass-card rounded-2xl p-4 text-left"
            >
              <span className="font-medium text-foreground text-sm">{meal.name}</span>
              <span className="text-xs text-muted-foreground">{Math.round(meal.calories)} kcal</span>
            </button>
          ))}
        </div>
      )}

      {mode === "manual" && !estimate && (
        <Button
          onClick={() => setEstimate({ ...EMPTY_ESTIMATE })}
          className="w-full py-6 rounded-2xl"
        >
          Fill in Details
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