import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - same as the native Android app
const firebaseConfig = {
  apiKey: "AIzaSyCWX4L4y4Qi--ooSiklKBtoXpEJQice6mQ",
  authDomain: "emu-incidents.firebaseapp.com",
  projectId: "emu-incidents",
  storageBucket: "emu-incidents.firebasestorage.app",
  messagingSenderId: "841200945180",
  appId: "1:841200945180:web:08e09744b8f5b0f14bb7d9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Default export the app
export default app;