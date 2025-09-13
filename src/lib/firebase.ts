import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  appId:
    process.env.EXPO_PUBLIC_ANDROID_APP_ID ??
    process.env.EXPO_PUBLIC_WEB_APP_ID,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_NUMBER!,
};

// Avoid re-initializing during Fast Refresh
const app = getApps().length ? getApps()[0] : initializeApp(config);

// Use getAuth which automatically handles persistence based on platform
const auth = getAuth(app);

const firestore = getFirestore(app);

export { app, auth, firestore };