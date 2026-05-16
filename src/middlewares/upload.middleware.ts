import multer from "multer";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.fieldname === "image" && !file.mimetype.startsWith("image/")) {
    return cb(new Error("image field must be an image file"));
  }
  if (file.fieldname === "audio" && !file.mimetype.startsWith("audio/")) {
    return cb(new Error("audio field must be an audio file"));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

/**
 * Accepts one cover image (`image`) and one audio track (`audio`).
 * No-op when the request isn't multipart/form-data, so JSON-only callers
 * still work.
 */
export const songUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "audio", maxCount: 1 },
]);
