import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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

let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (e) {
  // If already initialized (e.g. during fast refresh), use existing instance
  authInstance = getAuth(app);
}
export const auth = authInstance;

export const storage = getStorage(app);
