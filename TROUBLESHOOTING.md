# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. Installation Issues

#### Problem: `npm install` fails
**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete lock file and node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps
```

#### Problem: TypeScript errors in IDE
**Solution:**
- Restart VS Code
- Run: `npm install` to ensure all types are installed
- Check that TypeScript version matches: `"typescript": "^5.3.3"`

---

### 2. Supabase Connection Issues

#### Problem: "Missing Supabase environment variables"
**Solution:**
1. Verify `.env` file exists in project root (same level as `package.json`)
2. Check file contains:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxx...
   ```
3. Restart dev server after adding/changing `.env`
4. Variables must start with `VITE_` prefix

#### Problem: "Failed to fetch" or network errors
**Solutions:**
- Check Supabase project is not paused (free tier pauses after inactivity)
- Verify project URL is correct
- Check internet connection
- Try visiting Supabase URL in browser to confirm it's accessible
- Check browser console for CORS errors

#### Problem: Database queries return empty
**Solutions:**
- Verify RLS (Row Level Security) policies are set correctly
- Check if you're authenticated (user is logged in)
- Run SQL in Supabase SQL Editor to verify data exists:
  ```sql
  SELECT * FROM companies;
  SELECT * FROM employees;
  ```

---

### 3. Authentication Issues

#### Problem: Can't log in / "Invalid credentials"
**Solutions:**
- Verify user exists in Supabase → Authentication → Users
- Check if email is confirmed (toggle "Auto Confirm User" when creating)
- Try resetting password in Supabase dashboard
- Clear browser localStorage: `localStorage.clear()`

#### Problem: Stuck on login page after successful login
**Solutions:**
- Check browser console for errors
- Verify `AuthContext` is properly wrapped around app
- Clear cookies and localStorage
- Check if RLS policies allow reading employee data

#### Problem: Automatically logged out
**Solutions:**
- Check Supabase project settings → Auth → Session timeout
- Increase JWT expiry time in Supabase settings
- Check browser is allowing cookies

---

### 4. Database Migration Issues

#### Problem: Migration fails with "relation already exists"
**Solution:**
```sql
-- Drop all tables and start fresh (WARNING: Deletes all data!)
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;

-- Then run migration again
```

#### Problem: Foreign key constraint errors
**Solution:**
- Ensure you're creating tables in the correct order (companies before employees)
- Check that referenced IDs actually exist
- Verify foreign key columns have matching data types

---

### 5. Email Reminder Issues

#### Problem: Emails not sending
**Solutions:**

**Check Resend API Key:**
```bash
# Test API key with curl
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from": "test@yourcompany.com", "to": ["you@email.com"], "subject": "Test", "html": "<p>Test</p>"}'
```

**Check Edge Function:**
```bash
# View function logs
supabase functions logs send-reminders
```

**Common fixes:**
- Verify Resend API key is active (check resend.com dashboard)
- Ensure "from" email is verified in Resend
- Check employee email addresses are valid
- Verify Edge Function is deployed
- Check function environment variables are set

#### Problem: Duplicate emails sent
**Solution:**
- Check reminder table for existing entries
- The function should check for existing reminders before sending
- Run this to clear test reminders:
```sql
DELETE FROM reminders WHERE status = 'sent';
```

---

### 6. Build and Deployment Issues

#### Problem: Build fails with TypeScript errors
**Solutions:**
```bash
# Check TypeScript config
npx tsc --noEmit

# If errors, try:
npm install --save-dev @types/node @types/react @types/react-dom

# Update TypeScript
npm install --save-dev typescript@latest
```

#### Problem: "Module not found" in production
**Solutions:**
- Check import paths use `@/` alias correctly
- Verify `vite.config.ts` has path alias configured
- Ensure all dependencies are in `dependencies` not `devDependencies`

#### Problem: Environment variables not working in production
**Solutions:**
- Set environment variables in hosting platform (Vercel/Netlify)
- Remember: Only variables starting with `VITE_` are exposed to client
- Rebuild after changing environment variables

---

### 7. UI/Display Issues

