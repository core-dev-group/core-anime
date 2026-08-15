import { useState } from "react";
import { Link } from "react-router";

// Tipe data yang diharapkan dari getSchedule API
interface UnifiedScheduleDay {
  day: string;
  animeList: any[];
}

interface ReleaseScheduleProps {
  items: UnifiedScheduleDay[];
}

export function ReleaseSchedule({ items }: ReleaseScheduleProps) {
  // Ambil hari saat ini (0 = Minggu, 1 = Senin, ... 6 = Sabtu)
  const currentDayIndex = new Date().getDay();
  // Sesuaikan ke format (0 = Senin, ..., 6 = Minggu)
  const today = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
  
  const [activeDay, setActiveDay] = useState(today);

  // Jika items dari API berupa array hari, kita bisa langsung pakai
  // Jika masih kosong (fallback belum dapat data), tampilkan state kosong
  const DAYS = items.length > 0 
    ? items.map(i => i.day) 
    : ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  // Handle activeDay fallback jika data kurang dari 7 hari
  const safeActiveDay = activeDay < DAYS.length ? activeDay : 0;
  
  const dayItems = items.length > 0 && items[safeActiveDay] 
    ? items[safeActiveDay].animeList 
    : [];

  return (
    <div className="bg-surface border-2 border-surface-soft mb-6 md:mb-10 relative">
      <div className="absolute -top-3 left-4 bg-background px-2 flex items-center gap-2">
        <div className="w-2 h-2 bg-accent animate-pulse"></div>
        <h3 className="text-lg sm:text-xl font-display uppercase tracking-widest text-foreground">Jadwal Rilis</h3>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-1 pt-5 sm:pt-6 px-3 sm:px-4 pb-0 border-b-2 border-surface-soft">
        {DAYS.map((day, index) => (
          <button
            key={day}
            onClick={() => setActiveDay(index)}
            className={`whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 border-t-2 border-l-2 border-r-2 text-xs sm:text-sm font-mono font-bold uppercase transition-all duration-300 relative top-[2px] ${
              safeActiveDay === index
                ? "bg-accent text-background border-accent"
                : "text-foreground/60 hover:text-foreground border-surface-soft bg-surface-soft/30 hover:bg-surface-soft/60"
            }`}
          >
            {day}
            {/* Hanya highlight 'Hari Ini' jika array harinya standar (7 hari) */}
            {index === today && DAYS.length === 7 && <span className="ml-1 sm:ml-2 text-[8px] sm:text-[9px] bg-background/20 px-1 py-0.5 border border-current">TODAY</span>}
          </button>
        ))}
      </div>

      {/* Schedule Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-background/50">
        {dayItems.length > 0 ? (
          dayItems.map((anime: any, idx: number) => (
            <Link 
              key={anime.slug || idx} 
              to={`/anime/${anime.slug || anime.sourceSlug || anime.id}`}
              className="flex gap-4 items-center p-2 bg-surface border-2 border-surface-soft hover:border-accent transition-colors group relative overflow-hidden"
            >
              <div className="w-16 h-20 shrink-0 border border-surface-soft relative overflow-hidden">
                <img 
                  src={anime.thumbnail || anime.image || anime.poster} 
                  alt={anime.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 crt-scanline pointer-events-none"></div>
              </div>
              
              <div className="flex-1 min-w-0 py-1 flex flex-col justify-between h-full">
                <h4 className="font-display uppercase tracking-wide text-sm text-foreground/90 group-hover:text-accent transition-colors line-clamp-2 leading-tight">
                  {anime.title}
                </h4>
                <div className="flex items-center flex-wrap gap-2 mt-auto text-xs text-foreground/50">
                  {anime.type && anime.type !== "unknown" && (
                    <span className="bg-surface-soft/50 text-foreground px-1.5 py-0.5 border border-surface-soft text-[10px] font-mono font-bold uppercase">
                      {anime.type}
                    </span>
                  )}
                  
                  {anime.score && anime.score !== "unknown" && (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-accent-2 border-b border-accent-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {Number(anime.score).toFixed(1)}
                    </span>
                  )}

                  {anime.episode && (
                    <span className="text-accent font-mono text-[10px] font-bold border-b border-accent">
                      EP.{String(anime.episode).padStart(3, '0')}
                    </span>
                  )}
                  
                  <span className="text-foreground/70 font-mono uppercase text-[10px] ml-auto">
                    {anime.status && anime.status !== "unknown" ? anime.status : 'Ongoing'}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-foreground/50 text-sm font-mono uppercase">
            No signal. Standby.
          </div>
        )}
      </div>
    </div>
  );
}
