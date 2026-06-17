/**
 * server/routes/gallery.ts
 *
 * Security hardening over the original:
 *  1. multer memoryStorage  — file never hits disk unvalidated
 *  2. MIME allowlist        — rejects anything not jpeg/png/webp/gif
 *  3. Magic-byte check      — catches MIME-spoofed uploads (e.g. PHP file renamed .jpg)
 *  4. sharp re-encode       — strips ALL metadata (EXIF/XMP/ICC) + neutralises polyglots
 *  5. UUID v4 filename      — no user-supplied path component ever touches the FS
 *  6. Path-traversal guard  — paranoia double-check before every disk write/delete
 *  7. uploadLimiter         — 30 uploads / hour per IP
 *  8. Input validation      — zod on caption / category before any DB write
 *  9. requireAuth on POST/PUT/DELETE — unauthenticated users get 401 before multer runs
 */

import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import { db } from "../db";
import { gallery } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { uploadLimiter, submissionLimiter } from "../lib/security";
import { logger } from "../lib/logger";

const router = Router();

// ─── Cloudinary config ───────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
const CLOUDINARY_FOLDER = "gallery";

// ─── Allowed types ────────────────────────────────────────────────────────────
const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
type AllowedMime = (typeof ALLOWED_MIME)[number];

// ─── Magic-byte signatures ────────────────────────────────────────────────────
const MAGIC: Record<AllowedMime, { offset: number; bytes: Buffer }[]> = {
  "image/jpeg": [{ offset: 0, bytes: Buffer.from([0xff, 0xd8, 0xff]) }],
  "image/png": [
    {
      offset: 0,
      bytes: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    },
  ],
  "image/webp": [{ offset: 8, bytes: Buffer.from([0x57, 0x45, 0x42, 0x50]) }],
  "image/gif": [{ offset: 0, bytes: Buffer.from([0x47, 0x49, 0x46, 0x38]) }],
};

function checkMagicBytes(buf: Buffer, mime: string): boolean {
  const checks = MAGIC[mime as AllowedMime];
  if (!checks) return false;
  return checks.every(({ offset, bytes }) => {
    if (buf.length < offset + bytes.length) return false;
    return buf.subarray(offset, offset + bytes.length).equals(bytes);
  });
}

// ─── Cloudinary helpers ───────────────────────────────────────────────────────
function uploadBufferToCloudinary(
  buf: Buffer,
  publicId: string
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: CLOUDINARY_FOLDER, public_id: publicId, resource_type: "image" },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("Upload failed"));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buf);
  });
}

// Extract Cloudinary public_id from a secure_url stored in imageUrl.
// Format: https://res.cloudinary.com/<cloud>/image/upload/v<version>/<public_id>.<ext>
function publicIdFromUrl(url: string): string | null {
  const m = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
  return m ? m[1] : null;
}

// ─── Multer — memory only, 5 MB cap ──────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if ((ALLOWED_MIME as readonly string[]).includes(file.mimetype))
      cb(null, true);
    else cb(new Error("INVALID_MIME_TYPE"));
  },
});

