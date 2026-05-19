import express from "express";
import cors from "cors";
import { env } from "./config/env.ts";
import { artistsRouter } from "./routes/artists.routes.ts";
import { feedRouter } from "./routes/feed.routes.ts";
import { tracksRouter } from "./routes/tracks.routes.ts";
import { streamRouter } from "./routes/stream.routes.ts";
import { hlsRouter } from "./routes/hls.routes.ts";
import { errorHandler } from "./middleware/errorHandler.ts";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "Mini Music API", version: "1.0.0" });
});

app.use("/api/feed", feedRouter);
app.use("/api/tracks", tracksRouter);
app.use("/api/artists", artistsRouter);
app.use("/api/stream", streamRouter);
app.use("/api/hls", hlsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🎵 Mini Music API  →  http://localhost:${env.PORT}`);
  console.log(`   Feed endpoint    →  http://localhost:${env.PORT}/api/feed`);
  console.log(`   Tracks endpoint  →  http://localhost:${env.PORT}/api/tracks`);
  console.log(
    `   Artists endpoint →  http://localhost:${env.PORT}/api/artists`,
  );
  console.log(
    `   Stream endpoint  →  http://localhost:${env.PORT}/api/stream/:id`,
  );
  console.log(`   Environment      →  ${env.NODE_ENV}`);
});
