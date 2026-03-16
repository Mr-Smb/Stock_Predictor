import { Quote } from "../types/market_types";

const API_BASE = "/api";

export const stockService = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getHistory(symbol: string, period: string = "2y") {
    try {
      const res = await fetch(`${API_BASE}/history?symbol=${symbol}&period=${period}`);
      if (!res.ok) {
        let errorMessage = `API Error: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          const text = await res.text();
          errorMessage = text || res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return res.json();
    } catch (e: any) {
      console.error(`Failed to fetch history for ${symbol}:`, e);
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
        throw new Error("Network error: Please check your internet connection or server status.");
      }
      throw e;
    }
  },

  async getQuote(symbol: string): Promise<Quote> {
    try {
      const res = await fetch(`${API_BASE}/live?symbol=${symbol}`);
      if (!res.ok) {
        let errorMessage = `API Error: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          const text = await res.text();
          errorMessage = text || res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return res.json();
    } catch (e: any) {
      console.warn(`Failed to fetch quote for ${symbol}:`, e);
      throw e;
    }
  },

  async getWatchlist(symbols: string[]) {
    try {
      const res = await fetch(`${API_BASE}/watchlist?symbols=${symbols.join(",")}`);
      if (!res.ok) {
        let errorMessage = `API Error: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          const text = await res.text();
          errorMessage = text || res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return res.json();
    } catch (e: any) {
      console.error("Failed to fetch watchlist:", e);
      throw e;
    }
  },

  async getTrending() {
    try {
      const res = await fetch(`${API_BASE}/trending`);
      if (!res.ok) throw new Error(`Trending API Error: ${res.status}`);
      return res.json();
    } catch (e: any) {
      console.warn("Failed to fetch trending stocks:", e);
      throw e;
    }
  }
};
