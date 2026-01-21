import requests
import time
from datetime import datetime

BASE_URL = "http://127.0.0.1:8001/api"

def wait_for_server():
    for _ in range(10):
        try:
            requests.get(BASE_URL + "/")
            return True
        except:
            time.sleep(1)
    return False

if not wait_for_server():
    print("Server not responding")
    exit(1)

# 1. Check Status
resp = requests.get(f"{BASE_URL}/status")
data = resp.json()
print("Status:", data)
server_date = data['current_date']
print(f"Server Date: {server_date}")

# Verify date is recent (today)
server_dt = datetime.strptime(server_date, "%Y-%m-%d %H:%M:%S")
now = datetime.now()
if (now - server_dt).days > 1:
    print("FAIL: Server date is too old")
else:
    print("PASS: Server date is current")

# 2. Check Quote
resp = requests.get(f"{BASE_URL}/quote/AAPL")
if resp.status_code == 200:
    quote = resp.json()
    print(f"AAPL Quote: {quote['price']} at {quote['date']}")
    if quote['price'] > 0:
        print("PASS: Got valid price")
    else:
        print("FAIL: Invalid price")
else:
    print(f"FAIL: Quote failed {resp.status_code} {resp.text}")

# 3. Buy
buy_req = {"ticker": "AAPL", "quantity": 10, "action": "BUY"}
resp = requests.post(f"{BASE_URL}/buy", json=buy_req)
if resp.status_code == 200:
    print("PASS: Buy successful")
    print(resp.json())
else:
    print(f"FAIL: Buy failed {resp.status_code} {resp.text}")
