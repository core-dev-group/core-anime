import { Link } from "react-router";
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "~/lib/firebase.client";

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
  // If we don't have dynamic donators yet, show an empty state or dummy fallback
  const displayDonators = topDonators.length > 0 ? topDonators : [
    { name: "SULTAN_ANIME", amount_formatted: "Rp 5.000.000", message: "Maju terus webnya min!", tier: "DIAMOND" },
    { name: "HIKIKOMORI_RICH", amount_formatted: "Rp 2.500.000", message: "Buat beli kopi server", tier: "PLATINUM" },
    { name: "ANON_1928", amount_formatted: "Rp 1.000.000", message: "Semangat updatenya", tier: "GOLD" },
  ];

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
        
        <div className="flex flex-col gap-3 font-mono text-xs">
          {topWatchers.length > 0 ? (
            topWatchers.map((user) => (
              <div key={user.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 flex items-center justify-center font-bold shrink-0 ${user.rank === 1 ? 'bg-accent text-background border border-accent shadow-[0_0_5px_rgba(255,59,59,0.8)]' : user.rank <= 3 ? 'bg-surface-soft text-foreground' : 'text-foreground/50'}`}>
                    {user.rank}
                  </span>
                  
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-surface-soft shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-surface-soft flex items-center justify-center text-[10px] font-bold text-foreground/50 shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <span className={`font-bold tracking-wider ${user.rank <= 3 ? 'text-foreground' : 'text-foreground/70'} group-hover:text-accent transition-colors truncate max-w-[90px] md:max-w-[100px]`}>{user.name}</span>
                </div>
                <span className="text-foreground/50">{user.eps} <span className="text-[9px]">ANIME</span></span>
              </div>
            ))
          ) : (
            <div className="text-foreground/50 text-center py-2 text-[10px] uppercase tracking-widest border-2 border-dashed border-surface-soft">
              Belum ada data. Jadilah yang pertama!
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4 border-b-2 border-surface-soft pb-2 pt-6">
          <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest">Durasi Terbanyak</span>
          <span className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest">ALL TIME</span>
        </div>
        
        <div className="flex flex-col gap-3 font-mono text-xs">
          {topHours.length > 0 ? (
            topHours.map((user) => (
              <div key={user.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 flex items-center justify-center font-bold shrink-0 ${user.rank === 1 ? 'bg-accent text-background border border-accent shadow-[0_0_5px_rgba(255,59,59,0.8)]' : 'bg-surface-soft text-foreground'}`}>
                    {user.rank}
                  </span>
                  
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-surface-soft shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-surface-soft flex items-center justify-center text-[10px] font-bold text-foreground/50 shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <span className="font-bold tracking-wider text-foreground group-hover:text-accent transition-colors truncate max-w-[90px] md:max-w-[100px]">{user.name}</span>
                </div>
                <span className="text-foreground/50">{user.hours} <span className="text-[9px]">JAM</span></span>
              </div>
            ))
          ) : (
            <div className="text-foreground/50 text-center py-2 text-[10px] uppercase tracking-widest border-2 border-dashed border-surface-soft">
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
          {displayDonators.map((donator, idx) => (
            <div key={donator.name} className="flex flex-col border border-surface-soft p-3 bg-background group hover:border-accent transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono font-bold text-xs tracking-widest text-foreground group-hover:text-accent transition-colors">
                  {idx + 1}. {donator.name}
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 ${
                  donator.tier === 'DIAMOND' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500' :
                  donator.tier === 'PLATINUM' ? 'bg-purple-500/20 text-purple-400 border border-purple-500' :
                  donator.tier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500' :
                  donator.tier === 'SILVER' ? 'bg-slate-400/20 text-slate-300 border border-slate-400' :
                  'bg-orange-700/20 text-orange-600 border border-orange-700'
                }`}>
                  {donator.tier}
                </span>
              </div>
              <span className="font-display text-lg text-foreground/90">{donator.amount_formatted}</span>
              <p className="text-[10px] font-mono text-foreground/50 mt-1 italic border-l-2 border-surface-soft pl-2">
                "{donator.message}"
              </p>
            </div>
          ))}
          
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
