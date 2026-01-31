import yfinance as yf
import pandas as pd
from typing import Dict, List, Optional

class CommodityProxy:
    """Stable proxy for commodity prices and stats using global yfinance benchmarks (USD)"""
    
    # Mapping of our tickers to yfinance equivalents (Global Futures)
    TICKER_MAP = {
        "GOLD": "GC=F",
        "SILVER": "SI=F",
        "PLATINUM": "PL=F",
        "PALLADIUM": "PA=F",
        "NICKEL": "HG=F", # Proxy (Copper) if Nickel is delisted
        "COPPER": "HG=F",
        "ALUMINUM": "ALI=F",
        "ZINC": "ZNC=F",
        "LEAD": "LED=F",
        "TIN": "TIN=F"
    }

    # Standard Units Display
    UNIT_MAP = {
        "GOLD": "per oz",
        "SILVER": "per oz",
        "PLATINUM": "per oz",
        "PALLADIUM": "per oz",
        "NICKEL": "per lb",
        "COPPER": "per lb",
        "ALUMINUM": "per ton",
        "ZINC": "per ton",
        "LEAD": "per ton",
        "TIN": "per ton"
    }

    def get_stats(self, ticker: str) -> Optional[Dict]:
        """Fetch current USD price and 24h stats for a given ticker"""
        yf_ticker = self.TICKER_MAP.get(ticker.upper())
        if not yf_ticker:
            return None

        try:
            t = yf.Ticker(yf_ticker)
            # Fetch 5 days to ensure we have enough data across weekends
            hist = t.history(period="5d", interval="1h")
            
            if hist.empty or len(hist) < 2:
                # Try daily if hourly fails
                hist = t.history(period="5d", interval="1d")
                if hist.empty: return None

            current_price = hist['Close'].iloc[-1]
            
            # 24h Change Calculation
            prev_idx = max(0, len(hist) - 24) if len(hist) > 24 else 0
            prev_price = hist['Close'].iloc[prev_idx]
            
            change_abs = current_price - prev_price
            change_pct = (change_abs / prev_price) * 100 if prev_price else 0
            
            # Day high/low (last 24 periods)
            last_day = hist.iloc[-24:] if len(hist) > 24 else hist
            day_high = last_day['High'].max()
            day_low = last_day['Low'].min()

            # Sparkline (last 20 points)
            sparkline = hist['Close'].tolist()[-20:]

            return {
                "price": float(current_price),
                "change_pct": float(round(change_pct, 2)),
                "change_abs": float(round(change_abs, 2)),
                "day_high": float(round(day_high, 2)),
                "day_low": float(round(day_low, 2)),
                "sparkline": [float(x) for x in sparkline],
                "unit": self.UNIT_MAP.get(ticker.upper(), "per unit")
            }

        except Exception as e:
            print(f"Error fetching {ticker} via yfinance: {e}")
            return None

    def get_all_commodities(self, tickers: List[str]) -> List[Dict]:
        """Fetch full data for all commodities in USD"""
        results = []
        for ticker in tickers:
            stats = self.get_stats(ticker)
            if stats:
                results.append({
                    "ticker": ticker,
                    "name": ticker.capitalize(),
                    "price": stats["price"],
                    "currency": "USD",
                    "unit": stats["unit"],
                    "change_pct": stats["change_pct"],
                    "sparkline": stats["sparkline"]
                })
        return results
