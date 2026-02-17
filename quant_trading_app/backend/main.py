from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from trading_engine import TradingEngine
from models import PortfolioSummary, TradeSignal

app = FastAPI(title="Quant Trading App")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = TradingEngine()

@app.get("/")
def read_root():
    return {"message": "Quant Trading API is running"}

@app.get("/api/portfolio", response_model=PortfolioSummary)
def get_portfolio():
    return engine.get_portfolio_summary()

@app.get("/api/price/{ticker}")
def get_price(ticker: str):
    price = engine.get_stock_price(ticker)
    return {"ticker": ticker, "price": price}

# Add more endpoints for strategies, backtesting etc.
