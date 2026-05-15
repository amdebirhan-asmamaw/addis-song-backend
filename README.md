# Addis Song Backend

A RESTful API for managing song information — built with **Express.js**, **MongoDB**, **Mongoose**, and **TypeScript**. Supports full CRUD operations on songs and provides aggregated statistics (total counts, per-genre, per-artist, per-album breakdowns).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Docker](#docker)
- [API Reference](#api-reference)
  - [Health Check](#health-check)
  - [Songs](#songs)
  - [Statistics](#statistics)
- [API Response Format](#api-response-format)
- [Data Model](#data-model)
  - [Song](#song)
  - [User](#user)
- [Statistics Breakdown](#statistics-breakdown)
- [Error Handling](#error-handling)

---

## Tech Stack

| Technology   | Purpose                          |
| ------------ | -------------------------------- |
| Node.js      | Runtime environment              |
| Express 5    | HTTP framework                   |
| MongoDB      | Database                         |
| Mongoose     | ODM / schema modeling            |
| TypeScript   | Type safety                      |
| Joi          | Request validation               |
| Docker       | Containerization                 |
| Helmet       | Security headers                 |
| CORS         | Cross-origin resource sharing    |
| Compression  | Response compression             |

---

## Project Structure

```
src/
├── config/
│   ├── corsOptions.ts        # CORS middleware configuration
│   ├── db.ts                 # MongoDB connection & disconnect
│   └── env.ts                # Environment variable parsing
├── features/
│   ├── auth/
│   │   └── user.model.ts     # User Mongoose model (email, username, password)
│   └── songs/
│       ├── song.controller.ts  # HTTP request handlers
│       ├── song.model.ts       # Song Mongoose model & indexes
│       ├── song.routes.ts      # Express route definitions
│       ├── song.service.ts     # Data access layer (CRUD)
│       ├── song.stats.ts       # MongoDB aggregation pipelines
│       ├── song.types.ts       # TypeScript interfaces & DTOs
│       └── song.validation.ts  # Joi validation schemas
├── middlewares/
│   ├── error.middleware.ts   # Global error handler
│   └── validate.ts           # Request body validation middleware
├── utils/
│   └── apiResponse.ts        # Unified API response builder
├── index.routes.ts           # Root route aggregator
├── app.ts                    # Express app setup & middleware
└── server.ts                 # HTTP server bootstrap & graceful shutdown
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 9
- **MongoDB** (local instance or Atlas connection string)
- **Docker** (optional, for containerized deployment)

### Installation

```bash
git clone https://github.com/<your-username>/addis-song-backend.git
cd addis-song-backend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/addis-songs
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

| Variable      | Description                              | Default                |
| ------------- | ---------------------------------------- | ---------------------- |
| `PORT`        | Server port                              | `5000`                 |
| `MONGO_URI`   | MongoDB connection string                | —                      |
| `CORS_ORIGIN` | Comma-separated allowed origins          | `*` (if not set)       |
| `NODE_ENV`    | `development` or `production`            | `development`          |

### Running Locally

```bash
# Development (hot-reload)
npm run dev

# Production build
npm run build
npm start
```

The server starts at `http://localhost:5000`.

---

## Docker

### Build

```bash
docker build -t addis-song-backend .
```

### Run

```bash
docker run -p 5000:5000 \
  -e MONGO_URI=mongodb://host.docker.internal:27017/addis-songs \
  -e CORS_ORIGIN=http://localhost:3000 \
  addis-song-backend
```

The Dockerfile uses a **multi-stage build**: TypeScript is compiled in the builder stage, and only the compiled JavaScript and production dependencies are copied to the final image.

---

## API Reference

**Base URL:** `/api/v1`

### Health Check

```
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2026-05-16T00:00:00.000Z"
}
```

---

### Songs

#### List All Songs

```
GET /api/v1/songs
```

**Query Parameters:**

| Param   | Type   | Required | Description              |
| ------- | ------ | -------- | ------------------------ |
| `genre` | string | No       | Filter songs by genre    |

**Example:** `GET /api/v1/songs?genre=Rock`

**Response (200):**

```json
{
  "success": true,
  "message": "Songs retrieved",
  "data": [
    {
      "_id": "664...",
      "title": "Bohemian Rhapsody",
      "artist": "Queen",
      "album": "A Night at the Opera",
      "genre": "Rock",
      "createdAt": "2026-05-16T00:00:00.000Z",
      "updatedAt": "2026-05-16T00:00:00.000Z"
    }
  ]
}
```

---

#### Get Single Song

```
GET /api/v1/songs/:id
```

**Response (200):**

```json
{
  "success": true,
  "message": "Song retrieved",
  "data": { ... }
}
```

**Response (404):**

```json
{
  "success": false,
  "message": "Song not found"
}
```

---

#### Create Song

```
POST /api/v1/songs
```

**Request Body:**

```json
{
  "title": "Bohemian Rhapsody",
  "artist": "Queen",
  "album": "A Night at the Opera",
  "genre": "Rock"
}
```

| Field    | Type   | Required | Constraints      |
| -------- | ------ | -------- | ---------------- |
| `title`  | string | Yes      | 1–200 characters |
| `artist` | string | Yes      | 1–200 characters |
| `album`  | string | Yes      | 1–200 characters |
| `genre`  | string | Yes      | 1–100 characters |

**Response (201):**

```json
{
  "success": true,
  "message": "Song created",
  "data": { ... }
}
```

---

#### Update Song

```
PUT /api/v1/songs/:id
```

**Request Body:** Partial — at least one field required.

```json
{
  "genre": "Classic Rock"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Song updated",
  "data": { ... }
}
```

---

#### Delete Song

```
DELETE /api/v1/songs/:id
```

**Response (200):**

```json
{
  "success": true,
  "message": "Song deleted",
  "data": { ... }
}
```

---

### Statistics

```
GET /api/v1/songs/stats
```

**Response (200):**

```json
{
  "success": true,
  "message": "Statistics retrieved",
  "data": {
    "totalSongs": 50,
    "totalArtists": 12,
    "totalAlbums": 18,
    "totalGenres": 6,
    "songsPerGenre": [
      { "genre": "Rock", "count": 15 },
      { "genre": "Pop", "count": 10 }
    ],
    "songsAndAlbumsPerArtist": [
      { "artist": "Queen", "songCount": 8, "albumCount": 3 },
      { "artist": "Adele", "songCount": 5, "albumCount": 2 }
    ],
    "songsPerAlbum": [
      { "album": "A Night at the Opera", "artist": "Queen", "songCount": 4 },
      { "album": "25", "artist": "Adele", "songCount": 3 }
    ]
  }
}
```

---

## API Response Format

Every endpoint returns a consistent JSON structure:

```typescript
{
  success: boolean;     // true for 2xx, false for errors
  message: string;      // Human-readable status message
  data?: T;             // Payload (present on success)
  error?: string | string[];  // Error details (present on failure)
}
```

### Status Codes

| Code | Meaning               | When                                |
| ---- | --------------------- | ----------------------------------- |
| 200  | OK                    | Successful read/update/delete       |
| 201  | Created               | Song successfully created           |
| 400  | Bad Request           | Validation failure                  |
| 404  | Not Found             | Song or route not found             |
| 409  | Conflict              | Duplicate key (MongoDB E11000)      |
| 500  | Internal Server Error | Unhandled server error              |

---

## Data Model

### Song

| Field       | Type     | Required | Notes                      |
| ----------- | -------- | -------- | -------------------------- |
| `title`     | String   | Yes      | Trimmed                    |
| `artist`    | String   | Yes      | Trimmed                    |
| `album`     | String   | Yes      | Trimmed                    |
| `genre`     | String   | Yes      | Trimmed                    |
| `createdAt` | Date     | Auto     | Managed by Mongoose        |
| `updatedAt` | Date     | Auto     | Managed by Mongoose        |

**Indexes:**
- Compound: `{ artist: 1, album: 1 }` — optimizes per-artist/album queries
- Single: `{ genre: 1 }` — optimizes genre filtering & stats

### User

| Field       | Type     | Required | Notes                        |
| ----------- | -------- | -------- | ---------------------------- |
| `email`     | String   | Yes      | Unique, lowercase, trimmed   |
| `username`  | String   | Yes      | Unique, trimmed              |
| `password`  | String   | Yes      | Excluded from queries by default (`select: false`) |
| `createdAt` | Date     | Auto     | Managed by Mongoose          |
| `updatedAt` | Date     | Auto     | Managed by Mongoose          |

---

## Statistics Breakdown

All stats are computed server-side using MongoDB aggregation pipelines, executed in parallel via `Promise.all`:

| Stat                       | Description                                        |
| -------------------------- | -------------------------------------------------- |
| `totalSongs`               | Total number of songs in the database              |
| `totalArtists`             | Count of distinct artists                          |
| `totalAlbums`              | Count of distinct albums                           |
| `totalGenres`              | Count of distinct genres                           |
| `songsPerGenre`            | Number of songs in each genre                      |
| `songsAndAlbumsPerArtist`  | Song count and album count for each artist         |
| `songsPerAlbum`            | Number of songs in each album (grouped by artist)  |

---

## Error Handling

Errors are handled at three levels:

1. **Validation Middleware** — Joi schema validation returns `400` with field-level errors
2. **Controller** — Not-found checks return `404`
3. **Global Error Handler** — Catches everything else:
   - Joi errors → structured field messages
   - MongoDB duplicate key (E11000) → `"field already in use"`
   - Stack traces included in development, hidden in production

---

## Scripts

| Script        | Command           | Description                       |
| ------------- | ----------------- | --------------------------------- |
| `dev`         | `npm run dev`     | Start dev server with hot-reload  |
| `build`       | `npm run build`   | Compile TypeScript to `dist/`     |
| `start`       | `npm start`       | Run compiled production build     |

---

## License

MIT
