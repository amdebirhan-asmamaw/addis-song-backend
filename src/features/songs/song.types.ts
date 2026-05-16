import type { Document } from "mongoose";
import type { CloudinaryAsset } from "../../utils/cloudinaryAsset";

export type SongStatus = "LIVE" | "PROCESSING" | "DRAFT";

export interface ISong {
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: string;
  status: SongStatus;
  image: CloudinaryAsset | null;
  releaseYear: number;
  description: string;
  audioUrl: CloudinaryAsset | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SongDoc = Document & ISong;

// ─── Request DTOs ─────────────────────────────────────────────────────
// These represent the text fields parsed from the body. Cloudinary assets
// are populated by the controller from uploaded files, not from the body.

export interface CreateSongDto {
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration?: string;
  status?: SongStatus;
  releaseYear?: number;
  description?: string;
}

export type UpdateSongDto = Partial<CreateSongDto>;

// ─── Stats response types ─────────────────────────────────────────────

export interface GenreStat {
  genre: string;
  count: number;
}

export interface ArtistStat {
  artist: string;
  songCount: number;
  albumCount: number;
}

export interface AlbumStat {
  album: string;
  artist: string;
  songCount: number;
}

export interface OverallStats {
  totalSongs: number;
  totalArtists: number;
  totalAlbums: number;
  totalGenres: number;
  songsPerGenre: GenreStat[];
  songsAndAlbumsPerArtist: ArtistStat[];
  songsPerAlbum: AlbumStat[];
}
