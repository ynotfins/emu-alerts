# 🚨 EMU Alerts - Real-Time Emergency Monitoring

A cross-platform **Expo React Native** application that provides real-time emergency alerts monitoring for EMU (Emergency Management Unit). Built with **Firebase Firestore** for live data sync and **Google Maps** integration for location services.

## ✨ Features

- 🔴 **Real-time Alerts** - Live emergency notifications from Firestore
- 🗺️ **Google Maps Integration** - Location mapping and directions  
- 🔐 **Firebase Authentication** - Secure email/password sign-in
- 📱 **Cross-Platform** - Works on iOS, Android, and Web
- ⚡ **Live Updates** - Real-time data sync with no refresh needed
- 🎯 **Incident Details** - Detailed view with location and timeline
- 🌐 **Web-First Design** - Optimized for web deployment with mobile support

## 🏗️ Project Structure

```
emu-alerts-expo/
├── src/                    # React Native source code
│   ├── components/         # Reusable UI components
│   │   ├── AlertItem.tsx   # Alert list item component
│   │   └── MapView.tsx     # Google Maps integration
│   ├── screens/           # Screen components
│   │   ├── SignInScreen.tsx       # Authentication screen
│   │   ├── MainScreen.tsx         # Alert list screen
│   │   └── AlertDetailsScreen.tsx # Incident details
│   ├── firebase/          # Firebase configuration
│   │   └── config.ts      # Firebase app initialization
│   └── types/             # TypeScript type definitions
│       └── Alert.ts       # Alert data interface
├── android/               # Expo Android configuration
├── assets/               # App icons and images
├── App.tsx              # Main app component & navigation
├── app.config.ts        # Expo configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── archive-2025-08-26/  # Legacy project files (safe to delete after testing)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** - VS Code recommended

### 1️⃣ Clone & Install

```bash
git clone https://github.com/ynotfins/emu-alerts.git
cd emu-alerts-expo
npm install
```

### 2️⃣ Environment Setup

Create your environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your Google Maps API key:
```bash
# Required: Google Maps API Key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3️⃣ Firebase Linking

This project is configured to work with the existing Firebase project `emu-incidents`. The Firebase configuration files are already included in the repository.

**Install Firebase CLI (if not already installed):**
```bash
npm install -g firebase-tools
```

**Login to Firebase:**
```bash
firebase login
```

**Verify Project Connection:**
```bash
firebase projects:list
# Should show "emu-incidents" as the current project
```

**Install Functions Dependencies:**
```bash
cd functions
npm install
npm run build  # Compile TypeScript functions
cd ..
```

**Test Firebase Connection:**
```bash
# Start Firebase emulators for local development
firebase emulators:start

# Deploy security rules only (safe to test)
firebase deploy --only firestore:rules
```

### 4️⃣ Get Google Maps API Key

1. **Visit Google Cloud Console:** https://console.cloud.google.com/
2. **Create/Select Project** 
3. **Enable APIs:**
   - Maps SDK for Android ✅
   - Maps SDK for iOS ✅  
   - Maps JavaScript API ✅
   - Geocoding API ✅
4. **Create API Key** in "Credentials"
5. **Add to .env file**

### 5️⃣ Run the App

```bash
# Start development server
npm start

# Or run on specific platforms:
npm run web      # 🌐 Web browser (recommended for development)
npm run android  # 📱 Android emulator/device
npm run ios      # 🍎 iOS simulator (macOS only)
```

**🌐 Web App:** Opens at `http://localhost:8081`

## 📱 Platform Setup

### 🌐 Web Development (Recommended)
**✅ Ready to go!** No additional setup needed. The web version includes:
- Google Maps integration (opens in new tab)
- Full Firebase functionality
- Responsive design
- Hot reload development

### 🤖 Android Development

#### Prerequisites
- **Java Development Kit (JDK) 17** - Required for Android builds
- **Android Studio Hedgehog | 2023.1.1 or newer**
- **Android SDK API 34** (compileSdk for target compatibility)

#### Option A: Android Studio Setup (Recommended)

**1. Install Android Studio:**
- Download: https://developer.android.com/studio
- Install with default settings
- Open Android Studio and complete first-run setup

**2. Configure Android SDK:**
```bash
# Open Android Studio
# File → Settings (Windows/Linux) or Android Studio → Preferences (macOS)
# Appearance & Behavior → System Settings → Android SDK
# SDK Platforms tab: Install Android 14.0 (API 34)
# SDK Tools tab: Install Android SDK Build-Tools 34.0.0
```

**3. Create Android Virtual Device (AVD):**
```bash
# In Android Studio:
# Tools → AVD Manager
# Create Virtual Device
# Choose: Pixel 6 (or similar modern device)
# System Image: API 34 (Android 14.0)
# Advanced Settings: Set RAM to 2048 MB
# Finish and Launch emulator
```

**4. Run on Android Emulator:**
```bash
# Start emulator first, then:
npm run android
```

#### Option B: Physical Android Device

**1. Enable Developer Mode:**
```bash
# On your Android device:
Settings → About Phone → Tap "Build number" 7 times
# You'll see "You are now a developer!" message
```

**2. Enable USB Debugging:**
```bash
Settings → Developer Options → USB Debugging ✅
Settings → Developer Options → Install via USB ✅
```

**3. Connect and Test:**
```bash
# Connect device via USB cable
# Allow USB debugging on device when prompted
# Verify connection:
npx expo run:android --device

# Or check with ADB:
adb devices
# Should show your device
```

#### Troubleshooting Android Setup

**"No connected device found" Error:**
```bash
# Check emulator status
adb devices

# Start emulator manually
cd $ANDROID_HOME/emulator
./emulator -avd YOUR_AVD_NAME

# Or try with device flag:
npm run android -- --device
```

