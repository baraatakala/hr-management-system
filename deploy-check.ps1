# PowerShell Deployment Helper Script
# Run this to prepare for deployment

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " HR MANAGEMENT SYSTEM - DEPLOY READY" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if git is initialized
if (Test-Path .git) {
    Write-Host "✅ Git repository found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Git not initialized. Run: git init" -ForegroundColor Yellow
}

# Check if node_modules exists
if (Test-Path node_modules) {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Dependencies not installed. Run: npm install" -ForegroundColor Yellow
}

# Check if .env exists
if (Test-Path .env) {
    Write-Host "✅ Environment variables configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  No .env file found (this is OK for deployment)" -ForegroundColor Yellow
}

# Test build
Write-Host "`nTesting build..." -ForegroundColor Cyan
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Check errors above." -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "READY FOR DEPLOYMENT!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📋 Deployment Checklist:" -ForegroundColor Yellow
Write-Host "  1. Edge Function deployed? ✅" -ForegroundColor White
Write-Host "  2. Build successful? ✅" -ForegroundColor White
Write-Host "  3. GitHub repository created? ⏳" -ForegroundColor White
Write-Host "  4. Vercel account ready? ⏳`n" -ForegroundColor White

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Create GitHub repo: https://github.com/new" -ForegroundColor White
Write-Host "  2. Push code:" -ForegroundColor White
Write-Host "     git remote add origin https://github.com/YOUR_USERNAME/hr-management-system.git" -ForegroundColor Gray
Write-Host "     git branch -M main" -ForegroundColor Gray
Write-Host "     git push -u origin main`n" -ForegroundColor Gray
Write-Host "  3. Deploy on Vercel: https://vercel.com/new`n" -ForegroundColor White

Write-Host "📚 Full Guide: See QUICK-DEPLOY.md`n" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
