@echo off
REM Eco-Lens Backend Startup Script
REM This script starts the backend server for the Eco-Lens application

echo.
echo ========================================
echo   Eco-Lens Backend Server Startup
echo ========================================
echo.

cd /d "C:\Users\Ayodhya\Desktop\Eco-Lens\eco-lens\backend"

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please create a .env file with required environment variables.
    echo.
    pause
)

echo.
echo Starting server on port 5002...
echo Server will be available at:
echo   - Local: http://localhost:5002
echo   - Network: http://10.38.245.146:5002
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
