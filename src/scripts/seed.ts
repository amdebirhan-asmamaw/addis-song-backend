// scripts/seed.ts — Populate the songs collection with realistic seed data.
//
// Usage:
//   npm run seed           # insert seeds (skips any with a duplicate title)
//   npm run seed -- --reset  # wipe collection + Cloudinary assets first
//
// The script fetches remote images and MP3s, streams them to Cloudinary so
// each seed song has a proper { url, id } reference (and deletion still
// works), then writes the documents to Mongo.

import mongoose from "mongoose";
import { connectMongo, closeMongoConnection } from "../config/db";
import { Song } from "../features/songs/song.model";
import {
  deleteAsset,
  uploadBuffer,
  type CloudinaryAsset,
} from "../utils/cloudinaryAsset";
import "../config/cloudinary"; // initialise SDK

interface SeedInput {
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: string;
  status: "LIVE" | "PROCESSING" | "DRAFT";
  releaseYear: number;
  description: string;
  imageUrl: string;
  audioUrl: string;
}

const SEEDS: SeedInput[] = [
  {
    title: "Neon Horizons",
    artist: "Cyber Architect",
    album: "Synthwave Vol. 1",
    genre: "Electronic",
    duration: "04:32",
    status: "LIVE",
    releaseYear: 2023,
    description: "High energy synthwave track.",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "Velvet Echoes",
    artist: "Luna Grey",
    album: "Midnight Sessions",
    genre: "Jazz Fusion",
    duration: "05:15",
    status: "PROCESSING",
    releaseYear: 2022,
    description: "Smooth jazz with electronic elements.",
    imageUrl:
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    title: "Steel Rhythm",
    artist: "Forge",
    album: "Iron Works",
    genre: "Industrial",
    duration: "03:58",
    status: "DRAFT",
    releaseYear: 2024,
    description: "Heavy industrial beats.",
    imageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    title: "Aether",
    artist: "Solstice",
    album: "Celestial Drift",
    genre: "Ambient",
    duration: "07:20",
    status: "LIVE",
    releaseYear: 2021,
    description: "Atmospheric soundscapes.",
    imageUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    title: "Prism",
    artist: "Spectral",
    album: "Light & Shadow",
    genre: "Progressive",
    duration: "04:45",
    status: "LIVE",
    releaseYear: 2023,
    description: "Complex time signatures and melodies.",
    imageUrl:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
  {
    title: "Hollow Sun",
    artist: "Cinder",
    album: "Ashen Sky",
    genre: "Post-Rock",
    duration: "06:08",
    status: "LIVE",
    releaseYear: 2022,
    description: "Slow-build crescendo with reversed guitars.",
    imageUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  },
  {
    title: "Quartz Loop",
    artist: "Mira Vey",
    album: "Crystalfields",
    genre: "Electronic",
    duration: "03:22",
    status: "LIVE",
    releaseYear: 2024,
    description: "Glassy arpeggios over a half-time groove.",
    imageUrl:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  },
  {
    title: "Lowtide",
    artist: "Drift House",
    album: "Coastal Demos",
    genre: "Lo-fi",
    duration: "02:54",
    status: "DRAFT",
    releaseYear: 2023,
    description: "Tape-saturated piano sketch.",
    imageUrl:
      "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600&auto=format&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  },
];

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url} — HTTP ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function uploadAssetsFor(seed: SeedInput): Promise<{
  image: CloudinaryAsset;
  audioUrl: CloudinaryAsset;
}> {
  const [imageBuf, audioBuf] = await Promise.all([
    fetchBuffer(seed.imageUrl),
    fetchBuffer(seed.audioUrl),
  ]);
  const [image, audioUrl] = await Promise.all([
    uploadBuffer(imageBuf, "image"),
    uploadBuffer(audioBuf, "audio"),
  ]);
  return { image, audioUrl };
}

async function resetExisting() {
  const existing = await Song.find().lean();
  console.log(`Removing ${existing.length} existing songs + Cloudinary assets…`);
  await Promise.all(
    existing.flatMap((doc) => [
      deleteAsset(doc.image as CloudinaryAsset | null, "image"),
      deleteAsset(doc.audioUrl as CloudinaryAsset | null, "audio"),
    ]),
  );
  await Song.deleteMany({});
}

async function seedOne(seed: SeedInput) {
  const existing = await Song.findOne({ title: seed.title });
  if (existing) {
    console.log(`  • skip "${seed.title}" — already present`);
    return;
  }
  console.log(`  • seeding "${seed.title}"…`);
  const assets = await uploadAssetsFor(seed);
  await Song.create({
    title: seed.title,
    artist: seed.artist,
    album: seed.album,
    genre: seed.genre,
    duration: seed.duration,
    status: seed.status,
    releaseYear: seed.releaseYear,
    description: seed.description,
    image: assets.image,
    audioUrl: assets.audioUrl,
  });
}

async function main() {
  const shouldReset = process.argv.includes("--reset");

  await connectMongo();
  try {
    if (shouldReset) {
      await resetExisting();
    }

    console.log(`Seeding ${SEEDS.length} songs…`);
    for (const seed of SEEDS) {
      try {
        await seedOne(seed);
      } catch (err) {
        console.error(`  ✗ "${seed.title}" failed:`, err);
      }
    }

    const total = await Song.countDocuments();
    console.log(`Done. Songs in collection: ${total}`);
  } finally {
    await closeMongoConnection();
    // mongoose still holds open handles in some drivers; exit explicitly.
    await mongoose.disconnect().catch(() => {});
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
