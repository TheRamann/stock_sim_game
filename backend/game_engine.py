import uuid
import pandas as pd
from datetime import datetime
from typing import Dict, List, Optional
from models import PortfolioState, TradeRecord, StockQuote, TradeOrder
from commodity_proxy import CommodityProxy

class StockData:
    def __init__(self, tickers: List[str]):
        self.tickers = tickers

    def get_price(self, ticker: str) -> Optional[float]:
        import yfinance as yf
        try:
            t = yf.Ticker(ticker)
            price = t.fast_info.last_price
            if price is None:
                 hist = t.history(period="1d", interval="1m")
                 if not hist.empty:
                     price = hist['Close'].iloc[-1]
            return float(price) if price else None
        except Exception as e:
            print(f"Error getting price for {ticker}: {e}")
            return None

    def get_history(self, ticker: str, period: str = "1mo", interval: str = "1d") -> List[Dict]:
        import yfinance as yf
        try:
            t = yf.Ticker(ticker)
            hist = t.history(period=period, interval=interval)
            if hist.empty:
                return []
            
            result = []
            for date, row in hist.iterrows():
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
        import yfinance as yf
        try:
            t = yf.Ticker(ticker)
            news = t.news
            if hasattr(news, 'get'):
                data = news.get('data')
                if data: return data
            if isinstance(news, list):
                return news
            return []
        except Exception as e:
            print(f"Error getting news for {ticker}: {e}")
            return []

