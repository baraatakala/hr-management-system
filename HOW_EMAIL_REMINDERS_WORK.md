# 📧 Email Reminder System - How It Works

## 🔄 System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    DAILY AUTOMATED PROCESS                       │
└─────────────────────────────────────────────────────────────────┘

1. ⏰ CRON JOB TRIGGERS (9:00 AM UTC Daily)
   │
   │   [PostgreSQL pg_cron]
   │
   ├──> Calls Edge Function
   │    URL: /functions/v1/send-reminders
   │
   ▼

2. 🔍 CHECK EXPIRING DOCUMENTS
   │
   │   [Supabase Edge Function]
   │
   ├──> Query employees table
   │    • Find documents expiring in 30 days
   │    • Filter: passport, card, Emirates ID, residence
   │    • Only employees with email addresses
   │
   ▼

3. 📝 FOUND EXPIRING DOCUMENTS?
   │
   ├─ NO ──> ✅ End (No action needed)
   │
   └─ YES ─┐
           │
           ▼

4. 🔍 CHECK FOR DUPLICATES
   │
   │   [reminders table]
   │
   ├──> Has reminder been sent already?
   │    • Check: employee_id + document_type + expiry_date
   │    • Status: 'sent'
   │
   ├─ YES ──> ⏩ Skip (Already notified)
   │
   └─ NO ─┐
          │
          ▼

5. 📧 SEND EMAIL
   │
   │   [Resend API]
   │
   ├──> POST https://api.resend.com/emails
   │    • From: HR Management System
   │    • To: employee@email.com
   │    • Subject: Document Expiry Reminder
   │    • Body: HTML template with details
   │
   ├─ SUCCESS ─┐
   │           │
   └─ FAILED ──┤
               │
               ▼

6. 📊 LOG REMINDER
   │
   │   [reminders table]
   │
   ├──> INSERT new record
   │    • employee_id
   │    • type (passport/card/etc)
   │    • target_date (expiry date)
   │    • status (sent/failed)
   │    • sent_at (timestamp)
   │
   ▼

7. 🔄 REPEAT for next document/employee
   │
   └──> Return to step 3

8. ✅ COMPLETE
   │
   └──> Return summary:
        • Total processed
        • Emails sent
        • Emails failed
```

---

## 📊 Database Schema

```
┌─────────────────────┐
│   employees         │
├─────────────────────┤
│ • id (UUID)         │◄──────┐
│ • name_en           │       │
│ • name_ar           │       │
│ • email             │       │
│ • passport_expiry   │       │
│ • card_expiry       │       │
│ • emirates_id_expiry│       │
│ • residence_expiry  │       │
└─────────────────────┘       │
                               │
                               │ (Foreign Key)
                               │
┌─────────────────────┐       │
│   reminders         │       │
├─────────────────────┤       │
│ • id (UUID)         │       │
│ • employee_id ──────┼───────┘
│ • type              │ (passport, card, etc)
│ • target_date       │ (expiry date)
│ • status            │ (sent, failed)
│ • sent_at           │ (timestamp)
│ • created_at        │
└─────────────────────┘
```

---

## 🎯 Example Scenario

### Scenario: Sara's Emirates ID is expiring

```
Day 1 (Nov 1, 2025):
├─ Sara's Emirates ID expiry: Dec 1, 2025 (30 days away)
├─ Cron job runs at 9 AM UTC
├─ Edge Function queries database
├─ Finds Sara's expiring Emirates ID
└─ Status: ✅ Ready to send reminder

Day 1 - 9:01 AM:
├─ Checks reminders table
├─ No previous reminder found for this document
├─ Sends email to sara.ali@company.com
├─ Email content:
│   Subject: Document Expiry Reminder - EMIRATES ID
│   Body: "Your Emirates ID is expiring on Dec 1, 2025"
└─ Status: ✅ Email sent successfully

Day 1 - 9:02 AM:
├─ Inserts record into reminders table:
│   {
│     employee_id: "sara-uuid",
│     type: "emirates_id",
│     target_date: "2025-12-01",
│     status: "sent",
│     sent_at: "2025-11-01 09:02:00"
│   }
└─ Status: ✅ Logged in database

Day 2 (Nov 2, 2025):
├─ Cron job runs again at 9 AM UTC
├─ Finds Sara's expiring Emirates ID again (29 days away)
├─ Checks reminders table
├─ Finds existing reminder: status = "sent"
└─ Status: ⏩ SKIPPED (Already notified)

