import { useState, useEffect } from "react";
import { sankaApi } from "~/lib/sankaClient";
import { Link, data, useNavigate, useLocation } from "react-router";
import type { Route } from "./+types/watch";
import { useWatchHistory } from "~/hooks/useWatchHistory";

import { useWatchTracker } from "~/hooks/useWatchTracker";

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params.slug;
  if (!slug) throw data("Missing slug", { status: 400 });

  const episode = await sankaApi.getEpisodeDetail(slug);
  
  let poster = "";
  if (episode.animeId) {
    try {
      const anime = await sankaApi.getAnimeDetail(episode.animeId);
      poster = anime.poster || "";
    } catch (e) {
      console.error("Failed to fetch anime for poster", e);
    }
  }

  return { episode, slug, poster };
}

export function meta({ data }: { data: any }) {
  return [
    { title: data ? `Watch ${data.episode.title || 'Episode'}` : "Watch Anime" },
  ];
}

function PlayerClient({ episode, slug, poster }: { episode: any, slug: string, poster?: string }) {
  const [activeUrl, setActiveUrl] = useState<string>(
    episode.defaultStreamingUrl || ""
  );
  const [activeServerId, setActiveServerId] = useState<string>(
    episode.defaultStreamingUrl || ""
  );
  const { addToHistory } = useWatchHistory();
  useWatchTracker(episode.animeId || slug);

  // Extract episode number from title if possible (e.g., "Sora wa... Episode 6 Subtitle...")
  const epMatch = episode.title?.match(/Episode\s+(\d+)/i);
  const episodeNum = epMatch ? epMatch[1] : 1;

  useEffect(() => {
    // Record history
    addToHistory({
      animeId: episode.animeId,
      episodeId: slug,
      title: episode.title?.split(" Episode")[0] || episode.title,
      episodeNum: episodeNum,
      thumbnail: poster || "",
      progress: 0
    });
  }, [episode.animeId, slug, episode.title, episodeNum, poster]);

  if (!activeUrl) {
    return (
      <div className="w-full aspect-video bg-surface flex items-center justify-center border-2 border-surface-soft shadow-[8px_8px_0px_rgba(46,78,78,0.5)]">
        <p className="text-foreground/50 font-mono tracking-widest uppercase">VIDEO TIDAK TERSEDIA SAAT INI.</p>
      </div>
    );
  }

  // Format qualities for buttons (Grouped by resolution)
  const groupedServers: Record<string, { url: string, server: string }[]> = {};
  
  if (episode.defaultStreamingUrl) {
    groupedServers['Auto'] = [{ url: episode.defaultStreamingUrl, server: 'Default' }];
  }
  
  if (episode.server?.qualities) {
    episode.server.qualities.forEach((q: any) => {
      const qualityTitle = q.title || 'Unknown';
      if (!groupedServers[qualityTitle]) groupedServers[qualityTitle] = [];
      
      if (q.serverList) {
        q.serverList.forEach((s: any) => {
          groupedServers[qualityTitle].push({
            url: s.serverId,
            server: s.title
          });
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up animation-delay-100">
      {/* Video Player Frame */}
      <div className="w-full bg-black relative border-2 border-surface-soft shadow-[4px_4px_0px_rgba(46,78,78,0.5)] md:shadow-[8px_8px_0px_rgba(46,78,78,0.5)] group overflow-hidden">
        <div className="relative w-full aspect-video">
          <iframe 
            key={activeUrl}
            src={activeUrl !== episode.defaultStreamingUrl ? `/api/proxy-stream?url=${encodeURIComponent(activeUrl)}` : activeUrl}
            className="absolute inset-0 w-full h-full z-20"
            allowFullScreen
            frameBorder="0"
            scrolling="no"
          />
        </div>
        <div className="absolute inset-0 pointer-events-none crt-scanline opacity-10 z-30"></div>
        <div className="absolute top-0 right-0 bg-accent text-background px-3 py-1 z-30 border-b-2 border-l-2 border-surface shadow-[-2px_2px_0px_rgba(0,0,0,0.5)] font-mono text-xs font-bold uppercase tracking-widest pointer-events-none">
          LIVE FEED
        </div>
      </div>

      {/* Server & Quality Selection */}
      <div className="bg-surface border-2 border-surface-soft p-6 relative shadow-[4px_4px_0px_rgba(46,78,78,0.3)]">
        <div className="absolute -top-3 left-4 bg-background px-2">
          <h3 className="text-lg font-display uppercase tracking-widest text-foreground">
            PILIH SERVER
          </h3>
        </div>
        <div className="flex flex-col gap-4 mt-4">
          {Object.entries(groupedServers)
            .filter(([_, servers]) => servers.length > 0)
            .map(([quality, servers]) => (
            <div key={quality} className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-surface-soft last:border-0 last:pb-0">
              <span className="font-mono font-bold text-accent text-sm uppercase tracking-widest w-20 shrink-0 border-l-2 border-accent pl-2">
                {quality}
              </span>
              <div className="flex flex-wrap gap-2">
                {servers.map((stream, idx) => (
                  <button
                    key={idx}
                    onClick={async () => {
                      setActiveServerId(stream.url); // Use stream.url (which is serverId or 'Default') as the unique identifier
                      if (stream.server === 'Default') {
                        setActiveUrl(stream.url);
                      } else {
                        try {
                          const res = await fetch(`/api/sanka?id=${encodeURIComponent(stream.url)}`).then(r => r.json());
                          if (res?.url) {
                            setActiveUrl(res.url);
                          } else {
                            alert('Gagal mengambil tautan server pihak ketiga.');
                          }
                        } catch (e) {
                          alert('Gagal menghubungi server penyedia.');
                        }
                      }
                    }}
                    className={`px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest transition-all border ${
                      activeServerId === stream.url
                        ? "bg-accent text-white border-accent shadow-[3px_3px_0px_rgba(255,59,59,0.5)]" 
                        : "bg-background text-foreground/70 hover:text-foreground hover:border-accent border-surface-soft shadow-[2px_2px_0px_rgba(46,78,78,0.5)] hover:-translate-y-0.5"
                    }`}
                  >
                    {stream.server}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WatchPage({ loaderData }: Route.ComponentProps) {
  const { episode, slug } = loaderData;
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl mt-4 md:mt-6">
      
      {/* Top Bar with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b-2 border-surface-soft pb-4 gap-4">
        <button 
          onClick={() => {
            if (location.state?.fromDetail && window.history?.state?.idx > 0) {
              navigate(-1);
            } else {
              navigate(`/anime/${episode.animeId}`, { replace: true });
            }
          }}
          className="flex items-center gap-2 text-foreground/70 hover:text-accent font-mono text-sm tracking-widest uppercase transition-colors group w-fit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          KEMBALI KE DETAIL
        </button>
        
        <div className="flex gap-2 self-end sm:self-auto">
          {episode.hasPrevEpisode && episode.prevEpisode ? (
            <Link 
              to={`/watch/${episode.prevEpisode.episodeId}`} 
              replace 
              state={{ fromDetail: location.state?.fromDetail }}
              className="px-4 py-1.5 bg-surface hover:bg-accent hover:text-white border-2 border-surface-soft hover:border-accent transition-colors text-xs font-mono font-bold uppercase shadow-[2px_2px_0px_rgba(46,78,78,0.5)]"
            >
              &laquo; PREV
            </Link>
          ) : (
            <div className="px-4 py-1.5 bg-surface/50 text-foreground/30 border-2 border-surface-soft/50 text-xs font-mono font-bold uppercase cursor-not-allowed">
              &laquo; PREV
            </div>
          )}
          {episode.hasNextEpisode && episode.nextEpisode ? (
            <Link 
              to={`/watch/${episode.nextEpisode.episodeId}`} 
              replace 
              state={{ fromDetail: location.state?.fromDetail }}
              className="px-4 py-1.5 bg-surface hover:bg-accent hover:text-white border-2 border-surface-soft hover:border-accent transition-colors text-xs font-mono font-bold uppercase shadow-[2px_2px_0px_rgba(46,78,78,0.5)]"
            >
              NEXT &raquo;
            </Link>
          ) : (
            <div className="px-4 py-1.5 bg-surface/50 text-foreground/30 border-2 border-surface-soft/50 text-xs font-mono font-bold uppercase cursor-not-allowed">
              NEXT &raquo;
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex flex-col gap-2">
          <div className="inline-block bg-accent text-background px-3 py-1 font-bold tracking-widest text-xs mb-1 border border-accent shadow-[0_0_10px_rgba(255,59,59,0.5)] w-fit animate-pulse">
            ON AIR
          </div>
          <h1 className="text-2xl md:text-4xl font-display font-bold text-foreground uppercase tracking-widest leading-tight drop-shadow-md">
            {episode.title}
          </h1>
        </div>
      </div>
      
      <PlayerClient episode={episode} slug={slug} poster={loaderData.poster} />
      
      {/* Downloads Section */}
      {episode.downloadUrl?.qualities && episode.downloadUrl.qualities.length > 0 && (
        <div className="mt-12 mb-20 bg-surface border-2 border-surface-soft p-6 relative shadow-[4px_4px_0px_rgba(46,78,78,0.3)] animate-fade-in-up animation-delay-200">
          <div className="absolute -top-3 left-4 bg-background px-2">
            <h2 className="text-lg font-display uppercase tracking-widest text-foreground">
              LINK DOWNLOAD
            </h2>
          </div>
          <div className="space-y-6 mt-4">
            {episode.downloadUrl.qualities.map((q: any, idx: number) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-surface-soft last:border-0 last:pb-0">
                <span className="font-mono font-bold text-accent-2 text-sm uppercase tracking-widest w-24 shrink-0 border-l-2 border-accent-2 pl-2 flex flex-col">
                  {q.title}
                  {q.size && <span className="text-[10px] text-foreground/50">{q.size}</span>}
                </span>
                <div className="flex flex-wrap gap-2">
                  {(q.urls || q.serverList || []).map((dl: any, dIdx: number) => (
                    <a 
                      key={dIdx} 
                      href={dl.url || dl.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-background hover:bg-accent-2 hover:text-black text-foreground/80 px-3 py-1 text-xs font-mono font-bold uppercase tracking-widest transition-colors border border-surface-soft hover:border-accent-2"
                    >
                      {dl.title}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
