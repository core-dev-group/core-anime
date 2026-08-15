import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const ref = doc(db, 'donations', 'test-id-123');
    await setDoc(ref, {
      id: 'test-id-123',
      donator_name: 'TEST BOT',
      donator_email: 'test@example.com',
      amount_raw: 10000,
      message: 'test message',
      created_at: new Date().toISOString()
    });
    console.log('Success writing to Firestore');
  } catch (e) {
    console.error('Failed:', e);
  }
}
test();
