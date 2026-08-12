import { AnimeCard } from "./AnimeCard";
import { useBookmarks } from "~/hooks/useBookmarks";

export function BookmarksRow() {
  const { bookmarks, isLoaded } = useBookmarks();

  if (!isLoaded || bookmarks.length === 0) return null;

  return (
    <div id="bookmark-section" className="mb-10 w-full animate-fade-in-up scroll-mt-24">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="w-1.5 h-6 bg-accent"></div>
        <h2 className="text-xl md:text-2xl font-display uppercase tracking-widest text-foreground">
          BOOKMARK SAYA
        </h2>
      </div>
      
      {/* Scrollable Container */}
      <div className="flex overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide snap-x gap-4 md:gap-6">
        {bookmarks.map((anime) => (
          <div key={anime.id || anime.slug} className="w-[140px] md:w-[180px] lg:w-[200px] flex-shrink-0 snap-start">
            <AnimeCard anime={anime} />
          </div>
        ))}
      </div>
    </div>
  );
}
