# EMU Alerts Deployment Guide

## Overview

This guide covers deployment procedures for all platforms: Web, Android, iOS, and Cloud Functions.

## Prerequisites

- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- EAS CLI installed (`npm install -g eas-cli`)
- Active Firebase project
- Apple Developer account (iOS only)
- Google Play Console account (Android only)

## Environment Setup

### 1. Environment Variables

Create `.env.production` for production builds:
```bash
# Optional - Only if using native maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_api_key
```

### 2. Firebase Project Setup

Ensure your Firebase project has:
- Authentication enabled (Email/Password)
- Firestore database created
- Cloud Functions enabled
- Proper security rules deployed

## Web Deployment

### Option 1: Firebase Hosting

1. **Build the web app**:
```bash
pnpm run build:web-prod
```

2. **Initialize Firebase Hosting** (first time only):
```bash
firebase init hosting

# Select options:
# - Public directory: dist-web
# - Single-page app: Yes
# - Overwrite index.html: No
```

3. **Deploy to Firebase**:
```bash
firebase deploy --only hosting
```

Your app will be available at: `https://emu-incidents.web.app`

### Option 2: Netlify

1. **Build the app**:
```bash
pnpm run build:web-prod
```

2. **Deploy with Netlify CLI**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd dist-web
netlify deploy --prod
```

3. **Or drag-and-drop**: Upload `dist-web` folder to Netlify dashboard

### Option 3: Vercel

1. **Build and deploy**:
```bash
# Install Vercel CLI
npm install -g vercel

# Build
pnpm run build:web-prod

# Deploy
cd dist-web
vercel --prod
```

### Option 4: Custom Server (Nginx)

1. **Build the app**:
```bash
pnpm run build:web-prod
```

2. **Nginx configuration**:
```nginx
server {
    listen 80;
    server_name emu-alerts.com;
    root /var/www/emu-alerts;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. **Deploy files**:
```bash
scp -r dist-web/* user@server:/var/www/emu-alerts/
```

## Mobile Deployment (EAS Build)

### Initial Setup

1. **Install EAS CLI**:
```bash
npm install -g eas-cli
```

2. **Login to Expo account**:
```bash
eas login
```

3. **Configure EAS** (first time only):
```bash
eas build:configure
```

### Android Deployment

#### Development Build
```bash
eas build --platform android --profile development
```

#### Production Build (APK)
```bash
eas build --platform android --profile preview
```

#### Production Build (AAB for Play Store)
```bash
eas build --platform android --profile production
```

#### Submit to Google Play Store
1. **Build AAB**:
```bash
eas build --platform android --profile production
```

2. **Configure submission**:
```bash
eas submit --platform android
```

3. **Or manually upload**: Download AAB and upload to Play Console

### iOS Deployment

#### Development Build
```bash
eas build --platform ios --profile development
```

#### TestFlight Build
```bash
eas build --platform ios --profile production
```

#### Submit to App Store
1. **Build IPA**:
```bash
eas build --platform ios --profile production
```

2. **Submit to App Store Connect**:
```bash
eas submit --platform ios
```

### EAS Configuration (eas.json)

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug"
      }
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
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json",
        "track": "production"
      },
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890"
      }
    }
  }
}
```

## Cloud Functions Deployment

### 1. Configure Environment

Set the ingest token:
```bash
firebase functions:config:set ingest.token="YOUR_SECURE_TOKEN_HERE"
```

### 2. Deploy Functions

Deploy single function:
```bash
cd functions
npm install
firebase deploy --only functions:ingestBNN
```

Deploy all functions:
```bash
firebase deploy --only functions
```

### 3. Verify Deployment

Check function URL:
```bash
firebase functions:list
```

Test the function:
```bash
curl -X POST https://us-central1-emu-incidents.cloudfunctions.net/ingestBNN \
  -H "Content-Type: application/json" \
  -H "X-Ingest-Token: YOUR_TOKEN_HERE" \
  -d '{
    "alertId": "TEST-DEPLOY-001",
    "message": "Deployment test alert"
  }'
```

## Database Security Rules

Deploy Firestore rules:

1. **Create `firestore.rules`**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Alerts - authenticated read only
    match /alerts/{alertId} {
      allow read: if request.auth != null;
      allow write: if false;
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if request.auth != null;
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

2. **Deploy rules**:
```bash
firebase deploy --only firestore:rules
```

## Production Checklist

### Before Deployment

- [ ] Update version in `package.json` and `app.json`
- [ ] Test all features in development
- [ ] Review and update environment variables
- [ ] Check API keys are production-ready
- [ ] Update Firebase security rules
- [ ] Review cloud function authentication

### Security

- [ ] Restrict Google Maps API key by platform
- [ ] Set proper CORS origins for cloud functions
- [ ] Enable Firebase App Check (optional)
- [ ] Review Firebase Auth settings
- [ ] Set up proper backup procedures

### Monitoring

- [ ] Enable Firebase Crashlytics
- [ ] Set up Firebase Performance Monitoring
- [ ] Configure Google Cloud alerts
- [ ] Set up uptime monitoring

### Performance

- [ ] Enable Firestore indexes
- [ ] Configure CDN for web assets
- [ ] Set proper cache headers
- [ ] Enable gzip compression

## CI/CD Setup (GitHub Actions)

### Web Deployment Workflow

`.github/workflows/deploy-web.yml`:
```yaml
name: Deploy Web

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install pnpm
        run: npm install -g pnpm
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build web app
        run: pnpm run build:web-prod
        
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### Mobile Build Workflow

`.github/workflows/eas-build.yml`:
```yaml
name: EAS Build

on:
  release:
    types: [published]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build Android
        run: eas build --platform android --profile production --non-interactive
        
      - name: Build iOS
        run: eas build --platform ios --profile production --non-interactive
```

## Rollback Procedures

### Web Rollback
```bash
# Firebase Hosting maintains version history
firebase hosting:releases:list
firebase hosting:rollback
```

### Cloud Functions Rollback
```bash
# View function versions
gcloud functions list --project=emu-incidents

# Rollback to previous version
firebase deploy --only functions:ingestBNN --force
```

### Mobile Rollback
- Android: Upload previous AAB to Play Store
- iOS: Contact Apple Developer Support
- Use EAS Update for minor fixes without new builds

## Monitoring and Maintenance

### Health Checks

1. **Web App**: Set up uptime monitoring
2. **Cloud Functions**: Monitor execution logs
3. **Database**: Check Firestore metrics
4. **Authentication**: Monitor sign-in rates

### Regular Maintenance

- Review and rotate API keys quarterly
- Update dependencies monthly
- Check Firebase usage and quotas
- Review security rules
- Backup Firestore data

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Clear cache: `expo start --clear`
   - Delete node_modules and reinstall
   - Check environment variables

2. **Deployment Failures**
   - Verify Firebase CLI is logged in
   - Check project permissions
   - Review build logs

3. **Runtime Errors**
   - Check Firebase Console logs
   - Review Crashlytics reports
   - Test with development build

### Support Resources

- Firebase Support: https://firebase.google.com/support
- Expo Forums: https://forums.expo.dev
- GitHub Issues: Project repository

## Cost Considerations

### Firebase Pricing
- Authentication: Free up to 10k users/month
- Firestore: Free up to 50k reads/day
- Cloud Functions: Free up to 125k invocations/month
- Hosting: Free up to 10GB storage

### Optimization Tips
- Implement caching strategies
- Use Firestore compound queries
- Optimize image assets
- Enable Firebase App Check for security