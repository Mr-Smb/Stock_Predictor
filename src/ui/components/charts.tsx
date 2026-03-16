import React, { useState, useRef, useCallback, useEffect } from 'react';
import { COLORS } from '../../core/config/constants';
import { movingAvg } from '../../ml/signals/technical_analysis';
import { StockDataPoint } from '../../api/types/market_types';

interface CandlestickChartProps {
  data: StockDataPoint[];
  closes: number[];
  maVis: { [key: number]: boolean };
  maPeriods: number[];
  height?: number;
}

export const CandlestickChart = React.memo(({ data, closes, maVis, maPeriods, height = 300 }: CandlestickChartProps) => {
  const [tooltip, setTooltip] = useState<any>(null);

  if (!data || data.length === 0) return (
    <div style={{ height, background: COLORS.SURFACE, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 11, color: COLORS.MUTED }}>
      No data
    </div>
  );

  const W = 900, H = height, PAD = { top: 10, right: 62, bottom: 22, left: 8 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const mas = React.useMemo(() => 
    maPeriods.map(p => movingAvg(closes, p).slice(-data.length)),
    [closes, maPeriods, data.length]
  );
  
  const { yMin, yMax, priceRange } = React.useMemo(() => {
    const allVisiblePrices = [
      ...data.map(d => d.high),
      ...data.map(d => d.low),
      ...mas.flatMap((ma, i) => maVis[i] ? ma.filter(v => v !== null) as number[] : [])
    ];

    const allHigh = Math.max(...allVisiblePrices);
    const allLow = Math.min(...allVisiblePrices);
    const range = allHigh - allLow;
    const yPad = range * 0.05;
    return { yMin: allLow - yPad, yMax: allHigh + yPad, priceRange: range };
  }, [data, mas, maVis]);

  const toX = (i: number) => PAD.left + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => PAD.top + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

  const candleW = Math.max(1.5, Math.min(8, chartW / data.length * 0.7));

  const maColors = ["#f6ad55", "#fc8181", "#4682b4"];

  const maPath = (arr: (number | null)[], col: string, key: any) => {
    let d = ""; let started = false;
    arr.forEach((v, i) => {
      if (v === null) { started = false; return; }
      if (!started) { d += `M${toX(i)},${toY(v)}`; started = true; }
      else d += `L${toX(i)},${toY(v)}`;
    });
    return <path key={key} d={d} fill="none" stroke={col} strokeWidth="2.2" opacity="1" />;
  };

  const yTicks = 5;
  const yTickVals = Array.from({ length: yTicks }, (_, i) => yMin + (yMax - yMin) * i / (yTicks - 1));
  const xStep = Math.max(1, Math.floor(data.length / 6));
  const xTicks = data.filter((_, i) => i % xStep === 0 || i === data.length - 1);

  return (
    <div style={{ position: "relative", userSelect: "none" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}
        onMouseLeave={() => setTooltip(null)}>
        {yTickVals.map((v, i) => (
          <line key={i} x1={PAD.left} x2={PAD.left + chartW} y1={toY(v)} y2={toY(v)}
            stroke={COLORS.BORDER} strokeWidth="0.5" strokeDasharray="4 4" />
        ))}
        {maPeriods.map((p, i) => maVis[i] && maPath(mas[i], maColors[i % maColors.length], p))}
        {data.map((d, i) => {
          const bull = d.close >= d.open;
          const col = bull ? COLORS.GREEN : COLORS.RED;
          const x = toX(i);
          const yHi = toY(d.high), yLo = toY(d.low);
          const yO = toY(d.open), yC = toY(d.close);
          const bodyY = Math.min(yO, yC), bodyH = Math.max(1, Math.abs(yC - yO));
          return (
            <g key={i} onMouseEnter={() => setTooltip({ d, x, y: yHi, i })} style={{ cursor: "crosshair" }}>
              <line x1={x} x2={x} y1={yHi} y2={yLo} stroke={col} strokeWidth="1" opacity="0.8" />
              <rect x={x - candleW / 2} y={bodyY} width={candleW} height={bodyH}
                fill={bull ? COLORS.GREEN : COLORS.RED} opacity="0.9"
                rx="0.5"
                stroke={bull ? "#00ff8866" : "#ff3b5c66"} strokeWidth="0.5" />
            </g>
          );
        })}
        {yTickVals.map((v, i) => (
          <text key={i} x={PAD.left + chartW + 6} y={toY(v) + 4} fontFamily="monospace" fontSize="9" fill={COLORS.MUTED}>${(v ?? 0).toFixed(0)}</text>
        ))}
        {xTicks.map((d, i) => {
          const idx = data.indexOf(d);
          return <text key={i} x={toX(idx)} y={H - 4} fontFamily="monospace" fontSize="8" fill={COLORS.MUTED} textAnchor="middle">{d.dateStr?.slice(5) ?? ""}</text>;
        })}
        {tooltip && (
          <line x1={tooltip.x} x2={tooltip.x} y1={PAD.top} y2={PAD.top + chartH}
            stroke={COLORS.ACCENT} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
        )}
      </svg>
      {tooltip && (() => {
        const d = tooltip.d, bull = d.close >= d.open;
        const chg = ((d.close - d.open) / d.open * 100);
        return (
          <div style={{ position: "absolute", top: 4, left: 10, background: "rgba(11,15,26,0.95)", border: `1px solid ${COLORS.BORDER2}`, borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: 11, pointerEvents: "none", zIndex: 10, minWidth: 160 }}>
            <div style={{ color: COLORS.ACCENT, marginBottom: 6, fontSize: 11, letterSpacing: 1 }}>{d.dateStr}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 12px" }}>
              {[["O", d.open, COLORS.TEXT], ["H", d.high, COLORS.GREEN], ["L", d.low, COLORS.RED], ["C", d.close, bull ? COLORS.GREEN : COLORS.RED]].map(([k, v, c]) => (
                <div key={k as string} style={{ color: COLORS.MUTED }}>{k as string} <span style={{ color: c as string }}>${((v as number) ?? 0).toFixed(2)}</span></div>
              ))}
            </div>
            <div style={{ marginTop: 5, color: bull ? COLORS.GREEN : COLORS.RED, fontSize: 10 }}>{bull ? "▲" : "▼"} {(Math.abs(chg || 0)).toFixed(2)}%</div>
          </div>
        );
      })()}
      <div style={{ display: "flex", gap: 14, marginTop: 6, paddingLeft: 8, flexWrap: "wrap" }}>
        {maPeriods.map((p, i) => maVis[i] && (
          <span key={p} style={{ fontFamily: "monospace", fontSize: 9, color: maColors[i % maColors.length], display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 12, height: 2, background: maColors[i % maColors.length], display: "inline-block" }} /> MA {p}
          </span>
        ))}
      </div>
    </div>
  );
});

export const VolumeChart = React.memo(({ data, height = 60 }: { data: StockDataPoint[], height?: number }) => {
  if (!data || data.length === 0) return null;
  const W = 900, H = height, PAD = { top: 4, right: 62, bottom: 16, left: 8 };
  const chartW = W - PAD.left - PAD.right, chartH = H - PAD.top - PAD.bottom;
  const maxVol = Math.max(...data.map(d => d.volume || 0));
  const barW = Math.max(1, chartW / data.length * 0.7);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <text x={PAD.left + chartW + 6} y={PAD.top + 8} fontFamily="monospace" fontSize="8" fill={COLORS.MUTED}>VOL</text>
      {data.map((d, i) => {
        const bull = d.close >= d.open;
        const x = PAD.left + (i / (data.length - 1)) * chartW;
        const barH = Math.max(1, ((d.volume || 0) / maxVol) * chartH);
        return <rect key={i} x={x - barW / 2} y={PAD.top + chartH - barH} width={barW} height={barH}
          fill={bull ? COLORS.GREEN : COLORS.RED} opacity="0.45" rx="0.5" />;
      })}
    </svg>
  );
});
