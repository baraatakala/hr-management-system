# Test Email Reminder Function
# Run this after deploying the Edge Function

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST EMAIL REMINDER FUNCTION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZHF3dWthcnlxZ2hvdnhiY3FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA4OTI4MSwiZXhwIjoyMDY3NjY1MjgxfQ.CQiqU_StpnAgvYDdcgdsfk9hn9-AkCXyiDsWP13UTgA"
$FUNCTION_URL = "https://lydqwukaryqghovxbcqg.supabase.co/functions/v1/send-reminders"

Write-Host "Testing function..." -ForegroundColor Yellow
Write-Host "URL: $FUNCTION_URL`n" -ForegroundColor Gray

try {
    $headers = @{
        "Authorization" = "Bearer $SERVICE_ROLE_KEY"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri $FUNCTION_URL -Method POST -Headers $headers -Body "{}" -TimeoutSec 30
    
    Write-Host "[SUCCESS] Function executed!" -ForegroundColor Green
    Write-Host "`nResponse:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host
    Write-Host ""
    
    if ($response.success) {
        Write-Host "[OK] Function is working correctly!" -ForegroundColor Green
        
        if ($response.processed -eq 0) {
            Write-Host "`n[INFO] No emails sent - No employees with expiring documents found" -ForegroundColor Yellow
            Write-Host "       This is normal if you haven't added test data yet`n" -ForegroundColor Gray
        } else {
            Write-Host "`n[OK] Processed $($response.processed) reminders!" -ForegroundColor Green
            Write-Host "     Check your email inbox`n" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "[ERROR] Function test failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*404*") {
        Write-Host "[HINT] Function not deployed yet or wrong name" -ForegroundColor Yellow
        Write-Host "       Make sure the function is named 'send-reminders'`n" -ForegroundColor Gray
    } elseif ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*403*") {
        Write-Host "[HINT] Authorization error" -ForegroundColor Yellow
        Write-Host "       Check if Service Role Key is correct`n" -ForegroundColor Gray
    } else {
        Write-Host "[HINT] Check function logs:" -ForegroundColor Yellow
        Write-Host "       https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/logs/edge-functions`n" -ForegroundColor Cyan
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Add Test Data:" -ForegroundColor Yellow
Write-Host "   - Open: https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/sql/new" -ForegroundColor Cyan
Write-Host "   - Copy SQL from: supabase\migrations\20250104000000_test_data_reminders.sql" -ForegroundColor White
Write-Host "   - Replace email addresses with YOUR real email" -ForegroundColor White
Write-Host "   - Click 'Run'`n" -ForegroundColor White

Write-Host "2. Test Again:" -ForegroundColor Yellow
Write-Host "   - Run this script again: .\test-function.ps1" -ForegroundColor Cyan
Write-Host "   - You should receive test emails`n" -ForegroundColor White

Write-Host "3. Set up Cron Job (Auto-run daily):" -ForegroundColor Yellow
Write-Host "   - Open: https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/sql/new" -ForegroundColor Cyan
Write-Host "   - Copy SQL from: supabase\migrations\20250103000000_setup_cron_job.sql" -ForegroundColor White
Write-Host "   - Replace YOUR_SERVICE_ROLE_KEY with your actual key" -ForegroundColor White
Write-Host "   - Click 'Run'`n" -ForegroundColor White

Write-Host "4. Monitor Reminders:" -ForegroundColor Yellow
Write-Host "   - Open your app: http://localhost:5174" -ForegroundColor Cyan
Write-Host "   - Go to: Reminders page" -ForegroundColor White
Write-Host "   - See all sent reminders`n" -ForegroundColor White

Write-Host "========================================`n" -ForegroundColor Cyan
