import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-background border-t-2 border-surface-soft mt-12 py-12 relative overflow-hidden">
      {/* Background scanline effect */}
      <div className="absolute inset-0 pointer-events-none crt-scanline opacity-20"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="flex flex-col items-start max-w-sm">
            <Link to="/" className="flex items-center gap-3 group mb-4">
              <div className="w-10 h-10 border-2 border-accent shadow-[4px_4px_0px_rgba(255,59,59,0.5)] group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0px_rgba(255,201,60,0.5)] transition-all duration-300 overflow-hidden flex-shrink-0 bg-black">
                <img src="/logo.png" alt="CoreAnime Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-display uppercase tracking-widest text-foreground">
                CORE<span className="text-accent">ANIME</span>
              </span>
            </Link>
            <p className="text-foreground/70 font-mono text-sm leading-relaxed text-left">
              Agregator anime tercepat dengan sistem fallback otomatis untuk pengalaman menonton tanpa hambatan. Siaran 24/7 non-stop.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-6 text-sm font-bold uppercase tracking-widest w-full md:w-auto mt-4 md:mt-0">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border-2 border-surface-soft text-accent text-xs mb-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
              <span>SIGNAL STRENGTH: EXCELLENT</span>
            </div>
          </div>
        </div>
        
        <div className="border-t-2 border-surface-soft mt-10 pt-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 font-mono text-xs text-foreground/50">
          <p className="text-left">
            &copy; {new Date().getFullYear()} COREANIME. <br className="md:hidden" />
            <span className="md:ml-1 mt-1 block md:inline">POWERED BY <a href="https://core-dev-group.my.id" className="text-accent hover:text-white transition-colors">CORE DEV GROUP</a>.</span>
          </p>
          <div className="flex flex-col items-start md:items-end gap-1.5 text-left md:text-right max-w-md">
            <p className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              ANIME API PROVIDED BY <span className="font-bold text-foreground">SANKA VOLLEREI</span>
            </p>
            <div className="flex gap-4 mt-2 font-bold tracking-widest text-[10px] text-foreground/70">
              <Link to="/tos" className="hover:text-accent transition-colors">TERMS OF SERVICE</Link>
              <span>|</span>
              <Link to="/privacy" className="hover:text-accent transition-colors">PRIVACY POLICY</Link>
            </div>
            <p className="text-[10px] leading-tight opacity-70 mt-2">
              DISCLAIMER: SITUS INI TIDAK MENYIMPAN FILE APAPUN DI SERVERNYA. SEMUA KONTEN DISEDIAKAN OLEH PIHAK KETIGA.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
