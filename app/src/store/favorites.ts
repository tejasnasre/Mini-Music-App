import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStorage } from "../lib/storage";
import type { Track } from "../types/track";

interface FavoritesState {
  tracks: Record<string, Track>;
  toggleFavorite: (track: Track) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      tracks: {},

      toggleFavorite: (track) => {
        const current = get().tracks;
        if (current[track.id]) {
          const next = { ...current };
          delete next[track.id];
          set({ tracks: next });
          return;
        }
        set({ tracks: { ...current, [track.id]: track } });
      },

      removeFavorite: (id) => {
        const next = { ...get().tracks };
        delete next[id];
        set({ tracks: next });
      },

      isFavorite: (id) => Boolean(get().tracks[id]),
    }),
    {
      name: "favorites-storage",
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
