import { create } from "zustand";
import TrackPlayer from "@rntp/player";
import type { Track } from "@/types/track";
// getHlsPlaybackUrl removed — we now use track.audio.hls_url directly

/** Convert our Track → RNTP MediaItem shape with HLS streaming */
export function toMediaItem(track: Track) {
  // Prefer the HLS URL returned by the API; fall back to the direct stream URL.
  // Never construct a speculative HLS URL — if the API says hls_url is null,
  // the backend does not serve HLS for this track.
  const hlsUrl = track.audio.hls_url;
  const streamUrl = track.audio.stream_url;
  const url = hlsUrl ?? streamUrl;
  const isHls = Boolean(hlsUrl);

  return {
    mediaId: track.id,
    url,
    ...(isHls && { type: "hls", mimeType: "application/x-mpegURL" }),
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
  /** The track that should be playing (set when playTrack is called) */
  currentTrack: Track | null;

  /**
   * Replace the RNTP queue with `trackList` and immediately start
   * playing `track` (defaults to index 0 if not found).
   */
  playTrack: (track: Track, trackList?: Track[]) => Promise<void>;

  /** Toggle play / pause based on current RNTP state */
  togglePlay: () => Promise<void>;

  /** Skip to next track with error handling */
  skipToNext: () => Promise<void>;

  /** Skip to previous track with error handling */
  skipToPrevious: () => Promise<void>;
}

export const usePlayerStore = create<PlayerStore>()((set, get) => ({
  trackMap: {},
  queue: [],
  currentTrack: null,

  playTrack: async (track, trackList) => {
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

    console.log(
      "[Player] Playing track:",
      track.id,
      "at index:",
      startIndex,
      "Queue size:",
      list.length,
    );

    // Surface HLS vs stream fallback decision for each queued item
    list.forEach((t) => {
      const hlsUrl = t.audio.hls_url;
      console.log(
        `[Player] ${t.id}: ${hlsUrl ? `HLS → ${hlsUrl}` : `stream → ${t.audio.stream_url}`}`,
      );
    });

    set({ trackMap: map, queue: list, currentTrack: track });

    // Tell RNTP about the new queue and start playback
    const mediaItems = list.map(toMediaItem);
    console.log(
      "[Player] Setting media items with URL:",
      mediaItems[startIndex]?.url,
    );

    try {
      // setMediaItems clears the queue, loads all items, and sets the active
      // item to startIndex in a single native call. Do NOT call skipToIndex
      // afterwards — it races with setMediaItems on the native thread and can
      // leave the queue in an empty/undefined state (seen as queue length 0).
      TrackPlayer.setMediaItems(mediaItems, startIndex);
      console.log("[Player] setMediaItems called, startIndex:", startIndex);

      await TrackPlayer.play();
      console.log("[Player] Play command sent");
    } catch (err: unknown) {
      console.error(
        "[Player] Error:",
        err instanceof Error ? err.message : String(err),
      );
    }
  },

  togglePlay: async () => {
    try {
      const isPlaying = TrackPlayer.isPlaying();
      console.log("[Player] Current playing state:", isPlaying);

      if (isPlaying) {
        console.log("[Player] Pausing...");
        await TrackPlayer.pause();
        console.log("[Player] Paused successfully");
      } else {
        console.log("[Player] Playing...");
        await TrackPlayer.play();
        console.log("[Player] Playing successfully");
      }
    } catch (err: unknown) {
      console.error(
        "[Player] togglePlay error:",
        err instanceof Error ? err.message : String(err),
      );
    }
  },

  skipToNext: async () => {
    try {
      const currentQueue = TrackPlayer.getQueue();
      const activeMediaItem = TrackPlayer.getActiveMediaItem();
      const currentIndex = activeMediaItem
        ? currentQueue.findIndex(
            (item) => item.mediaId === activeMediaItem.mediaId,
          )
        : -1;
      console.log(
        "[Player] skipToNext - current index:",
        currentIndex,
        "queue length:",
        currentQueue.length,
      );

      if (currentIndex < currentQueue.length - 1) {
        await TrackPlayer.skipToNext();
        console.log("[Player] Skipped to next successfully");
      } else {
        console.warn("[Player] Already at the end of queue");
      }
    } catch (err: unknown) {
      console.error(
        "[Player] skipToNext error:",
        err instanceof Error ? err.message : String(err),
      );
    }
  },

  skipToPrevious: async () => {
    try {
      const activeMediaItem = TrackPlayer.getActiveMediaItem();
      const currentQueue = TrackPlayer.getQueue();
      const currentIndex = activeMediaItem
        ? currentQueue.findIndex(
            (item) => item.mediaId === activeMediaItem.mediaId,
          )
        : -1;
      console.log("[Player] skipToPrevious - current index:", currentIndex);

      if (currentIndex > 0) {
        await TrackPlayer.skipToPrevious();
        console.log("[Player] Skipped to previous successfully");
      } else {
        console.warn("[Player] Already at the beginning of queue");
      }
    } catch (err: unknown) {
      console.error(
        "[Player] skipToPrevious error:",
        err instanceof Error ? err.message : String(err),
      );
    }
  },
}));
