import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-background border-t-2 border-surface-soft mt-16 pt-12 pb-8 relative overflow-hidden">
      {/* Background scanline effect */}
      <div className="absolute inset-0 pointer-events-none crt-scanline opacity-20"></div>
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-8">
          {/* Brand Section */}
          <div className="flex flex-col items-start text-left max-w-sm">
            <Link to="/" className="flex items-center gap-3 group mb-5">
              <div className="w-12 h-12 border-2 border-accent shadow-[4px_4px_0px_rgba(255,59,59,0.5)] group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0px_rgba(255,201,60,0.5)] transition-all duration-300 overflow-hidden flex-shrink-0 bg-black">
                <img src="/logo.png" alt="CoreAnime Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-display uppercase tracking-widest text-foreground">
                CORE<span className="text-accent">ANIME</span>
              </span>
            </Link>
            <p className="text-foreground/70 font-mono text-sm leading-relaxed mb-6">
              Agregator anime tercepat dengan sistem fallback otomatis untuk pengalaman menonton tanpa hambatan. Siaran 24/7 non-stop.
            </p>
            
            <div className="flex items-center gap-2 px-3 py-2 bg-surface border-2 border-surface-soft text-accent text-xs font-bold uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
              <span>SIGNAL STRENGTH: EXCELLENT</span>
            </div>
          </div>

          {/* Links & Info Section */}
          <div className="flex flex-col items-start md:items-end text-left md:text-right font-mono text-xs text-foreground/50 w-full md:w-auto">
            <div className="flex flex-col gap-3 w-full md:max-w-md items-start md:items-end">
              <p className="flex items-center gap-2 text-sm text-foreground/80">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                ANIME API PROVIDED BY <span className="font-bold text-foreground">SANKA VOLLEREI</span>
              </p>
              
              <div className="flex flex-wrap gap-4 mt-2 font-bold tracking-widest text-[11px] text-foreground/70">
                <Link to="/tos" className="hover:text-accent transition-colors">TERMS OF SERVICE</Link>
                <span className="hidden md:inline">|</span>
                <Link to="/privacy" className="hover:text-accent transition-colors">PRIVACY POLICY</Link>
              </div>

              <div className="mt-6 border-t-2 border-surface-soft/50 pt-5 w-full">
                <p className="text-[10px] leading-relaxed opacity-70">
                  DISCLAIMER: SITUS INI TIDAK MENYIMPAN FILE APAPUN DI SERVERNYA. SEMUA KONTEN DISEDIAKAN OLEH PIHAK KETIGA.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright Bar */}
        <div className="border-t-2 border-surface-soft mt-12 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-mono text-[11px] text-foreground/50">
          <p>
            &copy; {new Date().getFullYear()} COREANIME. ALL RIGHTS RESERVED.
          </p>
          <p className="flex items-center gap-2 flex-wrap">
            <span>POWERED BY</span>
            <a href="https://core-dev-group.my.id" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors font-bold uppercase tracking-wider bg-surface px-2 py-1 border border-surface-soft">
              CORE DEV GROUP
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
