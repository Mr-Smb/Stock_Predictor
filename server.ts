import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", provider: "yahoo-finance2" });
  });

  app.get("/api/history", async (req, res) => {
    const symbol = (req.query.symbol as string || "AAPL").toUpperCase();
    const period = (req.query.period as string || "2y");
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      if (period.endsWith('y')) {
        startDate.setFullYear(endDate.getFullYear() - parseInt(period));
      } else if (period.endsWith('mo')) {
        startDate.setMonth(endDate.getMonth() - parseInt(period));
      } else {
        startDate.setFullYear(endDate.getFullYear() - 2); // Default 2y
      }

      const queryOptions = {
        period1: startDate,
        period2: endDate,
        interval: '1d' as const,
      };

      const result = await yahooFinance.chart(symbol, queryOptions);
      const quote = await yahooFinance.quote(symbol);

      if (!result || !result.quotes) {
        return res.status(404).json({ error: `No data for ${symbol}` });
      }

      const data = result.quotes.map((row) => ({
        date: row.date ? row.date.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        volume: row.volume,
      })).filter((row) => row.close !== null && row.close !== undefined);

      res.json({
        symbol,
        currency: quote.currency || "USD",
        name: quote.longName || symbol,
        exchange: quote.exchange || "",
        data,
        source: "yahoo-finance2"
      });
    } catch (error: any) {
      console.error(`Error fetching history for ${symbol}:`, error);
      
      if (error.name === 'YahooFinanceError') {
        return res.status(400).json({ 
          error: `Yahoo Finance API error for ${symbol}. Please verify the ticker symbol.`,
          details: error.message 
        });
      }
      
      if (error.message && (error.message.includes('Not Found') || error.message.includes('404'))) {
        return res.status(404).json({ 
          error: `Stock symbol '${symbol}' not found.`,
          details: "The symbol might be delisted or incorrect."
        });
      }

      res.status(500).json({ 
        error: `Failed to fetch market data for ${symbol}.`,
        details: error.message 
      });
    }
  });

  app.get(["/api/quote", "/api/live"], async (req, res) => {
    const symbol = (req.query.symbol as string || "AAPL").toUpperCase();
    try {
      const quote = await yahooFinance.quote(symbol);
      
      if (!quote || quote.regularMarketPrice === undefined) {
        return res.status(404).json({ error: `Live quote not available for ${symbol}` });
      }

      res.json({
        symbol,
        price: quote.regularMarketPrice,
        open: quote.regularMarketOpen,
        high: quote.regularMarketDayHigh,
        low: quote.regularMarketDayLow,
        prevClose: quote.regularMarketPreviousClose,
        change: quote.regularMarketChange,
        changePct: quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume,
        week52High: quote.fiftyTwoWeekHigh,
        week52Low: quote.fiftyTwoWeekLow,
        timestamp: new Date().toISOString(),
        source: "yahoo-finance2",
      });
    } catch (error: any) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      
      if (error.message && (error.message.includes('Not Found') || error.message.includes('404'))) {
        return res.status(404).json({ error: `Stock symbol '${symbol}' not found.` });
      }

      res.status(500).json({ 
        error: `Failed to fetch live quote for ${symbol}.`,
        details: error.message 
      });
    }
  });

  app.get("/api/watchlist", async (req, res) => {
    const symbolsStr = (req.query.symbols as string || "AAPL,MSFT,NVDA,TSLA,META");
    const symbols = symbolsStr.split(",").map(s => s.trim().toUpperCase()).slice(0, 15);
    
    try {
      // yahoo-finance2 supports passing an array of symbols to quote()
      const results = await yahooFinance.quote(symbols);
      
      const quotes = results.map((q) => ({
        symbol: q.symbol,
        price: q.regularMarketPrice,
        changePct: q.regularMarketChangePercent,
        change: q.regularMarketChange,
      }));
      
      res.json({ quotes });
    } catch (error: any) {
      console.error("Watchlist fetch failed:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/trending", async (req, res) => {
    try {
      // Specific major indices from the user's request/image + global benchmarks
      const majorIndices = [
        { symbol: "^BSESN", name: "SENSEX" },
        { symbol: "^NSEI", name: "NIFTY 50" },
        { symbol: "^GSPC", name: "S&P 500" },
        { symbol: "^IXIC", name: "NASDAQ" },
        { symbol: "^DJI", name: "DOW 30" },
        { symbol: "^FTSE", name: "FTSE 100" },
        { symbol: "^N225", name: "NIKKEI 225" }
      ];

      // Fetch trending symbols to add variety
      const trending = await yahooFinance.trendingSymbols("US");
      const trendingSymbols = trending.quotes.map((q: any) => q.symbol).slice(0, 5);
      
      const allSymbols = [...majorIndices.map(i => i.symbol), ...trendingSymbols];
      const results = await yahooFinance.quote(allSymbols);
      
      const quotes = results.map((q) => {
        const indexMatch = majorIndices.find(i => i.symbol === q.symbol);
        return {
          symbol: q.symbol,
          name: indexMatch ? indexMatch.name : q.symbol,
          price: q.regularMarketPrice,
          change: q.regularMarketChange,
          changePct: q.regularMarketChangePercent,
        };
      });
      
      res.json({ quotes });
    } catch (error: any) {
      console.error("Market data fetch failed:", error);
      res.status(500).json({ error: "Failed to fetch real-time market data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
