import type { Route } from "./+types/genres";
import { Link } from "react-router";
import { sankaApi } from "~/lib/sankaClient";

export async function loader() {
  try {
    const data = await sankaApi.getGenres();
    return { genreList: data.genreList || [] };
  } catch (error) {
    console.error("Error fetching genres:", error);
    throw new Response("Gagal mengambil data genre", { status: 500 });
  }
}

export function meta() {
  return [
    { title: "Daftar Genre - CoreAnime" },
    { name: "description", content: "Jelajahi berbagai macam genre anime di CoreAnime." },
  ];
}

export default function GenresPage({ loaderData }: Route.ComponentProps) {
  const { genreList } = loaderData;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 min-h-screen">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-surface-soft pb-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/home" className="inline-block bg-surface text-foreground/70 hover:text-accent hover:border-accent transition-colors px-3 py-1 font-bold tracking-widest text-sm border-2 border-surface-soft">
              &laquo; KEMBALI KE BERANDA
            </Link>
            <div className="inline-block bg-accent text-background px-3 py-1 font-bold tracking-widest text-sm border border-accent shadow-[0_0_10px_rgba(255,59,59,0.5)]">
              DIRECTORY
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-foreground uppercase tracking-widest">
            Daftar <span className="text-accent">Genre</span>
          </h1>
        </div>
        <div className="font-mono text-sm text-foreground/60 border border-surface-soft px-3 py-2 bg-surface">
          TOTAL: {genreList.length} GENRE
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-fade-in-up animation-delay-100">
        {genreList.map((genre: any, index: number) => (
          <Link
            key={genre.genreId}
            to={`/genre/${genre.genreId}`}
            className="group block bg-surface border-2 border-surface-soft hover:border-accent p-4 text-center transition-all duration-300 shadow-[4px_4px_0px_rgba(46,78,78,0.5)] hover:shadow-[6px_6px_0px_rgba(255,59,59,0.3)] hover:-translate-y-1"
            style={{ animationDelay: `${(index % 20) * 30}ms` }}
          >
            <span className="font-display text-foreground group-hover:text-accent text-lg uppercase tracking-wider transition-colors">
              {genre.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
