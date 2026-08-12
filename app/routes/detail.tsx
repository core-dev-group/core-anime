import { sankaApi } from "~/lib/sankaClient";
import { getCompleteAnimeDetail } from "~/lib/malClient";
import { useState, useEffect, useRef } from "react";
import type { Route } from "./+types/detail";
import { Link, data, useNavigate } from "react-router";
import { useBookmarks } from "~/hooks/useBookmarks";

// Inline YouTube Player Component to fetch and embed video directly (Lazy Loaded)
function InlineYouTubePlayer({ query, title }: { query: string; title: string }) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let isMounted = true;
    setLoading(true);
    // Simple sanitization to improve search hit rate for long titles
    const cleanTitle = title.replace(/Season \d+|Part \d+/gi, '').trim();
    fetch(`/api/yt-search?q=${encodeURIComponent(query + ' ' + cleanTitle)}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          if (data.embedUrl) setEmbedUrl(data.embedUrl);
          else setError(true);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [inView, query, title]);

  return (
    <div ref={containerRef} className="w-full aspect-video border-2 border-surface-soft bg-black relative mb-4 shadow-[4px_4px_0px_rgba(46,78,78,0.3)] hover:border-accent transition-colors group">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-2 border-surface-soft border-t-accent rounded-full animate-spin"></div>
          <span className="text-xs text-foreground/50 tracking-widest uppercase">Searching...</span>
        </div>
      )}
      
      {error && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface">
          <span className="text-accent font-bold tracking-widest text-sm">NO VIDEO FOUND</span>
          <span className="text-xs text-foreground/50 text-center px-4">Video mungkin diblokir atau tidak tersedia</span>
        </div>
      )}

      {embedUrl && !error && !loading && (
        <iframe
          src={embedUrl.includes('?') ? `${embedUrl}&autoplay=0` : `${embedUrl}?autoplay=0&controls=1`}
          title="YouTube video player"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
}

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params.id;
  if (!slug) throw data("Missing slug", { status: 400 });

  const detailResponse = await sankaApi.getAnimeDetail(slug);
  const malData = await getCompleteAnimeDetail(detailResponse.title);

  return { detail: detailResponse, malData };
}

export function meta({ data }: { data: any }) {
  const title = data?.detail?.title ? `${data.detail.title} - Core Anime` : "Anime Detail";
  const desc = data?.detail?.synopsis?.paragraphs?.[0] || "Watch anime online";
  return [
    { title },
    { name: "description", content: desc }
  ];
}

export default function DetailPage({ loaderData }: Route.ComponentProps) {
  const { detail, malData } = loaderData;
  const { toggleBookmark, isBookmarked, isLoaded } = useBookmarks();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [vaLanguage, setVaLanguage] = useState('Japanese');
  const [isVaDropdownOpen, setIsVaDropdownOpen] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState<string | null>(null);

  // Compute all available VA languages from characters
  const availableVaLanguages = Array.from(new Set(
    malData?.characters?.flatMap((char: any) => char.voice_actors?.map((va: any) => va.language)) || []
  )).filter(Boolean).sort() as string[];

  const renderSynopsis = () => {
    // Prefer MAL synopsis
    if (malData?.malInfo?.synopsis) {
      return malData.malInfo.synopsis.split('\n').filter((p: string) => p.trim()).map((p: string, i: number) => (
        <p key={i} className="mb-4">{p.replace('[Written by MAL Rewrite]', '').trim()}</p>
      ));
    }
    // Fallback to Sanka
    if (detail.synopsis?.paragraphs) {
      return detail.synopsis.paragraphs.map((p: string, i: number) => (
        <p key={i} className="mb-4">{p}</p>
      ));
    }
    return <p>{detail.synopsis || "SINOPSIS TIDAK TERSEDIA."}</p>;
  };

  const tabs = [
    { id: 'details', label: 'DETAILS' },
    { id: 'episodes', label: 'EPISODES' },
    { id: 'characters', label: 'CHARACTERS & STAFF' },
    { id: 'music', label: 'MUSIC & OST' },
    { id: 'videos', label: 'VIDEOS & TRAILER' },
    { id: 'pictures', label: 'PICTURES' }
  ];

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in-up">
      
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between mb-8 border-b-2 border-surface-soft pb-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-foreground/70 hover:text-accent font-mono text-sm tracking-widest uppercase transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          KEMBALI
        </button>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-surface border-2 border-surface-soft text-[10px] font-mono text-accent">
          <div className="w-2 h-2 bg-accent animate-pulse"></div>
          <span>RECORDING...</span>
        </div>
      </div>

      {/* Hero Section (Image + Main Title + Stats) */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 relative z-10 mb-12">
        
        {/* Left Column: Image */}
        <div className="w-full max-w-xs mx-auto md:max-w-none md:w-1/3 lg:w-1/4 flex-shrink-0">
          <div className="relative border-2 border-surface-soft shadow-[8px_8px_0px_rgba(46,78,78,0.5)] bg-surface aspect-[3/4] overflow-hidden group">
            <img 
              src={detail.poster || detail.thumbnail || detail.image} 
              alt={detail.title}
              className="w-full h-full object-cover transition-all duration-700"
            />
            <div className="absolute inset-0 pointer-events-none crt-scanline opacity-30"></div>
            
            {detail.score && (
              <div className="absolute top-0 right-0 bg-accent text-background px-3 py-1.5 font-bold font-mono text-sm border-l-2 border-b-2 border-surface shadow-[-2px_2px_0px_rgba(0,0,0,0.5)] flex items-center gap-1">
                <span>★</span> {detail.score}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Title & Top Stats */}
        <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4 gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground uppercase leading-none tracking-wide drop-shadow-md break-words">
              {malData?.malInfo?.title || detail.title}
            </h1>
            {isLoaded && (
              <button 
                onClick={() => toggleBookmark({
                  id: detail.animeId,
                  slug: detail.animeId,
                  title: detail.title,
                  thumbnail: detail.poster || detail.thumbnail || detail.image,
                  type: detail.type,
                  status: detail.status,
                  score: detail.score,
                } as any)}
                className={`p-3 transition-colors flex-shrink-0 border-2 ${
                  isBookmarked(detail.animeId) 
                    ? "bg-accent text-white shadow-[4px_4px_0px_rgba(255,59,59,0.5)] border-accent" 
                    : "bg-surface text-foreground/70 hover:text-foreground hover:bg-surface-soft border-surface-soft shadow-[4px_4px_0px_rgba(46,78,78,0.5)]"
                }`}
                title={isBookmarked(detail.animeId) ? "Hapus Bookmark" : "Tambah Bookmark"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isBookmarked(detail.animeId) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M5 5v16l7-3.5 7 3.5V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
                </svg>
              </button>
            )}
          </div>
          
          {malData?.malInfo?.title_japanese && (
            <h2 className="text-xl font-display text-foreground/50 mb-6">{malData.malInfo.title_japanese}</h2>
          )}

          <div className="flex flex-wrap gap-2 mb-8">
            {(malData?.malInfo?.genres || detail.genreList)?.map((g: any) => (
              <span key={g.mal_id || g.genreId} className="px-3 py-1.5 bg-surface-soft/50 hover:bg-accent hover:text-white text-foreground/70 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors border border-surface-soft hover:border-accent cursor-pointer">
                {g.name || g.title}
              </span>
            ))}
          </div>

          {/* MAL Stats Grid */}
          {malData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-2 sm:gap-x-4 border-t-2 border-surface-soft pt-6 mt-auto">
              <div className="flex flex-col border-r-2 border-surface-soft pr-2 sm:pr-4">
                <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-widest bg-accent/10 inline-block px-2 py-0.5 mb-1 w-fit">SCORE</span>
                <div className="flex items-end gap-2 flex-wrap">
                  <span className="text-3xl font-display text-foreground leading-none">{malData.malInfo.score || 'N/A'}</span>
                  <span className="text-[10px] font-mono text-foreground/50 mb-1">{malData.malInfo.scored_by?.toLocaleString()} users</span>
                </div>
              </div>
              <div className="flex flex-col md:border-r-2 md:border-surface-soft pl-2 sm:pl-4 md:px-4">
                <span className="text-[10px] font-mono text-foreground/70 font-bold uppercase tracking-widest mb-1">RANK</span>
                <span className="text-2xl font-display text-foreground leading-none">#{malData.malInfo.rank || '-'}</span>
              </div>
              <div className="flex flex-col border-r-2 border-surface-soft pr-2 sm:pr-4 md:px-4">
                <span className="text-[10px] font-mono text-foreground/70 font-bold uppercase tracking-widest mb-1">POPULARITY</span>
                <span className="text-2xl font-display text-foreground leading-none">#{malData.malInfo.popularity || '-'}</span>
              </div>
              <div className="flex flex-col pl-2 sm:pl-4">
                <span className="text-[10px] font-mono text-foreground/70 font-bold uppercase tracking-widest mb-1">MEMBERS</span>
                <span className="text-xl font-display text-foreground leading-none">{malData.malInfo.members?.toLocaleString() || '-'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 mb-8 border-b-2 border-surface-soft pb-4 scrollbar-thin scrollbar-thumb-surface-soft scrollbar-track-transparent snap-x">
        {tabs.map((tab) => {
          if (tab.id === 'pictures' && (!malData?.malInfo?.pictures || malData.malInfo.pictures.length === 0)) return null;
          if (tab.id === 'music' && (!malData?.malInfo?.opening_themes?.length && !malData?.malInfo?.ending_themes?.length)) return null;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap flex-shrink-0 snap-start px-4 sm:px-6 py-2 sm:py-3 font-mono text-[10px] sm:text-xs uppercase tracking-widest font-bold border-2 transition-all ${
                activeTab === tab.id
                  ? "bg-accent border-accent text-white shadow-[4px_4px_0px_rgba(255,59,59,0.5)] translate-y-[2px]"
                  : "bg-surface border-surface-soft text-foreground/70 hover:bg-surface-soft hover:text-white hover:border-foreground/30 shadow-[4px_4px_0px_rgba(46,78,78,0.5)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[400px]">
        {/* DETAILS TAB */}
        {activeTab === 'details' && (
          <div className="animate-fade-in-up flex flex-col md:flex-row gap-8">
            {/* Detailed Info Column */}
            <div className="w-full md:w-1/3">
              <div className="bg-surface border-2 border-surface-soft p-6 shadow-[4px_4px_0px_rgba(46,78,78,0.3)]">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-6 bg-accent"></div>
                  <h3 className="text-lg font-display uppercase tracking-widest text-foreground">INFORMATION</h3>
                </div>
                <div className="flex flex-col gap-3 font-mono text-xs">
                  {[
                    { label: "Type", value: malData?.malInfo?.type || detail.type },
                    { label: "Episodes", value: malData?.malInfo?.episodes || detail.episodeList?.length },
                    { label: "Status", value: malData?.malInfo?.status || detail.status },
                    { label: "Aired", value: malData?.malInfo?.aired?.string },
                    { label: "Premiered", value: malData?.malInfo?.season ? `${malData.malInfo.season} ${malData.malInfo.year}` : null },
                    { label: "Broadcast", value: malData?.malInfo?.broadcast?.string },
                    { label: "Producers", value: malData?.malInfo?.producers?.length > 0 ? malData.malInfo.producers.map((p: any) => p.name).join(', ') : null },
                    { label: "Studios", value: malData?.malInfo?.studios?.length > 0 ? malData.malInfo.studios.map((s: any) => s.name).join(', ') : detail.studios },
                    { label: "Source", value: malData?.malInfo?.source },
                    { label: "Demographic", value: malData?.malInfo?.demographics?.length > 0 ? malData.malInfo.demographics.map((d: any) => d.name).join(', ') : null },
                    { label: "Duration", value: malData?.malInfo?.duration },
                    { label: "Rating", value: malData?.malInfo?.rating }
                  ].map(info => {
                    if (!info.value || info.value === "Unknown" || info.value === "-" || info.value === "?" || info.value === "0" || info.value === 0) return null;
                    return (
                      <div key={info.label} className="flex flex-col border-b border-surface-soft/50 pb-2 last:border-0 last:pb-0">
                        <span className="text-foreground/50 mb-1">{info.label}:</span>
                        <span className="text-foreground">{info.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Synopsis & Themes Column */}
            <div className="w-full md:w-2/3 flex flex-col gap-8">
              {/* Synopsis Box */}
              <div className="bg-surface border-2 border-surface-soft p-6 md:p-8 shadow-[4px_4px_0px_rgba(46,78,78,0.3)]">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-6 bg-accent"></div>
                  <h3 className="text-2xl font-display uppercase tracking-widest text-foreground">SINOPSIS</h3>
                </div>
                <div className="text-foreground/80 font-mono text-sm leading-relaxed max-w-none prose prose-invert prose-p:mb-4">
                  {renderSynopsis()}
                </div>
              </div>
              
            </div>
          </div>
        )}

        {/* EPISODES TAB */}
        {activeTab === 'episodes' && (
          <div className="animate-fade-in-up">
            <div className="flex flex-wrap items-center gap-4 mb-8">
              
              {detail.batch && (
                <Link 
                  to={`/batch/${detail.batch.batchId}`} 
                  state={{ fromDetail: true }}
                  className="bg-accent hover:bg-accent-2 text-white font-mono text-xs font-bold uppercase tracking-widest px-4 py-3 border-2 border-accent transition-all shadow-[4px_4px_0px_rgba(255,59,59,0.3)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_rgba(255,59,59,0.5)] flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  DOWNLOAD BATCH
                </Link>
              )}
            </div>
            
            {detail.episodeList && detail.episodeList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {detail.episodeList.map((ep: any) => (
                  <Link 
                    key={ep.episodeId}
                    to={`/watch/${ep.episodeId}`}
                    state={{ fromDetail: true }}
                    className="group bg-surface border-2 border-surface-soft hover:border-accent p-4 transition-all flex flex-col relative overflow-hidden shadow-[4px_4px_0px_rgba(46,78,78,0.5)] hover:shadow-[6px_6px_0px_rgba(46,78,78,0.3)] hover:-translate-y-1"
                  >
                    <div className="absolute top-0 right-0 w-8 h-8 bg-surface-soft group-hover:bg-accent transition-colors flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-foreground group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    
                    <span className="text-accent font-display font-bold mb-2 text-xl group-hover:text-accent-2 transition-colors">
                      EPISODE {ep.eps}
                    </span>
                    <span className="text-foreground/80 font-mono text-xs line-clamp-2 uppercase">
                      {ep.title}
                    </span>
                    <div className="mt-4 pt-3 border-t border-surface-soft flex justify-between items-center">
                      <span className="text-foreground/50 text-[10px] font-mono tracking-widest uppercase">
                        {ep.date}
                      </span>
                      <span className="text-[10px] font-bold text-background bg-foreground/30 px-2 py-0.5 uppercase group-hover:bg-accent transition-colors">
                        PLAY
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-surface border-2 border-surface-soft border-dashed p-12 text-center text-foreground/50 font-mono uppercase tracking-widest">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                TIDAK ADA SINYAL. BELUM ADA EPISODE YANG TERSEDIA.
              </div>
            )}
          </div>
        )}

        {/* CHARACTERS TAB */}
        {activeTab === 'characters' && (
          <div className="animate-fade-in-up">
            
            {/* VA Language Dropdown */}
            {availableVaLanguages.length > 1 && (
              <div className="mb-6 flex justify-end relative z-20">
                <div className="flex items-center gap-3">
                  <span className="text-foreground/70 font-mono text-xs uppercase tracking-widest">DUB LANGUAGE:</span>
                  <div className="relative">
                    <button 
                      onClick={() => setIsVaDropdownOpen(!isVaDropdownOpen)}
                      className="flex items-center gap-2 bg-surface border-2 border-surface-soft hover:border-accent text-accent font-mono text-xs font-bold uppercase tracking-widest py-2 px-4 focus:outline-none transition-colors shadow-[4px_4px_0px_rgba(46,78,78,0.5)] cursor-pointer"
                    >
                      {vaLanguage}
                      <svg className={`fill-current h-4 w-4 transition-transform ${isVaDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </button>
                    
                    {isVaDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setIsVaDropdownOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-48 bg-surface border-2 border-surface-soft shadow-[4px_4px_0px_rgba(46,78,78,0.5)] z-20 py-1">
                          {availableVaLanguages.map((lang: string) => (
                            <button
                              key={lang}
                              onClick={() => {
                                setVaLanguage(lang);
                                setIsVaDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-surface-soft hover:text-accent transition-colors ${vaLanguage === lang ? 'bg-surface-soft text-accent border-l-2 border-accent' : 'text-foreground'}`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {malData?.characters && malData.characters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {malData.characters.map((char: any) => {
                  const displayVa = char.voice_actors?.find((va: any) => va.language === vaLanguage) || 
                                   (vaLanguage !== 'Japanese' ? null : char.voice_actors?.[0]);
                  
                  return (
                    <div key={char.character.mal_id} className="bg-surface border-2 border-surface-soft flex p-2 gap-3 group hover:border-accent transition-colors">
                      <img src={char.character.images.jpg.image_url} alt={char.character.name} className="w-12 h-16 object-cover bg-surface-soft flex-shrink-0" />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-foreground text-sm truncate">{char.character.name}</p>
                          <p className="font-mono text-[10px] text-foreground/50">{char.role}</p>
                        </div>
                        {displayVa && (
                          <div className="text-right">
                            <p className="font-mono text-[10px] text-foreground/50">{displayVa.language}</p>
                            <p className="font-bold text-foreground text-xs truncate">{displayVa.person.name}</p>
                          </div>
                        )}
                      </div>
                      {displayVa ? (
                        <img src={displayVa.person.images.jpg.image_url} alt={displayVa.person.name} className="w-12 h-16 object-cover bg-surface-soft flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-16 border-2 border-surface-soft border-dashed flex items-center justify-center bg-surface/50 flex-shrink-0">
                          <span className="text-[8px] text-foreground/30 font-mono text-center">NO VA</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-surface border-2 border-surface-soft border-dashed p-12 text-center text-foreground/50 font-mono uppercase tracking-widest">
                INFO KARAKTER BELUM TERSEDIA.
              </div>
            )}
          </div>
        )}

        {/* MUSIC & OST TAB */}
        {activeTab === 'music' && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Openings */}
              <div className="w-full md:w-1/2 bg-surface border-2 border-surface-soft p-6 md:p-8 shadow-[4px_4px_0px_rgba(46,78,78,0.3)]">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-6 bg-accent"></div>
                  <h3 className="text-xl font-display uppercase tracking-widest text-foreground">OPENING THEMES</h3>
                </div>
                {malData?.malInfo?.opening_themes?.length > 0 ? (
                  <div className="space-y-6">
                    {malData.malInfo.opening_themes.map((theme: any, idx: number) => (
                      <div key={idx} className="flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-accent font-bold">OP{idx + 1}</span>
                          <span className="font-mono text-xs text-foreground/80 line-clamp-1">{theme.text}</span>
                        </div>
                        <InlineYouTubePlayer query={theme.text} title={malData?.malInfo?.title || detail.title} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-xs text-foreground/50 uppercase">TIDAK ADA LAGU OPENING.</p>
                )}
              </div>

              {/* Endings */}
              <div className="w-full md:w-1/2 bg-surface border-2 border-surface-soft p-6 md:p-8 shadow-[4px_4px_0px_rgba(46,78,78,0.3)]">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-6 bg-accent"></div>
                  <h3 className="text-xl font-display uppercase tracking-widest text-foreground">ENDING THEMES</h3>
                </div>
                {malData?.malInfo?.ending_themes?.length > 0 ? (
                  <div className="space-y-6">
                    {malData.malInfo.ending_themes.map((theme: any, idx: number) => (
                      <div key={idx} className="flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-accent font-bold">ED{idx + 1}</span>
                          <span className="font-mono text-xs text-foreground/80 line-clamp-1">{theme.text}</span>
                        </div>
                        <InlineYouTubePlayer query={theme.text} title={malData?.malInfo?.title || detail.title} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-xs text-foreground/50 uppercase">TIDAK ADA LAGU ENDING.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div className="animate-fade-in-up">
            {malData?.malInfo?.trailer?.embed_url ? (
              <div className="aspect-video w-full max-w-4xl mx-auto border-4 border-surface-soft shadow-[8px_8px_0px_rgba(255,59,59,0.3)] bg-black">
                <iframe 
                  src={malData.malInfo.trailer.embed_url} 
                  title="Promo Video" 
                  className="w-full h-full"
                  allowFullScreen 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              </div>
            ) : (
              <div className="bg-surface border-2 border-surface-soft border-dashed p-12 text-center text-foreground/50 font-mono uppercase tracking-widest">
                VIDEO PROMO TIDAK TERSEDIA.
              </div>
            )}
          </div>
        )}

        {/* PICTURES TAB */}
        {activeTab === 'pictures' && malData?.malInfo?.pictures && (
          <div className="animate-fade-in-up">
            <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
              {malData.malInfo.pictures.map((pic: any, idx: number) => (
                <div key={idx} className="break-inside-avoid relative group border-2 border-surface-soft hover:border-accent transition-colors bg-surface overflow-hidden">
                  <img 
                    src={pic.large || pic.medium} 
                    alt={`Gallery Image ${idx + 1}`} 
                    className="w-full h-auto object-cover block group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => setSelectedPicture(pic.large || pic.medium)} 
                      className="bg-accent text-background px-4 py-2 font-display uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors cursor-pointer border-2 border-transparent hover:border-accent"
                    >
                      VIEW FULL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      </div>
      
      {/* FULLSCREEN PICTURE MODAL */}
      {selectedPicture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-fade-in" style={{ position: 'fixed' }} onClick={() => setSelectedPicture(null)}>
          <button 
            className="absolute top-6 right-6 text-white hover:text-accent transition-colors"
            onClick={() => setSelectedPicture(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img 
            src={selectedPicture} 
            alt="Fullscreen View" 
            className="max-w-full max-h-[90vh] object-contain border-4 border-surface shadow-[8px_8px_0px_rgba(255,59,59,0.5)]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
