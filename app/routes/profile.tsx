import type { Route } from "./+types/profile";
import { Link, useNavigate } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { useWatchHistory } from "~/hooks/useWatchHistory";
import { useBookmarks } from "~/hooks/useBookmarks";
import { useState, useEffect, useCallback } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth, db } from "~/lib/firebase";
import Cropper from 'react-easy-crop';
import getCroppedImg from '~/lib/cropImage';

export function meta() {
  return [
    { title: "Profil Pengguna - CoreAnime" },
    { name: "description", content: "Statistik menonton dan kartu anggota CoreAnime Anda." },
  ];
}

export default function ProfilePage() {
  const { profile, isLoading, logout, linkWithGoogle } = useAuth();
  const { history, isLoaded: historyLoaded } = useWatchHistory();
  const { bookmarks, isLoaded: bookmarksLoaded } = useBookmarks();
  const navigate = useNavigate();

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);

  // Crop state
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (!isLoading && !profile) {
      navigate("/home");
    }
    if (profile) {
      setEditName(profile.displayName);
    }
  }, [profile, isLoading, navigate]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile || !auth.currentUser) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setCropImageSrc(reader.result?.toString() || null);
    });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSubmit = async () => {
    if (!cropImageSrc || !croppedAreaPixels || !profile || !auth.currentUser) return;

    setIsUploadingPhoto(true);
    setCropImageSrc(null);

    try {
      const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Gagal memproses gambar crop.");

      const formData = new FormData();
      formData.append("file", croppedBlob, "profile.jpg");
      formData.append("upload_preset", "core_anime");

      const response = await fetch("https://api.cloudinary.com/v1_1/rkmp4aiw/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        await updateProfile(auth.currentUser, { photoURL: data.secure_url });
        const userRef = doc(db, "users", profile.uid);
        await updateDoc(userRef, { photoURL: data.secure_url });
        window.location.reload();
      } else {
        throw new Error(data.error?.message || "Gagal upload gambar ke server");
      }
    } catch (e: any) {
      console.error(e);
      alert("Gagal mengupload foto: " + e.message + "\n\nPastikan preset Cloudinary 'core_anime' sudah dibuat mode Unsigned.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile || !auth.currentUser) return;

    const sanitized = editName.trim().toLowerCase();
    const asciiOnly = sanitized.replace(/[^a-z0-9]/g, "");
    if (!asciiOnly || asciiOnly.length < 3 || asciiOnly.length > 20 || asciiOnly !== sanitized) {
      alert("Username hanya boleh huruf a-z, angka, 3-20 karakter, tanpa spasi/karakter aneh.");
      return;
    }

    setIsSaving(true);
    try {
      const normalizedName = editName.trim().toLowerCase();
      if (normalizedName !== profile.displayName.toLowerCase()) {
        const { collection, query, where, getDocs } = await import("firebase/firestore");
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("displayName", "==", normalizedName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setIsSaving(false);
          alert(`Username "${normalizedName}" sudah digunakan orang lain.`);
          return;
        }
      }

      await updateProfile(auth.currentUser, {
        displayName: editName.trim().toLowerCase()
      });

      const userRef = doc(db, "users", profile.uid);
      await updateDoc(userRef, {
        displayName: editName.trim().toLowerCase()
      });

      window.location.reload();
    } catch (e) {
      console.error("Failed to update profile", e);
      alert("Gagal menyimpan profil.");
      setIsSaving(false);
    }
  };

  const copyUid = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleLinkGoogle = async () => {
    setIsLinkingGoogle(true);
    await linkWithGoogle();
    setIsLinkingGoogle(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return null;

  // Calculate Rank Title
  const watchHours = profile.totalWatchTimeSeconds ? profile.totalWatchTimeSeconds / 3600 : 0;
  let rankTitle = "NOVICE WATCHER";
  let rankColor = "text-foreground/70 border-surface-soft bg-surface-soft/20";
  if (watchHours >= 50) {
    rankTitle = "LEGENDARY SENSEI";
    rankColor = "text-yellow-400 border-yellow-400/50 bg-yellow-500/10 shadow-[0_0_8px_rgba(234,179,8,0.3)]";
  } else if (watchHours >= 20) {
    rankTitle = "HARDCORE OTAKU";
    rankColor = "text-purple-400 border-purple-400/50 bg-purple-500/10 shadow-[0_0_8px_rgba(168,85,247,0.3)]";
  } else if (watchHours >= 5) {
    rankTitle = "ANIME ENTHUSIAST";
    rankColor = "text-cyan-400 border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_8px_rgba(6,182,212,0.3)]";
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 min-h-screen">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8 border-b-2 border-surface-soft pb-4 animate-fade-in-up">
          <Link to="/home" className="inline-block bg-surface text-foreground/70 hover:text-accent hover:border-accent transition-colors px-3 py-1 font-bold tracking-widest text-xs border-2 border-surface-soft mb-6">
            &laquo; KEMBALI KE BERANDA
          </Link>
          <div className="flex justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-display text-foreground uppercase tracking-widest">
                KARTU <span className="text-accent">MEMBER</span>
              </h1>
              <p className="font-mono text-xs text-foreground/60 mt-1">
                Data resmi anggota & rekapan waktu tonton.
              </p>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-accent text-background px-4 py-2 font-display uppercase tracking-widest text-xs md:text-sm hover:bg-white transition-all border border-accent shadow-[3px_3px_0px_rgba(255,59,59,0.5)] shrink-0"
              >
                EDIT PROFIL
              </button>
            )}
          </div>
        </div>

        {/* Cyber / Retro ID Card */}
        <div className="bg-surface border-2 border-surface-soft p-6 md:p-8 relative shadow-[8px_8px_0px_rgba(46,78,78,0.5)] animate-fade-in-up animation-delay-100">

          {/* Card Top Header / Chip & Status */}
          <div className="flex items-center justify-between border-b-2 border-surface-soft pb-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-5 border border-accent-2 bg-accent-2/20 flex items-center justify-center font-mono text-[8px] font-bold text-accent-2">
                CHIP
              </div>
              <span className="font-mono text-[10px] font-bold text-foreground/60 tracking-widest">
                COREANIME PASS v7.0
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 border ${
                profile.isGuest
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
              }`}>
                {profile.isGuest ? '● GUEST PASS' : '● VERIFIED MEMBER'}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Retro Avatar Frame */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="relative">
                {/* Corner brackets */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-accent z-10 pointer-events-none"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-accent z-10 pointer-events-none"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-accent z-10 pointer-events-none"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-accent z-10 pointer-events-none"></div>

                <div className="w-32 h-32 md:w-36 md:h-36 border-2 border-surface-soft bg-background p-1 relative group overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,0.6)]">
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className={`w-full h-full object-cover transition-all duration-300 ${isUploadingPhoto ? 'opacity-30' : ''}`}
                  />
                  <div className="absolute inset-0 crt-scanline pointer-events-none opacity-40"></div>

                  {isUploadingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="relative w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <button
                    disabled={isUploadingPhoto}
                    className="text-[10px] font-mono text-accent hover:text-white uppercase tracking-widest border border-accent hover:border-white px-2 py-1 transition-colors w-full pointer-events-none bg-accent/10"
                  >
                    {isUploadingPhoto ? "MENGUNGGAH..." : "UBAH FOTO"}
                  </button>
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="flex-1 w-full text-center md:text-left min-w-0">

              {isEditing ? (
                <div className="mb-4 text-left">
                  <label className="block text-[10px] font-mono text-foreground/70 uppercase tracking-widest mb-1">
                    Ganti Username
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-background border-2 border-surface-soft p-2 font-display text-2xl text-foreground focus:outline-none focus:border-accent uppercase tracking-wider"
                    maxLength={20}
                  />
                </div>
              ) : (
                <div className="mb-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                    <h2 className="font-display text-3xl md:text-4xl text-accent uppercase tracking-widest truncate">
                      {profile.displayName}
                    </h2>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 border self-center md:self-auto uppercase tracking-wider ${rankColor}`}>
                      {rankTitle}
                    </span>
                  </div>
                </div>
              )}

              {/* UID Box with Click-to-Copy */}
              <div className="inline-flex items-center gap-2 bg-background border border-surface-soft px-2.5 py-1 mb-5">
                <span className="font-mono text-xs text-foreground/60 tracking-wider">
                  UID: <span className="text-foreground/90">{profile.uid.substring(0, 14)}...</span>
                </span>
                <button
                  onClick={copyUid}
                  className="text-[10px] font-mono text-accent hover:text-white uppercase tracking-wider transition-colors ml-1 font-bold"
                  title="Salin UID Lengkap"
                >
                  {copiedUid ? "✓ TERSALIN" : "[SALIN]"}
                </button>
              </div>

              {/* 4-Box Retro Stats Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="border border-surface-soft p-2.5 bg-background shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
                  <p className="font-mono text-[9px] text-foreground/60 uppercase tracking-wider mb-0.5">Total Waktu</p>
                  <p className="font-display text-xl text-accent-2">
                    {watchHours.toFixed(1)} <span className="text-xs font-mono text-foreground/60">JAM</span>
                  </p>
                </div>

                <div className="border border-surface-soft p-2.5 bg-background shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
                  <p className="font-mono text-[9px] text-foreground/60 uppercase tracking-wider mb-0.5">Episode Ditonton</p>
                  <p className="font-display text-xl text-foreground">
                    {profile.totalEpisodesWatched || 0} <span className="text-xs font-mono text-foreground/60">EPS</span>
                  </p>
                </div>

                <div className="border border-surface-soft p-2.5 bg-background shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
                  <p className="font-mono text-[9px] text-foreground/60 uppercase tracking-wider mb-0.5">Riwayat Anime</p>
                  <p className="font-display text-xl text-foreground">
                    {historyLoaded ? history.length : '-'} <span className="text-xs font-mono text-foreground/60">JUDUL</span>
                  </p>
                </div>

                <div className="border border-surface-soft p-2.5 bg-background shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
                  <p className="font-mono text-[9px] text-foreground/60 uppercase tracking-wider mb-0.5">Disimpan</p>
                  <p className="font-display text-xl text-foreground">
                    {bookmarksLoaded ? bookmarks.length : '-'} <span className="text-xs font-mono text-foreground/60">BOOKMARK</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              {isEditing ? (
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving || !editName.trim()}
                    className="px-6 py-2 bg-accent text-white font-display uppercase tracking-widest text-xs hover:bg-accent/80 transition-colors border-2 border-accent w-full sm:w-auto disabled:opacity-50 shadow-[2px_2px_0px_rgba(255,59,59,0.5)]"
                  >
                    {isSaving ? "Menyimpan..." : "SIMPAN"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(profile.displayName);
                    }}
                    disabled={isSaving}
                    className="px-6 py-2 bg-surface text-foreground/70 font-display uppercase tracking-widest text-xs hover:text-white transition-colors border-2 border-surface-soft w-full sm:w-auto"
                  >
                    BATAL
                  </button>
                </div>
              ) : (
                <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center">
                  <button
                    onClick={() => {
                      logout();
                      navigate("/home");
                    }}
                    className="px-6 py-2 bg-surface-soft/20 text-foreground/70 font-display uppercase tracking-widest text-xs hover:bg-surface-soft hover:text-white transition-all border-2 border-surface-soft w-full sm:w-auto text-center"
                  >
                    LOGOUT
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Guest Warning & Link Account Banner */}
          {profile.isGuest && !isEditing && (
            <div className="mt-6 border-2 border-accent/60 bg-accent/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="font-mono text-xs text-foreground/80">
                <span className="font-bold text-accent">PERINGATAN AKUN TAMU:</span> Statistik & bookmark Anda akan hilang jika ganti browser atau logout.
              </div>
              <button
                onClick={handleLinkGoogle}
                disabled={isLinkingGoogle}
                className="shrink-0 px-4 py-2 bg-white text-black font-display uppercase tracking-wider text-xs border border-white hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_rgba(255,255,255,0.4)]"
              >
                {isLinkingGoogle ? "MENAUTKAN..." : "TAUTKAN DENGAN GOOGLE"}
              </button>
            </div>
          )}
        </div>

        {/* Crop Modal */}
        {cropImageSrc && (
          <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border-2 border-accent p-4 md:p-6 w-full max-w-xl shadow-[8px_8px_0px_rgba(255,59,59,0.5)] flex flex-col">
              <h3 className="text-xl font-display uppercase tracking-widest text-foreground mb-4">
                Sesuaikan Foto Profil
              </h3>

              <div className="relative w-full h-[300px] md:h-[400px] bg-black mb-6 shrink-0 border border-surface-soft">
                <Cropper
                  image={cropImageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <div className="flex gap-4 justify-end mt-auto">
                <button
                  onClick={() => {
                    setCropImageSrc(null);
                    setZoom(1);
                  }}
                  className="px-6 py-2 bg-surface-soft text-foreground font-display uppercase tracking-widest text-sm hover:bg-surface-soft/80 transition-colors border border-transparent"
                >
                  BATAL
                </button>
                <button
                  onClick={handleCropSubmit}
                  className="px-6 py-2 bg-accent text-white font-display uppercase tracking-widest text-sm hover:bg-accent/80 transition-colors border-2 border-accent"
                >
                  CROP & SIMPAN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
