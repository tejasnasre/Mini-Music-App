import type { FeedResponse, Track, TracksResponse } from "@/types/track";

/**
 * Base URL for the backend.
 *
 * Android emulator  → http://10.0.2.2:3000
 * iOS simulator / physical device on same Wi-Fi → http://<your-machine-ip>:3000
 *
 * Override via EXPO_PUBLIC_API_URL in your .env file.
 */
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  /**
   * GET /api/feed?limit=N
   * Returns { featured: Track[], recent: Track[], total: number }
   */
  getFeed: (limit = 10) =>
    get<FeedResponse>(`/api/feed?limit=${limit}`),

  /**
   * GET /api/tracks?q=...&genre=...
   * Returns { tracks: Track[], total: number }
   */
  getTracks: (params?: { q?: string; genre?: string }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.genre) qs.set("genre", params.genre);
    const query = qs.toString();
    return get<TracksResponse>(`/api/tracks${query ? `?${query}` : ""}`);
  },

  /**
   * GET /api/tracks/:id
   * Returns { track: Track }
   */
  getTrack: (id: string) => get<{ track: Track }>(`/api/tracks/${id}`),
};
