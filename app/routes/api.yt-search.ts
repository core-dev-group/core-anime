import type { Route } from "./+types/api.yt-search";

const PROXIES = [
  { api: "https://pipedapi.kavin.rocks/streams/", embed: "https://piped.video/embed/" },
  { api: "https://invidious.nerdvpn.de/api/v1/videos/", embed: "https://invidious.nerdvpn.de/embed/" },
  { api: "https://invidious.snopyta.org/api/v1/videos/", embed: "https://invidious.snopyta.org/embed/" },
  { api: "https://inv.tux.pizza/api/v1/videos/", embed: "https://inv.tux.pizza/embed/" }
];

async function getWorkingEmbedUrl(youtubeId: string): Promise<string> {
  const checkProxy = async (proxy: typeof PROXIES[0]) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
      const res = await fetch(proxy.api + youtubeId, { 
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      clearTimeout(timeoutId);
      if (res.ok) return proxy.embed + youtubeId;
      throw new Error("Bad status");
    } catch (e) {
      throw e;
    }
  };

  try {
    const workingProxy = await Promise.any(PROXIES.map(p => checkProxy(p)));
    return workingProxy;
  } catch (e) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  
  if (!q) {
    return Response.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const searchRes = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    
    if (!searchRes.ok) {
      // Avoid console error spam by returning 200
      return Response.json({ error: "YouTube search failed" }, { status: 200 });
    }

    const html = await searchRes.text();
    // YouTube injects initial data as JSON, which contains "videoId":"..."
    const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (match && match[1]) {
      const embedUrl = await getWorkingEmbedUrl(match[1]);
      return Response.json({ videoId: match[1], embedUrl });
    }
    // Return 200 instead of 404 so we don't pollute the browser console with red errors when a song isn't found
    return Response.json({ error: "No video found" }, { status: 200 });
  } catch (err) {
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
