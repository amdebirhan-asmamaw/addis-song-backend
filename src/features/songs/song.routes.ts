import { Router } from "express";
import { songController } from "./song.controller";
import { validate } from "../../middlewares/validate";
import { createSongSchema, updateSongSchema } from "./song.validation";
import { songUpload } from "../../middlewares/upload.middleware";

const router = Router();

/**
 * @route   GET /api/v1/songs
 * @desc    Retrieve all songs (optionally filtered by genre)
 * @query   {string} [genre] - Filter by genre name
 * @access  Public
 */
router.get("/", songController.list);

/**
 * @route   GET /api/v1/songs/stats
 * @desc    Get overall statistics (totals, per-genre, per-artist, per-album)
 * @access  Public
 */
router.get("/stats", songController.stats);

/**
 * @route   GET /api/v1/songs/:id
 * @desc    Retrieve a single song by its ID
 * @param   {string} id - MongoDB ObjectId
 * @access  Public
 */
router.get("/:id", songController.getOne);

/**
 * @route   POST /api/v1/songs
 * @desc    Create a new song.
 * @body    multipart/form-data OR application/json
 * @field   {string}      title        - Song title (required)
 * @field   {string}      artist       - Artist name (required)
 * @field   {string}      album        - Album name (required)
 * @field   {string}      genre        - Genre (required)
 * @field   {string}      [duration]   - e.g. "04:32"
 * @field   {string}      [status]     - "LIVE" | "PROCESSING" | "DRAFT"
 * @field   {number}      [releaseYear]
 * @field   {string}      [description]
 * @file    {File}        [image]      - Cover artwork, uploaded to Cloudinary
 * @file    {File}        [audio]      - Audio track, uploaded to Cloudinary
 * @access  Public
 */
router.post(
  "/",
  songUpload,
  validate(createSongSchema),
  songController.create,
);

/**
 * @route   PUT /api/v1/songs/:id
 * @desc    Update an existing song. Any field is optional; uploaded files
 *          replace the existing assets and the old Cloudinary resources are
 *          deleted after the DB commit.
 * @access  Public
 */
router.put(
  "/:id",
  songUpload,
  validate(updateSongSchema),
  songController.update,
);

/**
 * @route   DELETE /api/v1/songs/:id
 * @desc    Delete a song and clean up its Cloudinary assets.
 * @access  Public
 */
router.delete("/:id", songController.remove);

export default router;
