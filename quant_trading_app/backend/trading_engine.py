import yfinance as yf
import pandas as pd
from datetime import datetime
from typing import List, Dict
from models import StockData, PortfolioPosition, PortfolioSummary, TradeSignal

class TradingEngine:
    def __init__(self, initial_cash: float = 100000.0):
        self.cash = initial_cash
        self.positions: Dict[str, PortfolioPosition] = {}
        self.history: List[TradeSignal] = []

    def get_stock_price(self, ticker: str) -> float:
        # Fetch real-time data using yfinance
        try:
            ticker_data = yf.Ticker(ticker)
            # rapid fetch for latest price
            history = ticker_data.history(period="1d")
            if not history.empty:
                return history['Close'].iloc[-1]
        except Exception as e:
            print(f"Error fetching price for {ticker}: {e}")
        return 0.0

    def get_portfolio_summary(self) -> PortfolioSummary:
        total_value = self.cash
        position_list = []
        
        for ticker, pos in self.positions.items():
            current_price = self.get_stock_price(ticker)
            pos.current_price = current_price
            pos.pnl = (current_price - pos.average_price) * pos.quantity
            total_value += current_price * pos.quantity
            position_list.append(pos)

        return PortfolioSummary(
            cash=self.cash,
            equity=total_value - self.cash,
            total_value=total_value,
            positions=position_list
        )

    def execute_trade(self, signal: TradeSignal):
        current_price = self.get_stock_price(signal.ticker)
        if current_price <= 0:
            print(f"Cannot trade {signal.ticker}, invalid price")
            return

        cost = current_price  # Simplified, assume 1 unit for now
        # Implement full logic for quantity
        
        # This is a stub for execution logic
        # In a real app we'd handle quantity, slippage, fees
        self.history.append(signal)

    # Placeholder for strategy execution
    def run_strategy(self):
        pass
