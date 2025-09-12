# Firebase Configuration and Security Documentation

## Overview

EMU Alerts uses Firebase as its backend infrastructure, providing authentication, real-time database, and cloud functions. This document covers Firebase configuration, security rules, and best practices.

## Firebase Services Used

1. **Firebase Authentication** - User management
2. **Cloud Firestore** - Real-time NoSQL database
3. **Cloud Functions** - Serverless backend logic
4. **Firebase Hosting** - Web app deployment (optional)

## Project Configuration

### Firebase Project Details

- **Project ID**: `emu-incidents`
- **Project Name**: EMU Incidents
- **Default Region**: `us-central1`
- **Web App ID**: `1:841200945180:web:08e09744b8f5b0f14bb7d9`

### Client Configuration

Located in `src/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyCWX4L4y4Qi--ooSiklKBtoXpEJQice6mQ",
  authDomain: "emu-incidents.firebaseapp.com",
  projectId: "emu-incidents",
  storageBucket: "emu-incidents.firebasestorage.app",
  messagingSenderId: "841200945180",
  appId: "1:841200945180:web:08e09744b8f5b0f14bb7d9"
};
```

**Note**: These are client-side configuration values and are safe to expose. Security is enforced through Firebase Security Rules and authentication.

## Authentication Setup

### Email/Password Authentication

**Enabled Features**:
- Email/password sign-in
- Account creation
- Password reset (future implementation)

**Configuration Steps**:
1. Firebase Console → Authentication → Sign-in method
2. Enable Email/Password provider
3. Configure password requirements

### User Management

**Creating Users Programmatically**:
```javascript
import { createUserWithEmailAndPassword } from 'firebase/auth';

const createUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error creating user:', error);
  }
};
```

**Managing Existing Users**:
- View users in Firebase Console → Authentication → Users
- Disable/delete users as needed
- Reset passwords manually

## Firestore Database

### Database Structure

```
firestore-root/
├── alerts/                    # Main collection
│   ├── {alertId}/            # Document ID matches alertId field
│   │   ├── alertId: string
│   │   ├── state: string
│   │   ├── county: string
│   │   ├── city: string
│   │   ├── address: string
│   │   ├── addressForMaps: string
│   │   ├── formattedAddress: string
│   │   ├── alertType: string
│   │   ├── geo: { latitude: number, longitude: number }
│   │   ├── initialMessage: string
│   │   ├── rawText: string
│   │   ├── source: string
│   │   ├── title: string
│   │   ├── createdAt: timestamp
│   │   ├── lastUpdatedAt: timestamp
│   │   └── messages/         # Subcollection
│   │       └── {messageId}/  # Auto-generated ID
│   │           ├── message: string
│   │           ├── receivedAtEpoch: number
│   │           ├── receivedAtText: string
│   │           └── serverTimestamp: timestamp
```

### Indexes

Required composite indexes for optimal query performance:

```json
{
  "indexes": [
    {
      "collectionGroup": "alerts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "lastUpdatedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

## Security Rules

### Current Production Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        request.auth.token.admin == true;
    }
    
    // Alerts collection
    match /alerts/{alertId} {
      // Anyone authenticated can read
      allow read: if isAuthenticated();
      
      // Only cloud functions can write (no client writes)
      allow write: if false;
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isAuthenticated();
        allow write: if false;
      }
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Security Rules Best Practices

1. **Principle of Least Privilege**: Only grant necessary permissions
2. **Validate Data**: Add validation rules for writes (if enabled)
3. **Use Functions**: Keep complex logic in security rule functions
4. **Test Rules**: Use Firebase Emulator Suite for testing

### Example: Enhanced Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Constants
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isVerifiedUser() {
      return isAuthenticated() && 
        request.auth.token.email_verified == true;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        request.auth.token.admin == true;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && 
        request.auth.uid == userId;
    }
    
    // Validate alert data structure
    function isValidAlert() {
      let data = request.resource.data;
      return data.keys().hasAll(['alertId', 'message']) &&
        data.alertId is string &&
        data.message is string &&
        data.alertId.size() > 0 &&
        data.message.size() > 0;
    }
    
    // Alerts with enhanced security
    match /alerts/{alertId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin() && isValidAlert();
      allow update: if isAdmin() && isValidAlert();
      allow delete: if isAdmin();
      
      match /messages/{messageId} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();
      }
    }
    
    // User preferences (future feature)
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
    }
  }
}
```

## Cloud Functions Security

### Function Configuration

Located in `functions/index.js`:

```javascript
// Set token via Firebase config
firebase functions:config:set ingest.token="YOUR_SECURE_TOKEN"

// Or use environment variable
export X_INGEST_TOKEN="YOUR_SECURE_TOKEN"
```

