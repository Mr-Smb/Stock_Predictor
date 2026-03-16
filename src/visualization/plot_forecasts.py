"""Plot forecasts."""
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import numpy as np
from src.utils.logger import get_logger

logger = get_logger(__name__)

def plot_forecast(closes: list, preds: list, upper: list, lower: list, symbol: str):
    fig = make_subplots(rows=1, cols=1, subplot_titles=('Price Forecast'))
    
    x_hist = list(range(len(closes)))
    x_future = list(range(len(closes), len(closes) + len(preds)))
    
    fig.add_trace(go.Scatter(x=x_hist, y=closes, name='Historical', line=dict(color='blue')), row=1, col=1)
    fig.add_trace(go.Scatter(x=x_future, y=preds, name='Forecast', line=dict(color='orange')), row=1, col=1)
    fig.add_trace(go.Scatter(x=x_future, y=upper, name='Upper', line=dict(color='green', dash='dash')), row=1, col=1)
    fig.add_trace(go.Scatter(x=x_future, y=lower, fill='tonexty', name='Lower Band', line=dict(color='red', dash='dash')), row=1, col=1)
    
    fig.update_layout(title=f'{symbol} Stock Forecast', showlegend=True)
    fig.write_html(f'experiments/{symbol}_forecast.html')
    logger.info(f"Plot saved for {symbol}")
    return f"experiments/{symbol}_forecast.html"

