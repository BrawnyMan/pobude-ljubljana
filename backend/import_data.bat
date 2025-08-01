@echo off
echo Starting data import...
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Run the import script
python run_import.py %*

echo.
echo Import completed!
pause 