import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore
} from "firebase/firestore";
import {
  getAuth
} from "firebase/auth";
import {
  getStorage
} from "firebase/storage";

// --------------------------------
// Prevent duplicate app initialization
// --------------------------------
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MSG_ID",
  appId: "YOUR_APP_ID",
};

// Fix: prevent "duplicate-app" error
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// --------------------------------
// Export Services
// --------------------------------
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
