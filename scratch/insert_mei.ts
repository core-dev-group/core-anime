import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import * as dotenv from "dotenv";
import { randomUUID } from "crypto";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function insertMei() {
  const donation = {
    id: "saweria-mei-" + randomUUID().substring(0, 8),
    donator_name: "mei",
    donator_email: "mei@example.com",
    amount_raw: 16000,
    message: "Telah mendukung CoreAnime!",
    created_at: new Date().toISOString(),
  };

  const ref = doc(db, 'donations', donation.id);
  await setDoc(ref, donation);
  console.log("Success writing Mei's donation to Firestore");
}

insertMei().catch(console.error);
