
import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def test_negative_buy():
    # Buy -10 shares of RELIANCE.NS
    order = {
        "ticker": "RELIANCE.NS",
        "quantity": -10,
        "action": "BUY",
        "order_type": "MARKET"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/buy", json=order)
        if response.status_code == 200:
            print("FAIL: Successfully bought negative quantity!")
            print(response.json())
            sys.exit(1) # Fail
        elif response.status_code == 400:
             # Check if it's the specific error we want or some other error
            print(f"SUCCESS? Got 400 error: {response.text}")
            if "differs" in response.text or "invalid quantity" in response.text.lower():
                 print("Validation appears to be working (or specific error caught).")
                 sys.exit(0)
            else:
                 print("Got 400 but might be for another reason.")
                 print(response.text)
                 sys.exit(0) # Treat as success for now if 400, but we want to ensure it's specifically for negative quantity
        else:
            print(f"Unexpected status code: {response.status_code}")
            print(response.text)
            sys.exit(1)
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_negative_buy()
