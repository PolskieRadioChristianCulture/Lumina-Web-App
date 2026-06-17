import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  projectId: "gen-lang-client-0094354839",
  appId: "1:553245611022:web:5ae303f1fe0d6d16f8985f",
  apiKey: "AIzaSyBDuwM3vB5elVsTgFw6xKkwbqEUCT--h7c",
  authDomain: "gen-lang-client-0094354839.firebaseapp.com",
  storageBucket: "gen-lang-client-0094354839.firebasestorage.app",
  messagingSenderId: "553245611022",
  measurementId: "G-P5L6Q1MXRL"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
