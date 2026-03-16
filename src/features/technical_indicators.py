"""Technical signals port from JS."""
import numpy as np
from typing import Dict, List, Any
from src.utils.logger import get_logger

logger = get_logger(__name__)

def moving_average(arr: np.ndarray, n: int) -> np.ndarray:
    if len(arr) < n:
        return np.full(len(arr), np.nan)
    result = np.full(len(arr), np.nan)
    sum_val = 0.0
    for i in range(len(arr)):
        sum_val += arr[i]
        if i >= n:
            sum_val -= arr[i - n]
        if i >= n - 1:
            result[i] = sum_val / n
    return result

def compute_signal(closes: np.ndarray, preds: List[float]) -> Dict[str, Any]:
    """Port JS computeSignal."""
    last = closes[-1]
    pred1 = preds[0]
    fcast_pct = (pred1 - last) / last * 100
    ma50 = np.mean(closes[-50:])
    ma200_len = min(200, len(closes))
    ma200 = np.mean(closes[-ma200_len:])
    mom5 = np.mean(closes[-5:])
    mom20 = np.mean(closes[-20:])
    hi52 = np.max(closes[-252:])
    lo52 = np.min(closes[-252:])
    pos52 = (last - lo52) / (hi52 - lo52) * 100
    
    factors = [
        {
            "name": "LSTM Forecast",
            "value": f'{fcast_pct:.2f}%' if fcast_pct >= 0 else f'-{abs(fcast_pct):.2f}%',
            "bullish": fcast_pct > 0
        },
        {
            "name": "MA 50/200",
            "value": "Golden Cross" if ma50 > ma200 else "Death Cross",
            "bullish": ma50 > ma200
        },
        {
            "name": "Momentum",
            "value": f'{((mom5/mom20 - 1)*100):.2f}%',
            "bullish": mom5 > mom20
        },
        {
            "name": "52W Position",
            "value": f'{pos52:.1f}%',
            "bullish": pos52 < 70
        },
    ]
    bulls = sum(1 for f in factors if f["bullish"])
    signal = "BUY" if bulls >= 3 else "SELL" if bulls <= 1 else "HOLD"
    return {"signal": signal, "factors": factors, "fcast_pct": fcast_pct, "bulls": bulls}

def compute_metrics(closes: np.ndarray) -> Dict[str, float]:
    """Port JS computeMetrics."""
    from src.models.lstm_model import heuristic_forecast
    n = min(80, len(closes) - 1)
    actual = closes[-n:]
    errors = []
    rel_errors = []
    correct = 0
    for i in range(10, len(actual)):
        window = actual[:i]
        pred, _, _, _ = heuristic_forecast(window, 1)
        err = abs(pred[0] - actual[i])
        errors.append(err ** 2)
        rel_errors.append(err / actual[i])
        if (pred[0] > actual[i - 1]) == (actual[i] > actual[i - 1]):
            correct += 1
    rmse = np.sqrt(np.mean(errors))
    mape = np.mean(rel_errors) * 100
    acc = (correct / len(errors)) * 100
    mean = np.mean(actual)
    ss_res = np.sum(errors)
    ss_tot = np.sum((actual - mean) ** 2)
    r2 = max(0, 1 - ss_res / ss_tot)
    return {"rmse": rmse, "mape": mape, "accuracy": acc, "r2": r2}

