from game_engine import GameEngine

try:
    print("Initializing GameEngine with Indian Stocks...")
    game = GameEngine()
    print(f"Tickers: {game.tickers}")
    
    if "RELIANCE.NS" not in game.tickers:
        print("FAIL: RELIANCE.NS not found")
        exit(1)
        
    print("Fetching RELIANCE.NS price...")
    price = game.get_price("RELIANCE.NS")
    print(f"RELIANCE.NS Price: {price}")
    
    if price and price > 500: # Reliance is usually > 500
        print("PASS: Got reasonable Indian stock price")
    else:
        print("FAIL: Invalid price or API error")
        
except Exception as e:
    print(f"Verification crashed: {e}")
