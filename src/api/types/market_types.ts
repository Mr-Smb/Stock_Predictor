export interface StockDataPoint {
  date: Date;
  dateStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Quote {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  change: number;
  changePct: number;
  volume: number;
  week52High: number;
  week52Low: number;
  timestamp: string;
  source: string;
}

export interface WatchlistItem {
  sym: string;
  price: number;
  chg: number;
}

export interface Factor {
  name: string;
  icon: string;
  value: string;
  bullish: boolean;
  raw: number;
  range: [number, number];
}

export interface Signal {
  signal: "BUY" | "SELL" | "HOLD";
  factors: Factor[];
  fcastPct: number;
  bulls: number;
}

export interface Metrics {
  acc: number;
  rmse: number;
  mape: number;
  r2: number;
}

export interface AnalysisResult {
  sym: string;
  data: StockDataPoint[];
  closes: number[];
  preds: number[];
  upper: number[];
  lower: number[];
  signal: Signal;
  metrics: Metrics;
  last: StockDataPoint;
  prev: StockDataPoint;
  chgPct: number;
  hi52: number;
  lo52: number;
  futureDates: string[];
  days: number;
}
