"use client";

import { Link } from "react-router";
import { useWatchHistory } from "~/hooks/useWatchHistory";

interface ContinueWatchingProps {
  fallbackItems?: any[];
}

export function ContinueWatchingRow({ fallbackItems = [] }: ContinueWatchingProps) {
  const { history, isLoaded } = useWatchHistory();

  // Mencegah hydration mismatch dengan tidak render sampai di-load di client
  if (!isLoaded) return null;

  // Hanya gunakan history asli, jika kosong jangan tampilkan apa-apa
  const itemsToRender = history;

  if (!itemsToRender || itemsToRender.length === 0) return null;

  return (
    <div className="mb-14 relative group/section">
      <div className="flex items-center justify-between mb-4 px-4 md:px-8">
        <h2 className="text-xl md:text-2xl font-display uppercase tracking-widest text-foreground flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Lanjutkan Menonton
        </h2>
      </div>
      
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 pt-2 px-4 md:px-8 hide-scrollbar">
        {itemsToRender.map((anime, index) => {
          // Normalisasi antara format history asli vs format fallback API
          const linkId = anime.animeId || anime.slug || anime.sourceSlug || anime.id || index;
          const progress = typeof anime.progress === 'number' ? anime.progress : 0;
          
          return (
            <Link 
              key={linkId} 
              to={anime.episodeId ? `/watch/${anime.episodeId}` : `/anime/${linkId}`}
              className="group snap-start shrink-0 w-[240px] md:w-[280px] flex flex-col focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <div className="relative w-full aspect-video overflow-hidden bg-surface-soft border-2 border-surface-soft group-hover:border-accent transition-colors">
                {anime.thumbnail || anime.image || anime.poster ? (
                  <img 
                    src={anime.thumbnail || anime.image || anime.poster} 
                    alt={anime.title}
                    className="w-full h-full object-cover grayscale mix-blend-hard-light group-hover:grayscale-0 transition-all duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-background/50 text-accent/30 font-display text-2xl uppercase tracking-widest">
                    NO IMAGE
                  </div>
                )}
                
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 crt-scanline pointer-events-none"></div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/50 z-20">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 border-2 border-accent flex items-center justify-center bg-accent/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-3 px-1">
                <h3 className="font-display tracking-wide uppercase text-foreground/90 text-sm md:text-base line-clamp-1 group-hover:text-accent transition-colors leading-tight">
                  {anime.title}
                </h3>
                <p className="text-xs font-mono text-foreground/50 mt-1 flex items-center gap-2">
                  <span className="text-foreground/80 font-bold">EP.{String(anime.episodeNum || anime.episode || 1).padStart(3, '0')}</span>
                  <span>/</span>
                  <span className="uppercase">Terakhir Ditonton</span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
