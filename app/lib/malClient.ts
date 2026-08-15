import { getMemoryCache, setMemoryCache } from "./cache";

const JIKAN_API_BASE = "https://api.jikan.moe/v4";

export interface MalAnimeDetail {
  mal_id: number;
  title: string;
  title_english: string;
  title_japanese: string;
  title_synonyms: string[];
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  trailer: {
    youtube_id: string;
    url: string;
    embed_url: string;
  };
  type: string;
  source: string;
  episodes: number;
  status: string;
  airing: boolean;
  aired: {
    string: string;
  };
  duration: string;
  rating: string;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  synopsis: string;
  background: string;
  season: string;
  year: number;
  broadcast: {
    string: string;
  };
  producers: { mal_id: number; name: string }[];
  studios: { mal_id: number; name: string }[];
  genres: { mal_id: number; name: string }[];
  demographics: { mal_id: number; name: string }[];
  opening_themes: { id: number; text: string }[];
  ending_themes: { id: number; text: string }[];
}

export interface MalCharacter {
  character: {
    mal_id: number;
    url: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
    name: string;
  };
  role: string;
  voice_actors: {
    person: {
      mal_id: number;
      url: string;
      images: {
        jpg: {
          image_url: string;
        };
      };
      name: string;
    };
    language: string;
  }[];
}

async function fetchJikanCharacters(malId: number): Promise<MalCharacter[]> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${malId}/characters`, {
      headers: { "User-Agent": "CoreAnime/7.0 (contact@coreanime.my.id)" }
    });
    if (res.ok) {
      const json = await res.json();
      return (json.data || []).map((item: any) => ({
        character: {
          mal_id: item.character?.mal_id,
          url: item.character?.url || "",
          images: { jpg: { image_url: item.character?.images?.jpg?.image_url || "" } },
          name: item.character?.name || ""
        },
        role: item.role || "Main",
        voice_actors: (item.voice_actors || []).map((va: any) => ({
          person: {
            mal_id: va.person?.mal_id,
            url: va.person?.url || "",
            images: { jpg: { image_url: va.person?.images?.jpg?.image_url || "" } },
            name: va.person?.name || ""
          },
          language: va.language || "Japanese"
        }))
      }));
    }
  } catch (e) {
    console.warn("Jikan characters fetch error:", e);
  }
  return [];
}

const PROXIES = [
  { api: "https://pipedapi.kavin.rocks/streams/", embed: "https://piped.video/embed/" },
  { api: "https://invidious.nerdvpn.de/api/v1/videos/", embed: "https://invidious.nerdvpn.de/embed/" },
  { api: "https://invidious.snopyta.org/api/v1/videos/", embed: "https://invidious.snopyta.org/embed/" },
  { api: "https://inv.tux.pizza/api/v1/videos/", embed: "https://inv.tux.pizza/embed/" }
];

async function getTrailerProxy(youtubeId: string): Promise<string> {
  // Proxy Invidious yang aktif dan tidak memblokir iframe dengan Cloudflare
  return `https://invidious.f5.si/embed/${youtubeId}`;
}

async function fetchYouTubeTrailer(title: string): Promise<{ youtube_id: string; url: string; embed_url: string }> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("YOUTUBE_API_KEY not set, skipping trailer fetch");
    return { youtube_id: "", url: "", embed_url: "" };
  }

  try {
    const q = `${title} official trailer pv anime`;
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "id");
    searchUrl.searchParams.set("q", q);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoEmbeddable", "true");
    searchUrl.searchParams.set("maxResults", "1");
    searchUrl.searchParams.set("key", apiKey);

    const res = await fetch(searchUrl.toString());
    if (res.ok) {
      const data = await res.json();
      const videoId = data?.items?.[0]?.id?.videoId;
      if (videoId) {
        const embed_url = await getTrailerProxy(videoId);
        return {
          youtube_id: videoId,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          embed_url
        };
      }
    }
  } catch (e) {
    console.warn("YouTube trailer search error:", e);
  }
  return { youtube_id: "", url: "", embed_url: "" };
}


