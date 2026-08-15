import { Link } from "react-router";
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "~/lib/firebase";

interface SidebarProps {
  topAnime: any[];
  topDonators?: any[]; // Dynamic donators from local DB
}

// Common Genres for Anime
const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", 
  "Isekai", "Magic", "Mecha", "Mystery", "Romance", 
  "Sci-Fi", "Slice of Life", "Sports", "Supernatural"
];

export function Sidebar({ topAnime, topDonators = [] }: SidebarProps) {
  const displayDonators = topDonators;

  const [topWatchers, setTopWatchers] = useState<any[]>([]);
  const [topHours, setTopHours] = useState<any[]>([]);

  useEffect(() => {
    // Real-time listener for Top Watchers (by Episodes)
    const epsQuery = query(collection(db, "users"), orderBy("totalEpisodesWatched", "desc"), limit(5));
    const unsubEps = onSnapshot(epsQuery, (snap) => {
      if (!snap.empty) {
        const data = snap.docs.map((d, i) => ({
          name: d.data().displayName || "Unknown",
          photoURL: d.data().photoURL || null,
          eps: d.data().totalEpisodesWatched || 0,
          rank: i + 1
        })).filter(u => u.eps > 0);
        setTopWatchers(data);
      } else {
        setTopWatchers([]);
      }
    });

    // Real-time listener for Top Watchers (by Time)
    const hoursQuery = query(collection(db, "users"), orderBy("totalWatchTimeSeconds", "desc"), limit(3));
    const unsubHours = onSnapshot(hoursQuery, (snap) => {
      if (!snap.empty) {
        const data = snap.docs.map((d, i) => ({
          name: d.data().displayName || "Unknown",
          photoURL: d.data().photoURL || null,
          hours: (d.data().totalWatchTimeSeconds / 3600).toFixed(1), // Convert seconds to hours
          rank: i + 1
        })).filter(u => parseFloat(u.hours) > 0);
        setTopHours(data);
      } else {
        setTopHours([]);
      }
    });

    return () => {
      unsubEps();
      unsubHours();
    };
  }, []);

  return (
    <aside className="w-full flex flex-col gap-8">
      {/* Top Anime Section */}
      <div className="bg-surface border-2 border-surface-soft p-5 relative">
        <div className="absolute -top-3 left-4 bg-background px-2 flex items-center gap-2">
          <h3 className="text-xl font-display uppercase tracking-widest text-foreground">
            Top Anime
          </h3>
        </div>
        
        <div className="flex items-center justify-end mb-5 border-b-2 border-surface-soft pb-2 pt-2">
          <span className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest">Bulan Ini</span>
        </div>
        
        <div className="flex flex-col gap-3">
          {topAnime.slice(0, 7).map((anime, index) => {
            const linkId = anime.slug || anime.sourceSlug || anime.id;
            
            return (
              <Link 
                key={linkId || index} 
                to={`/anime/${linkId}`}
                className="group flex gap-4 items-center p-2 bg-surface-soft/10 border border-transparent hover:border-accent hover:bg-surface-soft/30 transition-colors"
              >
                <div className="relative w-12 h-16 shrink-0 border border-surface-soft overflow-hidden">
                  <img 
                    src={anime.thumbnail || anime.image || anime.poster} 
                    alt={anime.title}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 crt-scanline pointer-events-none"></div>
                  <div className="absolute top-0 left-0 bg-accent text-background text-[10px] font-mono font-bold px-1 border-b border-r border-accent">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 h-full">
                  <h4 className="font-display uppercase tracking-wide text-sm text-foreground/90 group-hover:text-accent transition-colors line-clamp-2 leading-tight">
                    {anime.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-auto text-[10px] font-mono text-foreground/50">
                    {anime.type && anime.type !== "unknown" && <span className="uppercase text-foreground">{anime.type}</span>}
                    {anime.type && anime.type !== "unknown" && anime.status && anime.status !== "unknown" && <span>/</span>}
                    {anime.status && anime.status !== "unknown" && <span className="uppercase">{anime.status.replace('-', ' ')}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Genres Section */}
      <div className="bg-surface border-2 border-surface-soft p-5 relative">
        <div className="absolute -top-3 left-4 bg-background px-2">
          <h3 className="text-xl font-display uppercase tracking-widest text-foreground">
            Genre
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-4">
          {GENRES.map((genre) => {
            const genreSlug = genre.toLowerCase().replace(/ /g, '-');
            return (
              <Link 
                key={genre}
                to={`/genre/${genreSlug}`}
                className="text-[10px] font-mono font-bold uppercase text-foreground/70 bg-surface-soft/20 hover:bg-accent hover:text-background px-3 py-1.5 transition-colors border-2 border-surface-soft hover:border-accent"
              >
                {genre}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Leaderboard: Top Watchers */}
      <div className="bg-surface border-2 border-surface-soft p-5 relative mt-4 shadow-[4px_4px_0px_rgba(46,78,78,0.5)]">
        <div className="absolute -top-3 left-4 bg-background px-2 flex items-center gap-2">
          <h3 className="text-xl font-display uppercase tracking-widest text-foreground">
            LEADERBOARD
          </h3>
        </div>
        
        <div className="flex items-center justify-between mb-4 border-b-2 border-surface-soft pb-2 pt-2">
          <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest">Paling Sering Menonton</span>
          <span className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest">ALL TIME</span>
        </div>
        
        <div className="flex flex-col gap-2.5">
          {topWatchers.length > 0 ? (
            topWatchers.map((user, i) => {
              const isFirst = i === 0;
              const isSecond = i === 1;
              const isThird = i === 2;

              let rankBadge = 'bg-surface border-surface-soft text-foreground/60';
              if (isFirst) rankBadge = 'bg-yellow-400 text-black border-yellow-300 font-black';
              else if (isSecond) rankBadge = 'bg-slate-200 text-black border-slate-100 font-black';
              else if (isThird) rankBadge = 'bg-amber-600 text-white border-amber-500 font-black';

              return (
                <div
                  key={user.name + i}
                  className={`flex items-center justify-between p-2 border bg-background group transition-all ${
                    isFirst
                      ? 'border-yellow-400/80 shadow-[2px_2px_0px_rgba(234,179,8,0.4)]'
                      : 'border-surface-soft hover:border-accent shadow-[2px_2px_0px_rgba(0,0,0,0.4)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Retro Avatar Frame with Rank Number */}
                    <div className="relative shrink-0">
                      <div className={`w-9 h-9 border bg-surface overflow-hidden flex items-center justify-center ${
                        isFirst ? 'border-yellow-400' : 'border-surface-soft group-hover:border-accent'
                      }`}>
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-surface-soft flex items-center justify-center font-display text-sm text-foreground/60">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -left-1 w-4 h-4 flex items-center justify-center text-[9px] font-mono border ${rankBadge}`}>
                        {user.rank}
                      </div>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-mono font-bold text-xs tracking-wider text-foreground group-hover:text-accent transition-colors truncate max-w-[100px] sm:max-w-[120px]">
                        {user.name}
                      </span>
                      <span className="text-[9px] font-mono text-foreground/50">
                        Top #{user.rank} Watcher
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-display text-base text-accent-2">{user.eps}</span>
                    <span className="text-[9px] font-mono text-foreground/50 block -mt-1 uppercase">EPS</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-foreground/50 text-center py-2 text-[10px] uppercase tracking-widest border-2 border-dashed border-surface-soft font-mono">
              Belum ada data. Jadilah yang pertama!
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-3 border-b-2 border-surface-soft pb-2 pt-6">
          <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest">Durasi Terbanyak</span>
          <span className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest">ALL TIME</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {topHours.length > 0 ? (
            topHours.map((user, i) => {
              const isFirst = i === 0;
              const isSecond = i === 1;
              const isThird = i === 2;

              let rankBadge = 'bg-surface border-surface-soft text-foreground/60';
              if (isFirst) rankBadge = 'bg-yellow-400 text-black border-yellow-300 font-black';
              else if (isSecond) rankBadge = 'bg-slate-200 text-black border-slate-100 font-black';
              else if (isThird) rankBadge = 'bg-amber-600 text-white border-amber-500 font-black';

              return (
                <div
                  key={user.name + i}
                  className={`flex items-center justify-between p-2 border bg-background group transition-all ${
                    isFirst
                      ? 'border-yellow-400/80 shadow-[2px_2px_0px_rgba(234,179,8,0.4)]'
                      : 'border-surface-soft hover:border-accent shadow-[2px_2px_0px_rgba(0,0,0,0.4)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Retro Avatar Frame with Rank Number */}
                    <div className="relative shrink-0">
                      <div className={`w-9 h-9 border bg-surface overflow-hidden flex items-center justify-center ${
                        isFirst ? 'border-yellow-400' : 'border-surface-soft group-hover:border-accent'
                      }`}>
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-surface-soft flex items-center justify-center font-display text-sm text-foreground/60">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -left-1 w-4 h-4 flex items-center justify-center text-[9px] font-mono border ${rankBadge}`}>
                        {user.rank}
                      </div>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-mono font-bold text-xs tracking-wider text-foreground group-hover:text-accent transition-colors truncate max-w-[100px] sm:max-w-[120px]">
                        {user.name}
                      </span>
                      <span className="text-[9px] font-mono text-foreground/50">
                        Top #{user.rank} Streamer
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-display text-base text-foreground/90">{user.hours}</span>
                    <span className="text-[9px] font-mono text-foreground/50 block -mt-1 uppercase">JAM</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-foreground/50 text-center py-2 text-[10px] uppercase tracking-widest border-2 border-dashed border-surface-soft font-mono">
              Belum ada data. Teruslah menonton!
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard: Top Donators */}
      <div className="bg-surface border-2 border-surface-soft p-5 relative mt-4 shadow-[4px_4px_0px_rgba(46,78,78,0.5)]">
        <div className="absolute -top-3 left-4 bg-background px-2 flex items-center gap-2">
          <h3 className="text-xl font-display uppercase tracking-widest text-accent flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            TOP DONATOR
          </h3>
        </div>
        
        <div className="flex flex-col gap-4 pt-4">
          <p className="text-[10px] font-mono text-foreground/50 mb-2">
            {topDonators.length > 0 ? '*Daftar Top Donator' : '*Belum ada donasi. Jadilah yang pertama!'}
          </p>
          {displayDonators.map((donator, idx) => {
            const isRank1 = idx === 0;
            const tierColors = {
              DIAMOND: 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
              PLATINUM: 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]',
              GOLD: 'bg-yellow-500/20 text-yellow-300 border-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.4)]',
              SILVER: 'bg-slate-400/20 text-slate-200 border-slate-300',
              BRONZE: 'bg-amber-800/20 text-amber-500 border-amber-700'
            };

            const rankBadgeColors = [
              'bg-yellow-400 text-black border-yellow-300 font-black',
              'bg-slate-200 text-black border-slate-100 font-black',
              'bg-amber-600 text-white border-amber-500 font-black'
            ];

            return (
              <div
                key={donator.name}
                className={`flex flex-col border-2 p-3 bg-background group transition-all relative ${
                  isRank1
                    ? 'border-yellow-400 shadow-[4px_4px_0px_rgba(234,179,8,0.5)]'
                    : 'border-surface-soft hover:border-accent shadow-[3px_3px_0px_rgba(46,78,78,0.4)]'
                }`}
              >
                {isRank1 && (
                  <div className="absolute -top-2.5 right-2 bg-yellow-400 text-black text-[9px] font-mono font-black uppercase px-2 py-0.5 border border-yellow-300 tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,0.8)]">
                    ★ TOP SUPPORTER ★
                  </div>
                )}

                <div className="flex items-center gap-3 mb-2.5">
                  {/* Big Retro Avatar Frame */}
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 border-2 bg-surface overflow-hidden flex items-center justify-center ${
                      isRank1
                        ? 'border-yellow-400 shadow-[2px_2px_0px_rgba(234,179,8,0.6)]'
                        : 'border-surface-soft group-hover:border-accent shadow-[2px_2px_0px_rgba(0,0,0,0.6)]'
                    }`}>
                      {donator.photoURL ? (
                        <img
                          src={donator.photoURL}
                          alt={donator.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-surface-soft to-surface flex items-center justify-center font-display text-lg text-foreground/70">
                          {donator.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Rank Number Badge */}
                    <div className={`absolute -bottom-1.5 -left-1.5 w-5 h-5 flex items-center justify-center text-[10px] font-mono border ${
                      rankBadgeColors[idx] || 'bg-surface border-surface-soft text-foreground/70'
                    }`}>
                      {idx + 1}
                    </div>
                  </div>

                  {/* Name + Tier + Amount */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-mono font-bold text-xs tracking-wider text-foreground group-hover:text-accent transition-colors truncate">
                        {donator.name}
                      </span>
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 border shrink-0 ${
                        tierColors[donator.tier as keyof typeof tierColors] || tierColors.BRONZE
                      }`}>
                        {donator.tier}
                      </span>
                    </div>

                    <span className="font-display text-lg tracking-wide text-foreground/95 leading-none">
                      {donator.amount_formatted}
                    </span>
                  </div>
                </div>

                {/* Message Speech Bubble */}
                {donator.message && (
                  <div className="bg-surface/80 border-l-2 border-accent px-2 py-1 mt-1 text-[11px] font-mono text-foreground/80 italic break-words">
                    "{donator.message}"
                  </div>
                )}
              </div>
            );
          })}
          
          <Link 
            to="/donate"
            className="mt-2 block text-center w-full py-2 bg-accent/10 border border-accent hover:bg-accent hover:text-white text-accent font-mono font-bold text-xs tracking-widest uppercase transition-all shadow-[2px_2px_0px_rgba(255,59,59,0.5)]"
          >
            DUKUNG KAMI (DONASI)
          </Link>
        </div>
      </div>
    </aside>
  );
}
