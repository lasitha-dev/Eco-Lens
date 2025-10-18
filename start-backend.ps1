# Eco-Lens Backend Startup Script
# This script starts the backend server for the Eco-Lens application

Write-Host "🚀 Starting Eco-Lens Backend Server..." -ForegroundColor Green
Write-Host ""

# Navigate to backend directory
$backendPath = "C:\Users\Ayodhya\Desktop\Eco-Lens\eco-lens\backend"

if (Test-Path $backendPath) {
    Set-Location $backendPath
    Write-Host "✅ Found backend directory" -ForegroundColor Green
} else {
    Write-Host "❌ Backend directory not found at: $backendPath" -ForegroundColor Red
    Write-Host "Please check the path and try again." -ForegroundColor Yellow
    pause
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        pause
        exit 1
    }
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "Please create a .env file with required environment variables." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Required variables:" -ForegroundColor Cyan
    Write-Host "  - MONGODB_URI" -ForegroundColor Cyan
    Write-Host "  - JWT_SECRET" -ForegroundColor Cyan
    Write-Host "  - EMAIL_USER" -ForegroundColor Cyan
    Write-Host "  - EMAIL_PASS" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host ""
Write-Host "🔧 Starting server on port 5002..." -ForegroundColor Cyan
Write-Host "📡 Server will be available at:" -ForegroundColor Cyan
Write-Host "   - Local: http://localhost:5002" -ForegroundColor White
Write-Host "   - Network: http://10.38.245.146:5002" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
npm start
