import type { Request, Response, NextFunction } from "express";
import { AxiosError } from "axios";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Known API error
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  // Axios error (upstream AudioDB call failed)
  if (err instanceof AxiosError) {
    const status = err.response?.status ?? 502;
    res.status(status).json({
      error: "Upstream AudioDB request failed",
      detail: err.message,
    });
    return;
  }

  // Unknown error
  console.error("[Unhandled]", err);
  res.status(500).json({ error: "Internal server error" });
}
