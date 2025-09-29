@echo off
echo ========================================
echo   Database Connection Fix
echo ========================================
echo.

echo [1/4] Stopping any running servers...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak > nul

echo [2/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo [3/4] Resetting database users...
call npm run reset-users
if %errorlevel% neq 0 (
    echo WARNING: Could not reset users - database might be empty
)

echo [4/4] Starting backend server...
echo.
echo ========================================
echo   Backend server starting...
echo   Press Ctrl+C to stop
echo ========================================
echo.
call npm run dev

cd ..
pause