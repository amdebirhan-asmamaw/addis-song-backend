import { Song } from "./song.model";
import type { CreateSongDto, UpdateSongDto, SongDoc } from "./song.types";

export const songService = {
  async getAll(filter?: { genre?: string }): Promise<SongDoc[]> {
    const query = filter?.genre ? { genre: filter.genre } : {};
    return Song.find(query).sort({ createdAt: -1 });
  },

  async getById(id: string): Promise<SongDoc | null> {
    return Song.findById(id);
  },

  async create(data: CreateSongDto): Promise<SongDoc> {
    return Song.create(data);
  },

  async update(id: string, data: UpdateSongDto): Promise<SongDoc | null> {
    return Song.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  async remove(id: string): Promise<SongDoc | null> {
    return Song.findByIdAndDelete(id);
  },
};
