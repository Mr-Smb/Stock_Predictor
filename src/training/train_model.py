"""Train LSTM model."""
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import pandas as pd
import numpy as np
from pathlib import Path
from src.data.data_loader import download_stock_data, load_raw_data
from src.features.build_features import compute_technical_indicators, scale_features
from src.models.lstm_model import LSTMForecaster
from src.utils.config_loader import load_config
from src.utils.logger import get_logger

logger = get_logger(__name__)

def create_sequences(data: np.ndarray, lookback: int) -> tuple[np.ndarray, np.ndarray]:
    X, y = [], []
    for i in range(len(data) - lookback):
        X.append(data[i:i+lookback])
        y.append(data[i+lookback])
    return np.array(X), np.array(y)

def train():
    config = load_config('configs/model.yaml')
    # Download data
    symbols = ['AAPL']
    data = download_stock_data(symbols, '5y')
    df = data['AAPL'].dropna()
    df = compute_technical_indicators(df)
    df, scaler = scale_features(df)
    
    closes_scaled = df['Close_scaled'].values
    lookback = config['lstm']['lookback_days']
    X, y = create_sequences(closes_scaled, lookback)
    
    # Train/test split
    split = int(0.8 * len(X))
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]
    
    X_train_tensor = torch.FloatTensor(X_train).unsqueeze(-1)
    y_train_tensor = torch.FloatTensor(y_train).unsqueeze(-1)
    
    dataset = TensorDataset(X_train_tensor, y_train_tensor)
    loader = DataLoader(dataset, batch_size=config['lstm']['batch_size'], shuffle=True)
    
    model = LSTMForecaster()
    optimizer = torch.optim.Adam(model.parameters(), lr=config['lstm']['learning_rate'])
    criterion = nn.MSELoss()
    
    model.train()
    for epoch in range(config['lstm']['epochs']):
        epoch_loss = 0
        for batch_x, batch_y in loader:
            optimizer.zero_grad()
            output = model(batch_x)
            loss = criterion(output, batch_y)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
        if epoch % 10 == 0:
            logger.info(f'Epoch {epoch}, Loss: {epoch_loss/len(loader):.4f}')
    
    # Save
    model_path = Path('experiments/models/lstm_forecaster.pt')
    Path(model_path.parent).mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), model_path)
    np.save(f'{model_path}.scaler.npy', scaler)
    logger.info(f'Model and scaler saved')

if __name__ == '__main__':
    train()

