import { AnimeProvider, UnifiedAnime, UnifiedAnimeDetail, UnifiedEpisode, UnifiedScheduleDay, UnifiedGenre } from "./base";
import { isProviderHealthy } from "../cache/redis";
import { toUnifiedAnime } from "../normalizer/toUnifiedAnime";
import { fetchApi } from "./utils";

export const samehadaku: AnimeProvider = {
  name: "samehadaku",
  isHealthy: async () => await isProviderHealthy("samehadaku"),
  
  getHome: async (page = 1) => {
    const data = await fetchApi('/anime/samehadaku/home');
    // Adapting generic list field
    
    let list: any = data?.data || data?.home || data?.ongoing || data?.latest || data?.search || data || [];
    if (!Array.isArray(list)) {
      if (list.animeList && Array.isArray(list.animeList)) {
        list = list.animeList;
      } else if (list.ongoing && list.ongoing.animeList && Array.isArray(list.ongoing.animeList)) {
        list = list.ongoing.animeList;
      } else if (list.data && Array.isArray(list.data)) {
        list = list.data;
      } else {
        const arrValue = Object.values(list).find(v => Array.isArray(v));
        if (arrValue) {
          list = arrValue;
        } else {
          const arrAnimeList = Object.values(list).find(v => v && typeof v === 'object' && Array.isArray((v as any).animeList));
          if (arrAnimeList) list = (arrAnimeList as any).animeList;
          else list = [];
        }
      }
    }

    return list.map((item: any) => toUnifiedAnime("samehadaku", {
      title: item.title || item.name || "Unknown",
      thumbnail: item.thumb || item.thumbnail || item.poster || item.image || "",
      sourceSlug: item.slug || item.endpoint || item.id || "",
      status: item.status,
      type: item.type,
      score: item.score || item.rating,
    }));
  },

  search: async (query: string, page = 1) => {
    const data = await fetchApi('/anime/samehadaku/search?q=' + encodeURIComponent(query));
    
    let list: any = data?.data || data?.home || data?.ongoing || data?.latest || data?.search || data || [];
    if (!Array.isArray(list)) {
      if (list.animeList && Array.isArray(list.animeList)) {
        list = list.animeList;
      } else if (list.ongoing && list.ongoing.animeList && Array.isArray(list.ongoing.animeList)) {
        list = list.ongoing.animeList;
      } else if (list.data && Array.isArray(list.data)) {
        list = list.data;
      } else {
        const arrValue = Object.values(list).find(v => Array.isArray(v));
        if (arrValue) {
          list = arrValue;
        } else {
          const arrAnimeList = Object.values(list).find(v => v && typeof v === 'object' && Array.isArray((v as any).animeList));
          if (arrAnimeList) list = (arrAnimeList as any).animeList;
          else list = [];
        }
      }
    }

    return list.map((item: any) => toUnifiedAnime("samehadaku", {
      title: item.title || item.name || "Unknown",
      thumbnail: item.thumb || item.thumbnail || item.poster || item.image || "",
      sourceSlug: item.slug || item.endpoint || item.id || "",
      status: item.status,
      type: item.type,
      score: item.score || item.rating,
    }));
  },

  getDetail: async (slug: string) => {
    throw new Error("Not implemented yet");
  },

  getEpisode: async (slug: string) => {
    throw new Error("Not implemented yet");
  },

  getSchedule: async () => {
    const data = await fetchApi('/anime/samehadaku/schedule');
    const scheduleData = data?.data || data?.schedule || data || [];
    
    return scheduleData.map((dayObj: any) => ({
      day: dayObj.day || "Unknown",
      animeList: (dayObj.anime_list || dayObj.animeList || []).map((item: any) => toUnifiedAnime("samehadaku", {
        title: item.title || item.name || "Unknown",
        thumbnail: item.thumb || item.thumbnail || item.poster || item.image || "",
        sourceSlug: item.slug || item.endpoint || item.id || "",
        status: item.status,
        type: item.type,
        score: item.score || item.rating,
      }))
    }));
  },

  getOngoing: async (page = 1) => {
    const data = await fetchApi(`/anime/samehadaku/ongoing?page=${page}`);
    const list = data?.data || data?.ongoing || data?.animeList || [];
    return list.map((item: any) => toUnifiedAnime("samehadaku", {
      title: item.title || item.name || "Unknown",
      thumbnail: item.thumb || item.thumbnail || item.poster || item.image || "",
      sourceSlug: item.slug || item.endpoint || item.id || "",
      status: item.status || "ongoing",
      type: item.type,
      score: item.score || item.rating,
    }));
  },

  getCompleted: async (page = 1) => {
    const data = await fetchApi(`/anime/samehadaku/completed?page=${page}`);
    const list = data?.data || data?.completed || data?.animeList || [];
    return list.map((item: any) => toUnifiedAnime("samehadaku", {
      title: item.title || item.name || "Unknown",
      thumbnail: item.thumb || item.thumbnail || item.poster || item.image || "",
      sourceSlug: item.slug || item.endpoint || item.id || "",
      status: item.status || "completed",
      type: item.type,
      score: item.score || item.rating,
    }));
  },

  getPopular: async (page = 1) => {
    const data = await fetchApi(`/anime/samehadaku/popular?page=${page}`);
    const list = data?.data || data?.popular || data?.animeList || [];
    return list.map((item: any) => toUnifiedAnime("samehadaku", {
      title: item.title || item.name || "Unknown",
      thumbnail: item.thumb || item.thumbnail || item.poster || item.image || "",
      sourceSlug: item.slug || item.endpoint || item.id || "",
      status: item.status,
      type: item.type,
      score: item.score || item.rating,
    }));
  },

  getGenres: async () => {
    const data = await fetchApi('/anime/samehadaku/genres');
    const list = data?.data || data?.genres || data || [];
    return list.map((item: any) => ({
      name: item.name || item.title || "Unknown",
      slug: item.slug || item.endpoint || ""
    }));
  }
};
