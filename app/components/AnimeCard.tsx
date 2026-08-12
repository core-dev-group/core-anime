import { Link } from "react-router";

interface AnimeCardProps {
  anime: any;
  className?: string;
}

export function AnimeCard({ anime, className = "" }: AnimeCardProps) {
  // Try to use slug, sourceSlug, or id for linking
  const linkId = anime.slug || anime.sourceSlug || anime.id;
  
  // Format score nicely
  const displayScore = anime.score && anime.score !== "unknown" ? Number(anime.score).toFixed(1) : null;
  const hasType = anime.type && anime.type !== "unknown";
  const hasStatus = anime.status && anime.status !== "unknown";

  return (
    <Link 
      to={`/anime/${linkId}`}
      className={`group relative flex flex-col overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent ${className}`}
    >
      {/* Premium Hover Image Container */}
      <div className="relative w-full aspect-[3/4] overflow-hidden border-2 border-surface-soft bg-surface group-hover:border-accent transition-colors duration-300">
        <img 
          src={anime.thumbnail || anime.image || anime.poster} 
          alt={anime.title} 
          className="w-full h-full object-cover grayscale mix-blend-hard-light opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
          loading="lazy"
        />
        
        {/* CRT Scanline overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 crt-scanline transition-opacity duration-300"></div>
        
        {/* Channel Tuner Episode Number */}
        {anime.episode && (
          <div className="absolute top-0 right-0 bg-accent text-background px-2 py-1 z-10 border-b-2 border-l-2 border-accent">
            <span className="font-mono text-sm font-bold tracking-tighter">EP.{String(anime.episode).padStart(3, '0')}</span>
          </div>
        )}

        {/* Top-Left Type Badge */}
        {hasType && (
          <div className="absolute top-2 left-2 bg-surface-soft/90 px-1.5 py-0.5 border border-surface-soft z-10">
            <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-widest">{anime.type}</span>
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/50 z-20">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-2 border-accent flex items-center justify-center bg-accent/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            </div>
            {/* Timecode placeholder */}
            <span className="font-mono text-xs text-accent bg-background px-1 border border-accent">24:10</span>
          </div>
        </div>

        {/* Bottom Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent pointer-events-none z-10"></div>

        {/* Title & Status container */}
        <div className="absolute inset-x-0 bottom-0 p-3 z-20 flex flex-col justify-end">
          <h3 className="font-display tracking-wide text-white text-sm md:text-base line-clamp-2 group-hover:text-accent transition-colors duration-300 leading-tight uppercase drop-shadow-md">
            {anime.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {hasStatus && (
              <span className="text-[10px] text-accent font-mono font-bold uppercase border-b border-accent">
                {anime.status.replace('-', ' ')}
              </span>
            )}
            
            {displayScore && (
              <div className="flex items-center gap-1 text-[10px] text-accent-2 font-mono font-bold ml-auto border-b border-accent-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {displayScore}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
