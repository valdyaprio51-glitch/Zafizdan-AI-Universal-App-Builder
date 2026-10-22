# Setup script for Universal AI App Builder on Windows
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  UNIVERSAL AI APP BUILDER - AUTOMATED SETUP (WINDOWS)   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check prerequisites
Write-Host "`n[1/5] Checking environment prerequisites..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if (!$nodeVersion) {
    Write-Error "Node.js is required but not found. Please install Node.js >= 18."
    exit 1
}
Write-Host "✔ Node.js detected: $nodeVersion" -ForegroundColor Green

$dotnetVersion = dotnet --version 2>$null
if ($dotnetVersion) {
    Write-Host "✔ .NET SDK detected: $dotnetVersion" -ForegroundColor Green
} else {
    Write-Host "ℹ .NET SDK not in PATH (Node.js/Python frameworks available)" -ForegroundColor DarkYellow
}

# 2. Environment file
Write-Host "`n[2/5] Initializing environment configuration..." -ForegroundColor Yellow
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✔ Created .env from .env.example" -ForegroundColor Green
} else {
    Write-Host "✔ .env already exists" -ForegroundColor Green
}

# 3. Install dependencies
Write-Host "`n[3/5] Installing npm dependencies across workspaces..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}

# 4. Build shared and generate database
Write-Host "`n[4/5] Compiling shared models and syncing database schema..." -ForegroundColor Yellow
npm run build --workspace=@zafizdan/shared
npx prisma generate --schema=apps/server/prisma/schema.prisma
npx prisma db push --schema=apps/server/prisma/schema.prisma

# 5. Build server and web
Write-Host "`n[5/5] Building platform services..." -ForegroundColor Yellow
npm run build --workspace=@zafizdan/server
npm run build --workspace=@zafizdan/web

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETED SUCCESSFULLY!                           " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "`nTo start the platform:" -ForegroundColor Cyan
Write-Host "  Terminal 1 (Backend): npm run server:dev" -ForegroundColor White
Write-Host "  Terminal 2 (Frontend): npm run web:dev" -ForegroundColor White
Write-Host "  Browser URL:          http://localhost:3000`n" -ForegroundColor White

