# Deployment Guide - Trot Payroll

## GitHub Repository Setup

**Repository:** `git@github.com:eashangoel/trot-payroll.git`  
**Username:** `eashangoel`  
**URL:** https://github.com/eashangoel/trot-payroll

---

## 🚀 Quick Deploy to Vercel (Recommended)

Vercel offers the easiest deployment with automatic builds from GitHub.

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to:** https://vercel.com
2. **Sign in** with your GitHub account
3. **Click:** "New Project"
4. **Import** your repository: `eashangoel/trot-payroll`
5. **Configure:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Click:** "Deploy"

**Done!** You'll get a URL like: `https://trot-payroll.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd /Users/eashangoel/Desktop/trot-payroll

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Automatic Deployments:** Every time you push to GitHub, Vercel will automatically rebuild and deploy!

---

## 🌐 Alternative: Deploy to Netlify

### Via Netlify Dashboard

1. **Go to:** https://app.netlify.com
2. **Sign in** with your GitHub account
3. **Click:** "Add new site" → "Import an existing project"
4. **Select:** GitHub → `eashangoel/trot-payroll`
5. **Configure:**
   - Build command: `npm run build`
   - Publish directory: `dist`
6. **Click:** "Deploy site"

**Done!** You'll get a URL like: `https://trot-payroll.netlify.app`

### Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to project
cd /Users/eashangoel/Desktop/trot-payroll

# Build the project
npm run build

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

---

## 📦 First Time: Push to GitHub

If you haven't pushed your code to GitHub yet:

```bash
cd /Users/eashangoel/Desktop/trot-payroll

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Restaurant Payroll Automation v1.0"

# Add remote repository
git remote add origin git@github.com:eashangoel/trot-payroll.git

# Push to GitHub
git push -u origin main
```

**Note:** If you get an error about "master" vs "main" branch:
```bash
git branch -M main
git push -u origin main
```

---

## 🔄 Update Your Deployed App

After making changes:

```bash
# Stage your changes
git add .

# Commit with a message
git commit -m "Description of your changes"

# Push to GitHub
git push
```

**Automatic Deploy:** Vercel/Netlify will automatically detect the push and deploy the new version!

---

## 🌍 Custom Domain (Optional)

### On Vercel:
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain (e.g., payroll.yourrestaurant.com)
4. Follow DNS configuration instructions

### On Netlify:
1. Go to "Domain settings"
2. Click "Add custom domain"
3. Follow DNS configuration instructions

---

## 🔒 Environment Variables (If Needed)

If you ever need to add environment variables:

### Vercel:
1. Project Settings → Environment Variables
2. Add variables
3. Redeploy

### Netlify:
1. Site settings → Build & deploy → Environment
2. Add variables
3. Redeploy

**Note:** Currently, this app doesn't need any environment variables as it's 100% client-side!

---

## 📊 Deployment Checklist

Before deploying to production:

- [x] All code committed to GitHub
- [x] `.gitignore` properly configured (excludes `node_modules`, `dist`)
- [x] `package.json` has correct build script
- [x] App tested locally with `npm run dev`
- [x] App builds successfully with `npm run build`
- [x] Sample files included in `public/` directory
- [ ] Choose deployment platform (Vercel or Netlify)
- [ ] Deploy and test live URL
- [ ] Bookmark the live URL for easy access

---

## 🎯 Quick Links

**Repository:** https://github.com/eashangoel/trot-payroll  
**Vercel:** https://vercel.com  
**Netlify:** https://netlify.com  

**Deployment Status:** Once deployed, you can access your app from anywhere without running `npm run dev`!

---

## 🆘 Troubleshooting Deployments

### Build Fails on Vercel/Netlify

**Check:**
1. Node.js version (should be 16+)
2. Build command is `npm run build`
3. Output directory is `dist`
4. All dependencies in `package.json`

**Fix:** In Vercel/Netlify settings, set Node version:
```
NODE_VERSION=18
```

### App Loads but Files Don't Upload

**This is expected!** File upload works fine in production. Modern browsers support the File API used by the app.

### 404 Error on Page Refresh

**For Netlify:** Create `public/_redirects` file:
```
/*    /index.html   200
```

**For Vercel:** This is handled automatically.

---

## 💡 Pro Tips

1. **Use Vercel for fastest deploys** - Usually 30-60 seconds
2. **Enable preview deployments** - Test changes before production
3. **Monitor deployment logs** - Check for build errors
4. **Use custom domain** - More professional for your team

---

## 📱 Share Your App

Once deployed, share the URL with:
- Restaurant managers
- HR team
- Payroll staff

**Everyone can access it without installing anything!**

---

**Need Help?** Check the deployment platform docs:
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com
