from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from models import TradeOrder, StockQuote, PortfolioState, TradeRecord
from game_engine import GameEngine

app = FastAPI(title="Stock Sim Game API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    # In real-time mode, this just triggers a state refresh
    return game.get_status()

@app.get("/api/quote/{ticker}", response_model=StockQuote)
def get_quote(ticker: str):
    ticker_upper = ticker.upper()
    price = game.get_price(ticker_upper)
    if price is None:
        raise HTTPException(status_code=404, detail="Ticker not found or no data")
    
    return StockQuote(
        ticker=ticker_upper,
        name=game.ticker_names.get(ticker_upper),
        price=price,
        date=game.current_date.strftime("%Y-%m-%d %H:%M:%S")
    )

@app.post("/api/buy")
def buy_stock(order: TradeOrder):
    success = game.buy(order.ticker.upper(), order.quantity, order.order_type, order.price)
    if not success:
        raise HTTPException(status_code=400, detail="Insufficient funds or invalid quantity")
    return {"message": "Purchase successful", "status": game.get_status()}

@app.post("/api/sell")
def sell_stock(order: TradeOrder):
    success = game.sell(order.ticker.upper(), order.quantity, order.order_type, order.price)
    if not success:
        raise HTTPException(status_code=400, detail="Insufficient shares or invalid quantity")
    return {"message": "Sale successful", "status": game.get_status()}

@app.get("/api/trades", response_model=List[TradeRecord])
def get_trades():
    return game.trades

@app.get("/api/tickers")
def get_tickers():
    return {"tickers": game.tickers}

@app.get("/api/history/{ticker}")
def get_history(ticker: str, period: str = "1mo"):
    # Standardize interval based on period
    interval = "1d"
    if period == "1d": interval = "5m"
    elif period == "5d": interval = "15m"
    
    data = game.stock_data.get_history(ticker.upper(), period=period, interval=interval)
    return {"data": data}

@app.get("/api/news/{ticker}")
def get_news(ticker: str):
    return game.stock_data.get_news(ticker.upper())

@app.get("/api/orders", response_model=List[TradeOrder])
def get_orders():
    return game.limit_orders

@app.get("/api/watchlist")
def get_watchlist():
    return {"watchlist": game.watchlist}

@app.post("/api/watchlist/{ticker}")
def add_watchlist(ticker: str):
    game.add_watchlist(ticker)
    return {"message": "Added to watchlist", "watchlist": game.watchlist}

@app.delete("/api/watchlist/{ticker}")
def remove_watchlist(ticker: str):
    game.remove_watchlist(ticker)
    return {"message": "Removed from watchlist", "watchlist": game.watchlist}

@app.get("/api/commodities")
def get_commodities():
    return game.get_commodities()
