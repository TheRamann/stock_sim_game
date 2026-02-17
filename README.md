# Stock Trading Simulation Game 📈

A realistic, web-based stock trading simulation game that allows users to paper trade Indian stocks (NSE) using real-time data. Master the markets without the financial risk!

## About The Project 🚀

This project is designed to be a comprehensive tool for learning and practicing stock trading. It simulates a real trading environment where users can buy and sell stocks, track their portfolio performance, and analyze market trends using interactive charts.

Whether you're a beginner looking to understand the basics of the stock market or an experienced trader testing new strategies, this simulator provides a safe and feature-rich platform to hone your skills.

## Features ✨

*   **Real-Time Market Data**: Fetches live stock prices and data for NSE/BSE stocks.
*   **Virtual Trading**: Buy and sell stocks using virtual currency, simulating real-world order execution.
*   **Portfolio Management**: Track your Holdings, Total Portfolio Value, and realized/unrealized Profit & Loss (P&L) in real-time.
*   **Interactive Charts**: Analyze stock performance with dynamic charts (Line/Candlestick) supporting various timeframes.
*   **Transaction History**: Keep a detailed log of all your buy and sell orders.
*   **Stock Search**: Easily search for stocks by their symbol or company name.
*   **Responsive Design**: A modern, clean interface tailored for both desktop and mobile devices.

## Screenshots 📸

*(Screenshots coming soon)*

<!-- 
Example format:
![Dashboard Screenshot](./screenshots/dashboard.png)
-->

## Tech Stack 🛠️

*   **Frontend**: React, TypeScript, Vite, Material UI, Recharts
*   **Backend**: Python, FastAPI, yfinance

## Getting Started 🏁

Follow these instructions to set up the project locally.

### Prerequisites

*   Node.js (v16+ recommended)
*   Python (v3.8+)

### 1. Backend Setup

The backend runs on FastAPI and uses `yfinance` to fetch stock data.

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

The server will start at `http://localhost:8000`.

### 2. Frontend Setup

The frontend is a fast React application powered by Vite.

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

## Usage 💡

1.  Ensure both **backend** and **frontend** servers are running.
2.  Open your browser and navigate to `http://localhost:5173`.
3.  **Search** for a stock (e.g., `RELIANCE`, `TCS`, `INFY`).
4.  **Trade**: Enter a quantity and click Buy or Sell.
5.  **Monitor**: Watch your Portfolio update in real-time as market prices change.

---

*Happy Trading!* 🚀
