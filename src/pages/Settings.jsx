import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { calculateTargets } from "@/lib/nutrition";

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const profiles = await base44.entities.Profile.filter({}, "-created_date", 1);
      setProfile(profiles[0] || null);
    };
    load();
  }, []);

  const handleRecalculate = async () => {
    if (!profile) return;
    setRecalculating(true);
    const targets = calculateTargets(profile);
    await base44.entities.DailyTarget.create({ ...targets, active: true, reason: "手动重新计算" });
    setRecalculating(false);
  };

  const handleLogout = () => base44.auth.logout("/");

  return (
    <div className="px-5 pt-8 pb-10 min-h-screen bg-background">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-6 h-6 text-foreground" /></button>
        <h1 className="text-lg font-heading font-bold text-foreground">我的</h1>
      </div>

      {profile && (
        <div className="bg-card rounded-2xl p-4 border border-border mb-4 space-y-2">
          <p className="text-sm text-foreground"><span className="text-muted-foreground">姓名：</span>{profile.name}</p>
          <p className="text-sm text-foreground"><span className="text-muted-foreground">年龄：</span>{profile.age}</p>
          <p className="text-sm text-foreground"><span className="text-muted-foreground">身高：</span>{profile.height_cm} cm</p>
          <p className="text-sm text-foreground"><span className="text-muted-foreground">当前体重：</span>{profile.current_weight_kg} kg</p>
          <p className="text-sm text-foreground"><span className="text-muted-foreground">目标体重：</span>{profile.goal_weight_kg} kg</p>
        </div>
      )}

      <Button onClick={handleRecalculate} disabled={recalculating || !profile} variant="outline" className="w-full mb-3 rounded-xl bg-card border-border text-foreground hover:bg-secondary">
        {recalculating ? "计算中..." : "重新计算目标"}
      </Button>

      <Button onClick={handleLogout} variant="outline" className="w-full rounded-xl text-destructive border-destructive/20 bg-card hover:bg-destructive/10">
        <LogOut className="w-4 h-4 mr-2" /> 退出登录
      </Button>
    </div>
  );
}