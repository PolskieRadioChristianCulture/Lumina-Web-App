import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  projectId: "cc-mission-control",
  appId: "1:519207260358:web:d875a610f438ecad2c47c7",
  apiKey: "AIzaSyDou1gYyuJnuF2WocXEqglfRPqqwMm0Ge4",
  authDomain: "cc-mission-control.firebaseapp.com",
  storageBucket: "cc-mission-control.firebasestorage.app",
  messagingSenderId: "519207260358",
  measurementId: ""
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
