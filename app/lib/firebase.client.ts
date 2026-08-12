import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAShUa8BqPbZCQqsgj7UwMA3_8GC968eho",
  authDomain: "core-anime-v7.firebaseapp.com",
  projectId: "core-anime-v7",
  storageBucket: "core-anime-v7.firebasestorage.app",
  messagingSenderId: "913618656952",
  appId: "1:913618656952:web:3ed3014b0426b76ec55e4d",
  measurementId: "G-9QGQS0WM1W"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
