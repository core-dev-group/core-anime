import { Link } from "react-router";

export function meta() {
  return [
    { title: "Privacy Policy - CoreAnime" },
    { name: "description", content: "Kebijakan privasi dan data pengguna CoreAnime." },
  ];
}

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. PENGUMPULAN DATA",
      content: "Saat Anda menggunakan CoreAnime, kami secara transparan mengumpulkan beberapa jenis informasi. Jika Anda login melalui otentikasi Google (Firebase Auth), kami menyimpan alamat email, nama profil, dan foto Anda. Kami juga mencatat aktivitas teknis seperti episode anime yang di-bookmark dan total waktu tontonan Anda ke dalam database cloud kami."
    },
    {
      title: "2. PENGGUNAAN INFORMASI",
      content: "Informasi yang kami kumpulkan dipergunakan secara eksklusif untuk operasional Situs. Data Anda dimanfaatkan untuk menyalakan fitur pelacakan episode, sistem Leaderboard (Papan Peringkat), serta melakukan sinkronisasi otomatis daftar Bookmark Anda lintas perangkat. Kami juga memanfaatkan log analitik untuk mendeteksi error dan menyempurnakan performa server."
    },
    {
      title: "3. PENYIMPANAN LOKAL & COOKIE",
      content: "Alih-alih menggunakan cookie pelacakan invasif, arsitektur kami mengutamakan teknologi Local Storage pada browser Anda. Sistem ini menyimpan pengaturan interface (seperti preferensi resolusi, mode server fallback) dan daftar Bookmark sementara jika Anda memilih untuk tidak membuat akun (Guest Mode)."
    },
    {
      title: "4. KEAMANAN & PRIVASI MUTLAK",
      content: "Kami TIDAK PERNAH menjual, menyewakan, atau mendistribusikan informasi pribadi Anda kepada agensi periklanan atau pihak ketiga mana pun. Infrastruktur kami dilindungi oleh keamanan enkripsi standar industri milik Google Firebase Cloud Services."
    },
    {
      title: "5. KENDALI DI TANGAN ANDA",
      content: "Anda adalah pemilik sah dari data Anda. Anda memiliki hak penuh untuk meminta penghapusan akun serta pembersihan seluruh jejak digital (Bookmark & Jam Tayang) yang terkait dengan profil Anda kapan saja."
    },
    {
      title: "6. SITUS PIHAK KETIGA",
      content: "Situs ini mengandung iframe dan video player yang ditarik dari server pihak ketiga. Jika Anda berinteraksi dengan pemutar video tersebut, Anda akan tunduk pada Kebijakan Privasi milik layanan eksternal tersebut, yang berada di luar yurisdiksi dan kendali CoreAnime."
    }
  ];

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 min-h-screen mt-16 md:mt-20 text-foreground">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 border-b-2 border-surface-soft pb-4 animate-fade-in-up">
          <Link to="/home" className="inline-block bg-surface text-foreground/70 hover:text-accent hover:border-accent transition-colors px-3 py-1 font-bold tracking-widest text-sm border-2 border-surface-soft mb-6">
            &laquo; KEMBALI KE BERANDA
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-6xl font-display text-foreground uppercase tracking-widest">
              PRIVACY <span className="text-accent">POLICY</span>
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

        {/* System Logs Visual Element (Just for aesthetics) */}
        <div className="mt-12 bg-black border border-surface-soft p-4 font-mono text-[10px] text-accent/50 uppercase flex flex-col gap-1 overflow-hidden animate-fade-in-up animation-delay-200">
          <p>{`> [SYS] INITIALIZING PRIVACY PROTOCOL... OK`}</p>
          <p>{`> [SYS] ENCRYPTING USER DATASTREAM... SUCCESS`}</p>
          <p className="text-accent/80">{`> [SYS] YOUR SECRETS ARE SAFE WITH COREANIME.`}</p>
        </div>

      </div>
    </div>
  );
}
