/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA FIREBASE SERVICES BRIDGE
 * ══════════════════════════════════════════════════════════════════════════
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'lumina-cc',
  authDomain: 'lumina-cc.firebaseapp.com',
  storageBucket: 'lumina-cc.firebasestorage.app'
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
