from game_engine import GameEngine
import json

try:
    print("Initializing GameEngine...")
    game = GameEngine()
    
    ticker = "RELIANCE.NS"
    print(f"Fetching history for {ticker}...")
    hist = game.stock_data.get_history(ticker, days=5)
    
    if not hist:
        print("FAIL: No history returned")
        exit(1)
        
    first = hist[-1]
    print("Sample candle:", json.dumps(first, indent=2))
    
    required = ['open', 'high', 'low', 'close', 'date']
    missing = [k for k in required if k not in first]
    
    if missing:
        print(f"FAIL: Missing keys {missing}")
    else:
        print("PASS: OHLC data present")

except Exception as e:
    print(f"Verification crashed: {e}")
