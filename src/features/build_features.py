"""Feature engineering for stock forecasting."""
import pandas as pd
import numpy as np
from typing import Dict, Tuple
from src.utils.logger import get_logger

logger = get_logger(__name__)

def compute_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Compute MA, returns, vol etc."""
    closes = df['Close'].values
    highs = df['High'].values
    lows = df['Low'].values
    
    # Moving averages
    df['ma20'] = pd.Series(closes).rolling(window=20).mean()
    df['ma50'] = pd.Series(closes).rolling(window=50, min_periods=1).mean()
    df['ma200'] = pd.Series(closes).rolling(window=200, min_periods=1).mean()
    
    # Returns
    df['returns'] = df['Close'].pct_change()
    
    # Volatility
    df['volatility'] = df['returns'].rolling(window=20).std()
    
    logger.info("Technical indicators computed: MA20/50/200, returns, volatility")
    return df.dropna()

def scale_features(df: pd.DataFrame, method: str = 'minmax') -> Tuple[pd.DataFrame, Dict[str, Tuple[float, float]]]:
    """Min-max scaling."""
    scaler = {}
    for col in ['Close', 'Open', 'High', 'Low', 'Volume']:
        if method == 'minmax':
            min_val = df[col].min()
            max_val = df[col].max()
            df[col + '_scaled'] = (df[col] - min_val) / (max_val - min_val + 1e-8)
            scaler[col] = (min_val, max_val)
    logger.info("Features scaled")
    return df, scaler

