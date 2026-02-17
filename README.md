# Stock Trading Simulation Game

A web-based stock trading simulation game that allows users to paper trade Indian stocks (NSE) using real-time/historical data.

## Project Structure

*   **Frontend**: React application built with Vite and Material UI.
*   **Backend**: Python FastAPI application handling game logic and stock data.

## Features

*   Real-time stock data fetching.
*   Buy and Sell stocks with virtual currency.
*   Portfolio tracking (Holdings, Total Value, P&L).
*   Interactive stock charts.
*   Transaction history.
*   Search stocks by symbol.

## Prerequisites

*   Node.js (v16+. recommended)
*   Python (v3.8+)

## Installation & Running

### 1. Backend Setup

The backend runs on FastAPI and uses `yfinance` for stock data.

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

The backend server will start at `http://localhost:8000` (or similar).

### 2. Frontend Setup

The frontend is a React Vite app.

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will typically run at `http://localhost:5173`.

## Usage

1.  Make sure both Backend and Frontend servers are running.
2.  Open the frontend URL (e.g., `http://localhost:5173`) in your browser.
3.  Use the search bar to find stocks (e.g., `RELIANCE`, `TCS`).
4.  Buy or sell quantities using the interface.
5.  View your holdings and performance in the dashboard.
