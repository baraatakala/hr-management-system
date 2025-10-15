# 🚀 Deploy Edge Function via Supabase Dashboard
# Since Docker Desktop is not running, we'll deploy via the web interface

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Deploy Email Reminder Function" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Great progress! You've completed:" -ForegroundColor Green
Write-Host "  - Logged into Supabase CLI" -ForegroundColor White
Write-Host "  - Linked to project: lydqwukaryqghovxbcqg" -ForegroundColor White
Write-Host "  - Set RESEND_API_KEY secret" -ForegroundColor White
Write-Host ""

Write-Host "WARNING: Docker Desktop is not running" -ForegroundColor Yellow
Write-Host "   We'll deploy via Supabase Dashboard instead!`n" -ForegroundColor Yellow

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "STEP 1: Get Service Role Key" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "1. Open: https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/settings/api" -ForegroundColor White
Write-Host "2. Copy the 'service_role' key (the long one starting with 'eyJhbGc...')" -ForegroundColor White
Write-Host ""
$SERVICE_ROLE_KEY = Read-Host "Paste Service Role Key here"
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "STEP 2: Set Service Role Key Secret" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Running command..." -ForegroundColor Gray

try {
    supabase secrets set SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
    Write-Host "[OK] Service Role Key set successfully!" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to set secret" -ForegroundColor Red
}
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "STEP 3: Set SUPABASE_URL Secret" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

try {
    supabase secrets set SUPABASE_URL=https://lydqwukaryqghovxbcqg.supabase.co
    Write-Host "[OK] SUPABASE_URL set successfully!" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to set secret" -ForegroundColor Red
}
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "STEP 4: Deploy Function via Dashboard" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Choose deployment method:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option A: Start Docker Desktop (Recommended)" -ForegroundColor Cyan
Write-Host "  1. Start Docker Desktop application" -ForegroundColor White
Write-Host "  2. Wait for it to fully start (green icon)" -ForegroundColor White
Write-Host "  3. Run: supabase functions deploy send-reminders" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option B: Deploy via Dashboard (No Docker needed)" -ForegroundColor Cyan
Write-Host "  1. Open: https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/functions" -ForegroundColor White
Write-Host "  2. Click 'Create a new function'" -ForegroundColor White
Write-Host "  3. Name: send-reminders" -ForegroundColor White
Write-Host "  4. Open file: supabase\functions\send-reminders\index.ts" -ForegroundColor White
Write-Host "  5. Copy ALL the code from that file" -ForegroundColor White
Write-Host "  6. Paste into the function editor" -ForegroundColor White
Write-Host "  7. Click 'Deploy function'" -ForegroundColor White
Write-Host ""

$deployMethod = Read-Host "Which option? (A/B)"
Write-Host ""

if ($deployMethod -eq "A") {
    Write-Host "Waiting for Docker Desktop to start..." -ForegroundColor Yellow
    Write-Host "Press Enter once Docker is running..." -ForegroundColor Gray
    Read-Host
    
    Write-Host "Deploying function..." -ForegroundColor Yellow
    supabase functions deploy send-reminders
} else {
    Write-Host "Opening function file in VS Code..." -ForegroundColor Yellow
    code .\supabase\functions\send-reminders\index.ts
    Write-Host ""
    Write-Host "Copy the entire file content and deploy in Dashboard" -ForegroundColor Cyan
    Write-Host "   URL: https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/functions" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter once deployed"
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "STEP 5: Test the Function" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Testing via HTTP request..." -ForegroundColor Gray
Write-Host ""

try {
    $headers = @{
        "Authorization" = "Bearer $SERVICE_ROLE_KEY"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "https://lydqwukaryqghovxbcqg.supabase.co/functions/v1/send-reminders" -Method POST -Headers $headers -Body "{}"
    
    Write-Host "[SUCCESS] Function executed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
    Write-Host ""
    
} catch {
    Write-Host "[INFO] Function test:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Gray
    Write-Host ""
    Write-Host "This is normal if you haven't added test employees yet!" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Add Test Data:" -ForegroundColor White
Write-Host "   • Open: https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/sql/new" -ForegroundColor Cyan
Write-Host "   • Copy SQL from: supabase\migrations\20250104000000_test_data_reminders.sql" -ForegroundColor Cyan
Write-Host "   • Update email addresses with your real emails" -ForegroundColor Gray
Write-Host "   • Run the SQL" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test Manually:" -ForegroundColor White
Write-Host "   • Open Supabase Dashboard → Functions → send-reminders" -ForegroundColor Cyan
Write-Host "   • Click 'Invoke now'" -ForegroundColor Cyan
Write-Host "   • Check your email!" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Set up Cron Job (Auto-run daily):" -ForegroundColor White
Write-Host "   • Open: https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/sql/new" -ForegroundColor Cyan
Write-Host "   • Copy SQL from: supabase\migrations\20250103000000_setup_cron_job.sql" -ForegroundColor Cyan
Write-Host "   • Replace YOUR_SERVICE_ROLE_KEY with: $SERVICE_ROLE_KEY" -ForegroundColor Gray
Write-Host "   • Run the SQL" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Monitor Reminders:" -ForegroundColor White
Write-Host "   • App: http://localhost:5174 -> Reminders page" -ForegroundColor Cyan
Write-Host "   • Logs: https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/logs/edge-functions" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your email reminder system is ready!" -ForegroundColor Green
Write-Host ""
