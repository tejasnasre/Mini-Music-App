import type { Track } from "./track";

export interface ArtistSocials {
  youtube: string | null;
  spotify: string | null;
  instagram: string | null;
}

export interface ArtistStats {
  track_count: number;
  total_duration: number;
  top_track_id: string | null;
}

export interface ArtistProfile {
  id: string;
  name: string;
  slug: string;
  type: string;
  country: string | null;
  genres: string[];
  bio: string;
  image: string | null;
  cover_image: string | null;
  verified: boolean;
  socials: ArtistSocials;
  stats?: ArtistStats;
}

export interface ArtistsResponse {
  artists: ArtistProfile[];
  total: number;
}

export interface ArtistDetailResponse {
  artist: ArtistProfile;
  tracks: Track[];
  total: number;
}
