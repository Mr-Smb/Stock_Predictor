import React from 'react';
import { COLORS } from '../../core/config/constants';
import { Factor } from '../../api/types/market_types';

export const GaugeMeter = React.memo(({ score, signal }: { score: number, signal: string }) => {
  const norm = score / 4;
  const deg = -90 + norm * 180;
  const arcLen = Math.PI * 90;
  const fill = norm * arcLen;
  const col = signal === "BUY" ? COLORS.GREEN : signal === "SELL" ? COLORS.RED : COLORS.GOLD;
  return (
    <svg width="220" height="130" viewBox="0 0 220 130" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={COLORS.RED} />
          <stop offset="50%" stopColor={COLORS.GOLD} />
          <stop offset="100%" stopColor={COLORS.GREEN} />
        </linearGradient>
        <filter id="gf"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke={COLORS.BORDER} strokeWidth="16" strokeLinecap="round" />
      <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke="url(#gg)" strokeWidth="16" strokeLinecap="round"
        strokeDasharray={arcLen} strokeDashoffset={arcLen - fill}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
      <g stroke={COLORS.BORDER2} strokeWidth="1.5">
        <line x1="110" y1="20" x2="110" y2="28" />
        <line x1="42" y1="42" x2="47" y2="47" />
        <line x1="178" y1="42" x2="173" y2="47" />
      </g>
      <text x="16" y="126" fontFamily="monospace" fontSize="9" fill={COLORS.RED} textAnchor="middle">SELL</text>
      <text x="110" y="16" fontFamily="monospace" fontSize="9" fill={COLORS.GOLD} textAnchor="middle">HOLD</text>
      <text x="204" y="126" fontFamily="monospace" fontSize="9" fill={COLORS.GREEN} textAnchor="middle">BUY</text>
      <g style={{ transformOrigin: "110px 110px", transform: `rotate(${deg}deg)`, transition: "transform 1.2s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <line x1="110" y1="110" x2="110" y2="30" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" filter="url(#gf)" />
        <circle cx="110" cy="110" r="5" fill="white" opacity="0.9" />
        <circle cx="110" cy="110" r="3" fill={COLORS.BG} />
      </g>
      <text x="110" y="100" fontFamily="monospace" fontSize="22" fontWeight="700" fill={col} textAnchor="middle"
        style={{ transition: "fill 0.5s" }}>{score}/4</text>
      <text x="110" y="124" fontFamily="monospace" fontSize="9" fill={COLORS.MUTED} textAnchor="middle">BULL SCORE</text>
    </svg>
  );
});

interface MiniArcProps {
  factor: Factor;
  delay: number;
}

export const MiniArc = React.memo(({ factor, delay }: MiniArcProps) => {
  const norm = Math.min(1, Math.max(0, (factor.raw - factor.range[0]) / (factor.range[1] - factor.range[0])));
  const r = 34, cx = 50, cy = 50, arcLen = Math.PI * r, fill = norm * arcLen;
  const fc = factor.bullish ? COLORS.GREEN : COLORS.RED;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width="100" height="62" viewBox="0 0 100 62" style={{ overflow: "visible" }}>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={COLORS.BORDER} strokeWidth="8" strokeLinecap="round" />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={fc} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={arcLen} strokeDashoffset={arcLen - fill}
          style={{ transition: `stroke-dashoffset 1s ease ${delay}s`, filter: `drop-shadow(0 0 4px ${fc}66)` }} />
        <circle cx={cx} cy={cy} r="3.5" fill="white" opacity="0.9" />
        <text x={cx} y={cy - r - 6} fontFamily="monospace" fontSize="8" fill={COLORS.MUTED} textAnchor="middle">{factor.icon} {factor.name.split(" ")[0]}</text>
        <text x={cx} y={cy + 16} fontFamily="monospace" fontSize="11" fontWeight="600" fill={fc} textAnchor="middle">{factor.value}</text>
      </svg>
    </div>
  );
});

interface FactorBarProps {
  factor: Factor;
  pct: number;
  mounted: boolean;
}

export const FactorBar = React.memo(({ factor, pct, mounted }: FactorBarProps) => {
  const col = factor.bullish ? COLORS.GREEN : COLORS.RED;
  const g0 = factor.bullish ? "#00b4d8" : "#7b2fff";
  return (
    <div style={{ background: COLORS.SURFACE, border: `1px solid ${COLORS.BORDER}`, borderRadius: 12, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: col, borderRadius: "3px 0 0 3px" }} />
      <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: COLORS.MUTED, marginBottom: 10 }}>{factor.icon} {factor.name}</div>
      <div style={{ height: 6, background: COLORS.BORDER2, borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg,${g0},${col})`, width: mounted ? `${pct}%` : "0%", transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 500, color: col }}>{factor.value}</span>
        <span style={{
          fontFamily: "monospace", fontSize: 10, letterSpacing: 1, padding: "3px 8px", borderRadius: 4,
          background: factor.bullish ? "rgba(0,255,136,0.12)" : "rgba(255,59,92,0.12)",
          color: factor.bullish ? COLORS.GREEN : COLORS.RED
        }}>
          {factor.bullish ? "▲ BULL" : "▼ BEAR"}
        </span>
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: COLORS.MUTED, marginTop: 6 }}>{["Next-day predicted price change", "MA50 vs MA200 trend signal", "5-day vs 20-day average", "Price position within 52W band"][["LSTM Forecast", "MA 50/200", "Momentum", "52W Position"].indexOf(factor.name)] || ""}</div>
    </div>
  );
});
