import type { Route } from "./+types/api.yt-search";

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

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  if (!q) {
    return Response.json({ error: "Missing query" }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "YouTube API key not configured" }, { status: 500 });
  }

  try {
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "id");
    searchUrl.searchParams.set("q", q);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoEmbeddable", "true");
    searchUrl.searchParams.set("maxResults", "1");
    searchUrl.searchParams.set("key", apiKey);

    const res = await fetch(searchUrl.toString());

    if (!res.ok) {
      const err = await res.text();
      console.error("YouTube API error:", err);
      return Response.json({ error: "YouTube search failed" }, { status: 200 });
    }

    const data = await res.json();
    const videoId = data?.items?.[0]?.id?.videoId;

    if (videoId) {
      const embedUrl = await getTrailerProxy(videoId);
      return Response.json({
        videoId,
        embedUrl
      });
    }

    return Response.json({ error: "No video found" }, { status: 200 });
  } catch (err) {
    console.error("YouTube search error:", err);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
