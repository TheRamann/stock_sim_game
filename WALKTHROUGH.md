# Project Walkthrough & Setup Guide

This guide provides step-by-step instructions for setting up and running the Stock Simulation Game on both **macOS** and **Windows**.

---

## 🍎 macOS Setup

### Prerequisites
- **Git**: Ensure Git is installed (`git --version`).
- **Python**: Version 3.8 or higher (`python3 --version`).
- **Node.js**: Version 16 or higher (`node -v`).

### Step 1: Clone the Repository
Open your Terminal and run:
```bash
git clone <repository-url>
cd stock_sim_game
```

### Step 2: Backend Setup
1.  **Navigate to the backend folder**:
    ```bash
    cd backend
    ```
2.  **Create a virtual environment**:
    ```bash
    python3 -m venv venv
    ```
3.  **Activate the virtual environment**:
    ```bash
    source venv/bin/activate
    ```
    *(You should see `(venv)` appear in your terminal prompt)*
4.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
5.  **Start the Backend Server**:
    ```bash
    uvicorn main:app --reload
    ```
    The server should be running at `http://127.0.0.1:8000`.

### Step 3: Frontend Setup
1.  **Open a NEW Terminal window/tab** (keep the backend running in the first one).
2.  **Navigate to the project root, then frontend**:
    ```bash
    cd stock_sim_game/frontend
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Start the Frontend Server**:
    ```bash
    npm run dev
    ```
    The application will usually be accessible at `http://localhost:5173`.

---

## 🪟 Windows Setup

### Prerequisites
- **Git**: Installed and viable in Command Prompt/PowerShell.
- **Python**: Installed and added to PATH. Check with `python --version`.
- **Node.js**: Installed. Check with `node -v`.

### Step 1: Clone the Repository
Open Command Prompt (cmd) or PowerShell and run:
```powershell
git clone <repository-url>
cd stock_sim_game
```

### Step 2: Backend Setup
1.  **Navigate to the backend folder**:
    ```powershell
    cd backend
    ```
2.  **Create a virtual environment**:
    ```powershell
    python -m venv venv
    ```
3.  **Activate the virtual environment**:
    ```powershell
    .\venv\Scripts\activate
    ```
    *(If you get a permission error in PowerShell, run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`, then try activating again.)*
4.  **Install dependencies**:
    ```powershell
    pip install -r requirements.txt
    ```
5.  **Start the Backend Server**:
    ```powershell
    uvicorn main:app --reload
    ```
    The server should be running at `http://127.0.0.1:8000`.

### Step 3: Frontend Setup
1.  **Open a NEW Command Prompt/PowerShell window**.
2.  **Navigate to the project root, then frontend**:
    ```powershell
    cd stock_sim_game\frontend
    ```
3.  **Install dependencies**:
    ```powershell
    npm install
    ```
4.  **Start the Frontend Server**:
    ```powershell
    npm run dev
    ```
    The application will usually be accessible at `http://localhost:5173`.

---

## 🛠 Common Issues & Troubleshooting

-   **"uvicorn is not recognized..."**: Ensure you activated the virtual environment before running the command. If it still fails, try running `python -m uvicorn main:app --reload`.
-   **Port already in use**: If port 8000 (backend) or 5173 (frontend) is busy, the console will tell you. You can usually ignore it (it will pick the next available port) or kill the process using that port.
-   **Module not found**: Make sure you ran `pip install ...` **after** activating the virtual environment.
