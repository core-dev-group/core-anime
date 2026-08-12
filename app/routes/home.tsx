import type { Route } from "./+types/home";
import { sankaApi } from "~/lib/sankaClient";
import { getTopDonators } from "~/lib/donations.server";
import { HeroBanner } from "~/components/HeroBanner";
import { AnimeRow } from "~/components/AnimeRow";
import { Sidebar } from "~/components/Sidebar";
import { ContinueWatchingRow } from "~/components/ContinueWatchingRow";
import { BookmarksRow } from "~/components/BookmarksRow";
import { ReleaseSchedule } from "~/components/ReleaseSchedule";

export async function loader() {
  const [homeData, scheduleData, completeResult, ongoingResult] = await Promise.all([
    sankaApi.getHome(),
    sankaApi.getSchedule(),
    sankaApi.getComplete(), // proxy for popular
    sankaApi.getOngoing()
  ]);

  // Load real-time top donators from local JSON database
  const topDonators = getTopDonators(3);

  return { 
    homeData, 
    scheduleData, 
    popularData: completeResult.animeList, 
    ongoingData: ongoingResult.animeList,
    topDonators
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CoreAnime - Nonton Anime Terlengkap & Tercepat" },
    { name: "description", content: "Streaming anime terbaru dengan subtitle Indonesia. Cepat, ringan, dan banyak pilihan server." },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { homeData, scheduleData, popularData, ongoingData, topDonators } = loaderData;
  
  const latestAnime = Array.isArray(homeData) ? homeData : [];
  const scheduleItems = Array.isArray(scheduleData) ? scheduleData : [];
  const popularAnime = Array.isArray(popularData) ? popularData : [];
  const ongoingAnime = Array.isArray(ongoingData) ? ongoingData : [];
  
  // Ambil 5 teratas untuk hero banner dari latest anime
  const heroItems = latestAnime.slice(0, 5);
  
  // Top Anime untuk Sidebar dari popularAnime (atau fallback ke latest)
  const topAnime = popularAnime.length > 0 ? popularAnime.slice(0, 10) : latestAnime.slice(3, 13);
  
  // Riwayat Tontonan (Mock untuk saat ini karena butuh auth/localstorage)
  const continueWatching = latestAnime.slice(2, 6);
  
  // Menggunakan ongoing untuk baris 1
  const row1 = ongoingAnime.length > 0 ? ongoingAnime.slice(0, 10) : latestAnime.slice(5, 15);
  
  // Menggunakan popular untuk baris 2
  const row2 = popularAnime.length > 0 ? popularAnime.slice(0, 10) : (latestAnime.length > 15 ? latestAnime.slice(15, 25) : []);

  // Sisa data untuk baris 3
  const row3 = latestAnime.length > 25 ? latestAnime.slice(25, 35) : [];

  return (
    <div className="w-full bg-background overflow-hidden min-h-screen pb-12">
      {/* Hero Banner Cinematic Section */}
      {heroItems.length > 0 && <HeroBanner items={heroItems} />}

      {/* Main Content Layout with Sidebar */}
      <div className="container mx-auto max-w-screen-2xl">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          
          {/* Main Left Content */}
          <div className="flex-1 w-full min-w-0">
            {latestAnime.length > 0 ? (
              <div className="flex flex-col">
                <ContinueWatchingRow fallbackItems={continueWatching} />
                <BookmarksRow />
                
                {/* Real Schedule from API */}
                <ReleaseSchedule items={scheduleItems} />
                
                <div className="flex flex-col gap-4 mt-4">
                  <AnimeRow title="Sedang Tayang (Ongoing)" items={row1} />
                  {row2.length > 0 && <AnimeRow title="Anime Tamat" items={row2} viewAllLink="/complete" />}
                  {row3.length > 0 && <AnimeRow title="Baru Ditambahkan" items={row3} />}
                </div>
              </div>
            ) : (
              <div className="px-4 mt-8">
                <div className="text-center py-20 text-foreground/50 border border-surface-soft rounded-lg glass-card shadow-lg">
                  Tidak ada anime terbaru saat ini. Server mungkin sedang gangguan.
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          {latestAnime.length > 0 && (
            <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 px-4 lg:px-0">
              <Sidebar topAnime={topAnime} topDonators={topDonators} />
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

