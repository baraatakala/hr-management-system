# 🚀 Quick Deploy to Vercel (5 Minutes)

## Step-by-Step Commands

### 1. Make sure you're in the project directory

```bash
cd C:\Users\isc\VS_Code\project_2\project_2\hr-management-system
```

### 2. Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Ready for deployment"
```

### 3. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `hr-management-system`
3. Description: `HR Management System with Email Reminders`
4. **Make it Private** (recommended for business apps)
5. **Don't** initialize with README/gitignore (we already have them)
6. Click "Create repository"

### 4. Push to GitHub

Copy commands from GitHub (they'll look like this):

```bash
git remote add origin https://github.com/baraatakala/hr-management-system.git
git branch -M main
git push -u origin main
```

### 5. Deploy to Vercel

1. Go to https://vercel.com/signup
2. Click "Continue with GitHub"
3. Click "Import Project"
4. Paste your GitHub repo URL or select from list
5. Click "Import"

### 6. Configure Build Settings

Vercel should auto-detect Vite. Verify these settings:

- **Framework Preset**: Vite ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `dist` ✅
- **Install Command**: `npm install` ✅

### 7. Add Environment Variables

Click "Environment Variables" and add:

**Variable 1:**

- Name: `VITE_SUPABASE_URL`
- Value: `https://lydqwukaryqghovxbcqg.supabase.co`

**Variable 2:**

- Name: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZHF3dWthcnlxZ2hvdnhiY3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODkyODEsImV4cCI6MjA2NzY2NTI4MX0.eDVGF_kZzU5ZMVI81KKSZfxQ4jgSwPpP4m_0lx0kq4M`

### 8. Deploy!

- Click "Deploy"
- Wait 2-3 minutes ⏱️
- Your app will be live! 🎉

---

## ✅ What Will Work After Deployment

- ✅ **All Pages**: Employees, Companies, Departments, Jobs, Reminders
- ✅ **CRUD Operations**: Create, read, update, delete everything
- ✅ **Send Reminders Button**: Click and emails send instantly
- ✅ **Database**: Connected to Supabase (same as local)
- ✅ **HTTPS**: Automatic SSL certificate
- ✅ **Fast**: Global CDN, loads worldwide
- ✅ **Mobile**: Responsive design works on phones

---

## 🌐 Your Live URLs

After deployment, you'll get:

- **Production**: `https://hr-management-system.vercel.app`
- **Custom Domain** (optional): `https://yourdomain.com`

---

## 🔧 Future Updates

### To Deploy Updates:

```bash
# Make your changes
git add .
git commit -m "Update feature X"
git push
```

**That's it!** Vercel automatically deploys every push to `main` branch.

---

## 🆘 Troubleshooting

### "Build failed" Error

Check Vercel build logs. Common fixes:

```bash
# Locally test build
npm run build

# If it fails, fix TypeScript errors first
npm run type-check
```

### "Cannot connect to Supabase"

- Verify environment variables in Vercel dashboard
- Check spelling: `VITE_SUPABASE_URL` (not `SUPABASE_URL`)

### Emails not sending

- Emails work automatically! Edge Function is already deployed on Supabase
- Test by clicking "Send Reminders Now" button on live site

---

## 💰 Cost Breakdown

| Service      | What It Does              | Free Tier                     | Cost            |
| ------------ | ------------------------- | ----------------------------- | --------------- |
| **Vercel**   | Hosts your frontend       | 100GB bandwidth/month         | **$0**          |
| **Supabase** | Database + Edge Functions | 500MB database, 2GB bandwidth | **$0**          |
| **Resend**   | Sends emails              | 100 emails/day                | **$0**          |
| **Total**    | Full production app       | -                             | **$0/month** 🎉 |

### When to Upgrade?

- Vercel: Stay free forever for small teams
- Supabase: $25/month if >500MB database or >2GB bandwidth
- Resend: $20/month if >100 emails/day (3,000/month)

---

## 🎯 Next: Test Your Deployed App

Once deployed:

1. Visit your Vercel URL
2. Go to Employees page
3. Add a test employee with expiring document
4. Go to Reminders page
5. Click "Send Reminders Now"
6. Check your email! 📧

---

**Ready? Start with Step 1!** 🚀
