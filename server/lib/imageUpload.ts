/**
 * server/lib/imageUpload.ts
 *
 * Shared image-upload pipeline used by gallery uploads and newsletter
 * banners/posters. Same hardening as the original gallery route:
 *  1. multer memoryStorage  — file never hits disk unvalidated
 *  2. MIME allowlist        — rejects anything not jpeg/png/webp/gif
 *  3. Magic-byte check      — catches MIME-spoofed uploads
 *  4. sharp re-encode       — strips metadata + neutralises polyglots
 *  5. UUID v4 public id     — no user-supplied path component
 */

import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
type AllowedMime = (typeof ALLOWED_MIME)[number];

const MAGIC: Record<AllowedMime, { offset: number; bytes: Buffer }[]> = {
  "image/jpeg": [{ offset: 0, bytes: Buffer.from([0xff, 0xd8, 0xff]) }],
  "image/png": [
    { offset: 0, bytes: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
  ],
  "image/webp": [{ offset: 8, bytes: Buffer.from([0x57, 0x45, 0x42, 0x50]) }],
  "image/gif": [{ offset: 0, bytes: Buffer.from([0x47, 0x49, 0x46, 0x38]) }],
};

export function checkMagicBytes(buf: Buffer, mime: string): boolean {
  const checks = MAGIC[mime as AllowedMime];
  if (!checks) return false;
  return checks.every(({ offset, bytes }) => {
    if (buf.length < offset + bytes.length) return false;
    return buf.subarray(offset, offset + bytes.length).equals(bytes);
  });
}

// Multer instance — memory only, 5 MB cap, single file.
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if ((ALLOWED_MIME as readonly string[]).includes(file.mimetype)) cb(null, true);
    else cb(new Error("INVALID_MIME_TYPE"));
  },
});

function uploadBufferToCloudinary(
  buf: Buffer,
  folder: string,
  publicId: string
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: "image" },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("Upload failed"));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buf);
  });
}

/**
 * Validate magic bytes, re-encode to strip metadata, and upload to Cloudinary.
 * Throws "BAD_MAGIC" if content doesn't match the declared MIME type.
 */
export async function processAndUploadImage(
  buffer: Buffer,
  mimetype: string,
  folder: string
): Promise<string> {
  if (!checkMagicBytes(buffer, mimetype)) {
    throw new Error("BAD_MAGIC");
  }
  const cleaned = await sharp(buffer).withMetadata({}).toBuffer();
  const { secure_url } = await uploadBufferToCloudinary(cleaned, folder, uuidv4());
  return secure_url;
}
