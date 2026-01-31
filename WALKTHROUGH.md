# Stock Simulation Game - Walkthrough & Setup

## Prerequisites

- **Python 3.10+**
- **Node.js v24+** (LTS verified)
- **PowerShell** (if on Windows)

## Project Structure

- `backend/`: FastAPI application (Python)
- `frontend/`: React/Vite application (Node.js)

## 1. Backend Setup

### Navigate to backend
```powershell
cd backend
```

### Create/Activate Virtual Environment
**Windows:**
```powershell
# Create (if not exists)
python -m venv venv

# Activate
.\venv\Scripts\Activate
```

### Install Requirements
```powershell
pip install -r requirements.txt
```

### Run Server
```powershell
# From 'backend' directory
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000` (Documentation at `/docs`).

## 2. Frontend Setup

### Navigate to frontend
```powershell
cd frontend
```

### Install Dependencies
```powershell
npm install
```
*Note: If you encounter policy errors on Windows, run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`.*

### Run Development Server
```powershell
npm run dev
```
The app will be available at `http://localhost:5173`.

## Troubleshooting

### "uvicorn is not recognized"
Ensure you are running the command from the activated virtual environment or use the full path:
```powershell
.\venv\Scripts\uvicorn main:app --reload
```
