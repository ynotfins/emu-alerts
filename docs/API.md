# EMU Alerts API Documentation

## Overview

The EMU Alerts system uses Firebase Cloud Functions for data ingestion and Firebase Firestore for real-time data synchronization. The app itself only reads data; all write operations are handled through secure cloud functions.

## Base URL

```
https://us-central1-emu-incidents.cloudfunctions.net
```

## Authentication

### App Authentication
- **Type**: Firebase Authentication (Email/Password)
- **Required for**: All Firestore read operations
- **SDK**: Firebase Auth SDK v12.1.0

### API Authentication
- **Type**: Custom header token
- **Header**: `X-Ingest-Token`
- **Required for**: Cloud function write operations

## Endpoints

### 1. Ingest Alert Data

**Endpoint**: `/ingestBNN`  
**Method**: `POST`  
**Authentication**: Required (`X-Ingest-Token` header)

#### Description
Ingests emergency alert data from external systems (e.g., Macrodroid, BNN scanner feeds). Creates or updates alert documents with location data and messages.

#### Headers
```http
Content-Type: application/json
X-Ingest-Token: <configured-token>
```

#### Request Body
```json
{
  "alertId": "ALERT-12345",
  "source": "BNN Scanner Feed",
  "title": "Structure Fire - Main Street",
  "appName": "Macrodroid",
  "appPackage": "com.arlosoft.macrodroid",
  "receivedAtEpoch": 1234567890000,
  "receivedAtText": "2025-01-01T12:00:00Z",
  "rawText": "NY | Suffolk | Huntington | Structure Fire | 123 Main St",
  "state": "NY",
  "county": "Suffolk",
  "city": "Huntington",
  "address": "123 Main Street",
  "addressForMaps": "123 Main Street, Huntington, NY",
  "formattedAddress": "123 Main Street, Huntington, NY 11743",
  "alertType": "Structure Fire",
  "message": "E-414, E-415, L-43 responding to reported structure fire",
  "geo": {
    "latitude": 40.8682,
    "longitude": -73.4257
  }
}
```

#### Response

**Success (200 OK)**
```json
{
  "ok": true,
  "created": true,
  "alertId": "ALERT-12345"
}
```

**Update Existing (200 OK)**
```json
{
  "ok": true,
  "created": false,
  "alertId": "ALERT-12345"
}
```

**Error Responses**

- **401 Unauthorized**: Invalid or missing X-Ingest-Token
- **400 Bad Request**: Missing required fields (alertId or message)
- **405 Method Not Allowed**: Non-POST request
- **500 Internal Server Error**: Server processing error

#### CORS Support
- **Allowed Origins**: `*` (all origins)
- **Allowed Methods**: `GET, POST, OPTIONS`
- **Allowed Headers**: `content-type, x-ingest-token`

### 2. Firestore Collections (Direct Access)

The app reads directly from Firestore using the Firebase SDK. No REST endpoints are used for data retrieval.

#### Authentication
```javascript
// Firebase Auth required for all reads
import { signInWithEmailAndPassword } from 'firebase/auth';
await signInWithEmailAndPassword(auth, email, password);
```

## Data Models

### Alert Document
```typescript
interface Alert {
  // Identifiers
  alertId: string;
  
  // Source Information
  source?: string;
  title?: string;
  appName?: string;
  appPackage?: string;
  
  // Location Data
  state?: string;
  county?: string;
  city?: string;
  address?: string;
  addressForMaps?: string;
  formattedAddress?: string;
  geo?: {
    latitude: number;
    longitude: number;
  };
  
  // Alert Details
  alertType?: string;
  rawText?: string;
  initialMessage: string;
  
  // Timestamps
  createdAt: Timestamp;
  lastUpdatedAt: Timestamp;
  initialReceivedAtEpoch?: number;
  initialReceivedAtText?: string;
}
```

### Message Document (Subcollection)
```typescript
interface Message {
  message: string;
  receivedAtEpoch?: number;
  receivedAtText?: string;
  serverTimestamp: Timestamp;
}
```

## Firestore Security Rules

```javascript
// Current security model (simplified)
service cloud.firestore {
  match /databases/{database}/documents {
    // Alerts collection
    match /alerts/{alertId} {
      // Read: Authenticated users only
      allow read: if request.auth != null;
      // Write: Cloud functions only (admin SDK)
      allow write: if false;
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if request.auth != null;
        allow write: if false;
      }
    }
  }
}
```

## Rate Limits

- **Cloud Function**: Standard Google Cloud Function limits apply
- **Firestore Reads**: 50,000 reads/day free tier
- **Real-time Listeners**: No hard limit, but connection limits apply

## Error Handling

### Cloud Function Errors
- Returns appropriate HTTP status codes
- Error messages in response body
- Logs available in Firebase Console

### Firestore Errors
- SDK throws standard Firebase errors
- Common errors:
  - `permission-denied`: User not authenticated
  - `unavailable`: Network issues
  - `resource-exhausted`: Quota exceeded

## Testing

### Test Credentials
```
Email: test-1757693595470@emu.com
Password: test123456
```

### Test Cloud Function
```bash
curl -X POST https://us-central1-emu-incidents.cloudfunctions.net/ingestBNN \
  -H "Content-Type: application/json" \
  -H "X-Ingest-Token: YOUR_TOKEN_HERE" \
  -d '{
    "alertId": "TEST-001",
    "message": "Test alert message",
    "state": "NY",
    "alertType": "Test Alert"
  }'
```

## SDK Integration

### JavaScript/TypeScript
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCWX4L4y4Qi--ooSiklKBtoXpEJQice6mQ",
  authDomain: "emu-incidents.firebaseapp.com",
  projectId: "emu-incidents",
  storageBucket: "emu-incidents.firebasestorage.app",
  messagingSenderId: "841200945180",
  appId: "1:841200945180:web:08e09744b8f5b0f14bb7d9"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Real-time listener
const unsubscribe = onSnapshot(
  collection(firestore, 'alerts'),
  (snapshot) => {
    snapshot.forEach((doc) => {
      console.log(doc.data());
    });
  }
);
```

## Deployment

### Cloud Functions
```bash
cd functions
npm install
firebase deploy --only functions:ingestBNN
```

### Environment Variables
Set the ingest token:
```bash
firebase functions:config:set ingest.token="YOUR_SECURE_TOKEN"
```

Or use environment variable:
```bash
export X_INGEST_TOKEN="YOUR_SECURE_TOKEN"
```