import type { Route } from "./+types/genre.$id";
import { Link, useNavigation, data } from "react-router";
import { sankaApi } from "~/lib/sankaClient";
import { AnimeCard } from "~/components/AnimeCard";

export async function loader({ request, params }: Route.LoaderArgs) {
  const genreId = params.id;
  if (!genreId) throw data("Missing genre ID", { status: 400 });

  const url = new URL(request.url);
  const pageStr = url.searchParams.get("page") || "1";
  const page = parseInt(pageStr, 10) || 1;
  
  try {
    const { animeList, pagination } = await sankaApi.getAnimeByGenre(genreId, page);
    return { genreId, animeList, pagination, page };
  } catch (error) {
    console.error(error);
    throw new Response("Gagal mengambil data", { status: 500 });
  }
}

export function meta({ data }: Route.MetaArgs) {
  const title = data?.genreId ? `Genre: ${data.genreId.replace('-', ' ').toUpperCase()} - CoreAnime` : "Genre Anime";
  return [
    { title },
    { name: "description", content: `Daftar anime untuk genre ${data?.genreId}.` }
  ];
}

export default function GenreDetailPage({ loaderData }: Route.ComponentProps) {
  const { genreId, animeList, pagination, page } = loaderData;
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  const genreName = genreId.replace(/-/g, ' ').toUpperCase();

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-surface-soft pb-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/genres" className="inline-block bg-surface text-foreground/70 hover:text-accent hover:border-accent transition-colors px-3 py-1 font-bold tracking-widest text-sm border-2 border-surface-soft">
              &laquo; KEMBALI KE GENRE
            </Link>
            <div className="inline-block bg-accent text-background px-3 py-1 font-bold tracking-widest text-sm border border-accent shadow-[0_0_10px_rgba(255,59,59,0.5)]">
              KATEGORI
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-foreground uppercase tracking-widest">
            GENRE: <span className="text-accent">{genreName}</span>
          </h1>
        </div>
        {pagination && (
          <div className="font-mono text-sm text-foreground/60 border border-surface-soft px-3 py-2 bg-surface">
            HALAMAN {pagination.currentPage} / {pagination.totalPages}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        {animeList && animeList.length > 0 ? (
          animeList.map((anime: any, index: number) => (
            <div key={anime.id || anime.slug || index} className="animate-fade-in-up" style={{ animationDelay: `${(index % 12) * 50}ms` }}>
              <AnimeCard anime={anime} />
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-surface-soft border-dashed bg-surface text-foreground/50 font-mono tracking-widest uppercase">
            Tidak ada data anime untuk genre ini.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div className="mt-12 flex items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
          {pagination.hasPrevPage ? (
            <Link 
              to={`/genre/${genreId}?page=${pagination.prevPage}`}
              className="px-6 py-3 bg-surface hover:bg-accent hover:text-background text-foreground font-mono font-bold uppercase transition-colors border-2 border-surface-soft shadow-[4px_4px_0px_rgba(46,78,78,0.5)] hover:shadow-none hover:translate-y-1"
            >
              &laquo; Mundur
            </Link>
          ) : (
            <div className="px-6 py-3 bg-surface/50 text-foreground/30 font-mono font-bold uppercase border-2 border-surface-soft/50 cursor-not-allowed">
              &laquo; Mundur
            </div>
          )}

          <div className="font-mono text-xl font-bold px-4 text-accent-2 bg-surface border-2 border-surface-soft shadow-inner py-2">
            {page}
          </div>

          {pagination.hasNextPage ? (
            <Link 
              to={`/genre/${genreId}?page=${pagination.nextPage}`}
              className="px-6 py-3 bg-surface hover:bg-accent hover:text-background text-foreground font-mono font-bold uppercase transition-colors border-2 border-surface-soft shadow-[4px_4px_0px_rgba(46,78,78,0.5)] hover:shadow-none hover:translate-y-1"
            >
              Maju &raquo;
            </Link>
          ) : (
            <div className="px-6 py-3 bg-surface/50 text-foreground/30 font-mono font-bold uppercase border-2 border-surface-soft/50 cursor-not-allowed">
              Maju &raquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
