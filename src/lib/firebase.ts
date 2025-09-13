import { initializeApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, browserLocalPersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

// Check if auth is already initialized to avoid re-initialization
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  // React Native vs Web persistence
  const isReactNative = typeof navigator !== "undefined" && navigator.product === "ReactNative";
  
  // For React Native, we'll use the default persistence which Firebase handles automatically
  // For Web, we explicitly set browserLocalPersistence
  if (!isReactNative) {
    auth = initializeAuth(app, { persistence: browserLocalPersistence });
  } else {
    // Firebase SDK v12+ handles React Native persistence automatically with AsyncStorage
    auth = initializeAuth(app);
  }
}

const firestore = getFirestore(app);

export { app, auth, firestore };