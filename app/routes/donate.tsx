import type { Route } from "./+types/donate";
import { Link } from "react-router";
import { getAllDonations } from "~/lib/donations.server";

export function meta() {
  return [
    { title: "Donasi - Dukung CoreAnime" },
    { name: "description", content: "Dukung operasional server CoreAnime agar tetap hidup." },
  ];
}

export async function loader() {
  // Ambil data donasi terbaru dari server
  const allDonations = getAllDonations();
  // Sort by date descending (newest first)
  const recentDonations = [...allDonations].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 10); // Ambil 10 terbaru

  return { recentDonations };
}

export default function DonatePage({ loaderData }: Route.ComponentProps) {
  const { recentDonations } = loaderData;

  // Build marquee text
  const tickerText = recentDonations.length > 0 
    ? recentDonations.map(d => `${d.donator_name} menyawer Rp ${d.amount_raw.toLocaleString('id-ID')} - "${d.message}"`).join(' ••• ')
    : 'Belum ada donasi terbaru. Dukung operasional server kami melalui Saweria! Klik di sini.';

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
              SUPPORT US
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-foreground uppercase tracking-widest">
            Dukung <span className="text-accent">CoreAnime</span>
          </h1>
        </div>
      </div>

      {/* Ticker / Running Text (Custom Native) */}
      <a 
        href="https://saweria.co/coreanime"
        target="_blank"
        rel="noreferrer"
        className="w-full bg-accent border-2 border-surface-soft overflow-hidden h-8 flex items-center relative z-10 shadow-[4px_4px_0px_rgba(255,59,59,0.5)] mb-10 group hover:shadow-[4px_4px_0px_rgba(255,255,255,0.5)] transition-all block"
      >
        <div className="absolute left-0 z-20 bg-accent text-background px-4 h-full flex items-center font-display font-bold uppercase tracking-widest text-xs border-r-2 border-surface-soft shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
          LIVE FEED
        </div>
        <div className="w-full h-full flex items-center overflow-hidden relative">
          <div className="whitespace-nowrap font-mono text-xs text-white uppercase tracking-widest font-bold animate-marquee pl-[100%] hover:[animation-play-state:paused]">
            {tickerText}
          </div>
        </div>
      </a>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in-up animation-delay-100">
        
        {/* Left Col: Info & Tiers */}
        <div className="flex flex-col gap-8">
          <div className="bg-surface border-2 border-surface-soft p-6 shadow-[8px_8px_0px_rgba(46,78,78,0.5)]">
            <h2 className="text-2xl font-display uppercase tracking-widest text-accent mb-4 border-b-2 border-surface-soft pb-2">
              Kenapa Donasi?
            </h2>
            <div className="font-mono text-sm text-foreground/80 space-y-4">
              <p>
                Website ini memang menggunakan API pihak ketiga untuk tayangan videonya, sehingga tidak ada biaya server penyimpanan file yang mahal.
              </p>
              <p>
                Meski begitu, CoreAnime tetap membutuhkan biaya untuk memperpanjang <strong>domain</strong>, biaya layanan <strong>hosting website</strong>, dan tentu saja... secangkir kopi agar admin tetap melek ngoding dan memelihara tampilan web ini supaya selalu bersih tanpa iklan!
              </p>
            </div>
          </div>

          <div className="bg-surface border-2 border-surface-soft p-6 shadow-[8px_8px_0px_rgba(46,78,78,0.5)]">
            <h2 className="text-2xl font-display uppercase tracking-widest text-foreground mb-4 border-b-2 border-surface-soft pb-2">
              Donator Tiers
            </h2>
            <div className="flex flex-col gap-4">
              {/* Tier 1 */}
              <div className="border border-yellow-500/50 bg-yellow-500/10 p-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-yellow-500 text-background text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                  GOLD
                </div>
                <h3 className="font-display text-yellow-400 text-xl tracking-widest mb-1">Rp 50.000+</h3>
                <p className="font-mono text-xs text-foreground/70">Mendapatkan role khusus di Discord & nama dicantumkan di Leaderboard selama 1 minggu.</p>
              </div>

              {/* Tier 2 */}
              <div className="border border-purple-500/50 bg-purple-500/10 p-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-purple-500 text-background text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                  PLATINUM
                </div>
                <h3 className="font-display text-purple-400 text-xl tracking-widest mb-1">Rp 150.000+</h3>
                <p className="font-mono text-xs text-foreground/70">Benefit Gold + Lencana khusus VIP di profil Anda.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Payment Methods */}
        <div className="flex flex-col gap-8">
          
          <div className="bg-surface border-2 border-accent p-6 shadow-[8px_8px_0px_rgba(255,59,59,0.5)] relative">
            <div className="absolute -top-4 -right-4 bg-accent text-background font-mono font-bold px-4 py-2 rotate-12 uppercase tracking-widest border-2 border-background shadow-lg">
              VIA SAWERIA
            </div>
            
            <h2 className="text-2xl font-display uppercase tracking-widest text-foreground mb-4 border-b-2 border-surface-soft pb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Dukung Lewat Saweria
            </h2>
            
            <div className="flex flex-col items-center py-4">
              <p className="font-mono text-sm text-foreground/80 text-center mb-6">
                Saweria mendukung pembayaran menggunakan QRIS, Gopay, OVO, Dana, LinkAja, dan berbagai metode lainnya.
              </p>
              
              <a 
                href="https://saweria.co/coreanime" 
                target="_blank" 
                rel="noreferrer"
                className="w-full text-center py-4 bg-accent text-white font-display text-xl tracking-widest uppercase transition-all hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(255,59,59,0.3)] border-2 border-accent"
              >
                DONASI SEKARANG
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
