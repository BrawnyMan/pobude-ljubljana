# 🚀 Project — Pobude Ljubljana

This project consists of a **FastAPI backend** and a **React frontend**.  
Follow the instructions below to get everything running locally.

---

## 🧰 Versions Used

| Tool | Version |
|------|----------|
| 🐍 Python | 3.13.3 |
| 📦 pip | 25.2 |
| 🟢 Node.js | v22.14.0 |
| 📦 npm | 10.9.2 |

---

## 🖥️ Backend Setup

### 📁 Location
Go to the backend folder:
```bash
cd ./backend
```

▶️ Run the Server

You can start the FastAPI backend using either script:
On Linux / macOS / Git Bash
```bash
./start.sh
```
On Windows (Command Prompt or double-click)
```bash
./start.bat
```
The script will automatically:

    Create a Python virtual environment (if it doesn’t exist)

    Install all dependencies from requirements.txt

    Start the FastAPI development server at
    👉 http://127.0.0.1:8000

## 🌐 Frontend Setup
## 📁 Location
Go to the React frontend folder:
```bash
cd ./frontend/react-app
```
📦 Install Dependencies

Install all required npm packages:
```bahs
npm install
```
▶️ Run the Development Server

Start the frontend with:
```bash
npm run dev
```
The app will start on 👉 http://localhost:5173 (or whichever port Vite selects).

🧠 Notes

    The backend runs on FastAPI + SQLModel + Uvicorn

    The frontend runs on React + Vite

💡 Tip:
You can have both backend and frontend running simultaneously — open two terminals, one for each.