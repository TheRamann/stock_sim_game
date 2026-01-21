import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import uuid
from typing import Dict, List, Optional
from models import PortfolioState, TradeRecord, StockQuote

class StockData:
    def __init__(self, tickers: List[str]):
        self.tickers = tickers
        # No more bulk pre-fetching

    def get_price(self, ticker: str) -> Optional[float]:
        try:
            t = yf.Ticker(ticker)
            # Try fast_info first for real-time price
            price = t.fast_info.last_price
            if price is None:
                 # Fallback to 1-minute history
                 hist = t.history(period="1d", interval="1m")
                 if not hist.empty:
                     price = hist['Close'].iloc[-1]
            return float(price) if price else None
        except Exception as e:
            print(f"Error getting price for {ticker}: {e}")
            return None

    def get_history(self, ticker: str, days: int = 30) -> List[Dict]:
        try:
            t = yf.Ticker(ticker)
            # Fetch reasonable history for charting
            hist = t.history(period=f"{days}d")
            if hist.empty:
                return []
            
            result = []
            for date, row in hist.iterrows():
                result.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "open": float(row['Open']),
                    "high": float(row['High']),
                    "low": float(row['Low']),
                    "close": float(row['Close'])
                })
            return result
        except Exception as e:
            print(f"Error getting history for {ticker}: {e}")
            return []

class GameEngine:
    def __init__(self):
        self.tickers = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "TMCV.NS", "SBIN.NS", "BHARATCOAL.NS"]
        self.stock_data = StockData(self.tickers)
        
        # Game State
        self.initial_balance = 100000.0
        self.balance = self.initial_balance
        self.holdings: Dict[str, int] = {}
        self.trades: List[TradeRecord] = []
        
        self.update_time()

    def update_time(self):
        self.current_date = datetime.now()

    def reset(self):
        self.balance = self.initial_balance
        self.holdings = {}
        self.trades = []
        self.update_time()

    def next_tick(self):
        # In real-time mode, this just refreshes the state/time
        self.update_time()
        return self.get_status()

    def get_price(self, ticker: str):
        # Ignore date, always get current price
        return self.stock_data.get_price(ticker)

    def buy(self, ticker: str, quantity: int) -> bool:
        self.update_time()
        price = self.get_price(ticker)
        if not price:
            return False
            
        cost = price * quantity
        if self.balance >= cost:
            self.balance -= cost
            self.holdings[ticker] = self.holdings.get(ticker, 0) + quantity
            
            record = TradeRecord(
                id=str(uuid.uuid4()),
                ticker=ticker,
                quantity=quantity,
                price=price,
                action="BUY",
                date=self.current_date.strftime("%Y-%m-%d %H:%M:%S"),
                total=cost
            )
            self.trades.append(record)
            return True
        return False

    def sell(self, ticker: str, quantity: int) -> bool:
        self.update_time()
        price = self.get_price(ticker)
        if not price:
            return False
            
        current_qty = self.holdings.get(ticker, 0)
        if current_qty >= quantity:
            revenue = price * quantity
            self.balance += revenue
            self.holdings[ticker] -= quantity
            if self.holdings[ticker] == 0:
                del self.holdings[ticker]
                
            record = TradeRecord(
                id=str(uuid.uuid4()),
                ticker=ticker,
                quantity=quantity,
                price=price,
                action="SELL",
                date=self.current_date.strftime("%Y-%m-%d %H:%M:%S"),
                total=revenue
            )
            self.trades.append(record)
            return True
        return False

    def get_portfolio_value(self) -> float:
        value = 0.0
        for ticker, qty in self.holdings.items():
            price = self.get_price(ticker)
            if price:
                value += price * qty
        return value

    def get_status(self) -> PortfolioState:
        stock_value = self.get_portfolio_value()
        total_value = self.balance + stock_value
        pnl = total_value - self.initial_balance
        
        return PortfolioState(
            balance=self.balance,
            holdings=self.holdings,
            total_value=total_value,
            pnl=pnl,
            current_date=self.current_date.strftime("%Y-%m-%d %H:%M:%S")
        )
