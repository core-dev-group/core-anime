import type { Route } from "./+types/profile";
import { Link, useNavigate } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { useWatchHistory } from "~/hooks/useWatchHistory";
import { useState, useEffect } from "react";
import { useCallback } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth, db } from "~/lib/firebase.client";
import Cropper from 'react-easy-crop';
import getCroppedImg from '~/lib/cropImage';

export function meta() {
  return [
    { title: "Profil Pengguna - CoreAnime" },
    { name: "description", content: "Statistik menonton dan profil Anda." },
  ];
}

export default function ProfilePage() {
  const { profile, isLoading, logout } = useAuth();
  const { history, isLoaded: historyLoaded } = useWatchHistory();
  const navigate = useNavigate();
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  // Crop state
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    // If not loading and no profile, redirect to home
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

    // Use FileReader to convert image to data URL for the cropper
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setCropImageSrc(reader.result?.toString() || null);
    });
    reader.readAsDataURL(file);
    e.target.value = ''; // reset input so we can upload the same file again if needed
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSubmit = async () => {
    if (!cropImageSrc || !croppedAreaPixels || !profile || !auth.currentUser) return;

    setIsUploadingPhoto(true);
    setCropImageSrc(null); // Close modal

    try {
      const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Gagal memproses gambar crop.");

      const formData = new FormData();
      formData.append("file", croppedBlob, "profile.jpg");
      // Menggunakan "core_anime" sebagai nama Preset Unsigned. User harus membuatnya di Settings Cloudinary.
      formData.append("upload_preset", "core_anime"); 

      // Request ke REST API Cloudinary menggunakan nama cloud "rkmp4aiw"
      const response = await fetch("https://api.cloudinary.com/v1_1/rkmp4aiw/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        // Update ke Firebase Auth
        await updateProfile(auth.currentUser, { photoURL: data.secure_url });
        
        // Update ke Firestore Document
        const userRef = doc(db, "users", profile.uid);
        await updateDoc(userRef, { photoURL: data.secure_url });
        
        window.location.reload();
      } else {
        throw new Error(data.error?.message || "Gagal upload gambar ke server");
      }
    } catch (e: any) {
      console.error(e);
      alert("Gagal mengupload foto: " + e.message + "\n\nPastikan Anda sudah membuat Upload Preset bernama 'core_anime' dengan mode Unsigned di Cloudinary Settings.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile || !auth.currentUser) return;
    
    // Validasi kosong
    if (!editName.trim()) {
      alert("Username tidak boleh kosong!");
      return;
    }

    setIsSaving(true);
    try {
      // 0. Cek apakah username sudah ada yang pakai (Unique Username Check)
      // Kita melakukan query ke Firestore untuk mencari user dengan displayName yang sama
      if (editName !== profile.displayName) {
        const { collection, query, where, getDocs } = await import("firebase/firestore");
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("displayName", "==", editName));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Artinya ada dokumen dengan username tersebut
          setIsSaving(false);
          alert(`Username "${editName}" sudah digunakan oleh orang lain. Silakan pilih nama lain.`);
          return;
        }
      }

      // 1. Update Firebase Auth Profile
      await updateProfile(auth.currentUser, {
        displayName: editName
      });
      
      // 2. Update Firestore Document
      const userRef = doc(db, "users", profile.uid);
      await updateDoc(userRef, {
        displayName: editName
      });
      
      // Reload untuk memastikan data sinkron
      window.location.reload();
    } catch (e) {
      console.error("Failed to update profile", e);
      alert("Gagal menyimpan profil.");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 border-b-2 border-surface-soft pb-4 animate-fade-in-up">
          <Link to="/home" className="inline-block bg-surface text-foreground/70 hover:text-accent hover:border-accent transition-colors px-3 py-1 font-bold tracking-widest text-sm border-2 border-surface-soft mb-6">
            &laquo; KEMBALI KE BERANDA
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-4xl md:text-5xl font-display text-foreground uppercase tracking-widest flex items-center gap-4">
              PROFIL <span className="text-accent">SAYA</span>
            </h1>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-accent text-background px-4 py-2 font-display uppercase tracking-widest text-sm hover:bg-white transition-colors border border-accent shadow-[2px_2px_0px_rgba(255,59,59,0.5)]"
              >
                EDIT PROFIL
              </button>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-surface border-2 border-surface-soft p-6 md:p-10 relative shadow-[8px_8px_0px_rgba(46,78,78,0.5)] animate-fade-in-up animation-delay-100">
          <div className="absolute -top-3 left-4 bg-background px-2 flex items-center gap-2">
            <h3 className="text-xl font-display uppercase tracking-widest text-foreground">
              ID CARD
            </h3>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mt-4">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 border-4 border-accent p-1 relative group bg-surface-soft">
                <img src={profile.photoURL} alt={profile.displayName} className={`w-full h-full object-cover transition-all duration-300 ${isUploadingPhoto ? 'opacity-30' : ''}`} />
                <div className="absolute inset-0 crt-scanline pointer-events-none opacity-50"></div>
                {profile.isGuest && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-surface text-foreground text-[10px] font-mono font-bold px-2 py-0.5 border-2 border-surface-soft">
                    GUEST
                  </div>
                )}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
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
                    className="text-[10px] font-mono text-accent hover:text-white uppercase tracking-widest border border-accent hover:border-white px-2 py-1 transition-colors w-full pointer-events-none"
                  >
                    {isUploadingPhoto ? "MENGUNGGAH..." : "UBAH FOTO"}
                  </button>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 w-full text-center md:text-left">
              
              {isEditing ? (
                <div className="mb-4 text-left">
                  <label className="block text-[10px] font-mono text-foreground/70 uppercase tracking-widest mb-1">Username</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-surface-soft/20 border-2 border-surface-soft p-2 font-display text-2xl text-foreground focus:outline-none focus:border-accent uppercase tracking-wider"
                    maxLength={20}
                  />
                </div>
              ) : (
                <h2 className="font-display text-3xl md:text-4xl text-accent uppercase tracking-widest mb-1 truncate">
                  {profile.displayName}
                </h2>
              )}
              
              <p className="font-mono text-sm text-foreground/50 mb-6 font-bold tracking-widest uppercase">
                UID: {profile.uid.substring(0, 10)}...
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-surface-soft p-3 bg-surface-soft/20 flex flex-col justify-center">
                  <p className="font-mono text-[10px] text-foreground/70 uppercase tracking-widest mb-1">Judul Anime</p>
                  <p className="font-display text-2xl text-foreground">{historyLoaded ? history.length : '-'}</p>
                </div>
                <div className="border border-surface-soft p-3 bg-surface-soft/20 flex flex-col justify-center">
                  <p className="font-mono text-[10px] text-foreground/70 uppercase tracking-widest mb-1">Total Waktu</p>
                  <p className="font-display text-2xl text-foreground">
                    {(profile.totalWatchTimeSeconds / 3600).toFixed(1)} <span className="text-sm">JAM</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              {isEditing ? (
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving || !editName.trim()}
                    className="px-6 py-2 bg-accent text-white font-display uppercase tracking-widest text-sm hover:bg-accent/80 transition-colors border-2 border-accent w-full sm:w-auto disabled:opacity-50"
                  >
                    {isSaving ? "Menyimpan..." : "SIMPAN"}
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(profile.displayName);
                    }}
                    disabled={isSaving}
                    className="px-6 py-2 bg-surface text-foreground/70 font-display uppercase tracking-widest text-sm hover:text-white transition-colors border-2 border-surface-soft w-full sm:w-auto"
                  >
                    BATAL
                  </button>
                </div>
              ) : (
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => {
                      logout();
                      navigate("/home");
                    }}
                    className="px-6 py-2 bg-surface-soft/20 text-foreground/70 font-display uppercase tracking-widest text-sm hover:bg-surface-soft hover:text-white transition-all border-2 border-surface-soft w-full sm:w-auto text-center"
                  >
                    LOGOUT
                  </button>
                  {profile.isGuest && (
                    <p className="text-[10px] font-mono text-foreground/50 mt-2 sm:mt-0 sm:self-center">
                      *Akun tamu akan hilang jika Anda logout.
                    </p>
                  )}
                </div>
              )}

            </div>
          </div>
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
