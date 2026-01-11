# 📋 Deployment Checklist

Use this checklist to ensure smooth deployment to GitHub and Vercel/Render.

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Create MongoDB Atlas cluster (free tier is fine)
- [ ] Set MongoDB network access to `0.0.0.0/0` (allow from anywhere)
- [ ] Generate secure JWT_SECRET (32+ characters random string)
- [ ] Note down your MongoDB connection string

### 2. Local Testing
- [ ] Test backend seeds (`npm run seed`, `npm run seed-academic`, `npm run seed-modules`)
- [ ] Verify admin login works locally
- [ ] Test module dropdown shows 99 modules
- [ ] Verify student import works

### 3. GitHub Upload
```bash
cd fasnet-deploy
git init
git add .
git commit -m "Initial commit - FASNet Online v1.0"
git branch -M main
git remote add origin https://github.com/KasunHerath-dev/fasnet-online.git
git push -u origin main
```

### 4. Backend Deployment (Render.com)
- [ ] Sign up at render.com
- [ ] Create new "Web Service"
- [ ] Connect GitHub repository
- [ ] Configure:
  - **Root Directory**: `backend`
  - **Build Command**: `npm install`
  - **Start Command**: `node server.js`
- [ ] Add Environment Variables:
  ```
  MONGODB_URI=mongodb+srv://...
  JWT_SECRET=your_secure_secret
  PORT=10000
  NODE_ENV=production
  BCRYPT_ROUNDS=12
  JWT_EXPIRE=7d
  ```
- [ ] Deploy and note the backend URL (e.g., `https://fasnet-api.onrender.com`)

### 5. Frontend Deployment (Vercel)
- [ ] Sign up at vercel.com
- [ ] Import GitHub repository
- [ ] Configure:
  - **Framework**: Vite
  - **Root Directory**: `frontend`
- [ ] Add Environment Variable:
  ```
  VITE_API_BASE_URL=https://fasnet-api.onrender.com
  ```
  (use your actual backend URL from step 4)
- [ ] Deploy

### 6. Post-Deployment Setup
On your deployed backend (Render shell):
```bash
# Create admin user
npm run seed

# Seed academic structure
npm run seed-academic
npm run seed-modules
```

### 7. First Login
- [ ] Go to your Vercel frontend URL
- [ ] Login with `admin` / `Fas@2024!`
- [ ] Go to Admin Dashboard → General → Change My Password
- [ ] Set a secure password

### 8. Final Verification
- [ ] Test login/logout
- [ ] Verify dashboard loads
- [ ] Check module dropdown shows 99 modules
- [ ] Test resource upload
- [ ] Verify student management works

## 🚨 Common Issues

### "CORS Error"
- Check backend CORS settings in `server.js`
- Ensure your Vercel URL is allowed

### "Module dropdown empty"
- Run `npm run seed-modules` on backend

### "Can't login"
- Verify MongoDB connection
- Check if admin was created (`npm run seed`)
- Verify JWT_SECRET is set

### "500 errors"
- Check Render logs for backend errors
- Verify all environment variables are set

## 📞 Need Help?

1. Check DEPLOYMENT_GUIDE.md for detailed instructions
2. Review backend logs on Render dashboard
3. Check browser console for frontend errors

---

**Good luck with your deployment!** 🚀
