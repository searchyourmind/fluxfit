import { Link } from "react-router-dom";
import { Camera, TrendingUp, Sparkles, Dumbbell } from "lucide-react";

const FEATURES = [
  { icon: Camera, title: "拍照记录饮食", desc: "拍下你的食物，AI 自动识别中式菜、外卖、奶茶、火锅、寿司等" },
  { icon: Sparkles, title: "AI 智能估算", desc: "自动计算卡路里与蛋白质、碳水、脂肪含量" },
  { icon: TrendingUp, title: "体重与训练追踪", desc: "记录体重趋势和训练情况，一目了然" },
  { icon: Dumbbell, title: "每周自动调整", desc: "根据你的真实进度，每周动态调整卡路里目标" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3F8F1] to-white">
      <div className="max-w-md mx-auto px-6 pt-16 pb-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            AI 营养教练
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">MacroPilot</h1>
          <p className="text-slate-500 text-base leading-relaxed">
            拍照记录三餐，AI 帮你估算营养，
            <br />
            每周动态调整目标，更轻松地减脂增肌。
          </p>
        </div>

        <div className="space-y-4 mb-10">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 bg-white rounded-2xl p-4 shadow-sm border border-black/5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">{title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Link
            to="/register"
            className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-colors"
          >
            开始使用 Get Started
          </Link>
          <Link
            to="/login"
            className="block text-center bg-white border border-slate-200 text-slate-700 font-semibold py-3.5 rounded-2xl transition-colors hover:bg-slate-50"
          >
            登录 Log In
          </Link>
        </div>
      </div>
    </div>
  );
}