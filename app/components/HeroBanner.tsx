import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useBookmarks } from "~/hooks/useBookmarks";

interface HeroBannerProps {
  items: any[];
}

export function HeroBanner({ items }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toggleBookmark, isBookmarked, isLoaded } = useBookmarks();

  // Auto slide effect
  useEffect(() => {
    if (!items || items.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return null;

  const currentAnime = items[currentIndex];
  const linkId = currentAnime.slug || currentAnime.sourceSlug || currentAnime.id;
  const displayScore = currentAnime.score && currentAnime.score !== "unknown" ? Number(currentAnime.score).toFixed(1) : null;
  const getImageUrl = (anime: any) => anime.thumbnail || anime.image || anime.poster || "https://placehold.co/800x1200/111111/ff3b3b?text=CORE+ANIME&font=mono";

  return (
    <div className="relative w-full h-[52vh] sm:h-[65vh] md:h-[80vh] mt-0 mb-6 md:mb-10 overflow-hidden group rounded-b-sm border-b border-surface-soft shadow-xl">
      {/* Background Images with Crossfade */}
      {items.map((anime, index) => (
        <div
          key={anime.slug || index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out crt-scanline ${
            index === currentIndex ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
          }`}
        >
          <img
            src={getImageUrl(anime)}
            alt={anime.title}
            className="w-full h-full object-cover object-top opacity-80 md:opacity-50"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('placehold.co')) {
                target.src = "https://placehold.co/800x1200/111111/ff3b3b?text=CORE+ANIME&font=mono";
              }
            }}
          />
          {/* Deep cinematic gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 md:via-background/80 to-background/20 md:to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 md:from-background via-background/60 md:via-background/60 to-transparent"></div>
        </div>
      ))}

      {/* Content Area */}
      <div className="absolute inset-0 flex items-center z-20">
        <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full">

            {/* Left Content (Text) */}
            <div className="flex-1 max-w-3xl transform transition-all duration-700 translate-y-0 opacity-100" key={currentIndex}>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2 sm:mb-4 animate-fade-in-up">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-0.5 sm:py-1 bg-accent text-background text-[10px] sm:text-xs font-black tracking-widest border border-accent shadow-[0_0_10px_rgba(255,59,59,0.5)] animate-on-air">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-background"></div>
                  ON AIR
                </div>
                {currentAnime.type && currentAnime.type !== "unknown" && (
                  <span className="text-foreground/80 text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-surface/80 px-2 py-0.5 sm:py-1 border border-surface-soft">
                    {currentAnime.type}
                  </span>
                )}
                {displayScore && (
                  <div className="flex items-center gap-1 sm:gap-1.5 border border-accent-2/30 px-2 py-0.5 sm:py-1 bg-surface/80">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-accent-2 font-mono font-bold text-[10px] sm:text-xs">{displayScore}</span>
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display text-foreground mb-2 sm:mb-4 md:mb-6 leading-tight md:leading-none tracking-normal uppercase drop-shadow-xl line-clamp-2 sm:line-clamp-3 animate-fade-in-up animation-delay-100">
                {currentAnime.title}
              </h1>

              <p className="text-foreground/80 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 md:mb-8 max-w-2xl line-clamp-2 md:line-clamp-3 animate-fade-in-up animation-delay-200 hidden sm:block">
                {currentAnime.synopsis || "Streaming episode terbaru dari serial epik ini dengan subtitle bahasa Indonesia. Nikmati pengalaman menonton terbaik tanpa gangguan."}
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 animate-fade-in-up animation-delay-300">
                <Link
                  to={`/anime/${linkId}`}
                  className="inline-flex items-center gap-2 sm:gap-3 bg-accent hover:bg-white text-background px-5 py-2.5 sm:px-8 sm:py-3.5 md:py-4 rounded-none font-display text-base sm:text-xl transition-all duration-300 shadow-[3px_3px_0px_rgba(255,201,60,0.4)] hover:translate-y-1 hover:shadow-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  TUNE IN
                </Link>
                {isLoaded && (
                  <button
                    onClick={() => toggleBookmark(currentAnime)}
                    className={`inline-flex items-center gap-1.5 sm:gap-2 border border-surface-soft px-4 py-2.5 sm:px-6 sm:py-3.5 md:py-4 rounded-none font-mono font-bold text-xs sm:text-sm transition-all duration-300 shadow-[3px_3px_0px_rgba(46,78,78,0.5)] ${
                      isBookmarked(linkId)
                        ? "bg-accent hover:bg-accent/80 text-background"
                        : "bg-surface hover:bg-surface-soft text-foreground"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill={isBookmarked(linkId) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {isBookmarked(linkId) ? "BOOKMARKED" : "BOOKMARK"}
                  </button>
                )}
              </div>
            </div>

            {/* Right Content (Floating Poster Card - only visible on large screens) */}
            <div className="hidden lg:block w-[300px] shrink-0 animate-fade-in-up animation-delay-200" key={`poster-${currentIndex}`}>
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden shadow-[10px_10px_0px_rgba(46,78,78,0.5)] border-2 border-surface-soft transition-colors duration-500">
                <img 
                  src={getImageUrl(currentAnime)} 
                  alt={currentAnime.title}
                  className="w-full h-full object-cover opacity-80"
                  onError={(e) => { e.currentTarget.src = "https://placehold.co/800x1200/111111/ff3b3b?text=CORE+ANIME&font=mono"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  {currentAnime.status && currentAnime.status !== "unknown" && (
                    <span className="inline-block px-2 py-1 bg-surface-soft/80 text-foreground text-xs font-mono font-bold uppercase tracking-widest border border-surface-soft">
                      {currentAnime.status.replace('-', ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Carousel Indicators - Tuner Style */}
      {items.length > 1 && (
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-none ${
                idx === currentIndex 
                  ? "w-8 h-2 bg-accent shadow-[0_0_8px_rgba(255,59,59,0.8)]" 
                  : "w-4 h-2 bg-surface-soft hover:bg-foreground/50 border border-surface"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
