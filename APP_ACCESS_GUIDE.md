# EMU Alerts - App Access Guide

## 🚀 The app is running!

The Expo development server is running and the app is accessible.

## 🌐 Access URLs

### Primary URL:
**http://localhost:8081**

### Alternative URLs (if localhost doesn't work):
- http://127.0.0.1:8081
- http://[your-ip-address]:8081

## 📱 How to Access

1. **Open your web browser** (Chrome, Firefox, Safari, or Edge)
2. **Navigate to**: http://localhost:8081
3. **Wait a moment** for the app to load (first load may take 10-15 seconds)

## 🔐 Login Credentials

Once the app loads, use these test credentials:

```
Email: test-1757693595470@emu.com
Password: test123456
```

## 🛠️ Troubleshooting

### If you see a blank page:
1. **Wait 10-15 seconds** - The first load compiles the app
2. **Hard refresh** - Press Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)
3. **Check browser console** - Press F12 and look for errors

### If localhost doesn't work:
1. Try http://127.0.0.1:8081
2. Check if port 8081 is blocked by firewall
3. Try a different browser

### To see Expo developer menu:
- The terminal running `pnpm run web` shows:
  - Press `w` to open in web browser
  - Press `r` to reload
  - Press `m` to toggle menu
  - Press `j` to open debugger

## 📊 What you should see:

1. **Loading screen** - Brief loading indicator
2. **Sign In screen** - Email and password fields
3. **After login** - Main alerts screen (may show "No alerts yet")

## 🔄 To restart the server:

```bash
# Stop the server
pkill -f "expo start"

# Start again
pnpm run web
```

## 💡 Tips:

- The app uses React Native Web, so it works like a regular web app
- All features work in the browser (authentication, real-time updates, etc.)
- Maps open in a new tab (Google Maps)
- The app is responsive and works on mobile browsers too

---

**Current Status**: ✅ Server is running at http://localhost:8081