import fs from 'fs';
import path from 'path';

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

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'donations.json');

// Initialize the database file if it doesn't exist
function initDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([]));
  }
}

// Get all raw donations
export function getAllDonations(): SaweriaDonation[] {
  initDB();
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading donations file:", error);
    return [];
  }
}

// Save a new donation from the webhook
export function saveDonation(donation: SaweriaDonation) {
  initDB();
  const donations = getAllDonations();
  // Prevent duplicate webhook events if Saweria retries
  if (!donations.find(d => d.id === donation.id)) {
    donations.push(donation);
    fs.writeFileSync(FILE_PATH, JSON.stringify(donations, null, 2));
  }
}

// Calculate Top Donators for the Leaderboard
export function getTopDonators(limit: number = 5): DonatorLeaderboardEntry[] {
  const donations = getAllDonations();
  
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
