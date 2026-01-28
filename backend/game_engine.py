import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import uuid
from typing import Dict, List, Optional
from models import PortfolioState, TradeRecord, StockQuote, TradeOrder

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

    def get_history(self, ticker: str, period: str = "1mo", interval: str = "1d") -> List[Dict]:
        try:
            t = yf.Ticker(ticker)
            # Fetch history with specific period and interval
            hist = t.history(period=period, interval=interval)
            
            if hist.empty:
                return []
            
            result = []
            for date, row in hist.iterrows():
                # Format date based on interval
                if interval in ["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h"]:
                    date_str = date.strftime("%Y-%m-%d %H:%M:%S")
                else:
                    date_str = date.strftime("%Y-%m-%d")

                result.append({
                    "date": date_str,
                    "open": float(row['Open']),
                    "high": float(row['High']),
                    "low": float(row['Low']),
                    "close": float(row['Close'])
                })
            return result
        except Exception as e:
            print(f"Error getting history for {ticker}: {e}")
            return []

    def get_news(self, ticker: str) -> List[Dict]:
        try:
            t = yf.Ticker(ticker)
            return t.news
        except Exception as e:
            print(f"Error getting news for {ticker}: {e}")
            return []

class GameEngine:
    def __init__(self):
        self.tickers = [
            "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "TMCV.NS", "SBIN.NS", "BHARATCOAL.NS",
            "ICICIBANK.NS", "HINDUNILVR.NS", "ITC.NS", "LT.NS", "BAJFINANCE.NS", "MARUTI.NS",
            "ASIANPAINT.NS", "AXISBANK.NS", "TITAN.NS", "ULTRACEMCO.NS", "SUNPHARMA.NS", "WIPRO.NS"
        ]
        self.stock_data = StockData(self.tickers)
        
        # Game State
        self.initial_balance = 100000.0
        self.balance = self.initial_balance
        self.holdings: Dict[str, int] = {}
        self.holdings: Dict[str, int] = {}
        self.trades: List[TradeRecord] = []
        self.limit_orders: List[TradeOrder] = []
        
        self.update_time()

    def update_time(self):
        self.current_date = datetime.now()

    def reset(self):
        self.balance = self.initial_balance
        self.holdings = {}
        self.holdings = {}
        self.trades = []
        self.limit_orders = []
        self.update_time()

    def next_tick(self):
        # In real-time mode, this just refreshes the state/time
        self.update_time()
        self.process_limit_orders()
        return self.get_status()

    def get_price(self, ticker: str):
        # Ignore date, always get current price
        return self.stock_data.get_price(ticker)

    def process_limit_orders(self):
        # Check all pending limit orders
        remaining_orders = []
        for order in self.limit_orders:
            current_price = self.get_price(order.ticker)
            if not current_price:
                remaining_orders.append(order)
                continue
                
            executed = False
            if order.action == "BUY":
                # Buy if price <= limit price
                if current_price <= order.price:
                     if self.execute_trade(order.ticker, order.quantity, "BUY", current_price):
                         executed = True
            elif order.action == "SELL":
                 # Sell if price >= limit price
                 if current_price >= order.price:
                     if self.execute_trade(order.ticker, order.quantity, "SELL", current_price):
                         executed = True
            
            if not executed:
                remaining_orders.append(order)
        
        self.limit_orders = remaining_orders

    def execute_trade(self, ticker: str, quantity: int, action: str, price: float) -> bool:
        if action == "BUY":
            cost = price * quantity
            if self.balance >= cost:
                self.balance -= cost
                self.holdings[ticker] = self.holdings.get(ticker, 0) + quantity
                self._record_trade(ticker, quantity, price, "BUY", cost)
                return True
        elif action == "SELL":
            current_qty = self.holdings.get(ticker, 0)
            if current_qty >= quantity:
                revenue = price * quantity
                self.balance += revenue
                self.holdings[ticker] -= quantity
                if self.holdings[ticker] == 0:
                    del self.holdings[ticker]
                self._record_trade(ticker, quantity, price, "SELL", revenue)
                return True
        return False

    def _record_trade(self, ticker, quantity, price, action, total):
        record = TradeRecord(
            id=str(uuid.uuid4()),
            ticker=ticker,
            quantity=quantity,
            price=price,
            action=action,
            date=self.current_date.strftime("%Y-%m-%d %H:%M:%S"),
            total=total
        )
        self.trades.append(record)

    def buy(self, ticker: str, quantity: int, order_type: str = "MARKET", price: float = None) -> bool:
        self.update_time()
        
        if order_type == "LIMIT":
            if price is None:
                return False
            # For limit buy, we just add to orders, but we SHOULD verify funds? 
            # Classic limit: lock funds. Simplified: check funds at execution. Let's do simplified for now to avoid locking complexity logic.
            # Actually, standard is to lock funds. Let's stick to simple "check at execution" for this MVP to avoid complex "available cash" logic vs "balance".
            self.limit_orders.append(TradeOrder(ticker=ticker, quantity=quantity, action="BUY", order_type="LIMIT", price=price))
            return True

        current_price = self.get_price(ticker)
        if not current_price:
            return False
        return self.execute_trade(ticker, quantity, "BUY", current_price)

    def sell(self, ticker: str, quantity: int, order_type: str = "MARKET", price: float = None) -> bool:
        self.update_time()
        
        if order_type == "LIMIT":
             if price is None:
                return False
             current_qty = self.holdings.get(ticker, 0)
             # Basic validation: do they have the shares now?
             if current_qty < quantity:
                 return False
             self.limit_orders.append(TradeOrder(ticker=ticker, quantity=quantity, action="SELL", order_type="LIMIT", price=price))
             return True

        current_price = self.get_price(ticker)
        if not current_price:
            return False
            
        return self.execute_trade(ticker, quantity, "SELL", current_price)

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
