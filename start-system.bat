@echo off
echo ========================================
echo   Customer Support System Startup
echo ========================================
echo.

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

echo.
echo [2/3] Starting Backend Server...
cd backend
echo Starting MongoDB connection and API server...
start "Backend Server - Port 3002" cmd /k "echo Backend Server Starting... && npm run dev"
cd ..

echo.
echo [3/3] Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo Starting Frontend Application...
start "Frontend App - Port 5173" cmd /k "echo Frontend Starting... && npm run dev"

echo.
echo ========================================
echo   System Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:3002
echo Frontend App: http://localhost:5173
echo.

echo Press any key to close this window...
pause >nul