import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { getFeedData } from "../services/tracks.service.ts";

export const feedRouter = Router();

/**
 * GET /api/feed
 *
 * Returns the home feed from the local JSON database.
 *
 * Query params:
 *   limit (number, default 10) — max tracks per section
 *
 * Response:
 *   {
 *     featured: Track[]   ← sorted by popularity
 *     recent:   Track[]   ← sorted by release date (newest first)
 *     total:    number    ← total tracks in db
 *   }
 */
feedRouter.get("/", (_req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Number(_req.query.limit) || 10;
    const feed = getFeedData(limit);
    res.json(feed);
  } catch (err) {
    next(err);
  }
});
