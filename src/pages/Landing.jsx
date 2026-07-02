import { Link } from "react-router-dom";
import { Camera, TrendingUp, Sparkles, Dumbbell, MessageCircle } from "lucide-react";

const FEATURES = [
  { icon: Camera, title: "拍照识别饮食", desc: "拍下你的食物，AI 自动识别中式菜、外卖、奶茶、火锅、寿司等" },
  { icon: Sparkles, title: "自动估算碳蛋脂", desc: "自动计算卡路里与蛋白质、碳水、脂肪含量" },
  { icon: TrendingUp, title: "追踪体重趋势", desc: "记录体重趋势和训练情况，一目了然" },
  { icon: Dumbbell, title: "动态调整热量目标", desc: "根据你的真实进度，自动调整每日热量与宏量目标" },
  { icon: MessageCircle, title: "每周AI教练复盘", desc: "每周分析你的数据，给出具体可执行的调整建议" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-6 pt-16 pb-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            AI Nutrition Coach
          </div>
          <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight mb-2">FluxFit</h1>
          <p className="text-primary text-sm font-medium mb-4">动态热量追踪 · 自动调整减脂计划</p>
          <p className="text-muted-foreground text-base leading-relaxed">
            AI帮你记录饮食、估算热量、分析体重趋势，
            <br />
            并自动调整减脂计划。
          </p>
        </div>

        <div className="space-y-4 mb-10">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 bg-card rounded-2xl p-4 border border-border">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Link
            to="/register"
            className="block text-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-colors"
          >
            开始使用
          </Link>
          <Link
            to="/login"
            className="block text-center bg-card border border-border text-foreground font-semibold py-3.5 rounded-2xl transition-colors hover:bg-secondary"
          >
            登录
          </Link>
        </div>
      </div>
    </div>
  );
}