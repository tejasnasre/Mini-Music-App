import type { Request } from "express";
import type { Track } from "../schemas/track.schema.js";

function getBaseUrl(req: Request): string {
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim();
  const protocol = forwardedProto || req.protocol;
  const host = forwardedHost || req.get("host");

  return `${protocol}://${host}`;
}

export function withPlaybackUrl<T extends Track>(track: T, req: Request): T {
  const baseUrl = getBaseUrl(req);
  const trackId = encodeURIComponent(track.id);

  return {
    ...track,
    audio: {
      ...track.audio,
      stream_url: `${baseUrl}/api/stream/${trackId}`,
      // HLS audio streaming endpoint
      hls_url: `${baseUrl}/api/hls/${trackId}/playlist.m3u8`,
    },
  };
}

export function withPlaybackUrls<T extends Track>(
  tracks: T[],
  req: Request,
): T[] {
  return tracks.map((track) => withPlaybackUrl(track, req));
}
