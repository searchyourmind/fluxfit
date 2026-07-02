import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Camera, MessageCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "首页", icon: Home },
  { path: "/food/add", label: "记录", icon: Camera },
  { path: "/coach", label: "教练", icon: MessageCircle },
  { path: "/settings", label: "我的", icon: User },
];

export default function AppLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-20">
      <Outlet />
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-black/5 flex justify-around items-center h-16 z-50">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
                active ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}