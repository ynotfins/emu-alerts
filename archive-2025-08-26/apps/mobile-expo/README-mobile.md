EMU Alerts — Mobile (Expo SDK 51)

Apple‑clean, stable Expo + React Native + TypeScript app for employees to view live incidents.

Prerequisites (Windows)
- Node 18 LTS or 20 LTS (recommended by Expo)
- Android Studio (SDK Platform 34+), Android emulator or physical device with USB debugging
- JDK 17 (required by AGP 8) — set JAVA_HOME to JDK 17
- PowerShell 7+

Environment
Never commit secrets. Create .env from the template and paste your real values.

```powershell
cd "apps\mobile-expo"
Copy-Item env.example .env
```

Required keys (place into .env):
- EXPO_PUBLIC_FIREBASE_API_KEY
- EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
- EXPO_PUBLIC_FIREBASE_PROJECT_ID
- EXPO_PUBLIC_FIREBASE_APP_ID
- EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
- EXPO_PUBLIC_GOOGLE_MAPS_API_KEY (for react-native-maps)

First‑time setup (dev client for Maps)
```powershell
cd "apps\mobile-expo"
npm install
npx expo prebuild --platform android
# Add Firebase Android config file from the Firebase console
#   Place: apps/mobile-expo/android/app/google-services.json
npx expo run:android
```
This builds/installs the development client (required for react-native-maps).

Daily development (Metro only)
```powershell
cd "apps\mobile-expo"
# Start Metro and connect with the installed dev client
npx expo start --dev-client
```

iOS (later on a Mac)
- Place GoogleService-Info.plist in ios/ after `expo prebuild --platform ios`.
- Provide your Apple Maps/Google Maps keys as needed; we already read EXPO_PUBLIC_GOOGLE_MAPS_API_KEY from .env for Android via plugin.

Troubleshooting
- Metro cache
  ```powershell
  npx expo start -c
  ```
- Emulator cannot reach Metro
  ```powershell
  adb reverse tcp:8081 tcp:8081
  ```
- Gradle cache issues / JDK mismatch
  - Ensure JDK 17 and JAVA_HOME points to it
  - Delete C:\Users\<you>\.gradle\caches and rebuild
  - Or clean the app:
    ```powershell
    cd "apps\mobile-expo\android"
    ./gradlew clean | cat
    ```
- Native changes (e.g., maps) not picked up
  ```powershell
  npx expo prebuild --platform android
  npx expo run:android
  ```

QA checklist
- Sign‑in: create/sign‑in with email/password; pending role blocks access to tabs; authorized roles show tabs
- Home: realtime list updates after backend posts; rows show 2 lines (date/time + latest message); tap opens Details
- Details: map header shows if lat/lng exist or “Open in Maps” button; history list streams oldest→newest
- Responding: “I’m responding” writes incidents/{id}/responders/{uid} and merges employees/{uid} with presence
- Nearest: list sorts by distance; changing device location reorders
- Team: map markers for sharing employees; compact list with “updated n minutes ago”
- Profile: toggle share location on/off writes { sharing, lastLat?, lastLng?, updatedAt }
- Chat: global and incident chat send/receive; messages ordered ascending
- Feedback: star rating saves/updates; average reflects ratings

Notes
- Versions are pinned (Expo SDK 51, RN 0.74). Do not upgrade unless explicitly requested.
- .env is git‑ignored: apps/mobile-expo/.env


