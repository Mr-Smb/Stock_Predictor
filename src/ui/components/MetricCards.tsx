import React from "react";
import { COLORS } from "../../core/config/constants";
import { Quote, AnalysisResult } from "../../api/types/market_types";

interface MetricCardsProps {
  result: AnalysisResult;
  livePrice: Quote | null;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ result, livePrice }) => {
  const metrics = [
    { 
      label: "CURRENT PRICE", 
      val: `$${((livePrice ? livePrice.price : result.last.close) ?? 0).toFixed(2)}`, 
      sub: `${(livePrice ? livePrice.changePct : result.chgPct) >= 0 ? "▲" : "▼"} ${Math.abs(livePrice ? livePrice.changePct || 0 : result.chgPct).toFixed(2)}% today`, 
      subCol: (livePrice ? livePrice.changePct || 0 : result.chgPct) >= 0 ? COLORS.GREEN : COLORS.RED, 
      valCol: COLORS.ACCENT, 
      accent: COLORS.ACCENT 
    },
    { 
      label: "NEXT DAY FORECAST", 
      val: `$${(result.preds[0] ?? 0).toFixed(2)}`, 
      sub: `${result.signal.fcastPct >= 0 ? "▲" : "▼"} ${Math.abs(result.signal.fcastPct).toFixed(2)}% expected`, 
      subCol: result.signal.fcastPct >= 0 ? COLORS.GREEN : COLORS.RED, 
      valCol: COLORS.GOLD, 
      accent: COLORS.GOLD 
    },
    { 
      label: "52W RANGE", 
      val: `$${(result.lo52 ?? 0).toFixed(0)} – $${(result.hi52 ?? 0).toFixed(0)}`, 
      sub: `Current: ${(((result.last.close - result.lo52) / (result.hi52 - result.lo52)) * 100).toFixed(1)}% of range`, 
      subCol: COLORS.MUTED, 
      valCol: COLORS.TEXT, 
      accent: "#76e4f7" 
    },
    { 
      label: "SIGNAL", 
      val: result.signal.signal, 
      sub: result.signal.signal === "BUY" ? "Bullish setup" : result.signal.signal === "SELL" ? "Bearish setup" : "Neutral — wait", 
      subCol: COLORS.MUTED, 
      valCol: result.signal.signal === "BUY" ? COLORS.GREEN : result.signal.signal === "SELL" ? COLORS.RED : COLORS.GOLD, 
      accent: result.signal.signal === "BUY" ? COLORS.GREEN : result.signal.signal === "SELL" ? COLORS.RED : COLORS.GOLD 
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
      {metrics.map(m => (
        <div key={m.label} style={{ 
          background: COLORS.CARD, 
          border: `1px solid ${COLORS.BORDER}`, 
          borderRadius: 14, 
          padding: "22px 24px", 
          position: "relative", 
          overflow: "hidden" 
        }}>
          <div style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            right: 0, 
            height: 2, 
            background: `linear-gradient(90deg, ${m.accent}, transparent)` 
          }} />
          <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "2.5px", color: COLORS.MUTED, marginBottom: 12 }}>{m.label}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: m.valCol, marginBottom: 10 }}>{m.val}</div>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: m.subCol }}>{m.sub}</div>
        </div>
      ))}
    </div>
  );
};
