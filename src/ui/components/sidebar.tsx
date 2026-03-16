import React from 'react';
import { COLORS, STOCKS } from '../../core/config/constants';
import { Metrics, WatchlistItem } from '../../api/types/market_types';

interface SidebarProps {
  symbol: string;
  setSymbol: (s: string) => void;
  forecastDays: number;
  setForecastDays: (d: number) => void;
  maVis: { [key: number]: boolean };
  setMaVis: React.Dispatch<React.SetStateAction<{ [key: number]: boolean }>>;
  maPeriods: number[];
  loading: boolean;
  runAnalysis: (s: string, d: number) => void;
  watchlist: WatchlistItem[];
  metrics: Metrics | null;
}

export const Sidebar = React.memo(({
  symbol, setSymbol, forecastDays, setForecastDays, maVis, setMaVis, maPeriods, loading, runAnalysis, watchlist, metrics
}: SidebarProps) => {
  const s = {
    card: { background: COLORS.CARD, border: `1px solid ${COLORS.BORDER}`, borderRadius: 12, padding: 20 },
    cardTitle: { fontFamily: "monospace", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: COLORS.MUTED, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 },
    label: { fontFamily: "monospace", fontSize: 11, color: COLORS.MUTED, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 },
  };

  const maColors = ["#f6ad55", "#fc8181", "#4682b4"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={s.card}>
        <div style={s.cardTitle}><span style={{ display: "inline-block", width: 3, height: 12, background: COLORS.ACCENT, borderRadius: 2 }} />Configuration</div>

        <label style={s.label}>Stock Symbol</label>
        <select value={symbol} onChange={e => setSymbol(e.target.value)}
          style={{ width: "100%", background: COLORS.SURFACE, border: `1px solid ${COLORS.BORDER2}`, borderRadius: 8, color: COLORS.TEXT, fontFamily: "monospace", fontSize: 12, padding: "9px 12px", outline: "none", marginBottom: 14, cursor: "pointer" }}>
          {STOCKS.map(st => <option key={st.sym} value={st.sym}>{st.sym} — {st.name}</option>)}
        </select>

        <label style={s.label}>Forecast Days: <span style={{ color: COLORS.ACCENT }}>{forecastDays}</span></label>
        <input type="range" min="1" max="14" value={forecastDays} onChange={e => setForecastDays(+e.target.value)}
          style={{ width: "100%", marginBottom: 14, accentColor: COLORS.ACCENT }} />

        <hr style={{ border: "none", borderTop: `1px solid ${COLORS.BORDER}`, margin: "4px 0 14px" }} />

        <label style={s.label}>Moving Averages</label>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {maPeriods.map((n, i) => (
            <button key={i} onClick={() => setMaVis(v => ({ ...v, [i]: !v[i] }))}
              style={{ fontFamily: "monospace", fontSize: 11, padding: "5px 10px", borderRadius: 20, cursor: "pointer", border: `1px solid ${maColors[i % maColors.length]}`, background: maVis[i] ? `${maColors[i % maColors.length]}22` : "transparent", color: maVis[i] ? maColors[i % maColors.length] : COLORS.MUTED, transition: "all 0.15s" }}>
              MA {n}
            </button>
          ))}
        </div>

        <button onClick={() => runAnalysis(symbol, forecastDays)} disabled={loading}
          style={{ width: "100%", background: `linear-gradient(135deg,${COLORS.ACCENT},${COLORS.ACCENT2})`, color: "#000", fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", padding: 12, border: "none", borderRadius: 8, cursor: "pointer", boxShadow: `0 4px 20px rgba(0,229,255,0.25)`, opacity: loading ? 0.5 : 1, transition: "all 0.15s" }}>
          ⚡ Analyze Stock
        </button>
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}><span style={{ display: "inline-block", width: 3, height: 12, background: COLORS.ACCENT, borderRadius: 2 }} />Quick Watchlist</div>
        {watchlist.map(w => (
          <div key={w.sym} onClick={() => setSymbol(w.sym)}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 10px", borderRadius: 8, cursor: "pointer", border: `1px solid ${w.sym === symbol ? "rgba(0,229,255,0.3)" : COLORS.BORDER}`, background: w.sym === symbol ? "rgba(0,229,255,0.07)" : "transparent", marginBottom: 4, transition: "all 0.15s" }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{w.sym}</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: COLORS.MUTED }}>${(w.price ?? 0).toFixed(2)}</div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: w.chg >= 0 ? COLORS.GREEN : COLORS.RED }}>{w.chg >= 0 ? "▲" : "▼"}{(Math.abs(w.chg || 0)).toFixed(2)}%</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
});
