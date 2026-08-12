import { useState, useEffect } from 'react';

export interface WatchHistoryItem {
  animeId: string;
  episodeId: string;
  title: string;
  episodeNum: number | string;
  thumbnail: string;
  progress: number; // percentage 0-100
  timestamp: number;
}

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('core_anime_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse watch history from local storage", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever history changes, but only after initial load
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('core_anime_history', JSON.stringify(history));
    }
  }, [history, isLoaded]);

  const addToHistory = (item: Omit<WatchHistoryItem, 'timestamp'>) => {
    setHistory((prev) => {
      // Remove if already exists so we can move it to front
      const filtered = prev.filter(i => i.animeId !== item.animeId);
      
      const newItem: WatchHistoryItem = {
        ...item,
        timestamp: Date.now()
      };
      
      return [newItem, ...filtered].slice(0, 20); // Keep last 20
    });
  };

  const removeFromHistory = (animeId: string) => {
    setHistory(prev => prev.filter(i => i.animeId !== animeId));
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    isLoaded
  };
}
