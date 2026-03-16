import React from "react";
import { COLORS } from "../../core/config/constants";

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
}

interface TickerProps {
  items: TickerItem[];
}

export const Ticker: React.FC<TickerProps> = React.memo(({ items }) => {
  if (!items || items.length === 0) return null;

  // Duplicate items to ensure seamless scrolling
  const scrollItems = [...items, ...items, ...items];

  return (
    <div style={{ 
      width: "100%", 
      overflow: "hidden", 
      background: "#050810", 
      borderBottom: `1px solid ${COLORS.BORDER}`,
      whiteSpace: "nowrap",
      position: "relative",
      zIndex: 5,
      height: 40,
      display: "flex",
      alignItems: "center",
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
    }}>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .ticker-scroll {
          display: inline-flex;
          animation: scroll 60s linear infinite;
        }
        .ticker-scroll:hover {
          animation-play-state: paused;
        }
        .ticker-item {
          display: inline-flex;
          align-items: center;
          padding: 0 32px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          border-right: 1px solid rgba(255,255,255,0.05);
        }
      `}</style>
      <div className="ticker-scroll">
        {scrollItems.map((item, idx) => (
          <div key={`${item.symbol}-${idx}`} className="ticker-item">
            <span style={{ fontWeight: 700, color: "#fff", marginRight: 12, letterSpacing: "0.5px" }}>{item.name}</span>
            <span style={{ color: "#fff", marginRight: 12, opacity: 0.9 }}>{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span style={{ 
              color: item.change >= 0 ? COLORS.GREEN : COLORS.RED,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontWeight: 600
            }}>
              {item.change >= 0 ? "▲" : "▼"}
              {Math.abs(item.change).toFixed(2)} ({Math.abs(item.changePct).toFixed(2)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
