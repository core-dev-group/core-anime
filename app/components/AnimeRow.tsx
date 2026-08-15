import { useRef } from "react";
import { Link } from "react-router";
import { AnimeCard } from "./AnimeCard";

interface AnimeRowProps {
  title: string;
  items: any[];
  viewAllLink?: string;
}

export function AnimeRow({ title, items, viewAllLink }: AnimeRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -600, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 600, behavior: "smooth" });
    }
  };

  return (
    <div className="mb-6 md:mb-12 relative group/section">
      <div className="flex items-center justify-between mb-3 md:mb-4 px-4 md:px-8">
        <div className="flex items-center gap-3 md:gap-4">
          <h2 className="text-base sm:text-xl md:text-2xl font-display uppercase tracking-widest text-foreground pl-2.5 md:pl-4 border-l-4 border-accent">
            {title}
          </h2>
        </div>

        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-[9px] sm:text-xs font-mono font-bold text-foreground/70 hover:text-accent transition-colors border border-surface-soft hover:border-accent px-2 py-0.5 sm:py-1 bg-surface shrink-0 flex items-center gap-1 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]"
          >
            LIHAT SEMUA &raquo;
          </Link>
        )}

        {/* Navigation Buttons (Desktop Only, Visible on Hover) */}
        <div className="hidden md:flex gap-2 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300">
          <button
            onClick={scrollLeft}
            className="w-8 h-8 flex items-center justify-center border-2 border-surface-soft bg-surface hover:border-accent hover:bg-accent/20 hover:text-accent transition-colors"
            aria-label="Scroll Left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={scrollRight}
            className="w-8 h-8 flex items-center justify-center border-2 border-surface-soft bg-surface hover:border-accent hover:bg-accent/20 hover:text-accent transition-colors"
            aria-label="Scroll Right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 pb-4 sm:pb-6 pt-1 sm:pt-2 px-4 md:px-8 hide-scrollbar scroll-smooth"
        >
          {items.map((anime, index) => (
            <div key={anime.slug || anime.id || index} className="snap-start shrink-0 w-[125px] sm:w-[155px] md:w-[180px] lg:w-[220px]">
              <AnimeCard anime={anime} />
            </div>
          ))}
        </div>

        {/* Gradient fades on edges */}
        <div className="absolute top-0 bottom-0 left-0 w-6 md:w-8 bg-gradient-to-r from-background via-background/40 to-transparent pointer-events-none z-10 opacity-70 md:opacity-100"></div>
        <div className="absolute top-0 bottom-0 right-0 w-6 md:w-8 bg-gradient-to-l from-background via-background/40 to-transparent pointer-events-none z-10 opacity-70 md:opacity-100"></div>
      </div>
    </div>
  );
}
