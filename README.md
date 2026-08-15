# CoreAnime Database 📺

<div align="center">
  <h3>Portal Informasi, Indeks Episode, dan Database Anime Subtitle Indonesia Terlengkap</h3>
  <p>Dibangun menggunakan <strong>React Router v7</strong> dengan tema desain <i>Retro / CRT / Broadcast</i> yang estetik dan premium.</p>
  <br />
  <p>
    <strong>🔗 Live Demo: <a href="https://core-anime.my.id">core-anime.my.id</a></strong>
  </p>
  <p>
    Sebuah proyek persembahan dari <strong><a href="https://core-dev-group.my.id">Core Dev Group</a></strong>
  </p>
</div>

---

## 🚀 Fitur Utama

- ⚡ **Performa Kilat (SSR & CSR)**: Dibangun dengan teknologi web terbaru **React Router v7** (sebelumnya Remix) yang mendukung Server-Side Rendering untuk *loading* instan dan navigasi super cepat.
- 🎨 **Desain Retro yang Ikonik**: Mengusung UI/UX bertema *Broadcast Retro*, lengkap dengan estetika gelap, elemen merah *(crimson red)*, animasi *scanline* CRT, dan gaya ala monitor komputer klasik yang *sleek*.
- 🗂️ **Database Lengkap & Integrasi API Eksternal**:
  - **Jikan API (MyAnimeList)**: Mengambil data karakter, *voice actor* (Seiyuu), skor, dan statistik mendalam.
  - **AniList API**: Menampilkan *banner* kualitas tinggi dan *trailer* video resmi.
  - **Sanka API**: Sebagai agregator data indeks episode dan metadata tayangan (*scraper* pintar).
- 🔐 **Sistem Autentikasi (Google Login)**: Sinkronisasi akun yang mulus menggunakan Firebase Auth.
- 🕒 **Pelacak Riwayat (Watch Tracker)**: Sistem akan otomatis menyimpan episode terakhir yang Anda tonton secara *real-time* ke *database*, sehingga riwayat tontonan tidak akan hilang walau berganti perangkat.
- 🔖 **Bookmark System**: Simpan anime favorit Anda ke dalam daftar khusus.
- 🏆 **Leaderboard Interaktif**: Papan peringkat otomatis (Berdasarkan jumlah episode dan durasi menonton) untuk anggota komunitas yang paling aktif.
- 🛡️ **Penanganan CSP (Content Security Policy) Dinamis**: Mampu mengelola dan menghindari isu pemblokiran *iframe* (CSP) dari berbagai server pihak ketiga secara elegan dengan memberikan jalur alternatif bagi pengguna.

## 🛠️ Tech Stack & Arsitektur

Proyek ini dibangun di atas fondasi teknologi modern tingkat produksi:

- **Frontend & Framework**: [React Router v7](https://reactrouter.com/) (berbasis Vite)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database (Relasional)**: [Prisma ORM](https://www.prisma.io/) terhubung ke PostgreSQL (Supabase)
- **Database & Auth (Real-time)**: [Firebase Firestore & Firebase Auth](https://firebase.google.com/)
- **Deployment**: [Vercel](https://vercel.com/) (Serverless Edge Functions)

## 📦 Panduan Instalasi Lokal

Ingin menjalankan proyek ini di komputer Anda sendiri? Ikuti langkah-langkah berikut:

1. **Clone repository ini**
   ```bash
   git clone https://github.com/kodel-dev/core-anime.git
   cd core-anime
   ```

2. **Install semua dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   Buat file `.env` di *root directory* dan masukkan konfigurasi *database* Prisma Anda:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"
   ```

4. **Konfigurasi Firebase**
   Copy semua konfigurasi Firebase dari [console.firebase.google.com](https://console.firebase.google.com) > Project Settings > Your Apps ke file `.env`, ikuti format di `.env.example`. **Jangan hardcode key ke dalam source code.**

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

6. **Jalankan server pengembangan (Development)**
   ```bash
   npm run dev
   ```

7. Buka `http://localhost:5173` di browser Anda!

## 🤖 Praktik SEO & Keamanan

Aplikasi ini telah mematuhi standar SEO terbaru dan didesain untuk menghindari *flagging* otomatis (sebagai situs bajakan) oleh mesin pencari AI. Penggunaan *metadata* difokuskan pada kata kunci "Database Anime", "Komunitas", dan "Indeks Episode" untuk memastikan reputasi situs tetap aman dan diindeks secara positif oleh Google. Aplikasi ini juga telah dilengkapi dengan halaman perlindungan hukum seperti **Privacy Policy** dan **DMCA**.

## 👥 Tentang Core Dev Group

**CoreAnime** merupakan bagian dari inisiatif eksplorasi sumber terbuka (open-source) oleh **Core Dev Group**. Kami adalah kumpulan pengembang yang berfokus pada eksplorasi dan pengembangan teknologi web modern dengan performa tinggi dan desain inovatif.

- 🌐 Kunjungi situs web kami: [core-dev-group.my.id](https://core-dev-group.my.id)
- 💻 Jelajahi proyek kami lainnya di GitHub: [github.com/core-dev-group](https://github.com/core-dev-group)

---
*Dibangun dengan dedikasi penuh 🔥 oleh Core Dev Group.*
