import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { Readable } from "node:stream";
import { getTrackById, getTrackBySlug } from "../services/tracks.service.ts";
import { ApiError } from "../middleware/errorHandler.ts";

export const streamRouter = Router();

const DEFAULT_CONTENT_TYPE = "audio/mpeg";

function copyHeader(headers: Headers, name: string): string | undefined {
  return headers.get(name) ?? undefined;
}

function setStreamingHeaders(
  res: Response,
  upstream: globalThis.Response,
): void {
  const contentType =
    copyHeader(upstream.headers, "content-type") ?? DEFAULT_CONTENT_TYPE;
  const contentLength = copyHeader(upstream.headers, "content-length");
  const contentRange = copyHeader(upstream.headers, "content-range");
  const acceptRanges = copyHeader(upstream.headers, "accept-ranges") ?? "bytes";

  res.setHeader("Content-Type", contentType);
  res.setHeader("Accept-Ranges", acceptRanges);
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  if (contentLength) res.setHeader("Content-Length", contentLength);
  if (contentRange) res.setHeader("Content-Range", contentRange);
}

streamRouter.get<{ id: string }>(
  "/:id",
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const track =
        getTrackById(req.params.id) ?? getTrackBySlug(req.params.id);

      if (!track) {
        throw new ApiError(404, `Track "${req.params.id}" not found`);
      }

      if (!track.availability.streamable || !track.audio.stream_url) {
        throw new ApiError(403, `Track "${req.params.id}" is not streamable`);
      }

      const range = req.headers.range;
      const upstream = await fetch(track.audio.stream_url, {
        headers: range ? { Range: range } : undefined,
      });

      if (!upstream.ok && upstream.status !== 206) {
        throw new ApiError(
          upstream.status,
          `Unable to stream track "${req.params.id}"`,
        );
      }

      res.status(upstream.status === 206 ? 206 : 200);
      setStreamingHeaders(res, upstream);

      if (!upstream.body) {
        res.end();
        return;
      }

      const nodeStream = Readable.fromWeb(upstream.body as never);
      nodeStream.on("error", next);
      nodeStream.pipe(res);
    } catch (err) {
      next(err);
    }
  },
);
