import yfinance as yf
from datetime import datetime

tickers = ["AAPL"]
print(f"Testing yfinance for {tickers} at {datetime.now()}")

for t in tickers:
    ticker = yf.Ticker(t)
    try:
        # Try fast_info
        price = ticker.fast_info.get('last_price')
        print(f"{t} fast_info price: {price}")
    except Exception as e:
        print(f"fast_info failed: {e}")

    try:
        # Try history
        hist = ticker.history(period="1d", interval="1m")
        if not hist.empty:
            print(f"{t} history price: {hist['Close'].iloc[-1]}")
            print(f"Timestamp: {hist.index[-1]}")
        else:
            print(f"{t} history empty")
    except Exception as e:
        print(f"history failed: {e}")
