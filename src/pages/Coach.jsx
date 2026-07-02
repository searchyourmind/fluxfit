import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PRESET_QUESTIONS = [
  "今天还能吃什么？",
  "我今晚能不能吃火锅？",
  "今天蛋白质够不够？",
  "我这周减脂怎么样？",
  "为什么体重没掉？",
  "训练日要不要多吃碳水？",
];

export default function Coach() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "你好！我是你的 AI 教练，可以问我关于今天饮食、这周减脂进度或蛋白质摄入的问题。" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (overrideText) => {
    const question = overrideText ?? input;
    if (!question.trim() || sending) return;
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setSending(true);

    const [targets, logs, weights] = await Promise.all([
      base44.entities.DailyTarget.filter({ active: true }, "-created_date", 1),
      base44.entities.FoodLog.filter({}, "-created_date", 30),
      base44.entities.WeightLog.filter({}, "-log_date", 14),
    ]);
    const target = targets[0];
    const todayStr = new Date().toISOString().split("T")[0];
    const todayLogs = logs.filter((l) => l.created_date?.startsWith(todayStr));
    const consumed = todayLogs.reduce((s, l) => s + (l.calories || 0), 0);
    const protein = todayLogs.reduce((s, l) => s + (l.protein_g || 0), 0);

    const reply = await base44.integrations.Core.InvokeLLM({
      prompt: `你是 FluxFit 的 AI 营养教练，说中文，语气温暖友好、专业直接。
用户目标：${target ? `${target.calories} kcal，蛋白质 ${target.protein_g}g，碳水 ${target.carbs_g}g，脂肪 ${target.fat_g}g` : "暂无目标"}
今日已摄入：${Math.round(consumed)} kcal，蛋白质 ${Math.round(protein)}g
最近体重记录：${weights.map((w) => `${w.log_date}: ${w.weight_kg}kg`).join(", ") || "暂无"}
最近饮食记录：${logs.slice(0, 10).map((l) => l.description).join("、") || "暂无"}

用户问题："${question}"

请基于以上数据给出简洁、具体、可执行的中文回答。`,
    });

    setMessages((m) => [...m, { role: "assistant", content: reply }]);
    setSending(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-6 h-6 text-foreground" /></button>
        <h1 className="text-lg font-heading font-bold text-foreground">AI 教练</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "user" ? "bg-primary text-primary-foreground" : "glass-card text-foreground"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="glass-card rounded-2xl px-4 py-2.5 text-sm text-muted-foreground">思考中...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {PRESET_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="text-xs glass-card text-muted-foreground px-3 py-1.5 rounded-full"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="px-5 pb-24 pt-2" style={{ background: "rgba(8,12,24,0.80)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="问问教练..."
            className="flex-1 h-11 rounded-full px-4 text-sm outline-none text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          />
          <button onClick={() => handleSend()} disabled={sending} className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}