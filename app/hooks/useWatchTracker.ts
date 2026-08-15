import { useState, useEffect, useRef } from "react";
import { doc, increment, updateDoc, setDoc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "~/lib/firebase.client";
import { useAuth } from "./useAuth";

export function useWatchTracker(animeId: string) {
  const { profile } = useAuth();

  // Keep track of time locally before batch updating to Firestore to avoid too many writes
  const localSecondsRef = useRef(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  // Sync accumulated seconds to Firestore secara atomic
  const syncToFirestore = async (seconds: number, uid: string) => {
    if (seconds <= 0) return;

    const userRef = doc(db, "users", uid);
    const historyRef = doc(db, `users/${uid}/history`, animeId);

    try {
      // Increment global watch time
      await updateDoc(userRef, {
        totalWatchTimeSeconds: increment(seconds)
      });

      // Atomic read+write untuk history agar tidak race condition antar tab
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(historyRef);
        if (!snap.exists()) {
          tx.set(historyRef, {
            animeId,
            firstWatched: new Date().toISOString(),
            watchTimeSeconds: seconds,
            isCounted: false
          });
        } else {
          const data = snap.data();
          const newWatchTime = (data.watchTimeSeconds || 0) + seconds;
          const updates: Record<string, any> = { watchTimeSeconds: increment(seconds) };

          // 900 seconds = 15 minutes threshold
          if (newWatchTime >= 900 && !data.isCounted) {
            updates.isCounted = true;
            // Increment episode count outside transaction (best-effort, minor race ok)
            updateDoc(userRef, { totalEpisodesWatched: increment(1) }).catch(console.error);
          }
          tx.update(historyRef, updates);
        }
      });
    } catch (error) {
      console.error("Error syncing watch time", error);
      // Kembalikan detik yang gagal sync
      localSecondsRef.current += seconds;
    }
  };

  useEffect(() => {
    if (!profile || !animeId) return;

    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Increment local counter every second if visible
    const tracker = setInterval(() => {
      if (isVisibleRef.current) {
        localSecondsRef.current += 1;
      }
    }, 1000);

    // Sync to Firestore every 30 seconds
    syncIntervalRef.current = setInterval(async () => {
      if (localSecondsRef.current > 0) {
        const secondsToSync = localSecondsRef.current;
        localSecondsRef.current = 0;
        await syncToFirestore(secondsToSync, profile.uid);
      }
    }, 30000);

    return () => {
      clearInterval(tracker);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // ponytail: syncToFirestore tidak di-include deps agar tidak re-create interval; fn referensi stabil karena tidak pakai closure mutable
  }, [profile, animeId]);

  // Sync sisa detik saat unmount (best-effort, tidak bisa await di React cleanup)
  useEffect(() => {
    return () => {
      if (profile && localSecondsRef.current > 0) {
        const seconds = localSecondsRef.current;
        localSecondsRef.current = 0;
        syncToFirestore(seconds, profile.uid).catch(console.error);
      }
    };
  }, [profile]);
}
