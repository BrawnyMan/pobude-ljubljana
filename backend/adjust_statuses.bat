@echo off
echo Adjusting pobude statuses...
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Run the adjust script
python adjust_statuses.py

echo.
echo Status adjustment completed!
pause

