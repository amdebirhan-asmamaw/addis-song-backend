import Joi from "joi";

const currentYear = new Date().getFullYear();

const SONG_STATUSES = ["LIVE", "PROCESSING", "DRAFT"] as const;

// Note: validate middleware uses `convert: true`, so numeric strings from
// multipart/form-data bodies (e.g. releaseYear="2023") are coerced.

const baseFields = {
  title: Joi.string().trim().min(1).max(200),
  artist: Joi.string().trim().min(1).max(200),
  album: Joi.string().trim().min(1).max(200),
  genre: Joi.string().trim().min(1).max(100),
  duration: Joi.string().trim().allow("").max(20),
  status: Joi.string().valid(...SONG_STATUSES),
  releaseYear: Joi.number().integer().min(1900).max(currentYear + 1),
  description: Joi.string().allow("").max(2000),
};

export const createSongSchema = Joi.object({
  ...baseFields,
  title: baseFields.title.required(),
  artist: baseFields.artist.required(),
  album: baseFields.album.required(),
  genre: baseFields.genre.required(),
});

export const updateSongSchema = Joi.object(baseFields).min(1);
