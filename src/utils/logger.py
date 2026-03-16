"""Logging utility."""
from loguru import logger
import sys
from pathlib import Path

LOG_PATH = Path("logs/app.log")

logger.remove()
logger.add(sys.stdout, level="INFO")
logger.add(LOG_PATH, rotation="1 MB", level="DEBUG", format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}")

def get_logger(name: str):
    return logger.bind(name=name)

