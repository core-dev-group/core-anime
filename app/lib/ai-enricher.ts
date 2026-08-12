import { UnifiedAnime } from "./providers/base";
import { getAiCachedDetails, setAiCachedDetails } from "./enrichmentCache";

const JIKAN_BASE_URL = process.env.JIKAN_BASE_URL || "https://api.jikan.moe/v4";

// Helper function to delay execution (rate limit protection)
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function enrichWithAI(animes: UnifiedAnime[]): Promise<UnifiedAnime[]> {
  if (!animes || animes.length === 0) return animes;

  // Find animes that need enrichment
  const needsEnrichment = animes.filter(
    (a) => !getAiCachedDetails(a.title) && (!a.score || !a.synopsis || a.type === "unknown")
  );

  // We process up to 10 titles at a time to avoid Jikan rate limits (3 req/sec)
  const batch = needsEnrichment.slice(0, 10);

  if (batch.length > 0) {
    console.log(`[Jikan-Enricher] Fetching metadata for ${batch.length} animes from Jikan API...`);
    
    for (const anime of batch) {
      try {
        // Clean title for better search results (remove "Episode X", etc if any)
        const cleanTitle = anime.title.replace(/Episode \d+/i, '').trim();
        
        const response = await fetch(`${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(cleanTitle)}&limit=1`);
        if (response.ok) {
          const json = await response.json();
          if (json.data && json.data.length > 0) {
            const jikanData = json.data[0];
            
            // Cache the result
            setAiCachedDetails(anime.title, {
              score: jikanData.score || null,
              type: jikanData.type ? jikanData.type.toLowerCase() : "tv",
              synopsis: jikanData.synopsis || null,
              genres: jikanData.genres ? jikanData.genres.map((g: any) => g.name) : []
            });
            console.log(`[Jikan-Enricher] Success: ${anime.title} -> Score: ${jikanData.score}`);
          } else {
             // Cache as not found to avoid re-fetching
             setAiCachedDetails(anime.title, { notFound: true });
          }
        } else if (response.status === 429) {
          console.warn("[Jikan-Enricher] Rate limited! Skipping the rest.");
          break; // Stop processing this batch if rate limited
        }
      } catch (e) {
        console.error(`[Jikan-Enricher] Failed to fetch ${anime.title}:`, e);
      }
      
      // Delay 350ms to respect Jikan's 3 requests per second limit
      await delay(350);
    }
  }

  // Merge cache with original data
  return animes.map(anime => {
    const cached = getAiCachedDetails(anime.title);
    if (cached && !cached.notFound) {
      return {
        ...anime,
        score: anime.score || cached.score,
        type: anime.type === "unknown" ? (cached.type || "unknown") : anime.type,
        synopsis: anime.synopsis || cached.synopsis,
        genres: (anime.genres && anime.genres.length > 0) ? anime.genres : (cached.genres || [])
      };
    }
    return anime;
  });
}
