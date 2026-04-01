import { useState, useCallback } from "react";
import { stockService } from "../../api/services/stock_service";
import { AnalysisResult } from "../../api/types/market_types";
import { lstmPredict } from "ml/models/lstm_model";
import { computeSignal, computeMetrics } from "../../ml/signals/technical_analysis";

export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [barMounted, setBarMounted] = useState(false);

  const runAnalysis = useCallback(async (symbol: string, forecastDays: number, onComplete?: () => void) => {
    setLoading(true);
    setError(null);

    try {
      if (!symbol) throw new Error("Please select a valid stock symbol.");

      const historyRes = await stockService.getHistory(symbol, "2y");
      if (!historyRes.data || historyRes.data.length === 0) {
        throw new Error(`No historical data found for ${symbol}.`);
      }

      const data = historyRes.data.map((row: any) => ({
        ...row,
        date: new Date(row.date),
        dateStr: row.date
      }));
      const closes = data.map((d: any) => d.close);

      // Simulate processing time for UX
      await new Promise(r => setTimeout(r, 700));
      
      const predictions = lstmPredict(closes, forecastDays);
      const { preds, upper, lower } = predictions;

      const signal = computeSignal(closes, preds);
      const metrics = computeMetrics(closes);

      const last = data[data.length - 1];
      const prev = data[data.length - 2];
      const chgPct = (last.close - prev.close) / prev.close * 100;
      const hi52 = Math.max(...closes.slice(-252));
      const lo52 = Math.min(...closes.slice(-252));

      const lastDate = data[data.length - 1].date;
      const futureDates: string[] = [];
      for (let i = 1; i <= forecastDays; i++) {
        const d = new Date(lastDate);
        d.setDate(d.getDate() + i);
        while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
        futureDates.push(d.toISOString().slice(5, 10));
      }

      setResult({
        sym: symbol, data, closes, preds, upper, lower, signal, metrics, last, prev, chgPct, hi52, lo52,
        futureDates, days: forecastDays
      });

      if (onComplete) onComplete();

      setLoading(false);
      setBarMounted(false);
      setTimeout(() => setBarMounted(true), 100);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message);
      setLoading(false);
      setResult(null);
    }
  }, []);

  return { loading, error, result, barMounted, runAnalysis };
}
