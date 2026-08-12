export interface UnifiedAnime {
  internalId: string;
  title: string;
  slug: string;
  thumbnail: string;
  synopsis?: string;
  status: "ongoing" | "completed" | "unknown";
  type: "tv" | "movie" | "ova" | "ona" | "special" | "unknown";
  genres: string[];
  episodeCount?: number;
  malId?: number;
  score?: number;
  studio?: string;
  coverImage?: string;
  sources: {
    provider: string;
    sourceSlug: string;
    lastCheckedAt: string;
  }[];
}

export interface UnifiedAnimeDetail extends UnifiedAnime {
  episodes: {
    episodeNum: number;
    title?: string;
    slug: string;
  }[];
}

export interface UnifiedEpisode {
  animeId: string;
  episodeNum: number;
  title?: string;
  slug: string;
  streamUrls: {
    server: string;
    quality: string;
    provider: string;
    url: string;
  }[];
  downloadUrls?: {
    quality: string;
    server: string;
    url: string;
  }[];
}

export interface UnifiedScheduleDay {
  day: string;
  animeList: UnifiedAnime[];
}

export interface UnifiedGenre {
  name: string;
  slug: string;
}

export interface AnimeProvider {
  name: string;
  isHealthy(): Promise<boolean>;
  getHome(page?: number): Promise<UnifiedAnime[]>;
  search(query: string, page?: number): Promise<UnifiedAnime[]>;
  getDetail(slug: string): Promise<UnifiedAnimeDetail>;
  getEpisode(slug: string): Promise<UnifiedEpisode>;
  
  // New Methods for Full Integration
  getSchedule?(): Promise<UnifiedScheduleDay[]>;
  getOngoing?(page?: number): Promise<UnifiedAnime[]>;
  getCompleted?(page?: number): Promise<UnifiedAnime[]>;
  getPopular?(page?: number): Promise<UnifiedAnime[]>;
  getGenres?(): Promise<UnifiedGenre[]>;
}
