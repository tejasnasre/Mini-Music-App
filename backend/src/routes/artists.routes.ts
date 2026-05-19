import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../middleware/errorHandler.js";
import {
  getAllArtists,
  getArtistById,
  getArtistStats,
  getTracksByArtist,
  searchArtists,
} from "../services/artists.service.js";
import { withPlaybackUrls } from "./playback-url.js";

export const artistsRouter = Router();

artistsRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    const artists =
      typeof q === "string" && q.trim()
        ? searchArtists(q.trim())
        : getAllArtists();

    res.json({
      artists: artists.map((artist) => ({
        ...artist,
        stats: getArtistStats(artist),
      })),
      total: artists.length,
    });
  } catch (err) {
    next(err);
  }
});

artistsRouter.get<{ id: string }>(
  "/:id",
  (req, res: Response, next: NextFunction) => {
    try {
      const artist = getArtistById(req.params.id);

      if (!artist) {
        throw new ApiError(404, `Artist "${req.params.id}" not found`);
      }

      const tracks = getTracksByArtist(artist);

      res.json({
        artist: {
          ...artist,
          stats: getArtistStats(artist),
        },
        tracks: withPlaybackUrls(tracks, req),
        total: tracks.length,
      });
    } catch (err) {
      next(err);
    }
  },
);

artistsRouter.get<{ id: string }>(
  "/:id/tracks",
  (req, res: Response, next: NextFunction) => {
    try {
      const artist = getArtistById(req.params.id);

      if (!artist) {
        throw new ApiError(404, `Artist "${req.params.id}" not found`);
      }

      const tracks = getTracksByArtist(artist);

      res.json({
        artist,
        tracks: withPlaybackUrls(tracks, req),
        total: tracks.length,
      });
    } catch (err) {
      next(err);
    }
  },
);
