# Addis Song — Backend

A RESTful API for managing a song catalog, built with **Node.js**, **Express 5**, **TypeScript**, and **MongoDB**. Supports image & audio uploads via **Cloudinary** and provides aggregated statistics via MongoDB pipelines.

**Deployed on:** [Render](https://render.com)

---

## Features

- 🎵 **Song CRUD** — Create, read, update, and delete songs with full metadata
- 🖼️ **Media Uploads** — Image and audio file uploads to Cloudinary via Multer
- 📊 **Statistics API** — Aggregated stats: total songs/artists/albums/genres, per-genre/per-artist/per-album breakdowns
- 🔒 **Validation** — Joi-based request validation middleware
- 🛡️ **Security** — Helmet, CORS, rate limiting, compression
- 🌱 **Database Seeder** — Seed script with Cloudinary asset management

---

## Tech Stack

| Layer           | Technology                    |
| --------------- | ----------------------------- |
| **Runtime**     | Node.js                       |
| **Framework**   | Express 5                     |
| **Language**    | TypeScript 6                  |
| **Database**    | MongoDB (Mongoose 9)          |
| **File Upload** | Multer + Cloudinary           |
| **Validation**  | Joi                           |
| **Deployment**  | Render                        |

---

## Project Structure

```
src/
├── config/
│   ├── db.ts              # MongoDB connection & graceful close
│   └── env.ts             # Joi-validated environment variables
├── constants/             # App-wide constants
├── features/
│   ├── songs/
│   │   ├── song.controller.ts  # Route handlers
│   │   ├── song.model.ts       # Mongoose schema & indexes
│   │   ├── song.routes.ts      # Express router
│   │   ├── song.service.ts     # Business logic & Cloudinary ops
│   │   ├── song.types.ts       # TypeScript interfaces
│   │   └── song.validation.ts  # Joi schemas
│   └── auth/              # Authentication module (placeholder)
├── middlewares/
│   ├── error.middleware.ts     # Global error handler
│   ├── logger.middleware.ts    # Request logger
│   └── validate.middleware.ts  # Joi validation middleware
├── scripts/
│   └── seed.ts            # Database seeder with Cloudinary uploads
├── utils/
│   └── apiResponse.ts     # Standardized API response helper
├── index.routes.ts        # Route index (mounts feature routers)
├── app.ts                 # Express app setup (middleware stack)
└── server.ts              # HTTP server entry point
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local or Atlas)
- **Cloudinary** account (for media uploads)

### Installation

```bash
# Clone
git clone https://github.com/amdebirhan-asmamaw/addis-song-backend.git
cd addis-song-backend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/addis-songs
CORS_ORIGINS=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

| Variable                 | Required | Description                     | Default       |
| ------------------------ | -------- | ------------------------------- | ------------- |
| `NODE_ENV`               | No       | `development` / `production`    | `development` |
| `PORT`                   | No       | Server port                     | `5000`        |
| `MONGO_URI`              | Yes      | MongoDB connection string       | —             |
| `CORS_ORIGINS`           | No       | Comma-separated allowed origins | —             |
| `CLOUDINARY_CLOUD_NAME`  | Yes      | Cloudinary cloud name           | —             |
| `CLOUDINARY_API_KEY`     | Yes      | Cloudinary API key              | —             |
| `CLOUDINARY_API_SECRET`  | Yes      | Cloudinary API secret           | —             |

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

## Scripts

| Script       | Command              | Description                                 |
| ------------ | -------------------- | ------------------------------------------- |
| `dev`        | `tsx watch src/server.ts` | Start dev server with hot-reload       |
| `build`      | `tsc`                | Compile TypeScript to `dist/`               |
| `start`      | `node dist/server.js`| Run compiled production build               |
| `seed`       | `tsx src/scripts/seed.ts` | Seed database with sample songs        |
| `seed:reset` | `tsx src/scripts/seed.ts -- --reset` | Clear & re-seed database    |

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

| Param   | Type   | Required | Description           |
| ------- | ------ | -------- | --------------------- |
| `genre` | string | No       | Filter songs by genre |

**Response (200):**

```json
{
  "success": true,
  "message": "Songs retrieved",
  "data": [
    {
      "id": "664...",
      "title": "Bohemian Rhapsody",
      "artist": "Queen",
      "album": "A Night at the Opera",
      "genre": "Rock",
      "duration": "5:55",
      "status": "LIVE",
      "releaseYear": 1975,
      "description": "...",
      "image": { "url": "https://res.cloudinary.com/...", "id": "..." },
      "audioUrl": { "url": "https://res.cloudinary.com/...", "id": "..." },
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

---

#### Create Song

```
POST /api/v1/songs
Content-Type: multipart/form-data
```

| Field         | Type   | Required | Notes                          |
| ------------- | ------ | -------- | ------------------------------ |
| `title`       | string | Yes      | 1–200 characters               |
| `artist`      | string | Yes      | 1–200 characters               |
| `album`       | string | Yes      | 1–200 characters               |
| `genre`       | string | Yes      | 1–100 characters               |
| `duration`    | string | No       | e.g. `"3:45"`                  |
| `status`      | string | No       | `LIVE`, `PROCESSING`, `DRAFT`  |
| `releaseYear` | number | No       | 1900–2200                      |
| `description` | string | No       | Free text                      |
| `image`       | file   | No       | Image file (Cloudinary upload) |
| `audio`       | file   | No       | Audio file (Cloudinary upload) |

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
Content-Type: multipart/form-data
```

Partial update — at least one field required. Supports replacing image/audio files.

---

#### Delete Song

```
DELETE /api/v1/songs/:id
```

Deletes the song and its associated Cloudinary assets (image + audio).

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
      { "genre": "Rock", "count": 15 }
    ],
    "songsAndAlbumsPerArtist": [
      { "artist": "Queen", "songCount": 8, "albumCount": 3 }
    ],
    "songsPerAlbum": [
      { "album": "A Night at the Opera", "artist": "Queen", "songCount": 4 }
    ]
  }
}
```

---

## Data Model

### Song

| Field         | Type             | Required | Notes                                |
| ------------- | ---------------- | -------- | ------------------------------------ |
| `title`       | String           | Yes      | Trimmed                              |
| `artist`      | String           | Yes      | Trimmed                              |
| `album`       | String           | Yes      | Trimmed                              |
| `genre`       | String           | Yes      | Trimmed                              |
| `duration`    | String           | No       | e.g. `"3:45"`                        |
| `status`      | String (enum)    | No       | `LIVE` / `PROCESSING` / `DRAFT`      |
| `releaseYear` | Number           | No       | Defaults to current year             |
| `description` | String           | No       | Free text                            |
| `image`       | `{ url, id }`    | No       | Cloudinary asset (cover art)         |
| `audioUrl`    | `{ url, id }`    | No       | Cloudinary asset (audio file)        |
| `createdAt`   | Date             | Auto     | Managed by Mongoose                  |
| `updatedAt`   | Date             | Auto     | Managed by Mongoose                  |

**Indexes:**
- `{ artist: 1, album: 1 }` — optimizes per-artist/album queries
- `{ genre: 1 }` — optimizes genre filtering & stats
- `{ status: 1 }` — optimizes status filtering

---

## API Response Format

Every endpoint returns a consistent JSON envelope:

```typescript
{
  success: boolean;
  message: string;
  data?: T;
  error?: string | string[];
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

## Error Handling

Errors are handled at three levels:

1. **Validation Middleware** — Joi schema validation returns `400` with field-level errors
2. **Controller** — Not-found checks return `404`
3. **Global Error Handler** — Catches everything else:
   - Joi errors → structured field messages
   - MongoDB duplicate key (E11000) → `"field already in use"`
   - Stack traces included in development, hidden in production

---

## Deployment (Render)

| Setting           | Value                        |
| ----------------- | ---------------------------- |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `node dist/server.js`        |

Ensure all required environment variables are configured in the Render dashboard.

---

## Frontend

This backend serves the [Addis Song Frontend](https://github.com/amdebirhan-asmamaw/addis-music-frontend) — a React/Redux/Emotion SPA deployed on Vercel.

---

## License

MIT
