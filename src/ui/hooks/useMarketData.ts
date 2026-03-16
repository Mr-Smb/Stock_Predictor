import { useState, useEffect, useRef } from "react";
import { stockService } from "../../api/services/stock_service";
import { Quote, WatchlistItem } from "../../api/types/market_types";
import { WATCHLIST_SYMBOLS } from "../../core/config/constants";

export function useMarketData(symbol: string) {
  const [livePrice, setLivePrice] = useState<Quote | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const watchlistPollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLiveQuote = async (sym: string) => {
    try {
      const q = await stockService.getQuote(sym);
      setLivePrice(q);
      setLastRefresh(new Date());
    } catch (e) {
      console.warn("Live quote fetch failed", e);
    }
  };

  const fetchWatchlist = async () => {
    try {
      const wlRes = await stockService.getWatchlist(WATCHLIST_SYMBOLS);
      setWatchlist(wlRes.quotes.map((q: any) => ({
        sym: q.symbol,
        price: q.price,
        chg: q.changePct
      })));
    } catch (e) {
      console.error("Watchlist fetch failed", e);
    }
  };

  const fetchTrending = async () => {
    try {
      const res = await stockService.getTrending();
      setTrending(res.quotes || []);
    } catch (e) {
      console.warn("Trending fetch failed", e);
    }
  };

  // Polling for live quote
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (symbol) {
      fetchLiveQuote(symbol);
      pollingRef.current = setInterval(() => fetchLiveQuote(symbol), 10000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [symbol]);

  // Polling for watchlist
  useEffect(() => {
    fetchWatchlist();
    watchlistPollingRef.current = setInterval(fetchWatchlist, 30000);
    return () => {
      if (watchlistPollingRef.current) clearInterval(watchlistPollingRef.current);
    };
  }, []);

  // Polling for trending stocks
  useEffect(() => {
    fetchTrending();
    const t = setInterval(fetchTrending, 180000);
    return () => clearInterval(t);
  }, []);

  return { livePrice, watchlist, trending, lastRefresh, fetchLiveQuote };
}
