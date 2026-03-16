"""FastAPI app."""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from src.prediction.predict import predict
from src.data.data_loader import download_stock_data
from src.utils.config_loader import load_config
from src.utils.logger import get_logger

app = FastAPI(title="Stock Prediction API", version="1.0.0")

logger = get_logger(__name__)

class PredictionRequest(BaseModel):
    symbol: str
    days: Optional[int] = 7

@app.get("/health")
async def health():
    return {"status": "ok", "ml_backend": "python"}

@app.get("/stocks/history")
async def get_history(symbol: str, period: str = "2y"):
    try:
        symbols = [symbol.upper()]
        data = download_stock_data(symbols, period)
        return data[symbol].tail(252).to_dict()
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predictions/lstm")
async def get_prediction(req: PredictionRequest):
    try:
        result = predict(req.symbol, req.days)
        return result
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    config = load_config('configs/api.yaml')
    uvicorn.run(app, host=config['host'], port=config['port'], reload=config['reload'])

