import { collection, doc, getDocs, setDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { db } from '~/lib/firebase';

// Define the shape of our Saweria Webhook payload
export interface SaweriaDonation {
  id: string;
  donator_name: string;
  donator_email: string;
  amount_raw: number;
  message: string;
  created_at: string;
}

export interface DonatorLeaderboardEntry {
  name: string;
  amount: number;
  amount_formatted: string;
  message: string;
  tier: 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
}

// Get all raw donations
export async function getAllDonations(): Promise<SaweriaDonation[]> {
  try {
    const q = query(collection(db, 'donations'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as SaweriaDonation);
  } catch (error) {
    console.error("Error fetching donations:", error);
    return [];
  }
}

// Save a new donation from the webhook
export async function saveDonation(donation: SaweriaDonation) {
  try {
    const ref = doc(db, 'donations', donation.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, donation);
    }
  } catch (error) {
    console.error("Error saving donation:", error);
    throw error;
  }
}

// Calculate Top Donators for the Leaderboard
export async function getTopDonators(limit: number = 5): Promise<DonatorLeaderboardEntry[]> {
  const donations = await getAllDonations();
  
  // Group by donator name and sum their amounts, while keeping their latest message
  const donatorMap = new Map<string, { amount: number, message: string }>();
  
  for (const d of donations) {
    // Basic normalization of names (trim spaces, uppercase)
    const name = (d.donator_name || 'Anonym').trim().toUpperCase();
    
    if (donatorMap.has(name)) {
      const existing = donatorMap.get(name)!;
      donatorMap.set(name, {
        amount: existing.amount + d.amount_raw,
        // Use the newest message if there is one
        message: d.message ? d.message : existing.message
      });
    } else {
      donatorMap.set(name, {
        amount: d.amount_raw,
        message: d.message || "Telah mendukung CoreAnime!"
      });
    }
  }

  // Convert map to array and sort by amount descending
  const sortedList = Array.from(donatorMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);

  // Format currency and assign tiers
  return sortedList.map(entry => {
    let tier: DonatorLeaderboardEntry['tier'] = 'BRONZE';
    if (entry.amount >= 1000000) tier = 'DIAMOND';
    else if (entry.amount >= 500000) tier = 'PLATINUM';
    else if (entry.amount >= 100000) tier = 'GOLD';
    else if (entry.amount >= 50000) tier = 'SILVER';

    return {
      name: entry.name,
      amount: entry.amount,
      amount_formatted: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(entry.amount),
      message: entry.message,
      tier
    };
  });
}
