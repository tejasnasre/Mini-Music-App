/**
 * Central environment config.
 * Set AUDIODB_KEY in .env for a premium key — falls back to the free "123" key.
 */
export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  AUDIODB_KEY: process.env.AUDIODB_KEY ?? "123",
  AUDIODB_BASE: "https://www.theaudiodb.com/api/v1/json",
  NODE_ENV: process.env.NODE_ENV ?? "development",
} as const;