Result:
✅ Sara receives ONE email notification
✅ No duplicate emails
✅ Reminder logged for audit trail
```

---

## 🔐 Security & Best Practices

### Environment Variables Required

```
┌─────────────────────────────────────────────────┐
│ Edge Function Environment Variables             │
├─────────────────────────────────────────────────┤
│                                                  │
│ 1. RESEND_API_KEY                               │
│    • Used to: Send emails via Resend API       │
│    • Format: re_xxxxxxxxxxxxx                   │
│    • Security: Keep secret, rotate periodically │
│                                                  │
│ 2. SUPABASE_URL                                 │
│    • Used to: Connect to database              │
│    • Format: https://xxx.supabase.co           │
│    • Security: Public, safe to expose          │
│                                                  │
│ 3. SUPABASE_SERVICE_ROLE_KEY                   │
│    • Used to: Admin database access            │
│    • Format: eyJhbGciOiJIUzI1NiIsI...         │
│    • Security: ⚠️ CRITICAL - Never expose!     │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Access Control

```
┌──────────────────┐
│  User Browser    │
│  (Frontend)      │
└────────┬─────────┘
         │
         │ (VITE_SUPABASE_ANON_KEY)
         │ ├─ Can: Read own data
         │ └─ Cannot: Access admin functions
         │
         ▼
┌──────────────────┐
│  Supabase        │
│  (Backend)       │
└────────┬─────────┘
         │
         │ (SERVICE_ROLE_KEY)
         │ ├─ Can: Full database access
         │ ├─ Can: Bypass RLS policies
         │ └─ Used by: Edge Function only
         │
         ▼
┌──────────────────┐
│  Resend API      │
│  (Email Service) │
└──────────────────┘
```

---

## 📈 Monitoring & Debugging

### Check Reminder Status

```sql
-- View all sent reminders (last 7 days)
SELECT
  e.name_en,
  r.type as document,
  r.target_date as expires_on,
  r.status,
  r.sent_at
FROM reminders r
JOIN employees e ON e.id = r.employee_id
WHERE r.sent_at >= NOW() - INTERVAL '7 days'
ORDER BY r.sent_at DESC;
```

### Check Cron Job Status

```sql
-- View last 5 cron job executions
SELECT
  jobname,
  status,
  return_message,
  start_time,
  end_time,
  (end_time - start_time) as duration
FROM cron.job_run_details
WHERE jobname = 'send-document-reminders'
ORDER BY start_time DESC
LIMIT 5;
```

### Edge Function Logs

Access logs at:

```
https://supabase.com/dashboard/project/lydqwukaryqghovxbcqg/logs/edge-functions
```

Filter by:

- Function: `send-reminders`
- Time range: Last 24 hours
- Status: Errors only

---

## 🎨 Email Template

The email sent to employees looks like this:

```html
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 📧 Document Expiry Reminder
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Dear Ahmed Hassan, This is a reminder that
your passport is expiring soon. 📅 Expiry Date: December 15, 2025 ⚠️ Please take
necessary action to renew your document before it expires.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Best regards, HR Management Team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Customize Email Template

Edit: `supabase/functions/send-reminders/index.ts`

```typescript
html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h2>🔔 Document Expiry Reminder</h2>
    <p>Dear ${employee.name_en},</p>
    <!-- Add your custom styling here -->
  </div>
`;
```

---

## 🚨 Common Issues & Solutions

| Issue              | Cause                  | Solution                                  |
| ------------------ | ---------------------- | ----------------------------------------- |
| No emails received | Resend API key invalid | Check key in Supabase secrets             |
| Duplicate emails   | Reminder check failed  | Verify reminders table RLS policies       |
| Cron not running   | pg_cron not enabled    | Run: `CREATE EXTENSION pg_cron;`          |
| Function timeout   | Too many employees     | Add batching logic (process 50 at a time) |
| Wrong email sender | Domain not verified    | Verify domain in Resend dashboard         |

---

## ✅ Success Checklist

After setup, verify:

- [ ] Edge Function deployed successfully
- [ ] Environment variables set correctly
- [ ] Cron job created and active
- [ ] Test email received
- [ ] Reminder logged in database
- [ ] No duplicate emails sent
- [ ] Logs showing successful execution

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs/guides/functions
- **Resend Docs**: https://resend.com/docs
- **pg_cron Guide**: https://github.com/citusdata/pg_cron

---

🎉 **Your email reminder system is production-ready!**
