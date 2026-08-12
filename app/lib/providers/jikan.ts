import { getCachedData, setCachedData } from "../cache/redis";

export interface JikanEnrichment {
  score?: number;
  studio?: string;
  coverImage?: string;
  synopsis?: string;
  genres?: string[];
  malId?: number;
}

export async function fetchJikanEnrichment(title: string): Promise<JikanEnrichment | null> {
  // Normalize title for better matching and cache key
  const normalizedTitle = title.replace(/[^\w\s]/g, '').trim().toLowerCase();
  if (!normalizedTitle) return null;
  
  const cacheKey = `jikan:enrich:${encodeURIComponent(normalizedTitle)}`;
  const cached = await getCachedData<JikanEnrichment>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    // We add a tiny delay to help respect rate limits (3 req/sec) 
    // In production, a proper queue/rate limiter should be used.
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(normalizedTitle)}&limit=1`);
    if (!response.ok) {
      if (response.status === 429) {
        console.warn("Jikan API rate limit exceeded");
      }
      return null;
    }
    
    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      // Cache empty result so we don't spam for missing anime
      await setCachedData(cacheKey, {}, 86400 * 7); // Cache for 7 days
      return null;
    }
    
    const anime = data.data[0];
    const enrichment: JikanEnrichment = {
      malId: anime.mal_id,
      score: anime.score,
      studio: anime.studios && anime.studios.length > 0 ? anime.studios[0].name : undefined,
      coverImage: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url,
      synopsis: anime.synopsis,
      genres: anime.genres ? anime.genres.map((g: any) => g.name) : undefined
    };
    
    // Cache for 1 day
    await setCachedData(cacheKey, enrichment, 86400);
    return enrichment;
  } catch (error) {
    console.error(`Jikan API Error for ${title}:`, error);
    return null;
  }
}
