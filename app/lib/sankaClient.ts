// API Client untuk sankavollerei.web.id/anime

const API_BASE = "https://www.sankavollerei.web.id/anime";

export interface SankaAnime {
  title: string;
  poster: string;
  episodes?: string | number;
  releaseDay?: string;
  latestReleaseDate?: string;
  animeId?: string; // Bikin opsional karena schedule mengembalikan slug
  slug?: string;    // Tambahkan slug dari schedule API
  href?: string;
  otakudesuUrl?: string;
  rating?: string;
  score?: string;
  type?: string;
  status?: string;
  studio?: string;
}

import { getMemoryCache, setMemoryCache } from "./cache";

export interface SankaResponse<T> {
  status: string;
  data: T;
  pagination?: {
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalPages: number;
  };
}

export async function fetchSanka<T>(endpoint: string) {
  const cacheKey = `sanka_${endpoint}`;
  const cached = getMemoryCache<any>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);
  }
  
  const json = await res.json() as SankaResponse<T>;
  if (json.status !== "success") {
    throw new Error(`API Error on ${endpoint}`);
  }
  
  setMemoryCache(cacheKey, json.data, 30); // Cache for 30 minutes to heavily avoid rate limits
  return json.data;
}

// Mappers to internal UnifiedAnime type
export function mapSankaToUnified(item: SankaAnime) {
  return {
    id: item.animeId || item.slug, // Gunakan slug jika animeId tidak ada
    title: item.title,
    thumbnail: item.poster,
    episode: item.episodes && item.episodes !== "unknown" ? item.episodes : undefined,
    slug: item.slug || item.animeId, // Gunakan animeId jika slug tidak ada
    score: item.score || item.rating || "unknown",
    type: item.type || "TV",
    status: item.status || "Ongoing",
  };
}

export async function fetchSankaWithPagination<T>(endpoint: string) {
  const cacheKey = `sanka_page_${endpoint}`;
  const cached = getMemoryCache<any>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);
  }
  
  const json = await res.json() as SankaResponse<T>;
  if (json.status !== "success") {
    throw new Error(`API Error on ${endpoint}`);
  }
  
  const result = { data: json.data, pagination: json.pagination };
  setMemoryCache(cacheKey, result, 30);
  return result;
}

export const sankaApi = {
  getHome: async () => {
    const data = await fetchSanka<{
      ongoing: { animeList: SankaAnime[] };
      completed: { animeList: SankaAnime[] };
    }>("/home");
    
    // Gabungkan ongoing dan complete untuk halaman utama
    const all = [...(data.ongoing?.animeList || []), ...(data.completed?.animeList || [])];
    return all.map(mapSankaToUnified);
  },
  
  getSchedule: async () => {
    const data = await fetchSanka<any[]>("/schedule");
    // API Sanka schedule mengembalikan array of days: [{ day: "Senin", anime_list: [...] }]
    return data.map((dayObj: any) => ({
      day: dayObj.day,
      animeList: (dayObj.anime_list || dayObj.animeList || []).map(mapSankaToUnified)
    }));
  },
  
  getOngoing: async (page: number = 1) => {
    const result = await fetchSankaWithPagination<{ animeList: SankaAnime[] }>(`/ongoing-anime?page=${page}`);
    return {
      animeList: (result.data.animeList || []).map(mapSankaToUnified),
      pagination: result.pagination
    };
  },
  
  getComplete: async (page: number = 1) => {
    const result = await fetchSankaWithPagination<{ animeList: SankaAnime[] }>(`/complete-anime?page=${page}`);
    return {
      animeList: (result.data.animeList || []).map(mapSankaToUnified),
      pagination: result.pagination
    };
  },
  
  getGenres: async () => {
    return await fetchSanka<any>('/genre');
  },

  getAnimeByGenre: async (genreId: string, page: number = 1) => {
    const result = await fetchSankaWithPagination<{ animeList: SankaAnime[] }>(`/genre/${genreId}?page=${page}`);
    return {
      genreId,
      animeList: (result.data.animeList || []).map(mapSankaToUnified),
      pagination: result.pagination
    };
  },
  
  getUnlimited: async () => {
    return await fetchSanka<{ list: { startWith: string, animeList: SankaAnime[] }[] }>('/unlimited');
  },

  getAnimeDetail: async (slug: string) => {
    return await fetchSanka<any>(`/anime/${slug}`);
  },
  
  getEpisodeDetail: async (slug: string) => {
    return await fetchSanka<any>(`/episode/${slug}`);
  },
  
  getBatchDetail: async (slug: string) => {
    return await fetchSanka<any>(`/batch/${slug}`);
  },
  
  getServerUrl: async (serverId: string) => {
    return await fetchSanka<{ url: string }>(`/server/${serverId}`);
  }
};