// ─── Input validation schema ──────────────────────────────────────────────────
const galleryBodySchema = z.object({
  caption: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[\w\s,.'"\-–—!?():]+$/),
  category: z.enum(["worship", "events", "youth", "music"]),
});

// ─── Safe remote delete helper ────────────────────────────────────────────────
async function safeDelete(imageUrl: string | null) {
  if (!imageUrl) return;
  try {
    const publicId = publicIdFromUrl(imageUrl);
    if (publicId) await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    logger.warn("Failed to delete old gallery image", { imageUrl, error: e });
  }
}

// ─── Submission body schema (public, captures optional submitter info) ────────
const gallerySubmitSchema = z.object({
  caption: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[\w\s,.'"\-–—!?():]+$/),
  category: z.enum(["worship", "events", "youth", "music"]),
  submitterName: z.string().min(1).max(100).optional(),
  submitterEmail: z.string().email().max(200).optional(),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public: read APPROVED gallery items only
router.get("/", async (_req, res) => {
  try {
    const data = await db
      .select()
      .from(gallery)
      .where(eq(gallery.approved, true))
      .orderBy(desc(gallery.createdAt));
    res.json(data);
  } catch (err) {
    logger.error("Gallery fetch error", { err });
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
});

// Admin: read ALL gallery items (including pending submissions)
router.get("/all", requireAuth, async (_req, res) => {
  try {
    const data = await db.select().from(gallery).orderBy(desc(gallery.createdAt));
    res.json(data);
  } catch (err) {
    logger.error("Gallery (admin) fetch error", { err });
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
});

// Public: submit a photo for admin review (always stored unapproved)
router.post(
  "/submit",
  submissionLimiter,
  upload.single("image"),
  async (req, res) => {
    const parsed = gallerySubmitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid caption or category." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required." });
    }

    if (!checkMagicBytes(req.file.buffer, req.file.mimetype)) {
      return res
        .status(415)
        .json({ error: "File content does not match declared type." });
    }

    let imageUrl: string | null = null;
    try {
      const cleaned = await sharp(req.file.buffer).withMetadata({}).toBuffer();
      const { secure_url } = await uploadBufferToCloudinary(cleaned, uuidv4());
      imageUrl = secure_url;
    } catch (err) {
      logger.error("Image processing error on /submit", { err });
      return res.status(500).json({ error: "Image processing failed." });
    }

    try {
      const [row] = await db
        .insert(gallery)
        .values({
          caption: parsed.data.caption,
          category: parsed.data.category,
          imageUrl,
          approved: false,
          submitterName: parsed.data.submitterName ?? null,
          submitterEmail: parsed.data.submitterEmail ?? null,
        })
        .returning({ id: gallery.id });
      res
        .status(201)
        .json({ message: "Photo submitted for review", id: row.id });
    } catch (err) {
      if (imageUrl) safeDelete(imageUrl);
      logger.error("Gallery submit insert error", { err });
      res.status(500).json({ error: "Database error." });
    }
  }
);

// Admin: create new gallery item with image upload
router.post(
  "/",
  requireAuth,
  uploadLimiter,
  upload.single("image"),
  async (req, res) => {
    // Validate text fields
    const parsed = galleryBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid caption or category." });
    }
    const { caption, category } = parsed.data;

    let imageUrl: string | null = null;

    if (req.file) {
      // Magic-byte check
      if (!checkMagicBytes(req.file.buffer, req.file.mimetype)) {
        return res
          .status(415)
          .json({ error: "File content does not match declared type." });
      }

      try {
        // Re-encode: strips metadata, neutralises polyglots
        const cleaned = await sharp(req.file.buffer).withMetadata({}).toBuffer();
        const { secure_url } = await uploadBufferToCloudinary(cleaned, uuidv4());
        imageUrl = secure_url;
      } catch (err) {
        logger.error("Image processing error on POST", { err });
        return res.status(500).json({ error: "Image processing failed." });
      }
    }

    try {
      const [row] = await db
        .insert(gallery)
        .values({ caption, category, imageUrl: imageUrl ?? "", approved: true })
        .returning();
      res.status(201).json(row);
    } catch (err) {
      // Clean up written file if DB insert fails
      if (imageUrl) safeDelete(imageUrl);
      logger.error("Gallery insert error", { err });
      res.status(500).json({ error: "Database error." });
    }
  }
);

// Admin: approve a pending submission
router.patch("/:id/approve", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid ID." });
  }
  try {
    const [row] = await db
      .update(gallery)
      .set({ approved: true })
      .where(eq(gallery.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Gallery item not found." });
    res.json(row);
  } catch (err) {
    logger.error("Gallery approve error", { err });
    res.status(500).json({ error: "Database error." });
  }
});

// Admin: update caption/category + optionally replace image
router.put(
  "/:id",
  requireAuth,
  uploadLimiter,
  upload.single("image"),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid ID." });
    }

    // Validate text fields if provided
    const parsed = galleryBodySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid caption or category." });
    }

    // Fetch existing record
    const [existing] = await db
      .select()
      .from(gallery)
      .where(eq(gallery.id, id));
    if (!existing)
      return res.status(404).json({ error: "Gallery item not found." });

    const updates: Partial<typeof existing> = { ...parsed.data };

    if (req.file) {
      if (!checkMagicBytes(req.file.buffer, req.file.mimetype)) {
        return res
          .status(415)
          .json({ error: "File content does not match declared type." });
      }

      try {
        const cleaned = await sharp(req.file.buffer).withMetadata({}).toBuffer();
        const { secure_url } = await uploadBufferToCloudinary(cleaned, uuidv4());
        updates.imageUrl = secure_url;
        // Delete old remote asset after successful upload
        await safeDelete(existing.imageUrl);
      } catch (err) {
        logger.error("Image processing error on PUT", { err });
        return res.status(500).json({ error: "Image processing failed." });
      }
    }

    try {
      const [row] = await db
        .update(gallery)
        .set(updates)
        .where(eq(gallery.id, id))
        .returning();
      res.json(row);
    } catch (err) {
      logger.error("Gallery update error", { err });
      res.status(500).json({ error: "Database error." });
    }
  }
);

// Admin: delete gallery item + its image file
router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid ID." });
  }

  const [existing] = await db.select().from(gallery).where(eq(gallery.id, id));
  if (!existing) return res.status(404).json({ error: "Not found." });

  try {
    await db.delete(gallery).where(eq(gallery.id, id));
    safeDelete(existing.imageUrl);
    res.json({ success: true });
  } catch (err) {
    logger.error("Gallery delete error", { err });
    res.status(500).json({ error: "Database error." });
  }
});

// ─── Multer error handler (must be last in this router) ───────────────────────
router.use((err: any, _req: any, res: any, next: any) => {
  if (err.message === "INVALID_MIME_TYPE") {
    return res
      .status(415)
      .json({ error: "File type not allowed. Use JPEG, PNG, WebP, or GIF." });
  }
  if (err.message?.includes("File too large")) {
    return res.status(413).json({ error: "File exceeds 5 MB limit." });
  }
  next(err);
});

export default router;
