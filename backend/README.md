# Mini Music Backend

## Overview

Express.js API server that serves music data to the Mini Music mobile app.

## Stack

- Runtime: Bun
- Framework: Express.js
- Language: TypeScript
- Validation: Zod

## Setup

```
bun install
bun src/index.ts
```

Server runs on port 3000 (or PORT env variable).

## Environment

| Variable | Default | Description |
|---|---|---|
| PORT | 3000 | Server port |
| NODE_ENV | development | Environment mode |
| AUDIODB_KEY | 123 | AudioDB API key (not actively used) |

## API Endpoints

### GET /

Health check. Returns status, service name, and version.

Response:
```json
{
  "status": "ok",
  "service": "Mini Music API",
  "version": "1.0.0"
}
```

### GET /api/feed

Home feed with featured and recent tracks.

Query params:
- limit (number, default 10) - max tracks per section

Response:
```json
{
  "featured": [Track],
  "recent": [Track],
  "total": 5
}
```

### GET /api/tracks

List all tracks.

Query params:
- q (string) - search query (searches title, artist, album, genre, tags, mood)
- genre (string) - filter by genre

Response:
```json
{
  "tracks": [Track],
  "total": 5
}
```

### GET /api/tracks/:id

Single track by ID or slug.

Response:
```json
{
  "track": Track
}
```

### GET /api/artists

List all artists.

Query params:
- q (string) - search query (searches name, type, genre, bio)

Response:
```json
{
  "artists": [Artist],
  "total": 17
}
```

### GET /api/artists/:id

Single artist with their tracks.

Response:
```json
{
  "artist": Artist,
  "tracks": [Track],
  "total": 1
}
```

### GET /api/artists/:id/tracks

All tracks by a specific artist.

Response:
```json
{
  "artist": Artist,
  "tracks": [Track],
  "total": 1
}
```

### GET /api/stream/:id

Stream audio file for a track. Proxies the audio URL from the tracks database.

Supports HTTP range requests for seeking.

Response: Audio file (mp3) with appropriate headers.

## Data Models

### Track

```
id, title, slug, artists, album, movie, genre, language,
release_date, duration, duration_formatted, bpm, key, mood,
cover_image, audio, lyrics_available, explicit, copyright,
credits, stats, tags, source, availability, created_at, updated_at
```

### Artist

```
id, name, slug, type, country, genres, bio, image, cover_image,
verified, socials (youtube, spotify, instagram)
```

## File Structure

```
backend/src/
  index.ts          - Express app entry point
  config/env.ts     - Environment variables
  data/              - JSON data files
    artists.json     - Artist data
    tracks.json      - Track data
  middleware/        - Express middleware
    errorHandler.ts  - Global error handler
  routes/            - Express route handlers
    feed.routes.ts   - /api/feed
    tracks.routes.ts - /api/tracks
    artists.routes.ts - /api/artists
    stream.routes.ts - /api/stream
    playback-url.ts  - Rewrites stream_url to proxy through backend
  schemas/           - Zod validation schemas
    artist.schema.ts
    track.schema.ts
  services/          - Business logic
    tracks.service.ts
    artists.service.ts
```

## Error Handling

All errors return JSON with an "error" field.

- 400 - Bad request
- 404 - Not found
- 403 - Forbidden (e.g., non-streamable track)
- 500 - Internal server error