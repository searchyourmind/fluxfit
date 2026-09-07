import { Link } from "react-router-dom";
import { Camera, TrendingUp, Sparkles, Dumbbell, MessageCircle } from "lucide-react";

const FEATURES = [
  { icon: Camera, title: "Photo Food Recognition", desc: "Snap your meal and let AI identify dishes, takeout, bubble tea, hotpot, sushi and more" },
  { icon: Sparkles, title: "Auto Macro Estimation", desc: "Automatically calculate calories, protein, carbs and fat content" },
  { icon: TrendingUp, title: "Track Weight Trends", desc: "Monitor weight trends and training activity at a glance" },
  { icon: Dumbbell, title: "Dynamic Calorie Targets", desc: "Automatically adjust your daily calorie and macro targets based on real progress" },
  { icon: MessageCircle, title: "Weekly AI Coach Review", desc: "Weekly analysis of your data with specific, actionable recommendations" },
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
          <p className="text-primary text-sm font-medium mb-4">Dynamic Calorie Tracking · Auto-Adjusted Fat Loss Plan</p>
          <p className="text-muted-foreground text-base leading-relaxed">
            AI helps you log meals, estimate calories, analyze weight trends,
            <br />
            and automatically adjust your fat loss plan.
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
            Get Started
          </Link>
          <Link
            to="/login"
            className="block text-center bg-card border border-border text-foreground font-semibold py-3.5 rounded-2xl transition-colors hover:bg-secondary"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}