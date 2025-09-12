# EMU Alerts - Troubleshooting Access Guide

## ✅ Server Status: RUNNING

The Expo server is confirmed running at `http://localhost:8081`

## 🔍 Quick Diagnostics

### Server is responding correctly:
- Status: 200 OK
- Content: EMU Alerts HTML page
- Port: 8081

## 🛠️ Solutions to Try

### 1. Clear Browser Cache (Most Common Fix)
**For Chrome/Edge:**
1. Press `Ctrl + Shift + Delete` (Windows/Linux) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Try http://localhost:8081 again

**Hard Refresh:**
- `Ctrl + F5` (Windows/Linux) or `Cmd + Shift + R` (Mac)

### 2. Try Different URLs
- http://localhost:8081
- http://127.0.0.1:8081
- http://0.0.0.0:8081

### 3. Check Browser Console
1. Open http://localhost:8081
2. Press `F12` to open Developer Tools
3. Go to "Console" tab
4. Look for any red error messages
5. If you see CORS or security errors, try a different browser

### 4. Try Different Browsers
- Chrome (Recommended)
- Firefox
- Edge
- Safari

### 5. Disable Browser Extensions
Some extensions can interfere with local development:
1. Try opening in an Incognito/Private window
2. Or disable extensions temporarily

### 6. Check Firewall/Antivirus
- Windows Defender or antivirus might block localhost
- Add exception for port 8081

### 7. Use Direct Metro URL
The Expo server might be serving from a different URL. Check the terminal output for lines like:
- "Metro waiting on..."
- "Web is waiting on..."

## 🚀 Alternative Access Methods

### Option 1: Open via Expo CLI
In the terminal running `pnpm run web`, press `w` to open in web browser automatically.

### Option 2: Use Expo Go App
1. Install Expo Go on your phone
2. Make sure phone and computer are on same network
3. Scan the QR code shown in terminal

### Option 3: Network URL
Look in the terminal for a URL like: `http://192.168.x.x:8081`

## 📊 What You Should See

When it works, you'll see:
1. Brief loading screen (5-10 seconds on first load)
2. EMU Alerts sign-in screen with:
   - Email field
   - Password field
   - Blue "Sign In" button

## 🔄 Complete Restart Process

If nothing works, try a complete restart:

```bash
# 1. Kill all processes
pkill -f expo
pkill -f node

# 2. Clear caches
rm -rf .expo
rm -rf node_modules/.cache

# 3. Reinstall and start
pnpm install
pnpm run web
```

## 📝 Test Login Credentials

Once you can access the app:
```
Email: test-1757693595470@emu.com
Password: test123456
```

## 🆘 If Still Not Working

1. **Check the terminal** where you ran `pnpm run web` for any error messages
2. **Try a simple test**: Create a basic HTML file and open it to ensure your browser works with local files
3. **Check if port 8081 is blocked**: Some corporate networks or VPNs block certain ports
4. **Try WSL2** (if on Windows): Sometimes Windows firewall blocks WSL ports

## 💡 Current Status

Based on diagnostics:
- ✅ Server is running
- ✅ Port 8081 is active
- ✅ HTML is being served
- ✅ No errors in logs

The issue is likely:
1. Browser cache
2. Browser security settings
3. Local firewall/antivirus
4. Network configuration

Try the solutions above in order, starting with clearing browser cache!