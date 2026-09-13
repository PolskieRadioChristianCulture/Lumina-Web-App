import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  projectId: "lumina-cc",
  appId: "1:413985877183:web:b0c99a686a4fb1b875aa0a",
  apiKey: "AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M",
  authDomain: "lumina-cc.firebaseapp.com",
  storageBucket: "lumina-cc.firebasestorage.app",
  messagingSenderId: "413985877183",
  measurementId: ""
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
