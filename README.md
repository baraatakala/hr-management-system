# HR Management System - Setup Instructions

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RESEND_API_KEY=your_resend_api_key
```

### 3. Run Database Migration

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your_project_ref
```

4. Run the migration:
```bash
supabase db push
```

Or manually run the SQL in `supabase/migrations/20250101000000_initial_schema.sql` in your Supabase SQL Editor.

### 4. Set Up Email Reminders (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add it to your `.env` file

### 5. Deploy Edge Function

```bash
supabase functions deploy send-reminders --no-verify-jwt
```

### 6. Set Up Cron Job

In Supabase Dashboard:
1. Go to Database → Cron Jobs
2. Create a new cron job:
   - Name: `send-daily-reminders`
   - Schedule: `0 9 * * *` (9 AM daily)
   - SQL Command:
   ```sql
   SELECT
     net.http_post(
       url:='https://your-project.supabase.co/functions/v1/send-reminders',
       headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
     ) as request_id;
   ```

### 7. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## 📝 Default Credentials

After running migrations, create a user in Supabase Auth:
- Go to Authentication → Users → Add User
- Email: `admin@hrgroup.com`
- Password: (choose a secure password)

## 🗂️ Project Structure

```
hr-management-system/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Layout.tsx    # Main layout with sidebar
│   │   └── ProtectedRoute.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── pages/            # Application pages
│   │   ├── Dashboard.tsx
│   │   ├── EmployeesPage.tsx
│   │   ├── CompaniesPage.tsx
│   │   ├── DepartmentsPage.tsx
│   │   ├── JobsPage.tsx
│   │   └── RemindersPage.tsx
│   ├── lib/              # Utilities
│   │   ├── supabase.ts   # Supabase client
│   │   └── utils.ts      # Helper functions
│   ├── i18n/             # Internationalization
│   │   └── config.ts     # i18n configuration
│   ├── store/            # State management
│   │   └── useTheme.ts   # Theme store
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── supabase/
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge functions
│       └── send-reminders/
└── public/
```

## 🎨 Features

### Implemented
- ✅ Authentication (Supabase Auth)
- ✅ Dashboard with analytics and charts
- ✅ Employee management (CRUD)
- ✅ Company management (CRUD)
- ✅ Department management (CRUD)
- ✅ Job management (CRUD)
- ✅ Email reminder system
- ✅ Reminder log viewer
- ✅ Dark mode
- ✅ RTL support (English/Arabic)
- ✅ Responsive design
- ✅ Document expiry tracking
- ✅ Search and filters

### Advanced Features (Optional)
- 📊 Bulk import/export (CSV)
- 📄 PDF report generation
- 👥 Multi-tenant support
- 🔐 Role-based access control
- 📱 Mobile app version

## 🔧 Configuration

### Email Service Alternatives

If you prefer not to use Resend, you can modify the `send-reminders` Edge Function to use:

#### SendGrid
```typescript
await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email: employee.email }] }],
    from: { email: 'noreply@yourcompany.com' },
    subject: `Document Expiry Reminder`,
    content: [{ type: 'text/html', value: htmlContent }],
  }),
})
```

#### Mailgun
```typescript
await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
  },
  body: new URLSearchParams({
    from: 'noreply@yourcompany.com',
    to: employee.email,
    subject: 'Document Expiry Reminder',
    html: htmlContent,
  }),
})
```

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Issues
- Verify your `.env` file has correct credentials
- Check Supabase project is active
- Ensure RLS policies are set correctly

### Email Not Sending
- Verify Resend API key is valid
- Check Edge Function logs: `supabase functions logs send-reminders`
- Ensure employee email addresses are valid

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Resend API](https://resend.com/docs)

## 📄 License

MIT License - feel free to use this project for your organization.

## 🤝 Support

For issues or questions, please open an issue on GitHub or contact the development team.
