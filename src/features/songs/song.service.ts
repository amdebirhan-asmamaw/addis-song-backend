import { Song } from "./song.model";
import type { CreateSongDto, UpdateSongDto, SongDoc } from "./song.types";
import {
  deleteAsset,
  uploadBuffer,
  type CloudinaryAsset,
} from "../../utils/cloudinaryAsset";

export interface SongFiles {
  image?: Express.Multer.File;
  audio?: Express.Multer.File;
}

async function uploadIncomingFiles(files: SongFiles): Promise<{
  image?: CloudinaryAsset;
  audioUrl?: CloudinaryAsset;
}> {
  const [image, audioUrl] = await Promise.all([
    files.image ? uploadBuffer(files.image.buffer, "image") : Promise.resolve(undefined),
    files.audio ? uploadBuffer(files.audio.buffer, "audio") : Promise.resolve(undefined),
  ]);
  return { image, audioUrl };
}

export const songService = {
  async getAll(filter?: { genre?: string }): Promise<SongDoc[]> {
    const query = filter?.genre ? { genre: filter.genre } : {};
    return Song.find(query).sort({ createdAt: -1 });
  },

  async getById(id: string): Promise<SongDoc | null> {
    return Song.findById(id);
  },

  async create(data: CreateSongDto, files: SongFiles = {}): Promise<SongDoc> {
    const uploaded = await uploadIncomingFiles(files);
    try {
      return await Song.create({
        ...data,
        ...(uploaded.image ? { image: uploaded.image } : {}),
        ...(uploaded.audioUrl ? { audioUrl: uploaded.audioUrl } : {}),
      });
    } catch (err) {
      // DB write failed — don't leave orphaned Cloudinary assets behind.
      await Promise.all([
        deleteAsset(uploaded.image ?? null, "image"),
        deleteAsset(uploaded.audioUrl ?? null, "audio"),
      ]);
      throw err;
    }
  },

  async update(
    id: string,
    data: UpdateSongDto,
    files: SongFiles = {},
  ): Promise<SongDoc | null> {
    const existing = await Song.findById(id);
    if (!existing) return null;

    const uploaded = await uploadIncomingFiles(files);
    const patch: Record<string, unknown> = { ...data };
    if (uploaded.image) patch.image = uploaded.image;
    if (uploaded.audioUrl) patch.audioUrl = uploaded.audioUrl;

    try {
      const updated = await Song.findByIdAndUpdate(id, patch, {
        new: true,
        runValidators: true,
      });
      // Delete the displaced assets only after the DB commit succeeded.
      if (uploaded.image && existing.image) {
        deleteAsset(existing.image, "image");
      }
      if (uploaded.audioUrl && existing.audioUrl) {
        deleteAsset(existing.audioUrl, "audio");
      }
      return updated;
    } catch (err) {
      // DB write failed — roll back the new uploads.
      await Promise.all([
        deleteAsset(uploaded.image ?? null, "image"),
        deleteAsset(uploaded.audioUrl ?? null, "audio"),
      ]);
      throw err;
    }
  },

  async remove(id: string): Promise<SongDoc | null> {
    const removed = await Song.findByIdAndDelete(id);
    if (removed) {
      await Promise.all([
        deleteAsset(removed.image, "image"),
        deleteAsset(removed.audioUrl, "audio"),
      ]);
    }
    return removed;
  },
};
