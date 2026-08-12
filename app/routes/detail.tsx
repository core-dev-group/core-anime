import { sankaApi } from "~/lib/sankaClient";
import { Link, data, useNavigate } from "react-router";
import type { Route } from "./+types/detail";
import { useBookmarks } from "~/hooks/useBookmarks";

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params.id;
  if (!slug) throw data("Missing slug", { status: 400 });

  const detailResponse = await sankaApi.getAnimeDetail(slug);
  return { detail: detailResponse };
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
  const { detail } = loaderData;
  const { toggleBookmark, isBookmarked, isLoaded } = useBookmarks();
  const navigate = useNavigate();

  // Render synopsis from paragraphs if available
  const renderSynopsis = () => {
    if (detail.synopsis?.paragraphs) {
      return detail.synopsis.paragraphs.map((p: string, i: number) => (
        <p key={i} className="mb-4">{p}</p>
      ));
    }
    return <p>{detail.synopsis || "SINOPSIS TIDAK TERSEDIA."}</p>;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in-up mt-16 md:mt-20">
      
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

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 relative z-10">
        
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

        {/* Right Column: Info */}
        <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-foreground pr-4 uppercase leading-none tracking-wide drop-shadow-md">
              {detail.title}
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
          
          <div className="flex flex-wrap gap-3 font-mono text-xs font-bold tracking-widest mt-2 mb-6">
            {detail.status && (
              <span className="bg-surface text-accent px-3 py-1.5 border-2 border-surface-soft uppercase shadow-[2px_2px_0px_rgba(46,78,78,0.5)]">
                STATUS: {detail.status}
              </span>
            )}
            {detail.type && (
              <span className="bg-surface text-accent-2 px-3 py-1.5 border-2 border-surface-soft uppercase shadow-[2px_2px_0px_rgba(46,78,78,0.5)]">
                TYPE: {detail.type}
              </span>
            )}
            {detail.studios && (
              <span className="bg-surface text-foreground/80 px-3 py-1.5 border-2 border-surface-soft uppercase shadow-[2px_2px_0px_rgba(46,78,78,0.5)]">
                STUDIO: {detail.studios}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {detail.genreList?.map((g: any) => (
              <span key={g.genreId} className="px-3 py-1.5 bg-surface-soft/50 hover:bg-accent hover:text-white text-foreground/70 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors border border-surface-soft hover:border-accent cursor-pointer">
                {g.title}
              </span>
            ))}
          </div>

          <div className="mb-8 flex-grow bg-surface border-2 border-surface-soft p-6 relative">
            <div className="absolute -top-3 left-4 bg-background px-2">
              <h3 className="text-lg font-display uppercase tracking-widest text-foreground">
                SINOPSIS
              </h3>
            </div>
            <div className="text-foreground/80 font-mono text-sm leading-relaxed pt-2">
              {renderSynopsis()}
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="mt-16 mb-20 relative">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="h-8 w-2 bg-accent hidden sm:block"></div>
          <h2 className="text-3xl font-display text-foreground uppercase tracking-widest">
            DAFTAR EPISODE
          </h2>
          
          {detail.batch && (
            <Link 
              to={`/batch/${detail.batch.batchId}`} 
              state={{ fromDetail: true }}
              className="ml-auto sm:ml-4 bg-accent hover:bg-accent-2 text-white font-mono text-xs font-bold uppercase tracking-widest px-4 py-2 border-2 border-accent transition-all shadow-[4px_4px_0px_rgba(255,59,59,0.3)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_rgba(255,59,59,0.5)] flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              DOWNLOAD BATCH
            </Link>
          )}
          
          <div className="h-0.5 flex-grow bg-surface-soft hidden sm:block ml-4"></div>
        </div>
        
        {detail.episodeList && detail.episodeList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {detail.episodeList.map((ep: any) => (
              <Link 
                key={ep.episodeId}
                to={`/watch/${ep.episodeId}`}
                state={{ fromDetail: true }}
                className="group bg-surface border-2 border-surface-soft hover:border-accent p-4 transition-all flex flex-col relative overflow-hidden shadow-[4px_4px_0px_rgba(46,78,78,0.5)] hover:shadow-[6px_6px_0px_rgba(255,59,59,0.3)] hover:-translate-y-1"
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
    </div>
  );
}

