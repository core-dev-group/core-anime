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
async function getCleanTitleFromGroq(rawTitle: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("GROQ_API_KEY is missing. Using regex fallback.");
    // Fallback if no API key
    return rawTitle.replace(/(sub indo|batch|episode|season|ova|movie|\\d+)/gi, "").trim();
  }

  try {
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
            content: "You are a rigid parsing bot. Your ONLY job is to extract the pure Romaji or English anime title from the given string. Remove ALL tags ('Sub Indo', 'Batch', 'Episode X', 'Season Y', resolutions, etc). You MUST output ONLY the final extracted title as plain text. Do NOT add quotes. Do NOT add any conversational text like 'Here is the title' or 'However, ...'. If you add ANY extra words, the system will crash."
          },
          {
            role: "user",
            content: `Extract clean title from: "${rawTitle}"`
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
    return rawTitle.replace(/(sub indo|batch|episode|season|ova|movie|\\d+)/gi, "").trim();
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

export async function getCompleteAnimeDetail(sankaTitle: string) {
  const cacheKey = `mal_detail_v6_${sankaTitle}`;
  const cached = getMemoryCache<any>(cacheKey);
  if (cached) return cached;

  let malInfo = null;
  let malId = null;

  try {
    // 1. Clean the title using Groq
    const cleanTitle = await getCleanTitleFromGroq(sankaTitle);

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

  const anilistData = await fetchAnilistData(malId);

  let mainCharacters: MalCharacter[] = [];

  if (anilistData) {
    if (anilistData.trailer.youtube_id) {
      malInfo.trailer = anilistData.trailer;
    }
    // Filter to main/supporting just in case
    mainCharacters = anilistData.characters.filter(c => c.role === "Main" || c.role === "Supporting").slice(0, 10);
  }

  const result = {
    malInfo,
    characters: mainCharacters
  };

  // Cache for 2 hours (Since AniList is stable, we don't expect random 504s. If no characters, it just means they don't exist yet)
  setMemoryCache(cacheKey, result, 120);
  
  return result;
}
