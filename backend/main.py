from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from game_engine import GameEngine
from models import TradeOrder, StockQuote, PortfolioState, TradeRecord

app = FastAPI(title="Stock Sim Game API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

game = GameEngine()

@app.get("/")
def read_root():
    return {"message": "Stock Sim Game API is running"}

@app.get("/api/status", response_model=PortfolioState)
def get_status():
    return game.get_status()

@app.post("/api/reset")
def reset_game():
    game.reset()
    return {"message": "Game reset", "status": game.get_status()}

@app.post("/api/next_tick", response_model=PortfolioState)
def next_tick():
    return game.next_tick()

@app.get("/api/quote/{ticker}", response_model=StockQuote)
def get_quote(ticker: str):
    price = game.get_price(ticker.upper())
    if price is None:
        raise HTTPException(status_code=404, detail="Ticker not found or no data for date")
    
    return StockQuote(
        ticker=ticker.upper(),
        date=game.current_date.strftime("%Y-%m-%d %H:%M:%S"),
        price=price
    )

@app.get("/api/history/{ticker}")
def get_history(ticker: str, period: str = "1mo"):
    # Map period to days
    period_map = {
        "1d": 1,
        "5d": 5,
        "1mo": 30,
        "6mo": 180
    }
    days = period_map.get(period, 30)
    history = game.stock_data.get_history(ticker.upper(), days=days)
    return history

@app.post("/api/buy")
def buy_stock(order: TradeOrder):
    success = game.buy(order.ticker.upper(), order.quantity)
    if not success:
        raise HTTPException(status_code=400, detail="Insufficient funds or invalid ticker")
    return {"message": "Buy successful", "status": game.get_status()}

@app.post("/api/sell")
def sell_stock(order: TradeOrder):
    success = game.sell(order.ticker.upper(), order.quantity)
    if not success:
        raise HTTPException(status_code=400, detail="Insufficient holdings or invalid ticker")
    return {"message": "Sell successful", "status": game.get_status()}

@app.get("/api/portfolio")
def get_portfolio():
    return game.get_status()

@app.get("/api/trades", response_model=List[TradeRecord])
def get_trades():
    return game.trades

@app.get("/api/tickers")
def get_tickers():
    return {"tickers": game.tickers}