#### Problem: Styles not loading / looks broken
**Solutions:**
```bash
# Rebuild Tailwind
npm run build

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

#### Problem: Dark mode not working
**Solutions:**
- Check localStorage: `localStorage.getItem('theme')`
- Verify Tailwind config has `darkMode: ["class"]`
- Check `<html>` tag has `dark` class when enabled
- Clear browser cache

#### Problem: Arabic text not displaying correctly
**Solutions:**
- Verify font supports Arabic characters
- Check `dir="rtl"` is set when Arabic is selected
- Install Arabic font or use system fonts
- Check `document.documentElement.dir` in browser console

#### Problem: Charts not rendering
**Solutions:**
- Check if data is being fetched (look in browser network tab)
- Verify Recharts is installed: `npm list recharts`
- Check console for errors
- Ensure container has defined height

---

### 8. Performance Issues

#### Problem: Slow page loads
**Solutions:**
- Enable React Query cache
- Check database indexes are created
- Reduce number of API calls
- Use pagination for large datasets
- Optimize images

#### Problem: Slow database queries
**Solutions:**
```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM employees WHERE company_id = 'xxx';

-- Add missing indexes
CREATE INDEX idx_name ON table_name(column_name);
```

---

### 9. Development Issues

#### Problem: Hot reload not working
**Solutions:**
- Restart dev server: `npm run dev`
- Check file is being watched (not in node_modules)
- Try creating new file to test
- Clear Vite cache: `rm -rf node_modules/.vite`

#### Problem: ESLint errors everywhere
**Solutions:**
```bash
# Install ESLint dependencies
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Disable ESLint if needed (not recommended)
# Delete .eslintrc.cjs
```

---

### 10. Supabase Edge Function Issues

#### Problem: Edge function fails to deploy
**Solutions:**
```bash
# Install Deno (required for Edge Functions)
# On Windows: 
irm https://deno.land/install.ps1 | iex

# On Mac/Linux:
curl -fsSL https://deno.land/x/install/install.sh | sh

# Login again
supabase login

# Deploy with verbose logging
supabase functions deploy send-reminders --debug
```

#### Problem: Edge function runs but doesn't work
**Solutions:**
- Check function logs: `supabase functions logs send-reminders`
- Verify environment variables are set in Supabase dashboard
- Test function manually:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-reminders \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

### 11. Cron Job Issues

#### Problem: Cron job not running
**Solutions:**
- Check `pg_cron` extension is enabled
- Verify cron schedule syntax
- Check Supabase project logs
- Test function URL manually first
- Verify function accepts POST requests

---

## 🆘 Still Having Issues?

### Debugging Checklist:
1. ✅ Check browser console (F12) for JavaScript errors
2. ✅ Check Network tab for failed API requests
3. ✅ Check Supabase logs for backend errors
4. ✅ Verify environment variables are set correctly
5. ✅ Ensure all dependencies are installed
6. ✅ Try in incognito mode (rules out extension conflicts)
7. ✅ Check if issue happens in fresh project

### Get Help:
- Check Supabase Discord: https://discord.supabase.com
- Review Supabase docs: https://supabase.com/docs
- Check GitHub issues for similar problems
- Search Stack Overflow

### Report a Bug:
Include:
- OS and Node version: `node -v`
- npm version: `npm -v`
- Error message and full stack trace
- Steps to reproduce
- Browser console output
- Supabase logs if relevant

---

## 🔍 Quick Diagnostic Commands

```bash
# Check Node version (should be 18+)
node -v

# Check npm version
npm -v

# Check if TypeScript is installed
npx tsc -v

# Check if Supabase CLI is installed
supabase -v

# List installed packages
npm list --depth=0

# Check for outdated packages
npm outdated

# Validate package.json
npm doctor
```

---

## 💡 Prevention Tips

1. **Always commit before major changes** (use git)
2. **Test in development before production**
3. **Keep dependencies updated** (but test after updates)
4. **Use environment variables for secrets**
5. **Enable error tracking** in production
6. **Backup database regularly**
7. **Monitor Supabase usage** (watch quotas)
8. **Document any customizations**

---

**Remember**: Most issues are configuration-related. Double-check environment variables, Supabase settings, and follow the setup guide carefully. 🎯
