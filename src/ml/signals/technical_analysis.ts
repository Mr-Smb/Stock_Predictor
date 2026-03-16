import { Metrics, Signal, Factor } from "../../api/types/market_types";
import { lstmPredict } from "../models/lstm_model";

export function movingAvg(arr: number[], n: number) {
  if (arr.length < n) return arr.map(() => null);
  
  const result: (number | null)[] = new Array(arr.length).fill(null);
  let sum = 0;
  
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    if (i >= n) {
      sum -= arr[i - n];
    }
    if (i >= n - 1) {
      result[i] = sum / n;
    }
  }
  
  return result;
}

export function computeSignal(closes: number[], preds: number[]): Signal {
  const last = closes[closes.length-1], pred1=preds[0];
  const fcastPct = (pred1-last)/last*100;
  const ma50 = closes.slice(-50).reduce((a,b)=>a+b,0)/50;
  const ma200len = Math.min(200,closes.length);
  const ma200 = closes.slice(-ma200len).reduce((a,b)=>a+b,0)/ma200len;
  const mom5 = closes.slice(-5).reduce((a,b)=>a+b,0)/5;
  const mom20 = closes.slice(-20).reduce((a,b)=>a+b,0)/20;
  const hi52=Math.max(...closes.slice(-252)), lo52=Math.min(...closes.slice(-252));
  const pos52 = (last-lo52)/(hi52-lo52)*100;
  
  const factors: Factor[] = [
    { name:"LSTM Forecast",  icon:"🤖", value:`${fcastPct>=0?"+":""}${fcastPct.toFixed(2)}%`, bullish:fcastPct>0, raw:fcastPct, range:[-3,3] },
    { name:"MA 50/200",      icon:"📊", value:ma50>ma200?"Golden Cross":"Death Cross",      bullish:ma50>ma200, raw:ma50>ma200?2:-2, range:[-3,3] },
    { name:"Momentum",       icon:"⚡", value:`${((mom5/mom20-1)*100).toFixed(2)}%`,          bullish:mom5>mom20, raw:(mom5/mom20-1)*100, range:[-5,5] },
    { name:"52W Position",   icon:"📍", value:`${pos52.toFixed(1)}%`,                        bullish:pos52<70,   raw:pos52, range:[0,100] },
  ];
  
  const bulls = factors.filter(f=>f.bullish).length;
  return { signal: bulls>=3?"BUY":bulls<=1?"SELL":"HOLD", factors, fcastPct, bulls };
}

export function computeMetrics(closes: number[]): Metrics {
  const n = Math.min(80, closes.length - 1);
  const actual = closes.slice(-n);
  let correct = 0;
  const errors: number[] = [];
  const relErrors: number[] = [];
  for (let i = 10; i < actual.length; i++) {
    const { preds } = lstmPredict(actual.slice(0, i), 1);
    const err = Math.abs(preds[0] - actual[i]);
    errors.push(err * err);
    relErrors.push(err / actual[i]);
    if ((preds[0] > actual[i - 1]) === (actual[i] > actual[i - 1])) correct++;
  }
  const n2 = errors.length;
  const rmse = Math.sqrt(errors.reduce((a, b) => a + b, 0) / n2);
  const mape = relErrors.reduce((a, b) => a + b, 0) / n2 * 100;
  const mean = actual.reduce((a, b) => a + b, 0) / actual.length;
  const r2 = Math.max(0, 1 - errors.reduce((a, b) => a + b, 0) / actual.reduce((s, v) => s + Math.pow(v - mean, 2), 0));
  return { acc: (correct / n2) * 100, rmse, mape, r2 };
}