async function fetchAnilistData(malId: number): Promise<{ trailer: any, characters: MalCharacter[] } | null> {
  const query = `
  query ($idMal: Int) {
    Media (idMal: $idMal, type: ANIME) {
      trailer {
        id
        site
      }
      characters(sort: ROLE, perPage: 10) {
        edges {
          role
          node {
            id
            name { full }
            image { large }
          }
          voiceActors {
            id
            name { full }
            languageV2
            image { large }
          }
        }
      }
    }
  }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables: { idMal: malId } })
    });
    if (!res.ok) return null;
    const json = await res.json();
    const media = json.data?.Media;
    if (!media) return null;

    let trailer = { youtube_id: "", url: "", embed_url: "" };
    if (media.trailer && media.trailer.site === "youtube") {
      trailer = {
        youtube_id: media.trailer.id,
        url: `https://www.youtube.com/watch?v=${media.trailer.id}`,
        embed_url: `https://www.youtube.com/embed/${media.trailer.id}`
      };
    }

    const characters = (media.characters?.edges || []).map((edge: any) => {
      const voiceActors = edge.voiceActors?.map((va: any) => ({
        person: {
          mal_id: va.id,
          url: "",
          images: { jpg: { image_url: va.image?.large || "" } },
          name: va.name?.full || ""
        },
        language: va.languageV2 || "Unknown"
      })) || [];

      return {
        character: {
          mal_id: edge.node.id,
          url: "",
          images: { jpg: { image_url: edge.node.image?.large || "" } },
          name: edge.node.name?.full || ""
        },
        role: edge.role === "MAIN" ? "Main" : edge.role === "SUPPORTING" ? "Supporting" : "Background",
        voice_actors: voiceActors
      };
    });

    return { trailer, characters };
  } catch (error) {
    console.error("Anilist Fetch Error:", error);
    return null;
  }
}

// Function to call Groq to extract the clean anime title
async function getCleanTitleFromGroq(sankaData: any): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const rawTitle = typeof sankaData === 'string' ? sankaData : sankaData.title;
  
  if (!apiKey) {
    console.warn("GROQ_API_KEY is missing. Using regex fallback.");
    // Fallback if no API key
    let clean = rawTitle.replace(/(subtitle indonesia|sub indo|batch|episode\s*\d+|season\s*\d+|ova|movie)/gi, "");
    clean = clean.replace(/\s+\d+$/, ""); // Remove trailing numbers (e.g. episode numbers)
    clean = clean.replace(/\s+/g, " ").trim();
    if (clean.length > 60) clean = clean.substring(0, 60); // MAL API limits query to 64 chars
    return clean;
  }

  try {
    let contextStr = `Title: "${rawTitle}"`;
    if (typeof sankaData === 'object') {
      if (sankaData.studios) contextStr += `\nStudio: ${sankaData.studios}`;
      if (sankaData.type) contextStr += `\nType: ${sankaData.type}`;
      if (sankaData.status) contextStr += `\nStatus: ${sankaData.status}`;
      if (sankaData.episodes) contextStr += `\nEpisodes: ${sankaData.episodes}`;
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Recommended fast model
        messages: [
          {
            role: "system",
            content: "You are an expert MyAnimeList database mapper. I will give you a title from an Indonesian streaming site, along with context like Studio, Type, and Episodes. Your ONLY job is to output the EXACT official Romaji title of this anime as it appears on MyAnimeList.\n\nRULES:\n1. Indonesian sites often use alternate names, English names, or nicknames (e.g., 'Hell Mode', 'Failure Frame', 'Slime Datta Ken'). You MUST translate/map it to the official Romaji title on MyAnimeList.\n2. Keep 'Season 2', 'Part 2', or Cour numbers so the search engine finds the correct sequel.\n3. REMOVE all Indonesian tags (Sub Indo, Batch, Episode 10, dll).\n4. Output ONLY the mapped official title as plain text. Do not add quotes, notes, or prefixes. If you are unsure, output the closest official Romaji name."
          },
          {
            role: "user",
            content: `Extract the clean official title from this data:\n${contextStr}`
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      })
    });

    if (!response.ok) {
      console.warn("Groq API error:", await response.text());
      return rawTitle.replace(/(sub indo|batch|episode|season|ova|movie|\\d+)/gi, "").trim();
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error communicating with Groq:", error);
    let clean = rawTitle.replace(/(subtitle indonesia|sub indo|batch|episode\s*\d+|season\s*\d+|ova|movie)/gi, "");
    clean = clean.replace(/\s+\d+$/, "");
    clean = clean.replace(/\s+/g, " ").trim();
    if (clean.length > 60) clean = clean.substring(0, 60);
    return clean;
  }
}

