import React from "react";
import { COLORS } from "../../core/config/constants";
import { Quote, AnalysisResult } from "../../api/types/market_types";

interface DashboardHeaderProps {
  livePrice: Quote | null;
  result: AnalysisResult | null;
  clock: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ livePrice, result, clock }) => {
  return (
    <header style={{ 
      position: "relative", 
      zIndex: 10, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between", 
      padding: "14px 24px", 
      borderBottom: `1px solid ${COLORS.BORDER}`, 
      background: "rgba(5,8,16,0.9)", 
      backdropFilter: "blur(12px)" 
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ 
          width: 34, 
          height: 34, 
          background: `linear-gradient(135deg, ${COLORS.ACCENT}, ${COLORS.ACCENT2})`, 
          borderRadius: 8, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          fontSize: 17 
        }}>⚡</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5, color: COLORS.ACCENT }}>Stock Prediction</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {livePrice && result && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 8, 
            padding: "6px 14px", 
            background: "rgba(0,255,136,0.07)", 
            border: `1px solid ${COLORS.GREEN}44`, 
            borderRadius: 8 
          }}>
            <div style={{ 
              width: 6, 
              height: 6, 
              borderRadius: "50%", 
              background: COLORS.GREEN, 
              boxShadow: `0 0 8px ${COLORS.GREEN}`, 
              animation: "blink 2s infinite" 
            }} />
            <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: COLORS.GREEN }}>
              {result.sym} ${livePrice.price?.toFixed(2) ?? "N/A"}
            </span>
            <span style={{ 
              fontFamily: "monospace", 
              fontSize: 11, 
              color: livePrice.changePct >= 0 ? COLORS.GREEN : COLORS.RED 
            }}>
              {livePrice.changePct >= 0 ? "▲" : "▼"}{(Math.abs(livePrice.changePct || 0)).toFixed(2)}%
            </span>
          </div>
        )}
        <div style={{ fontFamily: "monospace", fontSize: 11, color: COLORS.MUTED }}>{clock}</div>
      </div>
    </header>
  );
};
