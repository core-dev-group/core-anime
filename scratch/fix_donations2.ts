import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { config } from 'dotenv';
config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log("Fixing mei's donation...");
  await setDoc(doc(db, 'donations', 'saweria-mei-f93b5a34'), {
    donator_name: 'mei',
    amount_raw: 16000,
    donator_email: 'mei@example.com',
    created_at: '2026-08-15T08:54:00.346Z',
    message: 'websitenya keren, bikin nostalgia',
    id: 'saweria-mei-f93b5a34'
  });
  console.log("Deleted test bot donation...");
  await deleteDoc(doc(db, 'donations', 'test-id-123'));
  console.log("Done");
}

main().catch(console.error);
