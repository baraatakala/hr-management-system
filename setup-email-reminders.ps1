# Quick Email Reminder Setup Script
# Run this in PowerShell

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Email Reminder System Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "Step 1: Checking Supabase CLI..." -ForegroundColor Yellow
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI not found. Installing..." -ForegroundColor Red
    npm install -g supabase
    Write-Host "✅ Supabase CLI installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Supabase CLI is already installed" -ForegroundColor Green
}
Write-Host ""

# Login to Supabase
Write-Host "Step 2: Login to Supabase..." -ForegroundColor Yellow
Write-Host "This will open your browser for authentication" -ForegroundColor Gray
supabase login
Write-Host ""

# Link project
Write-Host "Step 3: Linking to your Supabase project..." -ForegroundColor Yellow
Write-Host "Project: lydqwukaryqghovxbcqg" -ForegroundColor Gray
supabase link --project-ref lydqwukaryqghovxbcqg
Write-Host ""

# Set secrets
Write-Host "Step 4: Setting environment variables..." -ForegroundColor Yellow
Write-Host "Setting RESEND_API_KEY..." -ForegroundColor Gray
supabase secrets set RESEND_API_KEY=re_JPm8m1vU_GchkvBsobRtawyCvEGyTFqek

Write-Host ""
Write-Host "⚠️  IMPORTANT: Get your Service Role Key from:" -ForegroundColor Yellow
Write-Host "https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/settings/api" -ForegroundColor Cyan
Write-Host ""
$serviceRoleKey = Read-Host "Paste your Service Role Key here"

if ($serviceRoleKey) {
    supabase secrets set SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey
    Write-Host "✅ Service Role Key set!" -ForegroundColor Green
}
Write-Host ""

# Deploy function
Write-Host "Step 5: Deploying Edge Function..." -ForegroundColor Yellow
supabase functions deploy send-reminders
Write-Host ""

# List functions
Write-Host "Step 6: Verifying deployment..." -ForegroundColor Yellow
supabase functions list
Write-Host ""

# Test function
Write-Host "Step 7: Testing function..." -ForegroundColor Yellow
Write-Host "This will check for expiring documents and send test emails" -ForegroundColor Gray
$testResponse = Read-Host "Do you want to test the function now? (y/n)"

if ($testResponse -eq "y") {
    supabase functions invoke send-reminders --method POST
    Write-Host ""
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Set up cron job in Supabase SQL Editor" -ForegroundColor White
Write-Host "2. Add test employees with expiring documents" -ForegroundColor White
Write-Host "3. Monitor reminders at: http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full guide: EMAIL_REMINDER_SETUP.md" -ForegroundColor Cyan
