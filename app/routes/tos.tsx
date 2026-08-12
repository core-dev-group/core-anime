import { Link } from "react-router";

export function meta() {
  return [
    { title: "Terms of Service - CoreAnime" },
    { name: "description", content: "Syarat dan ketentuan layanan CoreAnime." },
  ];
}

export default function TosPage() {
  const sections = [
    {
      title: "1. PENERIMAAN SYARAT",
      content: "Dengan mengakses dan menggunakan CoreAnime (\"Situs\", \"Layanan\", \"kami\"), Anda menyetujui untuk terikat oleh Syarat dan Ketentuan Layanan (TOS) ini. Jika Anda tidak setuju dengan syarat ini, harap segera tinggalkan dan jangan gunakan Situs kami."
    },
    {
      title: "2. SIFAT LAYANAN (DISCLAIMER PENTING)",
      content: "CoreAnime adalah mesin pencari dan agregator video pihak ketiga. Kami TIDAK meng-host, menyimpan, menyiarkan, atau mendistribusikan file video atau media apa pun di server kami sendiri. Semua video dan media yang tersedia melalui Situs kami disimpan pada server pihak ketiga yang sama sekali tidak terafiliasi dengan kami. CoreAnime hanya menyediakan tautan dan iframe pemutar video. Kami tidak bertanggung jawab atas legalitas, keakuratan, atau masalah hak cipta dari situs penyedia pihak ketiga tersebut."
    },
    {
      title: "3. AKUN PENGGUNA",
      content: "Sistem kami mengizinkan pembuatan akun untuk menyimpan preferensi (Bookmark & Waktu Tonton). Anda bertanggung jawab penuh atas keamanan akun Anda. Jika Anda memilih masuk sebagai Tamu (Guest), sistem tidak menjamin data Anda akan tersimpan secara permanen dan dapat hilang kapan saja setelah sesi penjelajahan berakhir."
    },
    {
      title: "4. HAK CIPTA & DMCA",
      content: "Karena kami tidak menyimpan file berhak cipta apa pun, kami tidak dapat secara langsung menghapus konten dari web. Namun, kami sangat menghormati Hak Kekayaan Intelektual. Jika Anda adalah pemilik hak cipta dan menemukan konten yang melanggar disematkan (di-embed) di Situs kami, silakan hubungi kami agar kami dapat menghapus tautan tersebut dari indeks direktori kami."
    },
    {
      title: "5. BATASAN TANGGUNG JAWAB",
      content: "Dalam kondisi apa pun, CoreAnime beserta seluruh tim pengembang (Core Dev Group) tidak dapat dituntut atau dimintai pertanggungjawaban atas kerugian langsung maupun tidak langsung, insidental, atau konsekuensial yang timbul akibat penggunaan atau ketidakmampuan menggunakan Layanan kami."
    }
  ];

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 min-h-screen text-foreground">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 border-b-2 border-surface-soft pb-4 animate-fade-in-up">
          <Link to="/home" className="inline-block bg-surface text-foreground/70 hover:text-accent hover:border-accent transition-colors px-3 py-1 font-bold tracking-widest text-sm border-2 border-surface-soft mb-6">
            &laquo; KEMBALI KE BERANDA
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-6xl font-display text-foreground uppercase tracking-widest">
              TERMS OF <span className="text-accent">SERVICE</span>
            </h1>
            <p className="font-mono text-sm text-foreground/50 tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-accent inline-block animate-pulse"></span>
              Pembaruan Terakhir: {new Date().toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-6 animate-fade-in-up animation-delay-100">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-surface border-2 border-surface-soft p-6 md:p-8 relative group hover:border-accent transition-colors duration-300">
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-accent opacity-0 group-hover:opacity-100 transition-opacity -translate-x-[2px] -translate-y-[2px]"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-accent opacity-0 group-hover:opacity-100 transition-opacity translate-x-[2px] translate-y-[2px]"></div>
              <div className="absolute inset-0 crt-scanline opacity-10 pointer-events-none"></div>

              <h2 className="text-xl md:text-2xl font-display text-accent uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-surface-soft text-3xl font-black opacity-30">{String(idx + 1).padStart(2, '0')}</span>
                {section.title.split('. ')[1]}
              </h2>
              
              <p className="font-mono text-sm md:text-base leading-relaxed text-foreground/80 tracking-wide text-justify">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Warning */}
        <div className="mt-12 bg-accent/10 border border-accent p-6 text-center animate-fade-in-up animation-delay-200">
          <p className="font-mono text-xs md:text-sm text-accent uppercase tracking-widest font-bold">
            Dengan tetap berada di situs ini, Anda otomatis menyatakan setuju dengan seluruh persyaratan di atas.
          </p>
        </div>

      </div>
    </div>
  );
}
