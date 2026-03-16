"""Load stock data from yfinance."""
import yfinance as yf
import pandas as pd
from pathlib import Path
from typing import List
from src.utils.logger import get_logger

logger = get_logger(__name__)

def download_stock_data(symbols: List[str], period: str = "5y", raw_path: str = "data/raw") -> pd.DataFrame:
    Path(raw_path).mkdir(parents=True, exist_ok=True)
    data = yf.download(symbols, period=period, auto_adjust=True)
    csv_path = Path(raw_path) / f"stocks_{period}.csv"
    data.to_csv(csv_path)
    logger.info(f"Downloaded data for {symbols} to {csv_path}")
    return data

def load_raw_data(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path, index_col=0, parse_dates=True)
    logger.info(f"Loaded {len(df)} rows from {csv_path}")
    return df

