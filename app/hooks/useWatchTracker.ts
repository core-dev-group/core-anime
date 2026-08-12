import { useState, useEffect, useRef } from "react";
import { doc, increment, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from "~/lib/firebase.client";
import { useAuth } from "./useAuth";

export function useWatchTracker(animeId: string) {
  const { profile } = useAuth();
  
  // Keep track of time locally before batch updating to Firestore to avoid too many writes
  const localSecondsRef = useRef(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    // If not logged in, do nothing
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
        localSecondsRef.current = 0; // Reset local counter

        try {
          const userRef = doc(db, "users", profile.uid);
          // Increment global watch time
          await updateDoc(userRef, {
            totalWatchTimeSeconds: increment(secondsToSync)
          });

          // Also keep track of watched anime and only count if watched for at least 15 mins (900s)
          const historyRef = doc(db, `users/${profile.uid}/history`, animeId);
          const historySnap = await getDoc(historyRef);
          
          if (!historySnap.exists()) {
            await setDoc(historyRef, { 
              animeId, 
              firstWatched: new Date().toISOString(),
              watchTimeSeconds: secondsToSync,
              isCounted: false
            });
          } else {
            const data = historySnap.data();
            const newWatchTime = (data.watchTimeSeconds || 0) + secondsToSync;
            const updates: any = { watchTimeSeconds: increment(secondsToSync) };
            
            // 900 seconds = 15 minutes. Threshold for "watched until the end"
            if (newWatchTime >= 900 && !data.isCounted) {
              updates.isCounted = true;
              
              // Increment global totalEpisodesWatched (which is actually Anime count)
              await updateDoc(userRef, {
                totalEpisodesWatched: increment(1)
              });
            }
            
            await updateDoc(historyRef, updates);
          }

        } catch (error) {
          console.error("Error syncing watch time", error);
          // Put seconds back if sync failed
          localSecondsRef.current += secondsToSync;
        }
      }
    }, 30000); // 30 seconds

    return () => {
      clearInterval(tracker);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [profile, animeId]);

  // Also sync when unmounting
  useEffect(() => {
    return () => {
      if (profile && localSecondsRef.current > 0) {
        const userRef = doc(db, "users", profile.uid);
        updateDoc(userRef, {
          totalWatchTimeSeconds: increment(localSecondsRef.current)
        }).catch(console.error);
      }
    };
  }, [profile]);
}
