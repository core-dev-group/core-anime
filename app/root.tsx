import { useState, useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/logo.png", type: "image/png" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col min-h-screen">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const navigation = useNavigation();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Simulasi "Boot Sequence" saat pertama kali halaman dimuat (refresh/new entry)
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1200); // Tampil selama 1.2 detik
    
    return () => clearTimeout(timer);
  }, []);

  const isLoading = navigation.state === "loading" || isInitialLoading;

  return (
    <>
      {isLoading && (
        <div className={`fixed inset-0 z-[9999] bg-background/90 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${isInitialLoading ? 'opacity-100' : ''}`}>
          <div className="bg-surface border-4 border-surface-soft p-8 relative shadow-[8px_8px_0px_rgba(255,59,59,0.5)] overflow-hidden">
            {/* Retro scanline effect inside the loading box */}
            <div className="absolute inset-0 pointer-events-none crt-scanline opacity-20"></div>
            
            {/* Top loading progress bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-surface-soft">
               <div className="w-1/3 h-full bg-accent animate-pulse" style={{ animationDuration: '0.5s' }}></div>
            </div>
            
            <h2 className="text-4xl font-display uppercase tracking-widest text-accent animate-pulse flex items-center gap-4 relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-spin text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
              </svg>
              {isInitialLoading ? "BOOTING_" : "LOADING_"}
            </h2>
            <p className="mt-4 font-mono text-foreground/70 text-xs tracking-widest text-center uppercase relative z-10">
              {isInitialLoading ? "SYSTEM INITIALIZATION..." : "MENGHUBUNGKAN KE SERVER..."}
            </p>
          </div>
        </div>
      )}
      <Navbar />
      <main className="flex-grow pt-24 pb-8">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
