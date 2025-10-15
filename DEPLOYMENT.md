# 🚀 Deployment Guide

## Overview

This guide covers deploying your HR Management System to production. The application consists of:
- **Frontend**: React application (Vite build)
- **Backend**: Supabase (already hosted)
- **Edge Functions**: Serverless email automation

---

## Deployment Options

### Option 1: Vercel (Recommended) ⭐

**Best for**: Quick deployment, automatic HTTPS, excellent DX

#### Steps:

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Set Environment Variables**
```bash
# Or set in Vercel dashboard
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_RESEND_API_KEY production
```

5. **Deploy to Production**
```bash
vercel --prod
```

#### Vercel Dashboard Setup:
1. Go to https://vercel.com
2. Import your Git repository
3. Add environment variables in Settings → Environment Variables
4. Enable automatic deployments from main branch

---

### Option 2: Netlify

**Best for**: Static sites, easy rollbacks, form handling

#### Steps:

1. **Install Netlify CLI**
```bash
npm i -g netlify-cli
```

2. **Login to Netlify**
```bash
netlify login
```

3. **Build**
```bash
npm run build
```

4. **Deploy**
```bash
netlify deploy --prod
```

#### Netlify Dashboard Setup:
1. Go to https://netlify.com
2. New site from Git
3. Choose your repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Environment variables: Add in Site settings → Environment variables

---

### Option 3: GitHub Pages

**Best for**: Free hosting, simple setup

#### Steps:

1. **Install gh-pages**
```bash
npm install --save-dev gh-pages
```

2. **Update vite.config.ts**
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/hr-management-system/', // Your repo name
  // ... rest of config
})
```

3. **Add deploy script to package.json**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

4. **Deploy**
```bash
npm run deploy
```

5. **Enable GitHub Pages**
- Go to repository settings
- Pages → Source: gh-pages branch
- Save

**Note**: Add environment variables using GitHub Secrets, but they won't be available in client-side code on GitHub Pages. Consider using Vercel or Netlify for production.

---

### Option 4: Traditional VPS (DigitalOcean, AWS, etc.)

**Best for**: Full control, custom domains, advanced setups

#### Steps:

1. **Build the Application**
```bash
npm run build
```

2. **Set Up Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/hr-system/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

3. **Upload Files**
```bash
# Using rsync
rsync -avz dist/ user@your-server:/var/www/hr-system/dist/

