#!/bin/bash

if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
    echo "🔧 Linux/macOS detected – activating venv/bin/activate"
    source ./venv/bin/activate
    ./venv/bin/python -m uvicorn app.main:app --reload
else
    echo "🪟 Windows detected – activating venv/Scripts/activate"
    source ./venv/Scripts/activate
    ./venv/Scripts/python.exe -m uvicorn app.main:app --reload
fi