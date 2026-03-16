import React, { useState, useEffect, useCallback, useMemo } from "react";
import { COLORS, WATCHLIST_SYMBOLS } from "../core/config/constants";
import { Sidebar } from "./components/sidebar";
import { CandlestickChart, VolumeChart } from "./components/charts";
import { ForecastLineChart } from "./components/forecast_chart";
import { GaugeMeter, MiniArc, FactorBar } from "./components/gauges";
import { Ticker } from "./components/ticker";
import { DashboardHeader } from "./components/DashboardHeader";
import { MetricCards } from "./components/MetricCards";
import { useMarketData } from "./hooks/useMarketData";
import { useAnalysis } from "./hooks/useAnalysis";
import { stockService } from "../api/services/stock_service";

export default function App() {
  const [symbol, setSymbol] = useState("GOOG");
  const [forecastDays, setForecastDays] = useState(7);
  const [tab, setTab] = useState("overview");
  const [range, setRange] = useState(60);
  const [maVis, setMaVis] = useState<{ [key: number]: boolean }>({ 0: true, 1: true, 2: true });
  const [clock, setClock] = useState("");
  const [toast, setToast] = useState<{ msg: string, type: string } | null>(null);

  const { livePrice, watchlist, trending, fetchLiveQuote } = useMarketData(symbol);
  const { loading, error, result, barMounted, runAnalysis } = useAnalysis();

  const showToast = useCallback((msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Clock
  useEffect(() => {
    const t = setInterval(() => {
      const n = new Date();
      setClock(n.toLocaleTimeString("en-US", { hour12: false }) + " UTC" + (n.getTimezoneOffset() > 0 ? "-" : "+") + Math.abs(n.getTimezoneOffset() / 60));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleAnalysis = useCallback(async (sym = symbol, days = forecastDays) => {
    await runAnalysis(sym, days, () => {
      fetchLiveQuote(sym);
      showToast(`✓ ${sym} analysis complete`);
    });
  }, [symbol, forecastDays, runAnalysis, fetchLiveQuote, showToast]);

  useEffect(() => {
    const init = async () => {
      try {
        await stockService.getHealth();
      } catch (e) {
        console.warn("Server health check failed");
      }
      handleAnalysis(symbol, forecastDays);
    };
    init();
  }, []);

  const maPeriods = useMemo(() => 
    range === 60 ? [5, 10, 20] : range === 126 ? [10, 20, 50] : range === 252 ? [20, 50, 100] : [50, 100, 200],
  [range]);

  return (
    <div style={{ background: COLORS.BG, color: COLORS.TEXT, minHeight: "100vh", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: `linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)`, backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0 }} />

      {loading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(5,8,16,0.85)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <div style={{ width: 56, height: 56, border: `3px solid ${COLORS.BORDER2}`, borderTopColor: COLORS.ACCENT, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes blink{0%,100%{opacity:1} 50%{opacity:0.4}}`}</style>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200, background: COLORS.CARD, border: `1px solid ${toast.type === "error" ? COLORS.RED : COLORS.GREEN}33`, borderRadius: 10, padding: "14px 20px", fontFamily: "monospace", fontSize: 12, color: toast.type === "error" ? COLORS.RED : COLORS.GREEN, maxWidth: 340, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          {toast.msg}
        </div>
      )}

      <DashboardHeader livePrice={livePrice} result={result} clock={clock} />

      <Ticker items={trending} />

      <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, padding: "20px 20px", maxWidth: 1400, margin: "0 auto" }}>
        <Sidebar
          symbol={symbol} setSymbol={setSymbol}
          forecastDays={forecastDays} setForecastDays={setForecastDays}
          maVis={maVis} setMaVis={setMaVis}
          maPeriods={maPeriods}
          loading={loading} runAnalysis={handleAnalysis}
          watchlist={watchlist} metrics={result ? result.metrics : null}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          {result && <MetricCards result={result} livePrice={livePrice} />}

          <div style={{ background: COLORS.CARD, border: `1px solid ${COLORS.BORDER}`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.BORDER}`, marginBottom: 20 }}>
              {[["overview", "📊 Overview"], ["forecast", "🔮 Forecast"], ["signal", "💡 Signal"]].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "11px 18px", cursor: "pointer", border: "none", background: "transparent", color: tab === id ? COLORS.ACCENT : COLORS.MUTED, borderBottom: `2px solid ${tab === id ? COLORS.ACCENT : "transparent"}`, marginBottom: -1 }}>
                  {label}
                </button>
              ))}
            </div>

            {tab === "overview" && result && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{result.sym} — Candlestick Chart</div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: COLORS.MUTED }}>OHLC candles with volume</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[[60, "3M"], [126, "6M"], [252, "1Y"], [0, "ALL"]].map(([d, l]) => (
                      <button key={l as string} onClick={() => setRange(d as number)} style={{ fontFamily: "monospace", fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${range === d ? COLORS.ACCENT : COLORS.BORDER2}`, background: range === d ? "rgba(0,229,255,0.1)" : "transparent", color: range === d ? COLORS.ACCENT : COLORS.MUTED }}>
                        {l as string}
                      </button>
                    ))}
                  </div>
                </div>
                <CandlestickChart data={range === 0 ? result.data : result.data.slice(-range)} closes={result.closes} maVis={maVis} maPeriods={maPeriods} height={300} />
                <VolumeChart data={range === 0 ? result.data : result.data.slice(-range)} height={56} />
              </div>
            )}

            {!loading && error && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📉</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.RED, marginBottom: 12 }}>Analysis Failed</div>
                <div style={{ fontFamily: "monospace", fontSize: 13, color: COLORS.MUTED, maxWidth: 500, lineHeight: 1.6, marginBottom: 24 }}>
                  {error}
                </div>
                <button 
                  onClick={() => handleAnalysis(symbol, forecastDays)}
                  style={{ background: COLORS.SURFACE, border: `1px solid ${COLORS.BORDER2}`, color: COLORS.ACCENT, padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}
                >
                  Retry Analysis
                </button>
              </div>
            )}

            {!loading && !result && !error && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center", color: COLORS.MUTED }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Select a stock to begin analysis</div>
              </div>
            )}

            {tab === "forecast" && result && (
              <ForecastLineChart data={result.data} closes={result.closes} preds={result.preds} upper={result.upper} lower={result.lower} futureDates={result.futureDates} maVis={maVis} maPeriods={maPeriods} height={340} />
            )}

            {tab === "signal" && result && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div style={{ background: COLORS.SURFACE, border: `1px solid ${COLORS.BORDER}`, borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <GaugeMeter score={result.signal.bulls} signal={result.signal.signal} />
                    <div style={{ marginTop: 8, padding: "14px 28px", borderRadius: 12, fontWeight: 800, fontSize: 24, color: result.signal.signal === "BUY" ? COLORS.GREEN : result.signal.signal === "SELL" ? COLORS.RED : COLORS.GOLD }}>
                      {result.signal.signal}
                    </div>
                  </div>
                  <div style={{ background: COLORS.SURFACE, border: `1px solid ${COLORS.BORDER}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {result.signal.factors.map((f, i) => (
                        <MiniArc key={f.name} factor={f} delay={i * 0.15} />
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {result.signal.factors.map((f, i) => {
                    const pcts = [
                      Math.min(100, Math.max(0, 50 + result.signal.fcastPct * 15)), 
                      f.bullish ? 75 : 25, 
                      Math.min(100, Math.max(0, 50 + parseFloat(f.value) * 8)), 
                      parseFloat(f.value)
                    ];
                    return (
                      <FactorBar key={f.name} factor={f} pct={pcts[i] || 50} mounted={barMounted} />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
