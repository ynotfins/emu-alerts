# EMU Alerts

Real-time emergency alerts monitoring system for EMU (Emergency Management Unit).

## Project Structure

```
emu-alerts/
├── android-app/           # Native Android client (Kotlin)
├── apps/
│   └── mobile-expo/      # React Native/Expo mobile app (alternative client)
├── docs/                 # Documentation and design assets
├── firebase/            # Firebase configuration
├── firestore.rules      # Firestore security rules
├── functions/           # Firebase Cloud Functions (TypeScript)
└── scripts/            # Development utilities
```

## Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Android Studio Hedgehog | 2023.1.1 or newer
- Android SDK API 34 (compileSdk)
- Java Development Kit (JDK) 17

## Setup

1. **Firebase Project**

```bash
firebase login
firebase use emu-incidents
```

2. **Android App**

- Place `google-services.json` in `android-app/app/`
  - Package name must be `com.emualerts` to match `applicationId`
- Open in Android Studio
- File > Sync Project with Gradle Files
- Build > Clean Project

3. **Cloud Functions**

```bash
cd functions
npm install
npm run build
```

4. **Environment Setup**
- link.env` (if it doesn't exist)
- For local development, `X_INGEST_TOKEN` is in `link.env`
- For production, token is stored as Firebase Functions secret

## Building & Running

### Android App

1. In Android Studio:
   - Build > Clean Project
   - Build > Rebuild Project
   - Run > Run 'app'

2. Select an emulator (API 24+) or connected device

### Deploy Cloud Functions

```bash
firebase deploy --only functions:ingestBNN
```

## Endpoints

### ingestBNN

Ingests BNN-format emergency notifications.

```bash
curl -i -X POST \\
  https://us-central1-emu-incidents.cloudfunctions.net/ingestBNN \\
  -H "Content-Type: application/json" \\
  -H "X-Ingest-Token: $TOKEN" \\
  -d '{
    "appName": "BNN",
    "message": "NY | Dutchess | Poughkeepsie | Working Fire | 123 Main St | Smoke from 2nd floor | #12345",
    "source": "BNN"
  }'
```

Response:
```json
{
  "ok": true,
  "incidentId": "12345",
  "stage": "new"
}
```

## Firestore Data Model

### Collections

- `alerts`: Flat feed of all notifications
  - Ordered by `ts` DESC
  - Limited to 200 in app queries
  - Fields: `ts`, `reportedAt`, `state`, `county`, `city`, `address`, `alertType`, `alertMessage`, `incidentId`, `stage`

- `incidents/{id}`: Latest state of each incident
  - Fields: `lastTs`, `lastMessage`, `lastType`, `state`, `county`, `city`, `address`, `updateCount`, `firstSeenAt`

- `incidents/{id}/updates`: History of updates
  - Fields: `ts`, `reportedAt`, `message`, `stage`, `address`

## Troubleshooting

### Blank Home Screen
- Check Firebase project ID matches `google-services.json`
- Verify Firestore rules allow read access
- Check Logcat for "MainActivity" tag
- Ensure user has `employee` role claim

### Permission Denied
- Check X-Ingest-Token header matches secret
- Verify Firebase Auth user has required role
- Check Firestore rules

### Logcat Tags to Watch
- `MainActivity`: Home screen and alerts list
- `AlertDetailsActivity`: Incident details
- `FirebaseCrashlytics`: Crash reporting
- `FA`: Firebase Analytics
