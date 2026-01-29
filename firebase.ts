import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyA7qQuBhxXQrSbvAmUBO4oaeCAjKUiB-RE",
  authDomain: "doctors-clinic-medical-centre.firebaseapp.com",
  projectId: "doctors-clinic-medical-centre",
  storageBucket: "doctors-clinic-medical-centre.firebasestorage.app",
  messagingSenderId: "782547977271",
  appId: "1:782547977271:web:5817ad56419e02b3ff2bb2",
  measurementId: "G-Q3SM3JDETC"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);