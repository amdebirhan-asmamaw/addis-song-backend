import type { Document } from "mongoose";

export interface ISong {
  title: string;
  artist: string;
  album: string;
  genre: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SongDoc = Document & ISong;

// Request DTOs
export interface CreateSongDto {
  title: string;
  artist: string;
  album: string;
  genre: string;
}

export type UpdateSongDto = Partial<CreateSongDto>;

// Stats response types
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
