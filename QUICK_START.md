# HR Management System - Quick Start Guide

## 🎯 Overview

A complete Employee Management System built with:
- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **UI**: shadcn/ui components
- **Features**: Bilingual (EN/AR), Dark Mode, Email Reminders, Analytics

---

## 🚀 Installation Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_RESEND_API_KEY=your-resend-api-key-here
```

**Where to get these:**
1. **Supabase URL & Key**: 
   - Sign up at https://supabase.com
   - Create a new project
   - Go to Settings → API → Copy URL and anon/public key

2. **Resend API Key**:
   - Sign up at https://resend.com
   - Go to API Keys → Create API Key

### Step 3: Set Up Database

**Option A: Using Supabase Dashboard (Easiest)**
1. Go to your Supabase project
2. Click on SQL Editor
3. Copy and paste the entire contents of `supabase/migrations/20250101000000_initial_schema.sql`
4. Click "Run"

**Option B: Using Supabase CLI**
```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your_project_ref

# Push migration
supabase db push
```

### Step 4: Create Admin User

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter:
   - Email: `admin@hrgroup.com`
   - Password: (choose a secure password)
   - ✅ Auto Confirm User

### Step 5: Deploy Email Reminder Function

**Option A: Manual Setup in Supabase Dashboard**
1. Go to Edge Functions
2. Create new function: `send-reminders`
3. Copy contents from `supabase/functions/send-reminders/index.ts`
4. Deploy

**Option B: Using CLI**
```bash
supabase functions deploy send-reminders --no-verify-jwt
```

### Step 6: Set Up Daily Email Cron Job (Optional)

1. Go to Database → Extensions → Enable `pg_cron`
2. Run this SQL:

```sql
SELECT cron.schedule(
  'send-daily-reminders',
  '0 9 * * *', -- 9 AM daily
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/send-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

### Step 7: Run Development Server

```bash
npm run dev
```

Visit: http://localhost:5173

---

## 📱 Usage Guide

### Login
1. Use the admin credentials you created
2. The system will redirect you to the dashboard

### Dashboard
- View total employees
- See documents expiring soon
- Check analytics charts
- Monitor recent activity

### Managing Employees
1. Click "Employees" in sidebar
2. Click "+ Add Employee" button
3. Fill in employee details:
   - Basic info (name in English and Arabic)
   - Company, department, job assignment
   - Document details (passport, card, Emirates ID, residence)
   - Contact information
4. Click "Save"

**Search Employees**: Use the search box to find by name, employee number, passport, or Emirates ID

### Managing Companies/Departments/Jobs
1. Navigate to respective section
2. Click "+ Add" button
3. Enter code, English name, and Arabic name
4. Click "Save"

### Viewing Email Reminders
1. Go to "Email Reminders" page
2. See all sent/pending/failed reminders
3. Check reminder status and timestamps

### Settings
- **Language**: Toggle between English and Arabic (RTL support)
- **Theme**: Switch between light and dark mode

---

## 🎨 Features Checklist

✅ **Authentication**
- Email/password login
- Protected routes
- Session management

✅ **Employee Management**
- Add, edit, delete employees
- Bilingual support (English/Arabic)
- Document tracking
- Search and filter

✅ **Document Expiry Tracking**
- Passport expiry
- Work card expiry
- Emirates ID expiry
- Residence permit expiry
- Visual indicators (red = expired, yellow = expiring soon, green = valid)

✅ **Email Reminders**
- Automated daily checks
- Email notifications for expiring documents
- Reminder logs and history

✅ **Analytics Dashboard**
- Total employees count
- Missing documents statistics
- Expiry warnings
- Company distribution charts
- Recent activity log

✅ **Multi-language**
- English and Arabic
- RTL layout support
- Localized date formats

✅ **Dark Mode**
- Light/dark theme toggle
- Persisted preference

---

## 🔧 Customization

### Adding More Document Types

**1. Update Database:**
```sql
ALTER TABLE employees ADD COLUMN new_document_expiry DATE;
```

**2. Update TypeScript Types:**
Edit `src/lib/database.types.ts`

**3. Update Employee Form:**
Edit `src/pages/EmployeesPage.tsx` - add new input fields

**4. Update Reminder Function:**
Edit `supabase/functions/send-reminders/index.ts`

### Changing Email Provider

Edit `supabase/functions/send-reminders/index.ts` and replace the `sendEmail` function. Examples provided in README.md for SendGrid and Mailgun.

### Adding New Languages

**1. Update i18n config:**
Edit `src/i18n/config.ts`

**2. Add translations:**
```typescript
const resources = {
  en: { translation: {...} },
  ar: { translation: {...} },
  fr: { translation: {...} }, // Add new language
}
```

---

## 🐛 Common Issues

### "Missing environment variables" error
- Ensure `.env` file exists in root directory
- Check all variables are set correctly
- Restart dev server after changing `.env`

### Database connection fails
- Verify Supabase project is active
- Check URL and keys are correct
- Ensure RLS policies are enabled

### Email reminders not sending
- Verify Resend API key is valid
- Check Edge Function is deployed
- Review function logs in Supabase

### Build errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Database Schema Overview

```
companies (id, code, name_en, name_ar)
    ↓
employees (id, employee_no, name_en, name_ar, company_id, ...)
    ↓
activity_log (id, employee_id, action, timestamp)
reminders (id, employee_id, type, status, sent_at)

departments (id, code, name_en, name_ar)
jobs (id, code, name_en, name_ar)
```

---

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options

**1. Vercel**
```bash
npm i -g vercel
vercel
```

**2. Netlify**
```bash
npm i -g netlify-cli
netlify deploy --prod
```

**3. Supabase Hosting** (Coming Soon)

### Environment Variables in Production
Set all `.env` variables in your hosting platform's settings.

---

## 📞 Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review Supabase logs for backend errors
3. Check browser console for frontend errors

---

## 🎉 You're All Set!

The system is ready to use. Start by:
1. Adding companies, departments, and job titles
2. Creating employee records
3. Setting up the email reminder cron job
4. Monitoring the dashboard for insights

Happy managing! 🚀
