import mongoose, { Schema } from "mongoose";
import type { SongDoc } from "./song.types";

const songSchema = new Schema<SongDoc>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    album: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

// Compound index for common query patterns
songSchema.index({ artist: 1, album: 1 });
songSchema.index({ genre: 1 });

export const Song = mongoose.model<SongDoc>("Song", songSchema);
