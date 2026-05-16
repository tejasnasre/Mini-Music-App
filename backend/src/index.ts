import express from "express";
import cors from "cors";
import { env } from "./config/env.ts";
import { feedRouter } from "./routes/feed.routes.ts";
import { tracksRouter } from "./routes/tracks.routes.ts";
import { errorHandler } from "./middleware/errorHandler.ts";

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "Mini Music API", version: "1.0.0" });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/feed", feedRouter);
app.use("/api/tracks", tracksRouter);

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`🎵 Mini Music API  →  http://localhost:${env.PORT}`);
  console.log(
    `   AudioDB key      →  ${env.AUDIODB_KEY === "123" ? "free (123)" : "premium"}`,
  );
  console.log(`   Environment      →  ${env.NODE_ENV}`);
});
