import React, { useState, useRef, useEffect } from 'react';
import { COLORS } from '../../core/config/constants';
import { movingAvg } from '../../ml/signals/technical_analysis';
import { StockDataPoint } from '../../api/types/market_types';

interface ForecastLineChartProps {
  data: StockDataPoint[];
  closes: number[];
  preds: number[];
  upper: number[];
  lower: number[];
  futureDates: string[];
  maVis: { [key: number]: boolean };
  maPeriods: number[];
  height?: number;
}

export const ForecastLineChart = React.memo(({ data, closes, preds, upper, lower, futureDates, maVis, maPeriods, height = 340 }: ForecastLineChartProps) => {
  const [tooltip, setTooltip] = useState<any>(null);
  if (!data || !preds) return null;

  const W = 900, H = height;
  const PAD = { top: 16, right: 64, bottom: 28, left: 10 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const { allData, totalLen, histData } = React.useMemo(() => {
    const hist = data.map((d, i) => ({ date: d.dateStr?.slice(5) ?? "", close: d.close, idx: i }));
    const future = preds.map((p, i) => ({ date: futureDates[i], close: null, forecast: p, upper: upper[i], lower: lower[i], idx: hist.length + i }));
    const all = [...hist, ...future];
    return { allData: all, totalLen: all.length, histData: hist };
  }, [data, preds, futureDates, upper, lower]);

  const mas = React.useMemo(() => {
    const extendMA = (arr: (number | null)[]) => {
      const last = arr[arr.length - 1];
      const prev = arr.filter(v => v !== null) as number[];
      const slope = prev.length >= 2 ? (prev[prev.length - 1] - prev[prev.length - 10 < 0 ? 0 : prev.length - 10]) / Math.min(10, prev.length - 1) : 0;
      return [...arr, ...preds.map((_, i) => +(last! + slope * (i + 1)).toFixed(4))];
    };
    return maPeriods.map(p => extendMA(movingAvg(closes, p)));
  }, [closes, maPeriods, preds]);

  const maColors = ["#f6ad55", "#fc8181", "#4682b4"];

  const { yMin, yMax } = React.useMemo(() => {
    const allPrices = [
      ...data.map(d => d.close),
      ...preds, ...upper, ...lower,
      ...mas.flatMap((ma, i) => maVis[i] ? ma.filter(v => v !== null) as number[] : [])
    ];
    const priceMin = Math.min(...allPrices), priceMax = Math.max(...allPrices);
    const pPad = (priceMax - priceMin) * 0.06;
    return { yMin: priceMin - pPad, yMax: priceMax + pPad };
  }, [data, preds, upper, lower, mas, maVis]);

  const toX = (i: number) => PAD.left + (i / (totalLen - 1)) * chartW;
  const toY = (v: number) => PAD.top + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

  const buildPath = (vals: (number | null)[], offset = 0) => {
    let d = "", started = false;
    vals.forEach((v, i) => {
      if (v === null) { started = false; return; }
      const x = toX(i + offset), y = toY(v);
      if (!started) { d += `M${x},${y}`; started = true; }
      else d += `L${x},${y}`;
    });
    return d;
  };

  const lastHistClose = data[data.length - 1].close;
  const forecastVals = [lastHistClose, ...preds];
  const forecastPath = buildPath(forecastVals, histData.length - 1);

  const yTicks = 6;
  const yTickVals = Array.from({ length: yTicks }, (_, i) => yMin + (yMax - yMin) * i / (yTicks - 1));
  const xStep = Math.max(1, Math.floor(totalLen / 8));
  const xTickIdxs = allData.filter((_, i) => i % xStep === 0 || i === totalLen - 1).map(d => allData.indexOf(d));
  const divX = toX(histData.length - 1);

  return (
    <div style={{ position: "relative" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}
        onMouseMove={e => {
          const svg = e.currentTarget;
          const rect = svg.getBoundingClientRect();
          const scaleX = W / rect.width;
          const mx = (e.clientX - rect.left) * scaleX - PAD.left;
          const idx = Math.round((mx / chartW) * (totalLen - 1));
          if (idx >= 0 && idx < totalLen) setTooltip({ idx, x: toX(idx) });
        }}
        onMouseLeave={() => setTooltip(null)}>

        {yTickVals.map((v, i) => (
          <line key={i} x1={PAD.left} x2={PAD.left + chartW} y1={toY(v)} y2={toY(v)}
            stroke={COLORS.BORDER} strokeWidth="0.6" strokeDasharray="4 4" />
        ))}

        <rect x={divX} y={PAD.top} width={PAD.left + chartW - divX} height={chartH}
          fill="rgba(255,209,102,0.03)" rx="0" />

        {maPeriods.map((p, i) => maVis[i] && <path key={p} d={buildPath(mas[i])} fill="none" stroke={maColors[i % maColors.length]} strokeWidth="2" opacity="1" />)}

        <path d={buildPath(data.map(d => d.close))} fill="none" stroke={COLORS.GREEN} strokeWidth="2.5" opacity="1" />

        <path d={forecastPath} fill="none" stroke="#ff6b6b" strokeWidth="2.5" />

        <line x1={divX} x2={divX} y1={PAD.top} y2={PAD.top + chartH}
          stroke={COLORS.GOLD} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
        <text x={divX + 4} y={PAD.top + 10} fontFamily="monospace" fontSize="8" fill={COLORS.GOLD} opacity="0.7">FORECAST →</text>

        {yTickVals.map((v, i) => (
          <text key={i} x={PAD.left + chartW + 6} y={toY(v) + 4}
            fontFamily="monospace" fontSize="9" fill={COLORS.MUTED}>${(v ?? 0).toFixed(0)}</text>
        ))}

        {xTickIdxs.map((idx, i) => (
          <text key={i} x={toX(idx)} y={H - 6}
            fontFamily="monospace" fontSize="8" fill={COLORS.MUTED} textAnchor="middle">
            {allData[idx]?.date}
          </text>
        ))}

        {tooltip && (
          <line x1={tooltip.x} x2={tooltip.x} y1={PAD.top} y2={PAD.top + chartH}
            stroke={COLORS.ACCENT} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
        )}
      </svg>

      {tooltip && (() => {
        const d = allData[tooltip.idx];
        const isHist = tooltip.idx < histData.length;
        const val = isHist ? data[tooltip.idx]?.close : preds[tooltip.idx - histData.length];
        const upVal = !isHist ? upper[tooltip.idx - histData.length] : null;
        const loVal = !isHist ? lower[tooltip.idx - histData.length] : null;
        if (!val) return null;
        return (
          <div style={{ position: "absolute", top: 8, left: 14, background: "rgba(11,15,26,0.96)", border: `1px solid ${COLORS.BORDER2}`, borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: 11, pointerEvents: "none", zIndex: 10, minWidth: 170 }}>
            <div style={{ color: COLORS.ACCENT, marginBottom: 6, fontSize: 10, letterSpacing: 1 }}>{d?.date} · {isHist ? "HISTORICAL" : "FORECAST"}</div>
            <div style={{ color: isHist ? COLORS.GREEN : "#ff6b6b", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>${(val ?? 0).toFixed(2)}</div>
            {upVal && <div style={{ color: COLORS.MUTED, fontSize: 10 }}>Band: ${(loVal ?? 0).toFixed(2)} – ${(upVal ?? 0).toFixed(2)}</div>}
          </div>
        );
      })()}

      <div style={{ display: "flex", gap: 14, marginTop: 8, paddingLeft: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "monospace", fontSize: 9, color: COLORS.GREEN, display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 16, height: 2, background: COLORS.GREEN, display: "inline-block" }} />Close</span>
        {maPeriods.map((p, i) => maVis[i] && (
          <span key={p} style={{ fontFamily: "monospace", fontSize: 9, color: maColors[i % maColors.length], display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 16, height: 2, background: maColors[i % maColors.length], display: "inline-block" }} />MA {p}
          </span>
        ))}
        <span style={{ fontFamily: "monospace", fontSize: 9, color: "#ff6b6b", display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 16, height: 2, background: "#ff6b6b", display: "inline-block" }} />Forecast</span>
      </div>
    </div>
  );
});
