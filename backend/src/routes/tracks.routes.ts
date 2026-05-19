import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import {
  getAllTracks,
  getTrackById,
  getTrackBySlug,
  searchTracks,
  getTracksByGenre,
} from "../services/tracks.service.js";
import { ApiError } from "../middleware/errorHandler.js";
import { withPlaybackUrl, withPlaybackUrls } from "./playback-url.ts";

export const tracksRouter = Router();

/**
 * GET /api/tracks
 * List all tracks. Supports optional filtering:
 *   ?q=faded          full-text search
 *   ?genre=EDM        filter by genre
 */
tracksRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, genre } = req.query;

    let tracks =
      typeof q === "string" && q.trim()
        ? searchTracks(q.trim())
        : typeof genre === "string" && genre.trim()
          ? getTracksByGenre(genre.trim())
          : getAllTracks();

    res.json({ tracks: withPlaybackUrls(tracks, req), total: tracks.length });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/tracks/:id
 * Look up a single track by its unique ID or slug.
 *   /api/tracks/alan-walker-faded
 */
tracksRouter.get<{ id: string }>(
  "/:id",
  (req, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      // Try ID first, then slug as fallback
      const track = getTrackById(id) ?? getTrackBySlug(id);

      if (!track) {
        throw new ApiError(404, `Track "${id}" not found`);
      }

      res.json({ track: withPlaybackUrl(track, req) });
    } catch (err) {
      next(err);
    }
  },
);
