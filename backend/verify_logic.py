from game_engine import GameEngine

try:
    print("Initializing GameEngine...")
    game = GameEngine()
    print(f"Current Date: {game.current_date}")

    print("Fetching AAPL price...")
    price = game.get_price("AAPL")
    print(f"AAPL Price: {price}")
    
    if price and price > 0:
        print("Price check PASS")
    else:
        print("Price check FAIL")

    print(f"Buying 10 AAPL at {price}...")
    success = game.buy("AAPL", 10)
    if success:
        print("Buy PASS")
        print("Holdings:", game.holdings)
        print("Balance:", game.balance)
    else:
        print("Buy FAIL")

    print("Checking history...")
    hist = game.stock_data.get_history("AAPL", days=5)
    print(f"History items: {len(hist)}")
    if len(hist) > 0:
        print("History PASS")
        print(hist[-1])
    else:
        print("History FAIL")

except Exception as e:
    print(f"Verification crashed: {e}")
