import { DbSchema, type Track } from "../schemas/track.schema.ts";

const raw = await Bun.file(import.meta.dir + "/../data/tracks.json").json();
const db = DbSchema.parse(raw);

export function getAllTracks(): Track[] {
  return db.tracks;
}

export function getTrackById(id: string): Track | undefined {
  return db.tracks.find((t) => t.id === id);
}

export function getTrackBySlug(slug: string): Track | undefined {
  return db.tracks.find((t) => t.slug === slug);
}

export function searchTracks(query: string): Track[] {
  const q = query.toLowerCase().trim();
  if (!q) return db.tracks;

  return db.tracks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q) ||
      t.artists.some((a) => a.name.toLowerCase().includes(q)) ||
      t.genre.some((g) => g.toLowerCase().includes(q)) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      t.mood.some((m) => m.toLowerCase().includes(q)),
  );
}

export function getTracksByGenre(genre: string): Track[] {
  const g = genre.toLowerCase();
  return db.tracks.filter((t) =>
    t.genre.some((gen) => gen.toLowerCase().includes(g)),
  );
}

export function getFeedData(limit = 10): {
  featured: Track[];
  recent: Track[];
  total: number;
} {
  const streamable = db.tracks.filter((t) => t.availability.streamable);

  const featured = [...streamable]
    .sort((a, b) => b.stats.popularity - a.stats.popularity)
    .slice(0, limit);

  const recent = [...streamable]
    .sort(
      (a, b) =>
        new Date(b.release_date).getTime() - new Date(a.release_date).getTime(),
    )
    .slice(0, limit);

  return { featured, recent, total: db.tracks.length };
}
