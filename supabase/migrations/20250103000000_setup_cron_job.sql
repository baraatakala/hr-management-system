-- ============================================
-- Email Reminder Cron Job Setup
-- ============================================
-- This script sets up an automated daily job to send email reminders
-- for expiring employee documents (passports, cards, Emirates IDs, etc.)
--
-- INSTRUCTIONS:
-- 1. Replace YOUR_SERVICE_ROLE_KEY below with your actual key from:
--    https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/settings/api
-- 2. Run this script in Supabase SQL Editor:
--    https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/sql/new
-- ============================================

-- Step 1: Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Step 2: Enable http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;

-- Step 3: Create the cron job
-- This will run every day at 9:00 AM UTC
SELECT cron.schedule(
  'send-document-reminders',  -- Job name (can be changed)
  '0 9 * * *',                 -- Cron schedule: Every day at 9:00 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://lydqwukaryqghovxbcqg.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZHF3dWthcnlxZ2hvdnhiY3FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA4OTI4MSwiZXhwIjoyMDY3NjY1MjgxfQ.CQiqU_StpnAgvYDdcgdsfk9hn9-AkCXyiDsWP13UTgA'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ============================================
-- SCHEDULE OPTIONS (Choose one)
-- ============================================
-- Replace the schedule above with one of these:

-- Every day at 9 AM UTC
-- '0 9 * * *'

-- Every day at 2 PM UTC (9 PM UAE time)
-- '0 14 * * *'

-- Every Monday at 9 AM UTC
-- '0 9 * * 1'

-- Twice daily: 9 AM and 5 PM UTC
-- '0 9,17 * * *'

-- Every hour (for testing)
-- '0 * * * *'

-- Every 5 minutes (for testing only!)
-- '*/5 * * * *'

-- ============================================
-- MANAGEMENT COMMANDS
-- ============================================

-- View all scheduled jobs
-- SELECT * FROM cron.job;

-- View job run history (last 10 runs)
-- SELECT * FROM cron.job_run_details 
-- WHERE jobname = 'send-document-reminders'
-- ORDER BY start_time DESC 
-- LIMIT 10;

-- Delete/unschedule the job
-- SELECT cron.unschedule('send-document-reminders');

-- Update job schedule (change timing)
-- SELECT cron.unschedule('send-document-reminders');
-- Then run the SELECT cron.schedule() command again with new timing

-- ============================================
-- VERIFICATION
-- ============================================

-- After creating the job, verify it was created successfully:
SELECT * FROM cron.job;

-- Expected output:
-- jobid | jobname                    | schedule    | active | database
-- ------+----------------------------+-------------+--------+----------
-- 1     | send-document-reminders    | 0 9 * * *   | true   | postgres

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If the job is not running:

-- 1. Check if extensions are enabled
SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'http');

-- 2. Check recent job runs for errors
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 5;

-- 3. Verify the Edge Function is deployed
-- Go to: https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/functions

-- 4. Test the Edge Function manually via SQL
SELECT net.http_post(
  url := 'https://lydqwukaryqghovxbcqg.supabase.co/functions/v1/send-reminders',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZHF3dWthcnlxZ2hvdnhiY3FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA4OTI4MSwiZXhwIjoyMDY3NjY1MjgxfQ.CQiqU_StpnAgvYDdcgdsfk9hn9-AkCXyiDsWP13UTgA'
  ),
  body := '{}'::jsonb
);

-- ============================================
-- SECURITY NOTES
-- ============================================
-- 
-- ⚠️ The Service Role Key has full admin access to your database
-- ⚠️ Never commit this key to version control
-- ⚠️ Only use it in secure server-side environments
-- ⚠️ Consider rotating keys periodically
--
-- ============================================

-- Done! Your email reminder system is now automated 🎉
