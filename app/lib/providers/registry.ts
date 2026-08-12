import { AnimeProvider, UnifiedAnimeDetail } from "./base";
import { redis, isProviderHealthy } from "../cache/redis";
import { fetchJikanEnrichment } from "./jikan";

// Import all 14 providers
import { otakudesu } from "./otakudesu";
import { samehadaku } from "./samehadaku";
import { donghua } from "./donghua";
import { kusonime } from "./kusonime";
import { anoboy } from "./anoboy";
import { oploverz } from "./oploverz";
import { stream } from "./stream";
import { animekuindo } from "./animekuindo";
import { nimegami } from "./nimegami";
import { alqanime } from "./alqanime";
import { donghub } from "./donghub";
import { winbu } from "./winbu";
import { animekompi } from "./animekompi";
import { kuramanime } from "./kuramanime";

const allProviders = [
  otakudesu,
  samehadaku,
  donghua,
  kusonime,
  anoboy,
  oploverz,
  stream,
  animekuindo,
  nimegami,
  alqanime,
  donghub,
  winbu,
  animekompi,
  kuramanime
];

const providerMap = new Map<string, AnimeProvider>(
  allProviders.map(p => [p.name, p])
);

export const providerPriority = {
  home: [
    "otakudesu", "samehadaku", "animekuindo", "winbu", "nimegami", 
    "alqanime", "animekompi", "kusonime", "oploverz", "stream", 
    "anoboy", "donghua", "donghub", "kuramanime"
  ],
  search: [
    "otakudesu", "samehadaku", "alqanime", "animekompi", "animekuindo", 
    "winbu", "nimegami", "kusonime", "oploverz", "stream", 
    "anoboy", "donghua", "donghub", "kuramanime"
  ],
  detail: [
    "otakudesu", "samehadaku", "alqanime", "nimegami", "animekompi", 
    "animekuindo", "winbu", "kusonime", "oploverz", "stream", 
    "anoboy", "donghua", "donghub", "kuramanime"
  ],
  episode: [
    "otakudesu", "samehadaku", "stream", "anoboy", "alqanime", 
    "nimegami", "animekompi", "animekuindo", "winbu", "kusonime", 
    "oploverz", "donghua", "donghub", "kuramanime"
  ],
  schedule: [
    "otakudesu", "samehadaku"
  ],
  ongoing: [
    "otakudesu", "samehadaku"
  ],
  completed: [
    "otakudesu", "samehadaku"
  ],
  popular: [
    "samehadaku"
  ],
  genres: [
    "otakudesu", "samehadaku"
  ]
};

export function getProvider(name: string): AnimeProvider {
  const provider = providerMap.get(name);
  if (!provider) throw new Error(`Provider ${name} not found`);
  return provider;
}

export async function fetchWithFallback<T>(
  feature: keyof typeof providerPriority,
  fn: (provider: AnimeProvider) => Promise<T>
): Promise<T> {
  const providers = providerPriority[feature];
  
  for (const providerName of providers) {
    const provider = getProvider(providerName);
    
    if (!(await provider.isHealthy())) {
      console.warn(`[Fallback] Skipping ${providerName} (Unhealthy)`);
      continue;
    }
    
    try {
      return await fn(provider);
    } catch (err) {
      console.error(`[Fallback] ${providerName} failed:`, err);
      
      const failKey = `health:fail:${providerName}`;
      const fails = await redis.incr(failKey);
      if (fails === 1) {
        await redis.expire(failKey, 300); // expire in 5 mins
      }
      
      if (fails >= 3) {
        console.warn(`[Circuit Breaker] ${providerName} marked unhealthy for 5 mins`);
        await redis.setex(`health:status:${providerName}`, 300, "unhealthy");
        await redis.del(failKey); 
      }
      
      continue; // Coba provider berikutnya
    }
  }
  
  throw new Error(`Semua source gagal untuk fitur: ${feature}`);
}

export async function getEnrichedDetail(slug: string, providerName?: string): Promise<UnifiedAnimeDetail> {
  // If a specific provider is requested, use it directly (with fallback if it fails)
  // Otherwise, use standard fallback sequence
  
  let detail: UnifiedAnimeDetail;
  if (providerName) {
    try {
      const p = getProvider(providerName);
      detail = await p.getDetail(slug);
    } catch (e) {
      // Fallback
      detail = await fetchWithFallback("detail", p => p.getDetail(slug));
    }
  } else {
    detail = await fetchWithFallback("detail", p => p.getDetail(slug));
  }
  
  // Enrich with Jikan API if necessary
  // We enrich if synopsis is short/missing or score/studio is missing
  const needsEnrichment = !detail.score || !detail.studio || !detail.synopsis || detail.synopsis.length < 50;
  
  if (needsEnrichment) {
    const enrichment = await fetchJikanEnrichment(detail.title);
    if (enrichment) {
      detail.score = enrichment.score || detail.score;
      detail.studio = enrichment.studio || detail.studio;
      detail.coverImage = enrichment.coverImage || detail.coverImage;
      detail.malId = enrichment.malId || detail.malId;
      
      if (!detail.synopsis || detail.synopsis.length < 50) {
        detail.synopsis = enrichment.synopsis || detail.synopsis;
      }
      
      if (enrichment.genres && enrichment.genres.length > 0) {
        // Merge genres uniquely
        const merged = new Set([...detail.genres, ...enrichment.genres]);
        detail.genres = Array.from(merged);
      }
    }
  }
  
  return detail;
}