# Or using SCP
scp -r dist/* user@your-server:/var/www/hr-system/dist/
```

4. **Set Environment Variables**
Create `.env.production` file on server or set via system environment variables.

5. **Set Up SSL (Let's Encrypt)**
```bash
sudo certbot --nginx -d your-domain.com
```

---

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Set all environment variables in hosting platform
- [ ] Verify Supabase URL and keys are correct
- [ ] Confirm Resend API key is production-ready
- [ ] Test environment variables are not committed to Git

### 2. Build Testing
```bash
# Test production build locally
npm run build
npm run preview
```
- [ ] Navigate through all pages
- [ ] Test login/logout
- [ ] Verify all features work
- [ ] Check console for errors

### 3. Supabase Production Setup
- [ ] Verify database migration is applied
- [ ] Check RLS policies are enabled
- [ ] Test authentication flow
- [ ] Confirm data is properly seeded
- [ ] Review API limits and quotas

### 4. Security
- [ ] Remove any test/demo accounts
- [ ] Set strong admin passwords
- [ ] Enable 2FA for Supabase account
- [ ] Review CORS settings
- [ ] Check for exposed secrets in code

### 5. Performance
- [ ] Run Lighthouse audit
- [ ] Optimize images
- [ ] Enable compression
- [ ] Set up CDN (if needed)
- [ ] Configure caching headers

### 6. Monitoring
- [ ] Set up Supabase alerts
- [ ] Configure error tracking (optional: Sentry)
- [ ] Enable analytics (optional: Google Analytics)
- [ ] Set up uptime monitoring

---

## Supabase Production Configuration

### 1. Upgrade to Production Plan (if needed)
- Free tier has limits: 500MB database, 2GB bandwidth
- Consider upgrading for production use

### 2. Enable Pooler
```bash
# For better connection handling
# Go to Database Settings → Enable Connection Pooler
```

### 3. Set Up Backups
- Go to Database → Backups
- Enable daily backups
- Set retention period

### 4. Configure Auth Settings
- Go to Authentication → Settings
- Set site URL to your production domain
- Configure email templates
- Set up redirect URLs

### 5. Deploy Edge Function
```bash
supabase functions deploy send-reminders --project-ref your-prod-ref
```

### 6. Set Up Cron Job for Production
```sql
SELECT cron.schedule(
  'send-daily-reminders',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url:='https://your-prod-project.supabase.co/functions/v1/send-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

---

## Domain Setup

### 1. Custom Domain Configuration

#### For Vercel:
1. Go to your project → Settings → Domains
2. Add your domain
3. Update DNS records at your domain provider:
   - Type: A
   - Name: @
   - Value: 76.76.21.21

#### For Netlify:
1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS:
   - Type: CNAME
   - Name: www
   - Value: your-site.netlify.app

### 2. SSL Certificate
- Vercel: Automatic
- Netlify: Automatic
- VPS: Use Let's Encrypt (certbot)

---

## Post-Deployment Testing

### 1. Smoke Test
- [ ] Visit production URL
- [ ] Login with admin account
- [ ] Create a test employee
- [ ] Edit and delete test data
- [ ] Test all navigation links
- [ ] Verify dark mode toggle
- [ ] Test language switching

### 2. Cross-Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari
- [ ] Mobile Chrome

### 3. Performance Testing
```bash
# Run Lighthouse
npx lighthouse https://your-domain.com --view

# Check loading time
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com
```

### 4. Security Testing
- [ ] Test authentication edge cases
- [ ] Verify no sensitive data in responses
- [ ] Check for XSS vulnerabilities
- [ ] Test API rate limiting
- [ ] Verify HTTPS is enforced

---

## Monitoring & Maintenance

### 1. Set Up Monitoring

#### Supabase Metrics:
- Database size
- API requests
- Active users
- Error rates

#### Application Metrics:
- Page load times
- Error logs
- User activity
- Email delivery rates

### 2. Log Management
```bash
# View Edge Function logs
supabase functions logs send-reminders --project-ref your-ref

# View database logs
# In Supabase dashboard: Logs & Reports
```

### 3. Regular Maintenance
- [ ] Weekly: Review error logs
- [ ] Weekly: Check disk space
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review security advisories
- [ ] Quarterly: Backup verification
- [ ] Quarterly: Performance audit

---

## Scaling Considerations

### When to Scale:

1. **Database Performance**
   - Slow queries (>1s)
   - High CPU usage
   - Connection pool exhausted

   **Solution**: Upgrade Supabase plan, optimize queries, add indexes

2. **High Traffic**
   - Slow page loads
   - API timeouts
   - Rate limit errors

   **Solution**: Enable CDN, implement caching, upgrade hosting plan

3. **Large Dataset**
   - Pagination issues
   - Slow searches
   - Export timeouts

   **Solution**: Implement virtual scrolling, server-side pagination, background jobs

---

## Rollback Plan

### Quick Rollback:

#### Vercel:
```bash
vercel rollback
```

#### Netlify:
- Dashboard → Deploys → Click previous deploy → Publish

#### Manual:
```bash
# Redeploy previous commit
git checkout previous-commit-hash
npm run build
# Deploy using your method
```

### Database Rollback:
```sql
-- Restore from backup in Supabase dashboard
-- Database → Backups → Restore
```

---

## Production URLs Template

```
Frontend: https://hr-system.your-domain.com
Supabase: https://your-project.supabase.co
Edge Functions: https://your-project.supabase.co/functions/v1/
```

---

## Budget Estimation

### Free Tier (Good for testing):
- Vercel: Free
- Supabase: $0 (500MB DB, 2GB bandwidth)
- Resend: $0 (100 emails/month)
**Total: $0/month**

### Production (Recommended):
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Resend Starter: $20/month
**Total: $65/month**

### Enterprise:
- Custom domain: $10-15/year
- SSL: Free (Let's Encrypt)
- Monitoring: $29/month (optional)
- Backups: Included in Supabase

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **Vite Build**: https://vitejs.dev/guide/build

---

## Congratulations! 🎉

Your HR Management System is now live in production. Monitor logs regularly, keep dependencies updated, and scale as needed.

**Pro Tips**:
1. Set up staging environment for testing
2. Use Git tags for version tracking
3. Document any custom configurations
4. Keep team informed of deployments
5. Celebrate successful launches! 🚀
