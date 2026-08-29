/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA FIREBASE SERVICES BRIDGE
 * ══════════════════════════════════════════════════════════════════════════
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M",
  authDomain: "lumina-cc.firebaseapp.com",
  databaseURL: "https://lumina-cc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lumina-cc",
  storageBucket: "lumina-cc.firebasestorage.app",
  messagingSenderId: "413985877183",
  appId: "1:413985877183:web:b0c99a686a4fb1b875aa0a",
  measurementId: "G-6440T9VBQB"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
