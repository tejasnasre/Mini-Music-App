import { create } from "zustand";
import TrackPlayer from "@rntp/player";
import type { Track } from "@/types/track";
import { getPlaybackUrl } from "@/lib/api";

/** Convert our Track → RNTP MediaItem shape */
export function toMediaItem(track: Track) {
  return {
    mediaId: track.id,
    url: getPlaybackUrl(track.id),
    title: track.title,
    artist: track.artists.map((a) => a.name).join(", "),
    albumTitle: track.album,
    artworkUrl: track.cover_image,
    duration: track.duration,
  };
}

interface PlayerStore {
  /** Quick lookup: mediaId → full Track (covers, artists, etc.) */
  trackMap: Record<string, Track>;
  /** Ordered queue that mirrors what was sent to RNTP */
  queue: Track[];

  /**
   * Replace the RNTP queue with `trackList` and immediately start
   * playing `track` (defaults to index 0 if not found).
   */
  playTrack: (track: Track, trackList?: Track[]) => void;

  /** Toggle play / pause based on current RNTP state */
  togglePlay: () => void;
}

export const usePlayerStore = create<PlayerStore>()((set) => ({
  trackMap: {},
  queue: [],

  playTrack: (track, trackList) => {
    const list = trackList ?? [track];
    const startIndex = Math.max(
      list.findIndex((t) => t.id === track.id),
      0,
    );

    // Build id → Track map for the player screen to look up full details
    const map: Record<string, Track> = {};
    list.forEach((t) => {
      map[t.id] = t;
    });

    set({ trackMap: map, queue: list });

    // Tell RNTP about the new queue and start playback
    TrackPlayer.setMediaItems(list.map(toMediaItem), startIndex);
    TrackPlayer.play();
  },

  togglePlay: () => {
    if (TrackPlayer.isPlaying()) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  },
}));
