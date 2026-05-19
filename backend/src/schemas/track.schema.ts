import { z } from "zod";

const ArtistSchema = z.object({
  name: z.string(),
  role: z.string(),
  type: z.string().optional(),
});

const AudioSchema = z.object({
  stream_url: z.string().nullable(),
  hls_url: z.string().nullable(),
  preview_url: z.string().nullable(),
  format: z.string(),
  quality: z.string(),
  size_mb: z.number().nullable(),
});

const CopyrightSchema = z.object({
  label: z.string(),
  license: z.string(),
});

const CreditsSchema = z.object({
  producer: z.array(z.string()).optional(),
  composer: z.array(z.string()).optional(),
  lyricist: z.array(z.string()).optional(),
  music_director: z.array(z.string()).optional(), // Bollywood tracks
});

const StatsSchema = z.object({
  youtube_views: z.string().nullable().optional(),
  spotify_streams: z.string().nullable().optional(),
  popularity: z.number(),
});

const SourceSchema = z.object({
  youtube_video_id: z.string().nullable(),
  youtube_url: z.string().nullable(),
});

const AvailabilitySchema = z.object({
  downloadable: z.boolean(),
  streamable: z.boolean(),
  regions_blocked: z.array(z.string()),
});

export const TrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  artists: z.array(ArtistSchema),
  album: z.string(),
  movie: z.string().optional(), // Bollywood / film tracks
  cast: z.array(z.string()).optional(), // film cast
  genre: z.array(z.string()),
  language: z.string(),
  release_date: z.string(),
  duration: z.number(), // seconds
  duration_formatted: z.string(),
  bpm: z.number().nullable(),
  key: z.string().nullable(),
  mood: z.array(z.string()),
  cover_image: z.string().nullable(),
  audio: AudioSchema,
  lyrics_available: z.boolean(),
  explicit: z.boolean(),
  copyright: CopyrightSchema,
  credits: CreditsSchema,
  stats: StatsSchema,
  tags: z.array(z.string()),
  source: SourceSchema,
  availability: AvailabilitySchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export type Track = z.infer<typeof TrackSchema>;

export const DbSchema = z.object({
  tracks: z.array(TrackSchema),
});

export type Db = z.infer<typeof DbSchema>;
