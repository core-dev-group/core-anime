import { AnimeProvider, UnifiedAnime, UnifiedAnimeDetail, UnifiedEpisode } from "./base";
import { isProviderHealthy } from "../cache/redis";
import { toUnifiedAnime } from "../normalizer/toUnifiedAnime";
import { fetchApi } from "./utils";

export const alqanime: AnimeProvider = {
  name: "alqanime",
  isHealthy: async () => await isProviderHealthy("alqanime"),
  
  getHome: async (page = 1) => {
    const data = await fetchApi('/anime/alqanime/home');
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

    return list.map((item: any) => toUnifiedAnime("alqanime", {
      title: item.title || item.name || "Unknown",
      thumbnail: item.thumb || item.thumbnail || item.poster || item.image || "",
      sourceSlug: item.slug || item.endpoint || item.id || "",
      status: item.status,
      type: item.type,
    }));
  },

  search: async (query: string, page = 1) => {
    const data = await fetchApi('/anime/alqanime/search/' + encodeURIComponent(query));
    
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

    return list.map((item: any) => toUnifiedAnime("alqanime", {
      title: item.title || item.name || "Unknown",
      thumbnail: item.thumb || item.thumbnail || item.poster || item.image || "",
      sourceSlug: item.slug || item.endpoint || item.id || "",
      status: item.status,
      type: item.type,
    }));
  },

  getDetail: async (slug: string) => {
    throw new Error("Not implemented yet");
  },

  getEpisode: async (slug: string) => {
    throw new Error("Not implemented yet");
  }
};
