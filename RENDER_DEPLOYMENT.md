# Deploy to Render - Step by Step Guide

## 🚀 Complete Deployment Guide for Render

### Prerequisites
- GitHub account
- Render account (free at https://render.com)
- Your code pushed to GitHub

---

## Step 1: Prepare Your Code

### 1.1 Push to GitHub (if not already done)

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Render deployment"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

**Note:** Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub details.

---

## Step 2: Create Render Account

1. Go to **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

---

## Step 3: Create New Web Service

1. **Click "New +"** button in Render dashboard
2. Select **"Web Service"**
3. **Connect your GitHub account** (if not already connected)
4. **Select your repository** from the list
5. Click **"Connect"**

---

## Step 4: Configure Service Settings

Fill in the following settings:

### Basic Settings:
- **Name:** `collaborative-canvas` (or any name you prefer)
- **Region:** Choose closest to you (e.g., `Oregon (US West)`)
- **Branch:** `main` (or `master` if that's your default branch)
- **Root Directory:** Leave empty (or `./` if needed)

### Build & Deploy:
- **Runtime:** `Node`
- **Build Command:** 
  ```bash
  npm install && npm run build
  ```
- **Start Command:**
  ```bash
  node dist/server/server.js
  ```

### Environment:
- **Environment:** `Node`
- **Node Version:** `18` or `20` (Render will auto-detect)

### Plan:
- **Free** - For testing (has limitations)
- **Starter** ($7/month) - Better for production
- **Standard** ($25/month) - Best for production

---

## Step 5: Advanced Settings (Optional but Recommended)

Click **"Advanced"** and configure:

### Environment Variables:
Add if needed (usually not required for basic setup):
- `NODE_ENV=production`
- `PORT` (Render sets this automatically, but you can override)

### Health Check:
- **Health Check Path:** `/` (or leave empty)

### Auto-Deploy:
- ✅ **Auto-Deploy:** Enabled (deploys on every git push)

---

## Step 6: Deploy!

1. **Click "Create Web Service"**
2. Render will start building your application
3. Watch the build logs in real-time
4. Wait for deployment to complete (usually 2-5 minutes)

---

## Step 7: Get Your URL

Once deployed:
1. Render will provide a URL like: `https://collaborative-canvas-xxxx.onrender.com`
2. **Copy this URL** - this is your live application!

---

## Step 8: Test Your Deployment

1. **Open the Render URL** in your browser
2. **Open another browser window** with the same URL
3. **Test drawing** - both windows should sync in real-time
4. **Check status** - should show "Connected" (green)

---

## Step 9: Update CORS (If Needed)

If you have CORS issues, update `server/server.ts`:

```typescript
const io = new Server(httpServer, {
  cors: {
    origin: [
      'https://your-app-name.onrender.com',
      'http://localhost:3000' // For local development
    ],
    methods: ['GET', 'POST'],
  },
});
```

**Note:** The current code has `origin: '*'` which should work, but being specific is better for production.

---

## 🎯 Quick Deploy (Using render.yaml)

If you have the `render.yaml` file in your repo:

1. In Render dashboard, click **"New +"**
2. Select **"Blueprint"**
3. **Connect your repository**
4. Render will auto-detect `render.yaml`
5. Click **"Apply"** - Render configures everything automatically!

---

## 📋 Troubleshooting

### Build Fails

**Error: "Build command failed"**
- Check build logs in Render dashboard
- Verify `npm run build` works locally
- Make sure all dependencies are in `package.json`

**Fix:**
```bash
# Test locally first
npm install
npm run build
```

### Application Crashes

**Error: "Service crashed"**
- Check logs in Render dashboard
- Verify `node dist/server/server.js` works locally
- Check if port is correctly set

**Fix:**
- Make sure `server/server.ts` uses: `process.env.PORT || 3000`
- Check Render logs for specific error messages

### WebSocket Not Working

**Issue: Drawings don't sync**
- Check browser console for errors
- Verify WebSocket connection in Network tab
- Check Render logs for connection errors

**Fix:**
- Ensure CORS is configured correctly
- Check that Socket.io is loading: `/socket.io/socket.io.js`

### Free Tier Limitations

**Issue: Service goes to sleep**
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up

**Solution:**
- Upgrade to paid plan for always-on service
- Or use a service like UptimeRobot to ping your URL every 10 minutes

---

## 🔄 Updating Your Deployment

### Automatic Updates:
- Push to GitHub → Render auto-deploys (if enabled)

### Manual Deploy:
1. Go to Render dashboard
2. Click on your service
3. Click **"Manual Deploy"**
4. Select branch/commit
5. Click **"Deploy"**

---

## 📊 Monitoring

### View Logs:
1. Go to your service in Render dashboard
2. Click **"Logs"** tab
3. See real-time logs and errors

### Metrics:
- View CPU, Memory, Network usage
- Monitor request counts
- Check response times

---

## 💰 Pricing

### Free Tier:
- ✅ 750 hours/month (enough for testing)
- ✅ 512 MB RAM
- ⚠️ Services sleep after 15 min inactivity
- ⚠️ Slower cold starts

### Starter ($7/month):
- ✅ Always on
- ✅ 512 MB RAM
- ✅ Better performance

### Standard ($25/month):
- ✅ Always on
- ✅ 2 GB RAM
- ✅ Best performance

---

## ✅ Deployment Checklist

Before deploying, verify:

- [ ] Code is pushed to GitHub
- [ ] `npm run build` works locally
- [ ] `node dist/server/server.js` starts server locally
- [ ] All dependencies are in `package.json` (not devDependencies)
- [ ] Server uses `process.env.PORT`
- [ ] No hardcoded localhost URLs
- [ ] CORS is configured (currently `*` which works)

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Live URL to share
- ✅ Real-time collaborative drawing
- ✅ Works from anywhere in the world
- ✅ Auto-deploys on git push

**Share your Render URL with friends to test multi-user drawing!**

---

## 📝 Example Render URL Format

Your deployed app will be at:
```
https://collaborative-canvas-xxxx.onrender.com
```

Where `xxxx` is a random identifier Render assigns.

---

## 🆘 Need Help?

1. **Check Render logs** - Most issues show in logs
2. **Test locally first** - If it works locally, it should work on Render
3. **Render Support** - https://render.com/docs/support
4. **Community** - Render Discord/Forum

