// Firebase configuration for web app (NPM/Module setup)
// For NPM: npm install firebase
// import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCWX4L4y4Qi--ooSiklKBtoXpEJQice6mQ",
  authDomain: "emu-incidents.firebaseapp.com",
  projectId: "emu-incidents",
  storageBucket: "emu-incidents.firebasestorage.app",
  messagingSenderId: "841200945180",
  appId: "1:841200945180:web:08e09744b8f5b0f14bb7d9"
};

// For legacy global usage (if needed)
window.FIREBASE_CONFIG = firebaseConfig;

// For modern module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = firebaseConfig;
}
