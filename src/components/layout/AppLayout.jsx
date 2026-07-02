import { Outlet, Link, useLocation } from "react-router-dom";
import { Flame, UtensilsCrossed, Scale, Target, MessageCircle } from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "今天", icon: Flame },
  { path: "/food", label: "饮食", icon: UtensilsCrossed },
  { path: "/weight", label: "体重", icon: Scale },
  { path: "/strategy", label: "策略", icon: Target },
  { path: "/coach", label: "教练", icon: MessageCircle },
];

export default function AppLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Gradient glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(58,134,255,0.10) 0%, rgba(58,134,255,0.03) 35%, transparent 65%)",
        }}
      />
      <div className="relative z-10">
        <Outlet />
      </div>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16"
        style={{
          background: "rgba(8,12,24,0.80)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}