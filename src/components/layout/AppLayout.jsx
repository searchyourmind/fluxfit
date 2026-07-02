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
    <div className="min-h-screen bg-[#0E1117] pb-20">
      <Outlet />
      <nav className="fixed bottom-0 left-0 right-0 bg-[#171B22]/95 backdrop-blur-lg border-t border-white/5 flex justify-around items-center h-16 z-50">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                active ? "text-emerald-400" : "text-slate-500"
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