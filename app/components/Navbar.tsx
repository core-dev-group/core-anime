import { Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isLoading, loginWithGoogle, loginAsGuest, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-background border-b-2 border-surface-soft shadow-lg py-3" : "bg-background md:bg-gradient-to-b md:from-background/95 md:to-transparent py-4 md:py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className={`items-center gap-3 group flex`}>
            <div className="w-10 h-10 border-2 border-accent rounded-sm shadow-[4px_4px_0px_rgba(255,59,59,0.3)] group-hover:shadow-[4px_4px_0px_rgba(255,201,60,0.3)] transition-all overflow-hidden flex-shrink-0 bg-black">
              <img src="/logo.png" alt="CoreAnime Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-display text-foreground tracking-widest hidden sm:block uppercase">
              Core<span className="text-accent">Anime</span>
            </span>
          </Link>

          {/* Icons container */}
          <div className="flex items-center gap-2 sm:gap-6">
            
            {/* Home Icon/Link */}
            <Link 
              to="/home" 
              className={`p-2 transition-colors hover:text-accent flex items-center gap-2 group ${
                location.pathname === '/' || location.pathname === '/home' ? 'text-accent' : 'text-foreground/70'
              }`}
              title="Beranda"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm font-mono font-bold tracking-wider hidden sm:block uppercase">
                CH.01 BERANDA
              </span>
            </Link>

            {/* Genre Icon/Link */}
            <Link 
              to="/genres" 
              className={`p-2 transition-colors hover:text-accent flex items-center gap-2 group ${
                location.pathname.startsWith('/genre') ? 'text-accent' : 'text-foreground/70'
              }`}
              title="Daftar Genre"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="text-sm font-mono font-bold tracking-wider hidden sm:block uppercase">
                CH.02 GENRE
              </span>
            </Link>

            {/* Directory Link */}
            <Link 
              to="/directory" 
              className={`p-2 transition-colors hover:text-accent flex items-center gap-2 group ${
                location.pathname.startsWith('/directory') ? 'text-accent' : 'text-foreground/70'
              }`}
              title="A-Z Directory"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span className="text-sm font-mono font-bold tracking-wider hidden sm:block uppercase">
                CH.03 A-Z
              </span>
            </Link>

            {/* Bookmark Icon */}
            <Link 
              to="/bookmarks"
              className={`p-2 transition-colors flex items-center gap-2 group ${
                location.pathname.startsWith('/bookmarks') ? 'text-accent' : 'text-foreground/70 hover:text-accent'
              }`}
              title="Lihat Bookmark Saya"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-[10px] font-mono font-bold tracking-widest hidden lg:block uppercase group-hover:text-accent">
                Bookmark
              </span>
            </Link>

            {/* User Profile */}
            <div className="relative flex items-center gap-3 pl-2 sm:border-l border-surface-soft ml-1 sm:ml-2">
              <button 
                onClick={() => setShowLoginMenu(!showLoginMenu)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-none border-2 flex items-center justify-center overflow-hidden transition-colors ${
                  profile ? 'border-accent shadow-[2px_2px_0px_rgba(255,59,59,0.5)]' : 'border-surface-soft hover:border-accent bg-surface-soft'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                ) : profile ? (
                  <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </button>

              {/* Dropdown Menu */}
              {showLoginMenu && (
                <div className="absolute right-0 top-12 mt-2 w-56 bg-surface border-2 border-surface-soft shadow-[8px_8px_0px_rgba(46,78,78,0.5)] z-50 flex flex-col animate-fade-in-up">
                  <div className="p-3 border-b-2 border-surface-soft bg-surface-soft/20">
                    <p className="font-mono text-xs uppercase tracking-widest text-foreground/70">
                      {profile ? 'Status: ONLINE' : 'Status: OFFLINE'}
                    </p>
                    {profile && (
                      <p className="font-display text-sm uppercase tracking-wider text-accent truncate mt-1">
                        {profile.displayName}
                      </p>
                    )}
                  </div>
                  
                  <div className="p-2 flex flex-col gap-2">
                    {profile ? (
                      <>
                        <Link 
                          to="/profile"
                          onClick={() => setShowLoginMenu(false)}
                          className="w-full text-left px-3 py-2 text-xs font-mono font-bold uppercase tracking-widest text-foreground hover:bg-surface-soft hover:text-accent transition-colors"
                        >
                          Lihat Profil
                        </Link>
                        <button 
                          onClick={() => {
                            logout();
                            setShowLoginMenu(false);
                            navigate('/home');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-mono font-bold uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-colors"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={async () => {
                            await loginWithGoogle();
                            setShowLoginMenu(false);
                          }}
                          className="w-full text-center px-3 py-2 text-xs font-mono font-bold uppercase tracking-widest bg-accent text-white shadow-[2px_2px_0px_rgba(255,255,255,0.3)] hover:shadow-none hover:translate-y-[2px] transition-all"
                        >
                          Login Google
                        </button>
                        <button 
                          onClick={async () => {
                            await loginAsGuest();
                            setShowLoginMenu(false);
                          }}
                          className="w-full text-center px-3 py-2 text-xs font-mono font-bold uppercase tracking-widest border border-surface-soft text-foreground/80 hover:text-accent hover:border-accent transition-colors"
                        >
                          Masuk Tamu
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
