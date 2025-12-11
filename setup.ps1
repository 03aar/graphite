# LeafIt Setup Script for Windows PowerShell

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  LeafIt Setup - Windows PowerShell"  -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies
Write-Host "[1/5] Installing dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Step 2: Build packages
Write-Host ""
Write-Host "[2/5] Building shared packages..." -ForegroundColor Yellow
Set-Location packages/shared
pnpm build
Set-Location ../..

Set-Location packages/ui
pnpm build
Set-Location ../..

# Step 3: Generate Prisma Client
Write-Host ""
Write-Host "[3/5] Generating Prisma client..." -ForegroundColor Yellow
Set-Location apps/web
pnpm prisma generate

# Step 4: Create database
Write-Host ""
Write-Host "[4/5] Creating database..." -ForegroundColor Yellow
pnpm prisma db push

# Step 5: Seed database
Write-Host ""
Write-Host "[5/5] Seeding database with demo data..." -ForegroundColor Yellow
pnpm prisma db seed

Set-Location ../..

Write-Host ""
Write-Host "========================================"  -ForegroundColor Green
Write-Host "  Setup Complete!"  -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Green
Write-Host ""
Write-Host "To start the app, run:" -ForegroundColor Cyan
Write-Host "  pnpm dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