### Token Validation

```javascript
function getExpectedToken() {
  const fromEnv = process.env.X_INGEST_TOKEN;
  let fromConfig;
  try {
    fromConfig = functions.config()?.ingest?.token;
  } catch (_) {}
  return fromEnv || fromConfig || '';
}

// In function handler
const headerToken = req.get('x-ingest-token');
const expected = getExpectedToken();
if (!headerToken || headerToken !== expected) {
  res.status(401).send('Unauthorized');
  return;
}
```

### CORS Configuration

```javascript
function setCors(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'content-type,x-ingest-token');
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}
```

**Production CORS** (restrict origins):
```javascript
const allowedOrigins = [
  'https://emu-incidents.web.app',
  'https://emu-incidents.firebaseapp.com',
  'https://yourdomain.com'
];

function setCors(res, origin) {
  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
}
```

## API Key Security

### Google Maps API Key

1. **Restrict by Platform**:
   - Android: Package name `com.emualerts.expo`
   - iOS: Bundle ID `com.emualerts.expo`
   - Web: HTTP referrers `https://yourdomain.com/*`

2. **Restrict by API**:
   - Maps SDK for Android ✓
   - Maps SDK for iOS ✓
   - Maps JavaScript API ✓
   - Geocoding API ✓
   - Disable all others

### Firebase API Key

The Firebase Web API Key (`AIzaSyCWX4L4y4Qi...`) is designed to be public but should still be restricted:

1. **Application Restrictions**:
   - HTTP referrers for web
   - Android apps for mobile
   - Bundle IDs for iOS

2. **API Restrictions**:
   - Identity Toolkit API
   - Firebase Installations API
   - Firebase Cloud Firestore API
   - Disable unnecessary APIs

## Security Monitoring

### Enable Security Features

1. **Firebase App Check** (Recommended):
```javascript
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('your-recaptcha-site-key'),
  isTokenAutoRefreshEnabled: true
});
```

2. **Audit Logs**:
   - Enable Cloud Audit Logs
   - Monitor authentication events
   - Track Firestore access patterns

3. **Alerts**:
   - Set up budget alerts
   - Configure security alerts
   - Monitor unusual activity

### Security Checklist

- [ ] Enable App Check for production
- [ ] Restrict API keys by platform
- [ ] Implement proper CORS policies
- [ ] Use secure token generation
- [ ] Enable 2FA for admin accounts
- [ ] Regular security rule reviews
- [ ] Monitor usage patterns
- [ ] Implement rate limiting

## Backup and Recovery

### Firestore Backups

**Manual Backup**:
```bash
gcloud firestore export gs://your-backup-bucket/2025-01-01-backup
```

**Scheduled Backups**:
```javascript
// Cloud Function for automated backups
const { CloudFirestoreBackup } = require('@google-cloud/firestore');

exports.scheduledBackup = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const backup = new CloudFirestoreBackup();
    await backup.export('gs://your-backup-bucket/automatic-backup');
  });
```

### Restore Procedures

```bash
gcloud firestore import gs://your-backup-bucket/2025-01-01-backup
```

## Development vs Production

### Development Configuration

```javascript
// Enable emulators for local development
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(firestore, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

### Production Hardening

1. **Remove console logs**
2. **Enable App Check**
3. **Implement rate limiting**
4. **Use environment-specific configs**
5. **Enable all security features**
6. **Regular security audits**

## Compliance and Privacy

### Data Protection

1. **Encryption**: All data encrypted in transit and at rest
2. **Access Control**: Role-based access via security rules
3. **Audit Trail**: Cloud Audit Logs for compliance
4. **Data Retention**: Implement data lifecycle policies

### GDPR Compliance (if applicable)

1. **User Consent**: Implement consent mechanisms
2. **Data Export**: Provide user data export
3. **Right to Delete**: Implement account deletion
4. **Privacy Policy**: Update and display

## Troubleshooting

### Common Security Issues

1. **Permission Denied**:
   - Check authentication status
   - Verify security rules
   - Confirm user roles

2. **CORS Errors**:
   - Verify allowed origins
   - Check preflight handling
   - Confirm headers

3. **Authentication Failures**:
   - Check API key restrictions
   - Verify auth configuration
   - Monitor quota usage

### Debug Mode

```javascript
// Enable debug mode for security rules
firebase.firestore().enablePersistence({
  experimentalTabSynchronization: true
});
```

## Resources

- [Firebase Security Rules Reference](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [Cloud Functions Best Practices](https://firebase.google.com/docs/functions/bestpractices)
- [Firebase Security Checklist](https://firebase.google.com/support/guides/security-checklist)