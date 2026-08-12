import { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "~/lib/firebase.client";
import { useAuth } from "./useAuth";
import type { UnifiedAnime } from "~/lib/sankaClient";

const BOOKMARKS_KEY = "core_anime_bookmarks";

export function useBookmarks() {
  const { profile } = useAuth();
  const [bookmarks, setBookmarks] = useState<UnifiedAnime[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load bookmarks on mount and merge with Firestore if logged in
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      let localBookmarks: UnifiedAnime[] = [];
      if (stored) {
        localBookmarks = JSON.parse(stored);
      }

      if (profile) {
        // If logged in, merge Firestore bookmarks with local ones
        const firestoreBookmarks = profile.bookmarks || [];
        
        // Merge strategy: Unique items based on ID/Slug
        const mergedMap = new Map();
        [...localBookmarks, ...firestoreBookmarks].forEach(b => {
          const key = b.id || b.slug;
          if (key && !mergedMap.has(key)) {
            mergedMap.set(key, b);
          }
        });

        const mergedBookmarks = Array.from(mergedMap.values());
        setBookmarks(mergedBookmarks);
        
        // Update local storage to match the merged result
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(mergedBookmarks));
        
        // Sync the merged result back to Firestore if they differ
        if (firestoreBookmarks.length !== mergedBookmarks.length) {
          const userRef = doc(db, "users", profile.uid);
          updateDoc(userRef, { bookmarks: mergedBookmarks }).catch(console.error);
        }
      } else {
        // Just use local storage if not logged in
        setBookmarks(localBookmarks);
      }
    } catch (e) {
      console.error("Failed to parse bookmarks", e);
    }
    setIsLoaded(true);
  }, [profile]); // Re-run when profile changes (login/logout)

  const toggleBookmark = async (anime: UnifiedAnime) => {
    let newBookmarks: UnifiedAnime[] = [];
    
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === anime.id || b.slug === anime.slug);
      
      if (exists) {
        // Remove
        newBookmarks = prev.filter((b) => b.id !== anime.id && b.slug !== anime.slug);
      } else {
        // Add (at the beginning)
        newBookmarks = [anime, ...prev];
      }
      
      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
      } catch (e) {
        console.error("Failed to save bookmark locally", e);
      }
      
      return newBookmarks;
    });

    // If logged in, sync the new state to Firestore
    if (profile) {
      try {
        const userRef = doc(db, "users", profile.uid);
        // We update the entire array to match local state (handles both add and remove)
        await updateDoc(userRef, { bookmarks: newBookmarks });
      } catch (e) {
        console.error("Failed to sync bookmark to Firestore", e);
      }
    }
  };

  const isBookmarked = (animeIdOrSlug: string) => {
    return bookmarks.some((b) => b.id === animeIdOrSlug || b.slug === animeIdOrSlug);
  };

  return { bookmarks, toggleBookmark, isBookmarked, isLoaded };
}
