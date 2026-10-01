import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBxvaJRmzNtlmUqAl5WyFBmA31w97bdhRA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ruri-01.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ruri-01",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ruri-01.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "177985732901",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:177985732901:web:ec1259428099b02064dacc",
};

// Initialize Firebase once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
