import { useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  signOut,
  type User
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "~/lib/firebase.client";

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  isGuest: boolean;
  totalWatchTimeSeconds: number;
  totalEpisodesWatched: number;
  bookmarks?: any[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch or create user profile in Firestore
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setProfile(userSnap.data() as UserProfile);
        } else {
          // Create new profile
          const isGuest = currentUser.isAnonymous;
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || (isGuest ? "GUEST_" + currentUser.uid.substring(0, 5) : "Unknown User"),
            photoURL: currentUser.photoURL || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${currentUser.uid}`,
            isGuest,
            totalWatchTimeSeconds: 0,
            totalEpisodesWatched: 0
          };
          
          await setDoc(userRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const loginAsGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Error signing in anonymously", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return {
    user,
    profile,
    isLoading,
    loginWithGoogle,
    loginAsGuest,
    logout
  };
}
