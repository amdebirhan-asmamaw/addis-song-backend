import { Router } from "express";
import { songController } from "./song.controller";
import { validate } from "../../middlewares/validate";
import { createSongSchema, updateSongSchema } from "./song.validation";

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
 * @desc    Create a new song
 * @body    {string} title  - Song title (required)
 * @body    {string} artist - Artist name (required)
 * @body    {string} album  - Album name (required)
 * @body    {string} genre  - Genre name (required)
 * @access  Public
 */
router.post("/", validate(createSongSchema), songController.create);

/**
 * @route   PUT /api/v1/songs/:id
 * @desc    Update an existing song (partial update allowed)
 * @param   {string} id - MongoDB ObjectId
 * @body    {string} [title]  - Song title
 * @body    {string} [artist] - Artist name
 * @body    {string} [album]  - Album name
 * @body    {string} [genre]  - Genre name
 * @access  Public
 */
router.put("/:id", validate(updateSongSchema), songController.update);

/**
 * @route   DELETE /api/v1/songs/:id
 * @desc    Delete a song by its ID
 * @param   {string} id - MongoDB ObjectId
 * @access  Public
 */
router.delete("/:id", songController.remove);

export default router;
