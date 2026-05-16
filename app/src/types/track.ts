// ─── Domain types mirroring the backend schema ────────────────────────────────

export interface Artist {
  name: string;
  role: string;
  type?: string;
}

export interface AudioInfo {
  stream_url: string;
  hls_url: string | null;
  preview_url: string | null;
  format: string;
  quality: string;
  size_mb: number;
}

export interface Track {
  id: string;
  title: string;
  slug: string;
  artists: Artist[];
  album: string;
  movie?: string;
  genre: string[];
  language: string;
  release_date: string;
  /** duration in seconds */
  duration: number;
  duration_formatted: string;
  bpm: number;
  key: string;
  mood: string[];
  cover_image: string;
  audio: AudioInfo;
  lyrics_available: boolean;
  explicit: boolean;
  stats: {
    youtube_views?: string;
    spotify_streams?: string;
    popularity: number;
  };
  tags: string[];
  availability: {
    downloadable: boolean;
    streamable: boolean;
    regions_blocked: string[];
  };
  created_at: string;
  updated_at: string;
}

// ─── API response shapes ───────────────────────────────────────────────────────

export interface FeedResponse {
  featured: Track[];
  recent: Track[];
  total: number;
}

export interface TracksResponse {
  tracks: Track[];
  total: number;
}
