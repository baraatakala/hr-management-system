# 📧 Email Reminder System Setup Guide

This guide will help you set up automated email reminders for expiring employee documents (passports, cards, Emirates IDs, residence permits).

## 🎯 Overview

The email reminder system consists of:

1. **Edge Function** - Checks for expiring documents and sends emails
2. **Resend API** - Email delivery service
3. **Database Triggers** - Logs all reminder activity
4. **Cron Job** - Runs automatically (daily/weekly)

---

## 📋 Prerequisites

✅ You already have:

- Supabase project: `lydqwukaryqghovxbcqg`
- Resend API key: `re_JPm8m1vU_GchkvBsobRtawyCvEGyTFqek`
- Edge Function code: `supabase/functions/send-reminders/index.ts`

---

## 🚀 Step-by-Step Setup

### Step 1: Install Supabase CLI

Open PowerShell and run:

```powershell
# Install Supabase CLI via npm
npm install -g supabase

# Verify installation
supabase --version
```

### Step 2: Login to Supabase

```powershell
# Login to your Supabase account
supabase login

# This will open a browser window - authorize the CLI
```

### Step 3: Link Your Project

```powershell
# Navigate to your project directory
cd "C:\Users\isc\VS_Code\project_2\project_2\hr-management-system"

# Link to your Supabase project
supabase link --project-ref lydqwukaryqghovxbcqg

# When prompted, enter your database password
```

### Step 4: Set Environment Variables for Edge Function

The Edge Function needs these environment variables:

1. Go to: https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/settings/functions

2. Add these secrets:

```bash
# Your Resend API key
RESEND_API_KEY=re_JPm8m1vU_GchkvBsobRtawyCvEGyTFqek

# Your Supabase URL (already set)
SUPABASE_URL=https://lydqwukaryqghovxbcqg.supabase.co

# Get your Service Role Key from:
# https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/settings/api
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**To add secrets via CLI:**

```powershell
supabase secrets set RESEND_API_KEY=re_JPm8m1vU_GchkvBsobRtawyCvEGyTFqek
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 5: Deploy the Edge Function

```powershell
# Deploy the send-reminders function
supabase functions deploy send-reminders

# Verify deployment
supabase functions list
```

### Step 6: Test the Function Manually

```powershell
# Test the function
supabase functions invoke send-reminders --method POST
```

Or test via curl:

```powershell
curl -X POST "https://lydqwukaryqghovxbcqg.supabase.co/functions/v1/send-reminders" `
  -H "Authorization: Bearer YOUR_ANON_KEY" `
  -H "Content-Type: application/json"
```

### Step 7: Set Up Automated Scheduling (Cron Job)

#### Option A: Using Supabase pg_cron (Recommended)

1. Go to SQL Editor: https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/sql/new

2. Run this SQL to create a daily cron job:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to run daily at 9 AM
SELECT cron.schedule(
  'send-document-reminders',  -- Job name
  '0 9 * * *',                 -- Every day at 9:00 AM (UTC)
  $$
  SELECT net.http_post(
    url := 'https://lydqwukaryqghovxbcqg.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- View all scheduled jobs
SELECT * FROM cron.job;

-- To delete the job (if needed)
-- SELECT cron.unschedule('send-document-reminders');
```

**Note:** Replace `YOUR_SERVICE_ROLE_KEY` with your actual service role key from:
https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/settings/api

#### Option B: Using External Cron Service (Alternative)

Use services like:

- **Cron-job.org** - Free, web-based
- **EasyCron** - Free tier available
- **GitHub Actions** - If your project is on GitHub

Configure them to POST to:

```
https://lydqwukaryqghovxbcqg.supabase.co/functions/v1/send-reminders
```

---

## 📊 Monitor Reminder Activity

### View Sent Reminders in Your App

1. Open your app: http://localhost:5174
2. Navigate to **Reminders** page
3. See all sent email reminders with:
   - Employee name
   - Document type
   - Expiry date
   - Send status
   - Timestamp

### Check Logs in Supabase

Go to: https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/logs/edge-functions

Filter by function: `send-reminders`

---

## 🔧 Configuration & Customization

### Adjust Reminder Timing

Edit `supabase/functions/send-reminders/index.ts`:

```typescript
// Change from 30 days to 45 days notice
const thirtyDaysFromNow = new Date();
thirtyDaysFromNow.setDate(today.getDate() + 45); // Change here
```

### Customize Email Template

Edit the `sendEmail` function in the Edge Function:

```typescript
html: `
  <h2>🔔 Document Expiry Reminder</h2>
  <p>Dear ${employee.name_en},</p>
  <!-- Customize your email content here -->
`;
```

### Change Email Sender

Update the `from` field:

```typescript
from: 'HR Management System <noreply@yourcompany.com>',
// Change to your verified domain in Resend
```

**Note:** You need to verify your domain in Resend:
https://resend.com/domains

---

## 🧪 Testing Checklist

### 1. Test Email Delivery

1. Add a test employee with an expiring document (30 days from now)
2. Manually invoke the function
3. Check if email is received
4. Verify reminder is logged in the database

### 2. Test Duplicate Prevention

1. Run the function twice for the same employee
2. Verify only ONE email is sent (no duplicates)

### 3. Test Multiple Documents

1. Add employee with multiple expiring documents
2. Verify separate emails are sent for each document

---

## 🐛 Troubleshooting

### Edge Function Not Deploying

```powershell
# Check if you're logged in
supabase projects list

# Re-link your project
supabase link --project-ref lydqwukaryqghovxbcqg
```

### Emails Not Sending

1. **Check Resend API Key**: Verify it's correct in Supabase secrets
2. **Check Email Domain**: Verify your domain in Resend dashboard
3. **Check Function Logs**: Look for errors in Supabase dashboard
4. **Test Resend API**: Send a test email via Resend dashboard

### Cron Job Not Running

```sql
-- Check if cron is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Check job status
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Check job schedule
SELECT * FROM cron.job;
```

### No Reminders in Database

Check if:

1. Database migration was run (reminders table exists)
2. Edge Function has correct SUPABASE_SERVICE_ROLE_KEY
3. Function is successfully inserting records (check logs)

---

## 🎯 Quick Start Commands

```powershell
# Complete setup in one go:
npm install -g supabase
supabase login
cd "C:\Users\isc\VS_Code\project_2\project_2\hr-management-system"
supabase link --project-ref lydqwukaryqghovxbcqg
supabase secrets set RESEND_API_KEY=re_JPm8m1vU_GchkvBsobRtawyCvEGyTFqek
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
supabase functions deploy send-reminders
supabase functions invoke send-reminders --method POST
```

---

## 📚 Additional Resources

- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Resend Documentation**: https://resend.com/docs
- **pg_cron Documentation**: https://github.com/citusdata/pg_cron

---

## ✅ Setup Verification

After completing all steps, verify:

- [ ] Supabase CLI installed
- [ ] Project linked successfully
- [ ] Edge Function deployed
- [ ] Environment variables set
- [ ] Function invoked successfully
- [ ] Test email received
- [ ] Cron job scheduled
- [ ] Reminders logged in database

---

## 🎉 You're All Set!

Your email reminder system is now:

- ✅ Automatically checking for expiring documents
- ✅ Sending email notifications
- ✅ Logging all activity
- ✅ Preventing duplicate reminders

**Monitor your reminders at:**
http://localhost:5174 → Reminders page
