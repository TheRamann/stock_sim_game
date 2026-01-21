from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

class StockQuote(BaseModel):
    ticker: str
    date: str
    price: float

class TradeOrder(BaseModel):
    ticker: str
    quantity: int
    action: str  # "BUY" or "SELL"

class TradeRecord(BaseModel):
    id: str
    ticker: str
    quantity: int
    price: float
    action: str
    date: str
    total: float

class PortfolioState(BaseModel):
    balance: float
    holdings: Dict[str, int]  # Ticker -> Quantity
    total_value: float
    pnl: float
    current_date: str

class GameStatus(BaseModel):
    current_date: str
    is_market_open: bool
    balance: float
    holdings: Dict[str, int]
