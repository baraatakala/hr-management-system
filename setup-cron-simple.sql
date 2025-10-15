-- ============================================
-- Email Reminder Cron Job Setup (SIMPLIFIED)
-- ============================================
-- Run this to set up daily automated email reminders
-- ============================================

-- Step 1: Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Step 2: Create cron job (runs daily at 9 AM UTC)
SELECT cron.schedule(
  'send-document-reminders',
  '0 9 * * *',
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

-- Step 3: Verify it was created
SELECT * FROM cron.job;
