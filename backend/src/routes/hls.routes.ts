import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import fs from "node:fs";
import path from "node:path";
import { getTrackById, getTrackBySlug } from "../services/tracks.service.ts";
import { ApiError } from "../middleware/errorHandler.ts";

export const hlsRouter = Router();

// Resolve chunks directory relative to this file
// import.meta.dir gives us: .../backend/src/routes
// We need: .../backend/src/temp/chunks
// So we go up 1 level (..) to get to .../backend/src, then into temp/chunks
const CHUNKS_DIR = path.join(import.meta.dir, "..", "temp", "chunks");

/**
 * GET /api/hls/:trackId/playlist.m3u8
 * Returns the HLS playlist manifest for a track
 */
hlsRouter.get<{ trackId: string }>(
  "/:trackId/playlist.m3u8",
  async (
    req: Request<{ trackId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const track =
        getTrackById(req.params.trackId) ?? getTrackBySlug(req.params.trackId);

      if (!track) {
        throw new ApiError(404, `Track "${req.params.trackId}" not found`);
      }

      if (!track.availability.streamable) {
        throw new ApiError(
          403,
          `Track "${req.params.trackId}" is not streamable`,
        );
      }

      const trackName = track.title.replace(/\s+/g, "_").toLowerCase();
      const playlistPath = path.join(CHUNKS_DIR, trackName, "playlist.m3u8");

      if (!fs.existsSync(playlistPath)) {
        throw new ApiError(
          404,
          `HLS playlist not generated for track "${req.params.trackId}"`,
        );
      }

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("Access-Control-Allow-Origin", "*");

      fs.createReadStream(playlistPath).pipe(res);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/hls/:trackId/:segment
 * Returns individual HLS media segments (.ts files)
 */
hlsRouter.get<{ trackId: string; segment: string }>(
  "/:trackId/:segment",
  async (
    req: Request<{ trackId: string; segment: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const track =
        getTrackById(req.params.trackId) ?? getTrackBySlug(req.params.trackId);

      if (!track) {
        throw new ApiError(404, `Track "${req.params.trackId}" not found`);
      }

      if (!track.availability.streamable) {
        throw new ApiError(
          403,
          `Track "${req.params.trackId}" is not streamable`,
        );
      }

      const trackName = track.title.replace(/\s+/g, "_").toLowerCase();
      const segmentPath = path.join(CHUNKS_DIR, trackName, req.params.segment);

      // Validate segment path to prevent directory traversal attacks
      const resolvedSegmentPath = path.resolve(segmentPath);
      const resolvedBaseDir = path.resolve(path.join(CHUNKS_DIR, trackName));

      if (!resolvedSegmentPath.startsWith(resolvedBaseDir)) {
        throw new ApiError(403, "Invalid segment path");
      }

      if (!fs.existsSync(segmentPath)) {
        throw new ApiError(
          404,
          `Segment not found for track "${req.params.trackId}"`,
        );
      }

      res.setHeader("Content-Type", "video/mp2t"); // MPEG-TS segment
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Access-Control-Allow-Origin", "*");

      fs.createReadStream(segmentPath).pipe(res);
    } catch (err) {
      next(err);
    }
  },
);