async function fetchMalOfficialSearch(query: string) {
  const clientId = process.env.MAL_CLIENT_ID;
  if (!clientId) {
    console.warn("MAL_CLIENT_ID is missing. Cannot use official API.");
    return null;
  }
  try {
    const url = `https://api.myanimelist.net/v2/anime?q=${encodeURIComponent(query)}&limit=1&fields=id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,num_episodes,start_season,broadcast,source,average_episode_duration,rating,studios,opening_themes,ending_themes`;
    const res = await fetch(url, {
      headers: {
        "X-MAL-CLIENT-ID": clientId
      }
    });
    if (!res.ok) {
      console.warn(`MAL Official API Error: ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      return data.data[0].node;
    }
    return null;
  } catch (err) {
    console.error("Error fetching from MAL Official API:", err);
    return null;
  }
}

function mapMalOfficialToJikan(malData: any): MalAnimeDetail {
  return {
    mal_id: malData.id,
    title: malData.title,
    title_english: malData.alternative_titles?.en || "",
    title_japanese: malData.alternative_titles?.ja || "",
    title_synonyms: malData.alternative_titles?.synonyms || [],
    images: {
      jpg: {
        image_url: malData.main_picture?.medium || "",
        large_image_url: malData.main_picture?.large || malData.main_picture?.medium || ""
      }
    },
    trailer: { youtube_id: "", url: "", embed_url: "" },
    type: malData.media_type ? malData.media_type.toUpperCase() : "Unknown",
    source: malData.source || "Unknown",
    episodes: malData.num_episodes || 0,
    status: malData.status === "finished_airing" ? "Finished Airing" : malData.status === "currently_airing" ? "Currently Airing" : malData.status || "Unknown",
    airing: malData.status === "currently_airing",
    aired: {
      string: `${malData.start_date || "?"} to ${malData.end_date || "?"}`
    },
    duration: malData.average_episode_duration ? `${Math.floor(malData.average_episode_duration / 60)} min` : "Unknown",
    rating: malData.rating || "Unknown",
    score: malData.mean || 0,
    scored_by: malData.num_scoring_users || 0,
    rank: malData.rank || 0,
    popularity: malData.popularity || 0,
    members: malData.num_list_users || 0,
    favorites: 0,
    synopsis: malData.synopsis || "",
    background: "",
    season: malData.start_season?.season || "Unknown",
    year: malData.start_season?.year || 0,
    broadcast: {
      string: malData.broadcast ? `${malData.broadcast.day_of_the_week} at ${malData.broadcast.start_time}` : "Unknown"
    },
    producers: [],
    studios: (malData.studios || []).map((s: any) => ({ mal_id: s.id, name: s.name })),
    genres: (malData.genres || []).map((g: any) => ({ mal_id: g.id, name: g.name })),
    demographics: [],
    opening_themes: (malData.opening_themes || []).map((t: any) => ({ id: t.id, text: t.text })),
    ending_themes: (malData.ending_themes || []).map((t: any) => ({ id: t.id, text: t.text })),
    pictures: malData.pictures
  };
}

export async function getCompleteAnimeDetail(sankaData: any) {
  const rawTitle = typeof sankaData === 'string' ? sankaData : sankaData.title;
  const cacheKey = `mal_detail_v10_${rawTitle}`;
  const cached = getMemoryCache<any>(cacheKey);
  if (cached) return cached;

  let malInfo = null;
  let malId = null;

  try {
    // 1. Clean the title using Groq and full context
    const cleanTitle = await getCleanTitleFromGroq(sankaData);

    // 2. Search Official MAL API to get the correct MAL ID
    const officialNode = await fetchMalOfficialSearch(cleanTitle);
    
    if (!officialNode) {
      console.warn("No MAL data found via Official API for:", cleanTitle);
      return null;
    }

    malId = officialNode.id;

    // 3. Fetch full details (including pictures and OSTs) using the MAL ID
    const malResponse = await fetch(
      `https://api.myanimelist.net/v2/anime/${malId}?fields=id,title,main_picture,alternative_titles,synopsis,genres,mean,rank,popularity,num_list_users,num_scoring_users,num_episodes,status,start_date,end_date,start_season,broadcast,source,rating,studios,average_episode_duration,opening_themes,ending_themes,pictures`,
      {
        headers: {
          "X-MAL-CLIENT-ID": "611132154a400bb8e5da8584b648d2cb"
        }
      }
    );

    if (malResponse.ok) {
      const data = await malResponse.json();
      malInfo = mapMalOfficialToJikan(data);
    } else {
      console.error("MAL API Error (ID Fetch):", await malResponse.text());
      return null;
    }
  } catch (err) {
    console.error("Error fetching from MAL Official API:", err);
    return null;
  }

  // Try AniList first, then fallback to Jikan & YouTube if AniList is down
  const anilistData = await fetchAnilistData(malId);

  let mainCharacters: MalCharacter[] = [];

  if (anilistData && anilistData.characters.length > 0) {
    if (anilistData.trailer.youtube_id) {
      malInfo.trailer = anilistData.trailer;
    }
    mainCharacters = anilistData.characters.filter(c => c.role === "Main" || c.role === "Supporting").slice(0, 10);
  } else {
    // Fallback: Fetch characters from Jikan
    const jikanChars = await fetchJikanCharacters(malId);
    if (jikanChars.length > 0) {
      mainCharacters = jikanChars.slice(0, 12);
    }
    // Fallback: Fetch trailer from YouTube
    if (!malInfo.trailer?.embed_url) {
      const ytTrailer = await fetchYouTubeTrailer(malInfo.title);
      if (ytTrailer.embed_url) {
        malInfo.trailer = ytTrailer;
      }
    }
  }

  const result = {
    malInfo,
    characters: mainCharacters
  };

  // Cache for 2 hours
  setMemoryCache(cacheKey, result, 120);

  return result;
}
