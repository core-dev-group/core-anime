import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-surface border-t-4 border-surface-soft mt-16 sm:mt-20 relative overflow-hidden text-foreground">
      {/* Background CRT scanline & Retro Gradient Accent */}
      <div className="absolute inset-0 pointer-events-none crt-scanline opacity-25"></div>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent-2 to-static-teal"></div>

      {/* Retro Broadcast Ticker / Channel Bar */}
      <div className="border-b-2 border-surface-soft/80 bg-background/95 px-3 sm:px-6 py-2 font-mono text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest uppercase flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-accent font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping"></span>
            SYS: ONLINE
          </span>
          <span className="text-foreground/30">|</span>
          <span className="text-foreground/70">BAND: CH-89.4 CRT</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-foreground/60 flex-wrap">
          <span>REGION: ASIA-ID</span>
          <span className="text-foreground/30">|</span>
          <span className="text-accent-2 font-bold">NO ADS • 60 FPS</span>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-3 group mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-accent shadow-[3px_3px_0px_rgba(255,59,59,0.5)] group-hover:-translate-y-1 group-hover:shadow-[3px_3px_0px_rgba(255,201,60,0.5)] transition-all duration-300 overflow-hidden shrink-0 bg-black">
                <img src="/logo.png" alt="CoreAnime Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-display uppercase tracking-widest text-foreground">
                  CORE<span className="text-accent">ANIME</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono text-accent-2 tracking-widest -mt-1 font-bold">
                  RETRO ANIME BROADCAST
                </span>
              </div>
            </Link>

            <p className="text-foreground/70 font-mono text-xs leading-relaxed mb-4 sm:mb-6 max-w-md">
              Portal streaming & arsip anime subtitle Indonesia bertema siaran analog retro. Dilengkapi sistem fallback multiserver otomatis tanpa iklan.
            </p>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-background border border-surface-soft text-accent text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                <span>SIGNAL: 100% EXCELLENT</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-background border border-surface-soft text-accent-2 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
                <span>FPS: 60 SYNC</span>
              </div>
            </div>
          </div>

          {/* Col 2 & 3 Combined in Mobile 2-Cols: Navigation & Support */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4 sm:gap-6">
            {/* Menu */}
            <div className="flex flex-col font-mono text-xs">
              <h4 className="font-display text-sm sm:text-base uppercase tracking-widest text-foreground border-b-2 border-surface-soft pb-1 mb-3 sm:mb-4 flex items-center gap-1.5">
                <span className="text-accent">▶</span> MENU
              </h4>
              <div className="flex flex-col gap-2 text-foreground/70 font-semibold tracking-wider text-[11px] sm:text-xs">
                <Link to="/home" className="hover:text-accent hover:translate-x-1 transition-all py-0.5">BERANDA</Link>
                <Link to="/directory" className="hover:text-accent hover:translate-x-1 transition-all py-0.5">DIREKTORI</Link>
                <Link to="/genres" className="hover:text-accent hover:translate-x-1 transition-all py-0.5">GENRE</Link>
                <Link to="/complete" className="hover:text-accent hover:translate-x-1 transition-all py-0.5">TAMAT</Link>
                <Link to="/bookmarks" className="hover:text-accent hover:translate-x-1 transition-all py-0.5">BOOKMARK</Link>
              </div>
            </div>

            {/* Support */}
            <div className="flex flex-col font-mono text-xs">
              <h4 className="font-display text-sm sm:text-base uppercase tracking-widest text-foreground border-b-2 border-surface-soft pb-1 mb-3 sm:mb-4 flex items-center gap-1.5">
                <span className="text-accent-2">★</span> SUPPORT
              </h4>
              <div className="flex flex-col gap-2 text-foreground/70 font-semibold tracking-wider text-[11px] sm:text-xs">
                <Link to="/donate" className="text-accent hover:text-white transition-colors flex items-center gap-1 font-bold py-0.5">
                  <span>SAWERIA</span> &raquo;
                </Link>
                <Link to="/profile" className="hover:text-accent hover:translate-x-1 transition-all py-0.5">KARTU MEMBER</Link>
                <Link to="/tos" className="hover:text-accent hover:translate-x-1 transition-all py-0.5">TERMS (S&K)</Link>
                <Link to="/privacy" className="hover:text-accent hover:translate-x-1 transition-all py-0.5">PRIVASI</Link>
              </div>
            </div>
          </div>

          {/* Col 4: Data Source Card */}
          <div className="lg:col-span-3 flex flex-col font-mono text-xs">
            <h4 className="font-display text-sm sm:text-base uppercase tracking-widest text-foreground border-b-2 border-surface-soft pb-1 mb-3 sm:mb-4 flex items-center gap-1.5">
              <span className="text-cyan-400">◆</span> DATA SOURCE
            </h4>
            <div className="bg-background border-2 border-surface-soft p-3 sm:p-3.5 shadow-[3px_3px_0px_rgba(46,78,78,0.4)]">
              <p className="text-[10px] sm:text-[11px] text-foreground/80 leading-relaxed mb-2">
                API agregator didukung secara independen oleh:
              </p>
              <div className="text-accent-2 font-display text-sm sm:text-base tracking-wider uppercase flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                SANKA VOLLEREI
              </div>
              <p className="text-[9px] sm:text-[10px] text-foreground/50 mt-2 italic border-t border-surface-soft/60 pt-2">
                High availability multi-source anime gateway.
              </p>
            </div>
          </div>

        </div>

        {/* Disclaimer Box */}
        <div className="mt-8 sm:mt-10 p-3 bg-background/60 border border-surface-soft/60 font-mono text-[9px] sm:text-[10px] text-foreground/50 leading-relaxed">
          <span className="text-accent font-bold">DISCLAIMER:</span> CoreAnime tidak menyimpan file media video apapun di server fisik kami. Seluruh materi streaming bersumber dari penyedia pihak ketiga publik di internet.
        </div>

        {/* Bottom Copyright & Dev Credit */}
        <div className="border-t-2 border-surface-soft mt-6 sm:mt-8 pt-5 sm:pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 font-mono text-[10px] sm:text-[11px] text-foreground/60 text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} COREANIME. BROADCASTING WITH LOVE.
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span>DEVELOPED BY</span>
            <a
              href="https://core-dev-group.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-white transition-colors font-bold uppercase tracking-wider bg-background px-2.5 py-1 border border-surface-soft shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
            >
              CORE DEV GROUP
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
