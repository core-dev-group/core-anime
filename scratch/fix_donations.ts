import 'dotenv/config';
import { db } from '../app/lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

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
