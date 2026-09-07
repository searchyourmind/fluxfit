import { Link } from "react-router-dom";
import { Camera, TrendingUp, Sparkles, Dumbbell, MessageCircle } from "lucide-react";

const FEATURES = [
  { icon: Camera, title: "Photo Recognition", desc: "Snap your meal — AI identifies it instantly" },
  { icon: Sparkles, title: "Auto Macros", desc: "Calories, protein, carbs & fat calculated for you" },
  { icon: TrendingUp, title: "Weight Trends", desc: "Track weight and training at a glance" },
  { icon: Dumbbell, title: "Dynamic Targets", desc: "Calorie targets adjust to your real progress" },
  { icon: MessageCircle, title: "Weekly AI Review", desc: "Actionable insights every week" },
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
          <p className="text-primary text-sm font-medium mb-4">Dynamic Calorie Tracking · Auto-Adjusted Plan</p>
          <p className="text-muted-foreground text-base leading-relaxed">
            AI logs your meals, estimates calories, and adjusts your plan automatically.
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