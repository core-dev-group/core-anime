import type { Route } from "./+types/bookmarks";
import { Link } from "react-router";
import { useBookmarks } from "~/hooks/useBookmarks";
import { AnimeCard } from "~/components/AnimeCard";

export function meta() {
  return [
    { title: "Bookmark Saya - CoreAnime" },
    { name: "description", content: "Daftar anime yang telah Anda simpan." },
  ];
}

export default function BookmarksPage() {
  const { bookmarks, isLoaded } = useBookmarks();

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 min-h-screen mt-16 md:mt-20">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-surface-soft pb-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/home" className="inline-block bg-surface text-foreground/70 hover:text-accent hover:border-accent transition-colors px-3 py-1 font-bold tracking-widest text-sm border-2 border-surface-soft">
              &laquo; KEMBALI KE BERANDA
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-foreground uppercase tracking-widest flex items-center gap-4">
            BOOKMARK <span className="text-accent">SAYA</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-surface border-2 border-surface-soft text-[10px] font-mono text-foreground/70">
          <span>{isLoaded ? bookmarks.length : 0} ANIME TERSIMPAN</span>
        </div>
      </div>

      {!isLoaded ? (
        <div className="w-full flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full"></div>
        </div>
      ) : bookmarks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-fade-in-up animation-delay-100">
          {bookmarks.map((anime) => (
            <AnimeCard key={anime.id || anime.slug} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center py-20 bg-surface border-2 border-surface-soft border-dashed animate-fade-in-up animation-delay-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-surface-soft mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h3 className="font-display text-xl uppercase tracking-widest text-foreground/70 mb-2">TIDAK ADA SINYAL</h3>
          <p className="font-mono text-sm text-foreground/50 uppercase tracking-widest text-center max-w-md">
            BELUM ADA BOOKMARK TERSIMPAN. SILAKAN CARI ANIME DAN KLIK TOMBOL BOOKMARK UNTUK MENYIMPAN.
          </p>
          <Link 
            to="/directory"
            className="mt-6 px-6 py-2 bg-accent text-white font-display uppercase tracking-widest text-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(255,255,255,0.3)] transition-all border-2 border-accent"
          >
            JELAJAHI ANIME
          </Link>
        </div>
      )}
    </div>
  );
}
