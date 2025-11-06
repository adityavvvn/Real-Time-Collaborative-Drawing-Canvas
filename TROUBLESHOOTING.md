# Troubleshooting Guide

## Issue: "Connecting..." Status and Can't Draw

If you see "Connecting..." and can't draw or join rooms, follow these steps:

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Look for any red error messages
4. Common errors:
   - `Failed to load module` - Files not compiled or wrong paths
   - `io is not defined` - Socket.io not loading
   - `404 Not Found` - Files not being served correctly

### Step 2: Verify Build Process
Make sure you've built the project:
```bash
npm run build
```

This should create:
- `dist/server/` - Compiled server files
- `dist/client/` - Compiled client files  
- `dist/shared/` - Compiled shared types

### Step 3: Check Server is Running
1. Make sure the server started successfully
2. You should see: `Server running on http://localhost:3000`
3. If you see errors, check the terminal output

### Step 4: Verify Files are Being Served
1. Open browser and go to: `http://localhost:3000`
2. Check Network tab in Developer Tools
3. Verify these files load successfully:
   - `/socket.io/socket.io.js` - Should return JavaScript
   - `/main.js` - Should return JavaScript
   - `/canvas.js` - Should return JavaScript
   - `/websocket.js` - Should return JavaScript
   - `/shared/types.js` - Should return JavaScript

### Step 5: Check Module Imports
If you see "Failed to load module" errors:
1. Make sure all imports use `.js` extension
2. Check that `dist/client/` and `dist/shared/` folders exist
3. Verify server is serving from `dist/client` and `dist/shared`

### Step 6: Rebuild and Restart
```bash
# Clean and rebuild
npm run build

# Restart server
npm start
```

### Step 7: Check Socket.io Connection
In browser console, type:
```javascript
typeof io
```
Should return: `"function"` (not `"undefined"`)

If it's undefined, Socket.io isn't loading. Check:
- Server is running
- `/socket.io/socket.io.js` is accessible
- No CORS errors in console

### Common Fixes

**Fix 1: Files not compiled**
```bash
npm run build
npm start
```

**Fix 2: Port already in use**
Change port in `server/server.ts` or use:
```bash
PORT=3001 npm start
```

**Fix 3: Module resolution errors**
Make sure `dist/client/` and `dist/shared/` exist after build.

**Fix 4: Socket.io not loading**
- Check server is running
- Verify `/socket.io/socket.io.js` returns JavaScript (not 404)
- Check browser console for CORS errors

### Still Not Working?

1. **Check browser console** - Look for specific error messages
2. **Check server terminal** - Look for connection errors
3. **Verify Node.js version** - Should be v16 or higher: `node --version`
4. **Try different browser** - Chrome, Firefox, or Edge
5. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)


