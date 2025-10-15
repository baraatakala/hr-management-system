# Deploy Edge Function - Manual Steps

Since Docker Desktop is not running, follow these steps to deploy via Supabase Dashboard:

## Step 1: Open Supabase Functions Dashboard

Go to: https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/functions

## Step 2: Create New Function

1. Click "Create a new function" button
2. Name: `send-reminders`
3. Click "Create function"

## Step 3: Copy Function Code

Open the file: `supabase\functions\send-reminders\index.ts`

Copy ALL the code from that file (Ctrl+A, Ctrl+C)

## Step 4: Paste and Deploy

1. In the Supabase Dashboard function editor, paste the code
2. Click "Deploy" button
3. Wait for deployment to complete (about 30 seconds)

## Step 5: Verify Deployment

You should see "Function deployed successfully" message

## Step 6: Test the Function

Option A - Via Dashboard:
1. Click "Invoke" button in the function page
2. Use empty body: `{}`
3. Click "Send request"

Option B - Via PowerShell:
```powershell
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZHF3dWthcnlxZ2hvdnhiY3FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA4OTI4MSwiZXhwIjoyMDY3NjY1MjgxfQ.CQiqU_StpnAgvYDdcgdsfk9hn9-AkCXyiDsWP13UTgA"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://lydqwukaryqghovxbcqg.supabase.co/functions/v1/send-reminders" -Method POST -Headers $headers -Body "{}"
```

## Expected Response

If no employees with expiring documents:
```json
{
  "success": true,
  "processed": 0,
  "results": []
}
```

## Next Steps

After successful deployment:

1. **Add Test Data** - Run the SQL in `supabase\migrations\20250104000000_test_data_reminders.sql`
2. **Set up Cron Job** - Run the SQL in `supabase\migrations\20250103000000_setup_cron_job.sql`
3. **Monitor** - Check the Reminders page in your app: http://localhost:5174

---

**Alternative: Deploy via CLI (if Docker is running)**

If you start Docker Desktop:
```powershell
supabase functions deploy send-reminders
```
