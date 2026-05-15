import { Song } from "./song.model";
import type { OverallStats } from "./song.types";

export async function getOverallStats(): Promise<OverallStats> {
  const [
    totalSongs,
    totalArtists,
    totalAlbums,
    totalGenres,
    songsPerGenre,
    songsAndAlbumsPerArtist,
    songsPerAlbum,
  ] = await Promise.all([
    // Total counts
    Song.countDocuments(),

    Song.distinct("artist").then((r) => r.length),
    Song.distinct("album").then((r) => r.length),
    Song.distinct("genre").then((r) => r.length),

    // Songs per genre
    Song.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $project: { _id: 0, genre: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]),

    // Songs & albums per artist
    Song.aggregate([
      {
        $group: {
          _id: "$artist",
          songCount: { $sum: 1 },
          albums: { $addToSet: "$album" },
        },
      },
      {
        $project: {
          _id: 0,
          artist: "$_id",
          songCount: 1,
          albumCount: { $size: "$albums" },
        },
      },
      { $sort: { songCount: -1 } },
    ]),

    // Songs per album
    Song.aggregate([
      {
        $group: {
          _id: { album: "$album", artist: "$artist" },
          songCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          album: "$_id.album",
          artist: "$_id.artist",
          songCount: 1,
        },
      },
      { $sort: { songCount: -1 } },
    ]),
  ]);

  return {
    totalSongs,
    totalArtists,
    totalAlbums,
    totalGenres,
    songsPerGenre,
    songsAndAlbumsPerArtist,
    songsPerAlbum,
  };
}
