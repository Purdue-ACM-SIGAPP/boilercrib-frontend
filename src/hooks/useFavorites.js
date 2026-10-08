import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "favoriteBuildingIds";

/**
 * Favorite building ids, saved on the device so they survive app restarts.
 * `favorites` is a Set; `toggleFavorite(id)` adds or removes one.
 */
export default function useFavorites() {
  const [favorites, setFavorites] = useState(() => new Set());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => saved && setFavorites(new Set(JSON.parse(saved))))
      .catch(() => {}); // Unreadable storage just means no favorites yet.
  }, []);

  const toggleFavorite = useCallback((id) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next])).catch(() => {});
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}
