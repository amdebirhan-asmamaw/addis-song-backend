import mongoose, { Schema } from "mongoose";
import type { SongDoc, SongStatus } from "./song.types";

const SONG_STATUSES: SongStatus[] = ["LIVE", "PROCESSING", "DRAFT"];

// Embedded sub-schema for Cloudinary assets — `_id: false` so the asset
// object doesn't get its own ObjectId.
const cloudinaryAssetSchema = new Schema(
  {
    url: { type: String, required: true },
    id: { type: String, required: true },
  },
  { _id: false },
);

const songSchema = new Schema<SongDoc>(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    album: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    duration: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: SONG_STATUSES,
      default: "DRAFT",
    },
    image: { type: cloudinaryAssetSchema, default: null },
    releaseYear: {
      type: Number,
      default: () => new Date().getFullYear(),
      min: 1900,
      max: 2200,
    },
    description: { type: String, default: "", trim: true },
    audioUrl: { type: cloudinaryAssetSchema, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = (ret._id as { toString(): string } | undefined)?.toString();
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = (ret._id as { toString(): string } | undefined)?.toString();
        delete ret._id;
        return ret;
      },
    },
  },
);

// Indexes for common query patterns
songSchema.index({ artist: 1, album: 1 });
songSchema.index({ genre: 1 });
songSchema.index({ status: 1 });

export const Song = mongoose.model<SongDoc>("Song", songSchema);
