import type { Route } from "./+types/donate";
import { Link } from "react-router";
import { getAllDonations, getTopDonators } from "~/lib/donations.server";

export function meta() {
  return [
    { title: "Donasi & Hall of Fame - Dukung CoreAnime" },
    { name: "description", content: "Dukung operasional server CoreAnime agar tetap hidup dan tanpa iklan." },
  ];
}

export async function loader() {
  const [allDonations, topDonators] = await Promise.all([
    getAllDonations(),
    getTopDonators(10)
  ]);

  const recentDonations = [...allDonations].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 10);

  const totalRaised = allDonations.reduce((acc, curr) => acc + (curr.amount_raw || 0), 0);

  return { recentDonations, topDonators, totalRaised };
}

export default function DonatePage({ loaderData }: Route.ComponentProps) {
  const { recentDonations, topDonators, totalRaised } = loaderData;

  const tickerText = recentDonations.length > 0
    ? recentDonations.map(d => `${d.donator_name} menyawer Rp ${d.amount_raw.toLocaleString('id-ID')} - "${d.message}"`).join(' ••• ')
    : 'Belum ada donasi terbaru. Dukung operasional server kami melalui Saweria! Klik tombol donasi.';

  const tierBadges = {
    DIAMOND: 'bg-cyan-500/20 text-cyan-300 border-cyan-400',
    PLATINUM: 'bg-purple-500/20 text-purple-300 border-purple-400',
    GOLD: 'bg-yellow-500/20 text-yellow-300 border-yellow-400',
    SILVER: 'bg-slate-400/20 text-slate-200 border-slate-300',
    BRONZE: 'bg-amber-800/20 text-amber-500 border-amber-700'
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-surface-soft pb-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/home" className="inline-block bg-surface text-foreground/70 hover:text-accent hover:border-accent transition-colors px-3 py-1 font-bold tracking-widest text-xs border-2 border-surface-soft">
              &laquo; KEMBALI KE BERANDA
            </Link>
            <div className="inline-block bg-accent text-background px-3 py-1 font-bold tracking-widest text-xs border border-accent shadow-[0_0_10px_rgba(255,59,59,0.5)]">
              COMMUNITY FUND
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-display text-foreground uppercase tracking-widest">
            HALL OF <span className="text-accent">FAME</span> & DONASI
          </h1>
          <p className="font-mono text-xs text-foreground/60 mt-1">
            Bantu kami menjaga website tetap cepat, bebas iklan, dan server selalu online.
          </p>
        </div>

        {/* Total Raised Counter */}
        <div className="border-2 border-surface-soft bg-surface p-3 md:text-right shadow-[4px_4px_0px_rgba(46,78,78,0.5)]">
          <div className="font-mono text-[10px] text-foreground/60 uppercase tracking-widest">TOTAL DONASI TERKUMPUL</div>
          <div className="font-display text-2xl md:text-3xl text-accent-2">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalRaised)}
          </div>
        </div>
      </div>

      {/* Marquee Ticker */}
      <a
        href="https://saweria.co/coreanime"
        target="_blank"
        rel="noreferrer"
        className="w-full bg-accent border-2 border-surface-soft overflow-hidden h-9 flex items-center relative z-10 shadow-[4px_4px_0px_rgba(255,59,59,0.5)] mb-10 group hover:shadow-[4px_4px_0px_rgba(255,255,255,0.5)] transition-all block"
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

      {/* Hall of Fame / Top Donators Grid */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4 border-b-2 border-surface-soft pb-2">
          <h2 className="text-2xl md:text-3xl font-display uppercase tracking-widest text-foreground flex items-center gap-2">
            <span className="text-accent-2">★</span> TOP DONATORS (HALL OF FAME)
          </h2>
          <span className="font-mono text-xs text-foreground/60">
            {topDonators.length} Donatur Terhebat
          </span>
        </div>

        {topDonators.length === 0 ? (
          <div className="bg-surface border-2 border-surface-soft p-8 text-center font-mono text-foreground/60">
            Belum ada data donasi. Jadilah pahlawan pertama kami!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topDonators.map((donator, idx) => {
              const isRank1 = idx === 0;
              const isRank2 = idx === 1;
              const isRank3 = idx === 2;

              let rankBadge = 'bg-surface border-surface-soft text-foreground/70';
              if (isRank1) rankBadge = 'bg-yellow-400 text-black border-yellow-300 font-black';
              else if (isRank2) rankBadge = 'bg-slate-200 text-black border-slate-100 font-black';
              else if (isRank3) rankBadge = 'bg-amber-600 text-white border-amber-500 font-black';

              return (
                <div
                  key={donator.name}
                  className={`bg-surface border-2 p-4 relative flex flex-col justify-between transition-all ${
                    isRank1
                      ? 'border-yellow-400 shadow-[6px_6px_0px_rgba(234,179,8,0.5)]'
                      : isRank2
                      ? 'border-slate-300 shadow-[5px_5px_0px_rgba(203,213,225,0.4)]'
                      : isRank3
                      ? 'border-amber-600 shadow-[5px_5px_0px_rgba(217,119,6,0.4)]'
                      : 'border-surface-soft hover:border-accent shadow-[4px_4px_0px_rgba(46,78,78,0.4)]'
                  }`}
                >
                  {isRank1 && (
                    <div className="absolute -top-3 right-3 bg-yellow-400 text-black font-mono font-black text-[10px] px-2 py-0.5 border border-yellow-300 uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,0.8)]">
                      👑 CHAMPION DONATOR
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    {/* Big Avatar Frame */}
                    <div className="relative shrink-0">
                      <div className={`w-16 h-16 border-2 bg-background overflow-hidden flex items-center justify-center ${
                        isRank1
                          ? 'border-yellow-400 shadow-[3px_3px_0px_rgba(234,179,8,0.5)]'
                          : 'border-surface-soft shadow-[2px_2px_0px_rgba(0,0,0,0.6)]'
                      }`}>
                        {donator.photoURL ? (
                          <img
                            src={donator.photoURL}
                            alt={donator.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-surface-soft to-surface flex items-center justify-center font-display text-2xl text-foreground/70">
                            {donator.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className={`absolute -bottom-1.5 -left-1.5 w-6 h-6 flex items-center justify-center text-xs font-mono border ${rankBadge}`}>
                        #{idx + 1}
                      </div>
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-mono font-bold text-sm text-foreground truncate">
                          {donator.name}
                        </span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 border shrink-0 ${
                          tierBadges[donator.tier as keyof typeof tierBadges] || tierBadges.BRONZE
                        }`}>
                          {donator.tier}
                        </span>
                      </div>
                      <span className="font-display text-xl text-accent-2 leading-none">
                        {donator.amount_formatted}
                      </span>
                    </div>
                  </div>

                  {donator.message && (
                    <div className="bg-background/80 border-l-2 border-accent p-2 text-xs font-mono text-foreground/80 italic mt-auto">
                      "{donator.message}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lower Section: How to donate & Tiers info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
        {/* Donation CTA Box */}
        <div className="bg-surface border-2 border-accent p-6 shadow-[8px_8px_0px_rgba(255,59,59,0.5)] relative flex flex-col justify-between">
          <div className="absolute -top-4 -right-4 bg-accent text-background font-mono font-bold px-4 py-2 rotate-6 uppercase tracking-widest border-2 border-background shadow-lg text-xs">
            INSTANT QRIS / E-WALLET
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-display uppercase tracking-widest text-foreground mb-4 border-b-2 border-surface-soft pb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Sawer Sekarang Lewat Saweria
            </h2>
            <p className="font-mono text-sm text-foreground/80 mb-4 leading-relaxed">
              Dukungan Anda masuk langsung secara real-time ke leaderboard di website ini. Pastikan menggunakan <strong>Nama yang sama</strong> dengan akun CoreAnime Anda agar foto profil otomatis terhubung!
            </p>
            <div className="flex flex-wrap gap-2 mb-6 font-mono text-xs text-foreground/60">
              <span className="bg-background border border-surface-soft px-2 py-1">✓ QRIS</span>
              <span className="bg-background border border-surface-soft px-2 py-1">✓ GoPay</span>
              <span className="bg-background border border-surface-soft px-2 py-1">✓ OVO</span>
              <span className="bg-background border border-surface-soft px-2 py-1">✓ DANA</span>
              <span className="bg-background border border-surface-soft px-2 py-1">✓ ShopeePay</span>
              <span className="bg-background border border-surface-soft px-2 py-1">✓ LinkAja</span>
            </div>
          </div>

          <a
            href="https://saweria.co/coreanime"
            target="_blank"
            rel="noreferrer"
            className="w-full text-center py-4 bg-accent text-white font-display text-xl md:text-2xl tracking-widest uppercase transition-all hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(255,59,59,0.4)] border-2 border-accent block"
          >
            KLIK UNTUK SAWER KE SAWERIA &raquo;
          </a>
        </div>

        {/* Tiers & Benefits */}
        <div className="bg-surface border-2 border-surface-soft p-6 shadow-[8px_8px_0px_rgba(46,78,78,0.5)]">
          <h2 className="text-2xl md:text-3xl font-display uppercase tracking-widest text-foreground mb-4 border-b-2 border-surface-soft pb-2">
            TINGKATAN DONATUR (TIERS)
          </h2>
          <div className="flex flex-col gap-3 font-mono">
            <div className="border border-cyan-400/50 bg-cyan-500/10 p-3 flex justify-between items-center">
              <div>
                <span className="text-cyan-300 font-bold text-sm tracking-wider">DIAMOND TIER</span>
                <p className="text-[11px] text-foreground/70 mt-0.5">Top Supreme Supporter, Badge Bersinar di Web & Role VIP Discord.</p>
              </div>
              <span className="font-display text-base text-cyan-300 shrink-0">Rp 1.000.000+</span>
            </div>

            <div className="border border-purple-400/50 bg-purple-500/10 p-3 flex justify-between items-center">
              <div>
                <span className="text-purple-300 font-bold text-sm tracking-wider">PLATINUM TIER</span>
                <p className="text-[11px] text-foreground/70 mt-0.5">Lencana VIP khusus di profil & Leaderboard Highlight.</p>
              </div>
              <span className="font-display text-base text-purple-300 shrink-0">Rp 500.000+</span>
            </div>

            <div className="border border-yellow-400/50 bg-yellow-500/10 p-3 flex justify-between items-center">
              <div>
                <span className="text-yellow-300 font-bold text-sm tracking-wider">GOLD TIER</span>
                <p className="text-[11px] text-foreground/70 mt-0.5">Nama tercantum di Leaderboard Top Donator & Role Discord.</p>
              </div>
              <span className="font-display text-base text-yellow-300 shrink-0">Rp 100.000+</span>
            </div>

            <div className="border border-slate-400/50 bg-slate-400/10 p-3 flex justify-between items-center">
              <div>
                <span className="text-slate-200 font-bold text-sm tracking-wider">SILVER TIER</span>
                <p className="text-[11px] text-foreground/70 mt-0.5">Tercantum di Leaderboard & Ucapan Terimakasih.</p>
              </div>
              <span className="font-display text-base text-slate-200 shrink-0">Rp 50.000+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
