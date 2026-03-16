"""Inference."""
import yfinance as yf
import numpy as np
from typing import Dict, List
from src.models.lstm_model import heuristic_forecast
from src.features.technical_indicators import compute_signal
from src.utils.logger import get_logger

logger = get_logger(__name__)

def predict(symbol: str, days: int = 7) -> Dict:
    """Generate prediction."""
    # Fetch real data
    ticker = yf.Ticker(symbol.upper())
    hist = ticker.history(period="2y")
    if hist.empty:
        raise ValueError(f"No data for {symbol}")
    closes = hist['Close'].values
    
    preds, upper, lower, vol = heuristic_forecast(closes, days)
    signal = compute_signal(closes, preds)
    
    logger.info(f"Prediction for {symbol}: {signal['signal']}")
    return {
        "symbol": symbol,
        "predictions": preds,
        "upper": upper,
        "lower": lower,
        "volatility": vol,
        "signal": signal
    }

