"""Model evaluation."""
import torch
from src.models.lstm_model import LSTMForecaster, heuristic_forecast
from src.utils.config_loader import load_config
from src.utils.logger import get_logger
from src.features.technical_indicators import compute_metrics
import numpy as np

logger = get_logger(__name__)

def evaluate_model(closes: np.ndarray, model_path: str = "experiments/models/lstm_forecaster.pt"):
    """Evaluate using backtest."""
    metrics = compute_metrics(closes)
    logger.info(f"Metrics - RMSE: {metrics['rmse']:.4f}, MAPE: {metrics['mape']:.2f}%, Acc: {metrics['accuracy']:.1f}%")
    return metrics

