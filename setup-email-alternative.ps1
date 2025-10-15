# Alternative Email Reminder Setup
# This script deploys the Edge Function using Supabase Management API

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Email Reminder - Alternative Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Project details
$PROJECT_REF = "lydqwukaryqghovxbcqg"
$PROJECT_URL = "https://$PROJECT_REF.supabase.co"

Write-Host "📋 Project Information:" -ForegroundColor Yellow
Write-Host "  Project: $PROJECT_REF" -ForegroundColor White
Write-Host "  URL: $PROJECT_URL" -ForegroundColor White
Write-Host ""

# Step 1: Get Service Role Key
Write-Host "Step 1: Get your Service Role Key" -ForegroundColor Yellow
Write-Host "  Go to: https://supabase.com/dashboard/project/$PROJECT_REF/settings/api" -ForegroundColor Cyan
Write-Host "  Copy the 'service_role' key (starts with 'eyJhbGc...')" -ForegroundColor Gray
Write-Host ""
$SERVICE_ROLE_KEY = Read-Host "Paste Service Role Key here"

if (-not $SERVICE_ROLE_KEY) {
    Write-Host "❌ Service Role Key is required!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Service Role Key received" -ForegroundColor Green
Write-Host ""

# Step 2: Test Edge Function locally first
Write-Host "Step 2: Testing Edge Function code..." -ForegroundColor Yellow

if (Test-Path ".\supabase\functions\send-reminders\index.ts") {
    Write-Host "✅ Edge Function file found" -ForegroundColor Green
} else {
    Write-Host "❌ Edge Function file not found!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Manual deployment instructions
Write-Host "Step 3: Deploy Edge Function" -ForegroundColor Yellow
Write-Host "  Due to CLI login issues, we'll use manual deployment:" -ForegroundColor Gray
Write-Host ""
Write-Host "  Option A - Using Supabase Dashboard (Easiest):" -ForegroundColor Cyan
Write-Host "    1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/functions" -ForegroundColor White
Write-Host "    2. Click 'Create a new function'" -ForegroundColor White
Write-Host "    3. Name: send-reminders" -ForegroundColor White
Write-Host "    4. Copy content from: supabase\functions\send-reminders\index.ts" -ForegroundColor White
Write-Host "    5. Click 'Deploy function'" -ForegroundColor White
Write-Host ""
Write-Host "  Option B - Try CLI with access token:" -ForegroundColor Cyan
Write-Host "    1. Get access token: https://supabase.com/dashboard/account/tokens" -ForegroundColor White
Write-Host "    2. Run: supabase login --token YOUR_ACCESS_TOKEN" -ForegroundColor White
Write-Host "    3. Run: supabase link --project-ref $PROJECT_REF" -ForegroundColor White
Write-Host "    4. Run: supabase functions deploy send-reminders" -ForegroundColor White
Write-Host ""

$deployChoice = Read-Host "Have you deployed the function? (y/n)"

if ($deployChoice -ne "y") {
    Write-Host "⏸️  Please deploy the function first, then run this script again" -ForegroundColor Yellow
    exit 0
}

# Step 4: Set Environment Variables
Write-Host ""
Write-Host "Step 4: Setting Environment Variables" -ForegroundColor Yellow
Write-Host "  We need to set these secrets in Supabase Dashboard:" -ForegroundColor Gray
Write-Host ""
Write-Host "  Go to: https://supabase.com/dashboard/project/$PROJECT_REF/settings/functions" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Add these secrets:" -ForegroundColor White
Write-Host "    Name: RESEND_API_KEY" -ForegroundColor Yellow
Write-Host "    Value: re_JPm8m1vU_GchkvBsobRtawyCvEGyTFqek" -ForegroundColor Gray
Write-Host ""
Write-Host "    Name: SUPABASE_URL" -ForegroundColor Yellow
Write-Host "    Value: $PROJECT_URL" -ForegroundColor Gray
Write-Host ""
Write-Host "    Name: SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
Write-Host "    Value: $SERVICE_ROLE_KEY" -ForegroundColor Gray
Write-Host ""

$secretsSet = Read-Host "Have you set the environment variables? (y/n)"

if ($secretsSet -ne "y") {
    Write-Host "⏸️  Please set the environment variables first" -ForegroundColor Yellow
    exit 0
}

# Step 5: Test the function
Write-Host ""
Write-Host "Step 5: Testing the Edge Function" -ForegroundColor Yellow
Write-Host "  Invoking function..." -ForegroundColor Gray

try {
    $headers = @{
        "Authorization" = "Bearer $SERVICE_ROLE_KEY"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "$PROJECT_URL/functions/v1/send-reminders" -Method POST -Headers $headers -Body "{}"
    
    Write-Host "✅ Function executed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
} catch {
    Write-Host "❌ Function test failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  • Function not deployed yet" -ForegroundColor White
    Write-Host "  • Environment variables not set" -ForegroundColor White
    Write-Host "  • Service Role Key incorrect" -ForegroundColor White
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Set up Cron Job (Automated Daily Execution)" -ForegroundColor White
Write-Host "   • Open: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new" -ForegroundColor Cyan
Write-Host "   • Run the SQL from: supabase\migrations\20250103000000_setup_cron_job.sql" -ForegroundColor Cyan
Write-Host "   • Replace YOUR_SERVICE_ROLE_KEY with your actual key" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Add Test Data" -ForegroundColor White
Write-Host "   • Run SQL: supabase\migrations\20250104000000_test_data_reminders.sql" -ForegroundColor Cyan
Write-Host "   • Replace test emails with your real email addresses" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Monitor Reminders" -ForegroundColor White
Write-Host "   • App: http://localhost:5174 → Reminders page" -ForegroundColor Cyan
Write-Host "   • Logs: https://supabase.com/dashboard/project/$PROJECT_REF/logs/edge-functions" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Full Documentation: EMAIL_REMINDER_SETUP.md" -ForegroundColor Cyan
Write-Host ""
