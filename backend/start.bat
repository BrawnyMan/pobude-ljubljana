@echo off
setlocal enabledelayedexpansion
title FastAPI Server Starter

echo ========================================
echo FastAPI Project Launcher
echo ========================================

if not exist "venv\" (
    echo Virtual environment not found. Creating one...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo Failed to create virtual environment. Is Python installed and in PATH?
        pause
        exit /b 1
    )
) else (
    echo Virtual environment found.
)

echo Activating virtual environment...
call ".\venv\Scripts\activate.bat"

set PYTHON=.\venv\Scripts\python.exe

if exist ".\requirements.txt" (
    echo Installing dependencies from requirements.txt...
    "%PYTHON%" -m pip install -r ".\requirements.txt"
) else (
    echo No requirements.txt found. Skipping dependency installation.
)

echo Starting FastAPI server...
"%PYTHON%" -m uvicorn app.main:app --reload

pause