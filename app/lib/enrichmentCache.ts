import fs from "fs";
import path from "path";

// ==========================================
// 2. AI Enrichment Cache (File-Based)
// ==========================================
// Menyimpan secara permanen agar reload Vite tidak menghapus data Groq
const AI_CACHE_FILE = path.join(process.cwd(), ".ai-cache.json");

// Untuk performa baca yang cepat, kita load ke memory saat module dieksekusi pertama kali
let _aiCache: Record<string, any> | null = null;

function loadAiCache(): Record<string, any> {
  if (_aiCache) return _aiCache;
  try {
    if (fs.existsSync(AI_CACHE_FILE)) {
      const data = fs.readFileSync(AI_CACHE_FILE, "utf-8");
      _aiCache = JSON.parse(data);
      return _aiCache!;
    }
  } catch (e) {
    console.error("Failed to load AI cache:", e);
  }
  _aiCache = {};
  return _aiCache;
}

function saveAiCache(cache: Record<string, any>) {
  _aiCache = cache;
  try {
    fs.writeFileSync(AI_CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save AI cache:", e);
  }
}

export function getAiCachedDetails(title: string): any {
  const cache = loadAiCache();
  return cache[title] || null;
}

export function setAiCachedDetails(title: string, details: any) {
  const cache = loadAiCache();
  cache[title] = details;
  saveAiCache(cache);
}

export function setAiCachedDetailsBulk(entries: Record<string, any>) {
  const cache = loadAiCache();
  Object.assign(cache, entries);
  saveAiCache(cache);
}