**Build Errors:**
```bash
# Clear Expo cache
expo run:android --clear

# Clear Metro cache
npx expo start --clear

# Rebuild with fresh install
rm -rf node_modules && npm install
```

**Gradle Build Issues:**
```bash
# Check Java version (should be JDK 17)
java -version

# Set JAVA_HOME if needed (Windows)
set JAVA_HOME=C:\Program Files\Java\jdk-17.0.8

# Set JAVA_HOME if needed (macOS/Linux)
export JAVA_HOME=/usr/local/opt/openjdk@17
```

### 🍎 iOS Development (macOS only)

1. **Install Xcode** from Mac App Store
2. **Install iOS Simulator**
3. **Run:** `npm run ios`

## 🔧 Configuration

### Google Maps API Key Security

**For Production:** Restrict your API key by platform:

```javascript
// app.config.ts - Already configured ✅
android: {
  config: {
    googleMaps: {
      apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  },
},
ios: {
  config: {
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
},
```

**API Restrictions in Google Cloud:**
- **Android:** Package name: `com.emualerts.expo`
- **iOS:** Bundle ID: `com.emualerts.expo`  
- **Web:** HTTP referrers: `your-domain.com/*`

### Firebase Configuration

The app connects to Firebase project: **`emu-incidents`**
- Firestore database for real-time alerts
- Firebase Authentication for user management
- Automatic real-time synchronization

## 🏗️ Building for Production

### 🌐 Web Deployment

**Build and Deploy to Web:**
```bash
# Build optimized web bundle
npm run build:web-prod

# Files will be generated in: dist-web/
# Upload dist-web/ contents to your web server
```

**Deploy to Popular Hosting Services:**

**Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build:web-prod
netlify deploy --prod --dir dist-web
```

**Vercel:**
```bash
# Install Vercel CLI  
npm install -g vercel

# Build and deploy
npm run build:web-prod
cd dist-web && vercel --prod
```

**Firebase Hosting:**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize (one time)
firebase init hosting

# Build and deploy
npm run build:web-prod
firebase deploy --only hosting
```

### 📱 Mobile App Builds (EAS Build)

**Setup EAS Build (One-time):**
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo account (create free account if needed)
eas login

# Initialize EAS configuration
eas build:configure
```

**Build Android APK/AAB:**
```bash
# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Google Play Store
eas build --platform android --profile production

# Build for local development/testing
eas build --platform android --profile development --local
```

**Build iOS App:**
```bash
# Build for TestFlight/App Store (requires Apple Developer account)
eas build --platform ios --profile production

# Build for development testing
eas build --platform ios --profile development
```

**EAS Update (Over-the-Air Updates):**
```bash
# Install EAS Update
npm install -g @expo/eas-update

# Configure updates
eas update:configure

# Deploy update without rebuilding
eas update --branch production --message "Bug fixes and improvements"
```

### 🔧 Build Profiles Configuration

Create `eas.json` for custom build configurations:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 📦 App Store Submission

**Google Play Store (Android):**
```bash
# Build production AAB
eas build --platform android --profile production

# Submit to Google Play Console (requires Play Console API setup)
eas submit --platform android --profile production
```

**Apple App Store (iOS):**
```bash
# Build production IPA
eas build --platform ios --profile production

# Submit to App Store Connect (requires App Store Connect API setup)
eas submit --platform ios --profile production
```

## 🔍 App Flow

1. **🔐 Sign In** - Firebase email/password authentication
2. **📋 Alert List** - Real-time list of emergency incidents
3. **📄 Alert Details** - Tap any alert for full incident details
4. **🗺️ Location View** - Google Maps integration for incident locations
5. **🔄 Live Updates** - All data syncs in real-time automatically

## 🛠️ Development Commands

```bash
# Development
npm start          # Start Expo dev server
npm run web        # Run in web browser  
npm run android    # Run on Android
npm run ios        # Run on iOS

# Building
npm run build:web      # Build for web deployment
npm run build:web-prod # Build optimized production web

# Other
npm run type-check     # TypeScript type checking
```

## 📊 Firestore Data Structure

### Collections

**`alerts`** - Flat feed of all notifications
```javascript
{
  id: "incident_id",
  incidentId: "12345", 
  ts: Timestamp,
  rawText: "NY | County | City | Working Fire | 123 Main St",
  state: "NY",
  county: "County",
  city: "City", 
  alertType: "Working Fire",
  alertMessage: "123 Main St"
}
```

**`incidents/{id}`** - Latest state per incident
```javascript
{
  lastTs: Timestamp,
  lastMessage: "Latest update text",
  lastType: "Working Fire", 
  state: "NY",
  county: "County",
  city: "City",
  address: "123 Main St",
  updateCount: 3,
  firstSeenAt: Timestamp
}
```

## 🚨 Troubleshooting

### 🌐 Web Issues
- **Maps not loading:** Check Google Maps API key in `.env`
- **Blank screen:** Check browser console for errors
- **Firebase errors:** Verify Firebase project connection

### 📱 Android Issues
- **"No connected device found":** Start Android emulator or connect device
- **Build errors:** Run `expo run:android --clear` to clear cache
- **APK not installing:** Enable "Install unknown apps" in Android settings

### 🍎 iOS Issues  
- **Simulator not found:** Open Xcode → Window → Devices and Simulators
- **Build errors:** Run `expo run:ios --clear` to clear cache

### 🔑 API Key Issues
- **Maps show "For development purposes only":** API key needs billing enabled
- **403 errors:** Check API key restrictions in Google Cloud Console

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is private and proprietary for EMU emergency management use.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review GitHub Issues
3. Contact the development team

---

**⚡ Ready to monitor emergency alerts in real-time!** Start with `npm run web` for the fastest development experience.