import { Readable } from "node:stream";
import { cloudinary } from "../config/cloudinary";
import type { UploadApiResponse } from "cloudinary";

export interface CloudinaryAsset {
  url: string;
  id: string; // cloudinary public_id, used for deletion
}

export type AssetKind = "image" | "audio";

const FOLDER = "addis-song";

const resourceType = (kind: AssetKind): "image" | "video" =>
  kind === "audio" ? "video" : "image";

/**
 * Streams a Multer-buffered file to Cloudinary and returns the asset reference.
 * Audio is uploaded as a "video" resource — Cloudinary's media pipeline groups
 * audio and video under the same type.
 */
export function uploadBuffer(
  buffer: Buffer,
  kind: AssetKind,
): Promise<CloudinaryAsset> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${FOLDER}/${kind === "audio" ? "audio" : "images"}`,
        resource_type: resourceType(kind),
      },
      (err, result: UploadApiResponse | undefined) => {
        if (err || !result) {
          return reject(err ?? new Error("Cloudinary upload returned no result"));
        }
        resolve({ url: result.secure_url, id: result.public_id });
      },
    );
    Readable.from(buffer).pipe(stream);
  });
}

/**
 * Best-effort delete. Network/permission errors are logged but never thrown,
 * so a Cloudinary outage can't take down song deletion.
 */
export async function deleteAsset(
  asset: CloudinaryAsset | null | undefined,
  kind: AssetKind,
): Promise<void> {
  if (!asset?.id) return;
  try {
    await cloudinary.uploader.destroy(asset.id, {
      resource_type: resourceType(kind),
      invalidate: true,
    });
  } catch (err) {
    console.warn(`Cloudinary delete failed for ${asset.id}`, err);
  }
}
