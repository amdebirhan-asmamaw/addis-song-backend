import Joi from "joi";

export const createSongSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  artist: Joi.string().trim().min(1).max(200).required(),
  album: Joi.string().trim().min(1).max(200).required(),
  genre: Joi.string().trim().min(1).max(100).required(),
});

export const updateSongSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200),
  artist: Joi.string().trim().min(1).max(200),
  album: Joi.string().trim().min(1).max(200),
  genre: Joi.string().trim().min(1).max(100),
}).min(1); // At least one field required for update
