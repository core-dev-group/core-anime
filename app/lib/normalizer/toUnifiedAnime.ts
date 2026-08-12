import { UnifiedAnime, UnifiedAnimeDetail, UnifiedEpisode } from "../providers/base";

export type RawAnimeData = any;

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function toUnifiedAnime(
  providerName: string,
  mapping: {
    title: string;
    thumbnail: string;
    synopsis?: string;
    status?: string;
    type?: string;
    genres?: string[];
    episodeCount?: number;
    score?: number | string;
    sourceSlug: string;
  }
): UnifiedAnime {
  // Parsing status
  let status: UnifiedAnime["status"] = "unknown";
  const rawStatus = mapping.status?.toLowerCase() || "";
  if (rawStatus.includes("ongoing") || rawStatus.includes("sedang tayang")) {
    status = "ongoing";
  } else if (rawStatus.includes("completed") || rawStatus.includes("tamat") || rawStatus.includes("selesai")) {
    status = "completed";
  }

  // Parsing type
  let type: UnifiedAnime["type"] = "unknown";
  const rawType = mapping.type?.toLowerCase() || "";
  if (rawType.includes("tv")) type = "tv";
  else if (rawType.includes("movie")) type = "movie";
  else if (rawType.includes("ova")) type = "ova";
  else if (rawType.includes("ona")) type = "ona";
  else if (rawType.includes("special")) type = "special";
  else if (rawType.includes("donghua")) type = "ona"; // Seringkali donghua berupa ONA

  const cleanTitle = mapping.title.replace(/subtitle indonesia|sub indo|batch/gi, "").trim();
  const slug = slugify(cleanTitle);

  return {
    internalId: `${providerName}-${mapping.sourceSlug}`, // Default internalId jika belum ada di DB
    title: cleanTitle,
    slug: slug,
    thumbnail: mapping.thumbnail,
    synopsis: mapping.synopsis,
    status: status,
    type: type,
    genres: mapping.genres || [],
    episodeCount: mapping.episodeCount,
    score: mapping.score ? parseFloat(mapping.score as string) : undefined,
    sources: [
      {
        provider: providerName,
        sourceSlug: mapping.sourceSlug,
        lastCheckedAt: new Date().toISOString()
      }
    ]
  };
}
