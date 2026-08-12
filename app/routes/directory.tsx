import type { Route } from "./+types/directory";
import { Link } from "react-router";
import { sankaApi } from "~/lib/sankaClient";

export async function loader() {
  try {
    const data = await sankaApi.getUnlimited();
    return { list: data.list || [] };
  } catch (error) {
    console.error("Error fetching unlimited anime:", error);
    throw new Response("Gagal mengambil direktori anime", { status: 500 });
  }
}

export function meta() {
  return [
    { title: "A-Z Directory - CoreAnime" },
    { name: "description", content: "Daftar lengkap semua anime dari A sampai Z." },
  ];
}

export default function DirectoryPage({ loaderData }: Route.ComponentProps) {
  const { list } = loaderData;

  // Render navigation links for quick jump
  const jumpLinks = list.map((group: any) => group.startWith);

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 min-h-screen mt-16 md:mt-20">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-surface-soft pb-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/home" className="inline-block bg-surface text-foreground/70 hover:text-accent hover:border-accent transition-colors px-3 py-1 font-bold tracking-widest text-sm border-2 border-surface-soft">
              &laquo; KEMBALI KE BERANDA
            </Link>
            <div className="inline-block bg-accent text-background px-3 py-1 font-bold tracking-widest text-sm border border-accent shadow-[0_0_10px_rgba(255,59,59,0.5)]">
              UNLIMITED
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-foreground uppercase tracking-widest">
            A-Z <span className="text-accent">Directory</span>
          </h1>
        </div>
      </div>

      {/* Quick Jump Bar */}
      <div className="flex flex-wrap gap-2 mb-10 bg-surface border-2 border-surface-soft p-4 shadow-[4px_4px_0px_rgba(46,78,78,0.5)] animate-fade-in-up animation-delay-100">
        <span className="font-mono text-sm text-foreground/50 mr-2 flex items-center">JUMP TO:</span>
        {jumpLinks.map((char: string) => (
          <a 
            key={`jump-${char}`} 
            href={`#section-${char}`}
            className="w-8 h-8 flex items-center justify-center bg-background border border-surface-soft hover:border-accent hover:bg-accent hover:text-background font-mono font-bold text-sm transition-colors"
          >
            {char}
          </a>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-12 animate-fade-in-up animation-delay-200">
        {list.map((group: any) => (
          <section key={group.startWith} id={`section-${group.startWith}`} className="scroll-mt-32">
            <h2 className="text-3xl font-display text-accent border-b-2 border-surface-soft pb-2 mb-4 uppercase tracking-widest inline-block border-b-accent">
              {group.startWith}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {group.animeList.map((anime: any) => (
                <Link
                  key={anime.animeId}
                  to={`/anime/${anime.animeId}`}
                  className="font-mono text-sm text-foreground/80 hover:text-accent hover:translate-x-2 transition-all p-2 bg-surface/50 border border-transparent hover:border-surface-soft hover:bg-surface truncate block"
                  title={anime.title}
                >
                  {anime.title}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
