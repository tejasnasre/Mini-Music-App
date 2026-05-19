import {
  ArtistsDbSchema,
  type ArtistProfile,
} from "../schemas/artist.schema.js";
import type { Track } from "../schemas/track.schema.js";
import { getAllTracks } from "./tracks.service.js";
import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(
  fs.readFileSync(path.join(__dirname, "/../data/artists.json"), "utf-8"),
);
const db = ArtistsDbSchema.parse(raw);

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matchesArtist(track: Track, artist: ArtistProfile): boolean {
  const artistName = normalize(artist.name);
  return track.artists.some(
    (trackArtist) => normalize(trackArtist.name) === artistName,
  );
}

export function getAllArtists(): ArtistProfile[] {
  return db.artists;
}

export function getArtistById(id: string): ArtistProfile | undefined {
  const key = normalize(id);
  return db.artists.find(
    (artist) =>
      artist.id === key ||
      artist.slug === key ||
      normalize(artist.name) === key,
  );
}

export function searchArtists(query: string): ArtistProfile[] {
  const q = normalize(query);
  if (!q) return db.artists;

  return db.artists.filter(
    (artist) =>
      normalize(artist.name).includes(q) ||
      normalize(artist.type).includes(q) ||
      artist.genres.some((genre) => normalize(genre).includes(q)) ||
      normalize(artist.bio).includes(q),
  );
}

export function getTracksByArtist(artist: ArtistProfile): Track[] {
  return getAllTracks().filter((track) => matchesArtist(track, artist));
}

export function getArtistStats(artist: ArtistProfile): {
  track_count: number;
  total_duration: number;
  top_track_id: string | null;
} {
  const tracks = getTracksByArtist(artist);
  const topTrack = [...tracks].sort(
    (a, b) => b.stats.popularity - a.stats.popularity,
  )[0];

  return {
    track_count: tracks.length,
    total_duration: tracks.reduce((total, track) => total + track.duration, 0),
    top_track_id: topTrack?.id ?? null,
  };
}
