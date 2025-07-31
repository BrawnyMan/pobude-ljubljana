#!/bin/bash

if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
    echo "🔧 Linux/macOS detected – activating venv/bin/activate"
    source ./venv/bin/activate
else
    echo "🪟 Windows detected – activating venv/Scripts/activate"
    source ./venv/Scripts/activate
fi

uvicorn app.main:app --reload
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
