export default function CalorieRings({ consumed, remaining, target }) {
  const consumedPct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  const remainPct = target > 0 ? Math.min(100, (remaining / target) * 100) : 0;

  const lgSize = 148, lgStroke = 14;
  const lgR = (lgSize - lgStroke) / 2;
  const lgC = 2 * Math.PI * lgR;
  const lgOff = lgC - (consumedPct / 100) * lgC;

  const smSize = 108, smStroke = 12;
  const smR = (smSize - smStroke) / 2;
  const smC = 2 * Math.PI * smR;
  const smOff = smC - (remainPct / 100) * smC;

  return (
    <div className="flex items-center justify-center gap-6 py-3">
      <div className="relative">
        <svg width={lgSize} height={lgSize} className="-rotate-90">
          <circle cx={lgSize / 2} cy={lgSize / 2} r={lgR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={lgStroke} />
          <circle
            cx={lgSize / 2} cy={lgSize / 2} r={lgR} fill="none"
            stroke="#F59E0B" strokeWidth={lgStroke} strokeLinecap="round"
            strokeDasharray={lgC} strokeDashoffset={lgOff}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground font-heading">{Math.round(consumed).toLocaleString()}</span>
          <span className="text-[10px] text-muted-foreground">kcal</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">已摄入</span>
        </div>
      </div>
      <div className="relative">
        <svg width={smSize} height={smSize} className="-rotate-90">
          <circle cx={smSize / 2} cy={smSize / 2} r={smR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={smStroke} />
          <circle
            cx={smSize / 2} cy={smSize / 2} r={smR} fill="none"
            stroke="#3A86FF" strokeWidth={smStroke} strokeLinecap="round"
            strokeDasharray={smC} strokeDashoffset={smOff}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-muted-foreground">剩余</span>
          <span className="text-lg font-bold text-foreground font-heading">{Math.round(remaining)}</span>
          <span className="text-[10px] text-muted-foreground">kcal</span>
        </div>
      </div>
    </div>
  );
}