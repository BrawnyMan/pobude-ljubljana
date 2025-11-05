#!/bin/bash

if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
    echo "Linux/macOS detected"
    VENV_PATH="./venv"
    ACTIVATE_PATH="./venv/bin/activate"
    PYTHON_PATH="./venv/bin/python"
else
    echo "Windows detected"
    VENV_PATH="./venv"
    ACTIVATE_PATH="./venv/Scripts/activate"
    PYTHON_PATH="./venv/Scripts/python.exe"
fi

if [ ! -d "$VENV_PATH" ]; then
    echo "Virtual environment not found. Creating one..."
    python -m venv venv
    if [ $? -ne 0 ]; then
        echo "Failed to create virtual environment. Is Python installed?"
        exit 1
    fi
else
    echo "Virtual environment found."
fi

echo "Activating virtual environment..."
source "$ACTIVATE_PATH"

if [ -f "requirements.txt" ]; then
    echo "Installing dependencies from requirements.txt..."
    $PYTHON_PATH -m pip install -r requirements.txt
else
    echo "No requirements.txt found. Skipping dependency installation."
fi

echo "Starting FastAPI server..."
$PYTHON_PATH -m uvicorn app.main:app --reload