class GameEngine:
    def __init__(self):
        self.tickers = [
            "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "SBIN.NS", 
            "ICICIBANK.NS", "HINDUNILVR.NS", "ITC.NS", "LT.NS", "AXISBANK.NS",
            "KOTAKBANK.NS", "BHARTIARTL.NS", "BAJFINANCE.NS", "MARUTI.NS", "ASIANPAINT.NS",
            "TITAN.NS", "ULTRACEMCO.NS", "SUNPHARMA.NS", "TATASTEEL.NS", "M&M.NS",
            "NTPC.NS", "POWERGRID.NS", "COALINDIA.NS", "NESTLEIND.NS", "ADANIENT.NS",
            "ADANIPORTS.NS", "HCLTECH.NS", "JSWSTEEL.NS", "TATAMOTORS.NS", "HINDALCO.NS",
            "GRASIM.NS", "ONGC.NS", "SBILIFE.NS", "CIPLA.NS", "APOLLOHOSP.NS",
            "TATACONSUM.NS", "BRITANNIA.NS", "DRREDDY.NS", "BAJAJFINSV.NS", "EICHERMOT.NS",
            "DIVISLAB.NS", "TECHM.NS", "INDUSINDBK.NS", "BPCL.NS", "HEROMOTOCO.NS",
            "WIPRO.NS", "BAJAJ-AUTO.NS", "LTIM.NS"
        ]
        self.ticker_names = {
            "RELIANCE.NS": "Reliance Industries Limited",
            "TCS.NS": "Tata Consultancy Services Limited",
            "HDFCBANK.NS": "HDFC Bank Limited",
            "INFY.NS": "Infosys Limited",
            "SBIN.NS": "State Bank of India",
            "ICICIBANK.NS": "ICICI Bank Limited",
            "HINDUNILVR.NS": "Hindustan Unilever Limited",
            "ITC.NS": "ITC Limited",
            "LT.NS": "Larsen & Toubro Limited",
            "AXISBANK.NS": "Axis Bank Limited",
            "KOTAKBANK.NS": "Kotak Mahindra Bank Limited",
            "BHARTIARTL.NS": "Bharti Airtel Limited",
            "BAJFINANCE.NS": "Bajaj Finance Limited",
            "MARUTI.NS": "Maruti Suzuki India Limited",
            "ASIANPAINT.NS": "Asian Paints Limited",
            "TITAN.NS": "Titan Company Limited",
            "ULTRACEMCO.NS": "UltraTech Cement Limited",
            "SUNPHARMA.NS": "Sun Pharmaceutical Industries Limited",
            "TATASTEEL.NS": "Tata Steel Limited",
            "M&M.NS": "Mahindra & Mahindra Limited",
            "NTPC.NS": "NTPC Limited",
            "POWERGRID.NS": "Power Grid Corporation of India Limited",
            "COALINDIA.NS": "Coal India Limited",
            "NESTLEIND.NS": "Nestle India Limited",
            "ADANIENT.NS": "Adani Enterprises Limited",
            "ADANIPORTS.NS": "Adani Ports and SEZ Limited",
            "HCLTECH.NS": "HCL Technologies Limited",
            "JSWSTEEL.NS": "JSW Steel Limited",
            "TATAMOTORS.NS": "Tata Motors Limited",
            "HINDALCO.NS": "Hindalco Industries Limited",
            "GRASIM.NS": "Grasim Industries Limited",
            "ONGC.NS": "Oil & Natural Gas Corporation Limited",
            "SBILIFE.NS": "SBI Life Insurance Company Limited",
            "CIPLA.NS": "Cipla Limited",
            "APOLLOHOSP.NS": "Apollo Hospitals Enterprise Limited",
            "TATACONSUM.NS": "Tata Consumer Products Limited",
            "BRITANNIA.NS": "Britannia Industries Limited",
            "DRREDDY.NS": "Dr. Reddy's Laboratories Limited",
            "BAJAJFINSV.NS": "Bajaj Finserv Limited",
            "EICHERMOT.NS": "Eicher Motors Limited",
            "DIVISLAB.NS": "Divi's Laboratories Limited",
            "TECHM.NS": "Tech Mahindra Limited",
            "INDUSINDBK.NS": "IndusInd Bank Limited",
            "BPCL.NS": "Bharat Petroleum Corporation Limited",
            "HEROMOTOCO.NS": "Hero MotoCorp Limited",
            "WIPRO.NS": "Wipro Limited",
            "BAJAJ-AUTO.NS": "Bajaj Auto Limited",
            "LTIM.NS": "LTIMindtree Limited"
        }
        self.stock_data = StockData(self.tickers)
        self.commodity_proxy = CommodityProxy()
        
        self.initial_balance = 100000.0
        self.balance = self.initial_balance
        self.holdings: Dict[str, int] = {}
        self.trades: List[TradeRecord] = []
        self.limit_orders: List[TradeOrder] = []
        self.watchlist: List[str] = ["RELIANCE.NS", "TCS.NS"]
        
        self.update_time()

    def update_time(self):
        self.current_date = datetime.now()

    def reset(self):
        self.balance = self.initial_balance
        self.holdings = {}
        self.trades = []
        self.limit_orders = []
        self.watchlist = ["RELIANCE.NS", "TCS.NS"]
        self.update_time()

    def get_price(self, ticker: str):
        ticker = ticker.upper()
        if ticker in self.commodity_proxy.TICKER_MAP:
            stats = self.commodity_proxy.get_stats(ticker)
            return stats["price"] if stats else None
        return self.stock_data.get_price(ticker)

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
        if quantity <= 0:
            return False
        self.update_time()
        if order_type == "LIMIT":
            self.limit_orders.append(TradeOrder(ticker=ticker, quantity=quantity, action="BUY", order_type="LIMIT", price=price))
            return True
        current_price = self.get_price(ticker)
        if not current_price: return False
        return self.execute_trade(ticker, quantity, "BUY", current_price)

    def sell(self, ticker: str, quantity: int, order_type: str = "MARKET", price: float = None) -> bool:
        if quantity <= 0:
            return False
        self.update_time()
        if order_type == "LIMIT":
             current_qty = self.holdings.get(ticker, 0)
             if current_qty < quantity: return False
             self.limit_orders.append(TradeOrder(ticker=ticker, quantity=quantity, action="SELL", order_type="LIMIT", price=price))
             return True
        current_price = self.get_price(ticker)
        if not current_price: return False
        return self.execute_trade(ticker, quantity, "SELL", current_price)

    def get_portfolio_value(self) -> float:
        value = 0.0
        for ticker, qty in self.holdings.items():
            price = self.get_price(ticker)
            if price: value += price * qty
        return value

    def get_status(self) -> PortfolioState:
        stock_value = self.get_portfolio_value()
        total_value = self.balance + stock_value
        pnl = total_value - self.initial_balance
        return PortfolioState(
            balance=self.balance,
            holdings=self.holdings,
            ticker_names=self.ticker_names,
            total_value=total_value,
            pnl=pnl,
            current_date=self.current_date.strftime("%Y-%m-%d %H:%M:%S")
        )

    def add_watchlist(self, ticker: str):
        ticker = ticker.upper()
        if ticker not in self.watchlist:
            self.watchlist.append(ticker)

    def remove_watchlist(self, ticker: str):
        ticker = ticker.upper()
        if ticker in self.watchlist:
            self.watchlist.remove(ticker)

    def get_commodities(self):
        tickers = list(self.commodity_proxy.TICKER_MAP.keys())
        data = self.commodity_proxy.get_all_commodities(tickers)
        return {"commodities": data}
