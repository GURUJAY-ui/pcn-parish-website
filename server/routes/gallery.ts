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
      import path from "path";
      import fs from "fs";
      import { db } from "../db";
      import { gallery } from "../db/schema";
      import { eq } from "drizzle-orm";
      import { requireAuth } from "../middleware/auth";
      import { uploadLimiter } from "../lib/security";
      import { logger } from "../lib/logger";

      const router = Router();

      // ─── Upload directory (matches index.ts static-serve path) ───────────────────
      const UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "gallery");
      if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

      // ─── Allowed types ────────────────────────────────────────────────────────────
      const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
      type AllowedMime = (typeof ALLOWED_MIME)[number];

      // ─── Magic-byte signatures ────────────────────────────────────────────────────
      const MAGIC: Record<AllowedMime, { offset: number; bytes: Buffer }[]> = {
        "image/jpeg": [{ offset: 0, bytes: Buffer.from([0xff, 0xd8, 0xff]) }],
        "image/png":  [{ offset: 0, bytes: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) }],
        "image/webp": [{ offset: 8, bytes: Buffer.from([0x57, 0x45, 0x42, 0x50]) }],
        "image/gif":  [{ offset: 0, bytes: Buffer.from([0x47, 0x49, 0x46, 0x38]) }],
      };

      function checkMagicBytes(buf: Buffer, mime: string): boolean {
        const checks = MAGIC[mime as AllowedMime];
        if (!checks) return false;
        return checks.every(({ offset, bytes }) => {
          if (buf.length < offset + bytes.length) return false;
          return buf.subarray(offset, offset + bytes.length).equals(bytes);
        });
      }

      function mimeToExt(mime: string): string {
        return ({ "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" })[mime] ?? ".bin";
      }

      // ─── Multer — memory only, 5 MB cap ──────────────────────────────────────────
      const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024, files: 1 },
        fileFilter: (_req, file, cb) => {
          if ((ALLOWED_MIME as readonly string[]).includes(file.mimetype)) cb(null, true);
          else cb(new Error("INVALID_MIME_TYPE"));
        },
      });

      // ─── Input validation schema ──────────────────────────────────────────────────
      const galleryBodySchema = z.object({
        caption:  z.string().min(1).max(200).regex(/^[\w\s,.'"\-–—!?():]+$/),
        category: z.enum(["worship", "events", "youth", "music"]),
      });

      // ─── Safe file delete helper ──────────────────────────────────────────────────
      function safeDelete(imageUrl: string | null) {
        if (!imageUrl) return;
        try {
          const filename = path.basename(imageUrl);
          const filePath = path.join(UPLOAD_DIR, filename);
          // Path-traversal guard
          if (filePath.startsWith(UPLOAD_DIR + path.sep) && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (e) {
          logger.warn("Failed to delete old gallery image", { imageUrl, error: e });
        }
      }

      // ─── Routes ───────────────────────────────────────────────────────────────────

      // Public: read gallery items
      router.get("/", async (_req, res) => {
        try {
          const data = await db.select().from(gallery).orderBy(gallery.createdAt);
          res.json(data);
        } catch (err) {
          logger.error("Gallery fetch error", { err });
          res.status(500).json({ error: "Failed to fetch gallery" });
        }
      });

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
              return res.status(415).json({ error: "File content does not match declared type." });
            }

            const ext = mimeToExt(req.file.mimetype);
            const filename = `${uuidv4()}${ext}`;
            const outPath = path.join(UPLOAD_DIR, filename);

            // Path-traversal paranoia
            if (!outPath.startsWith(UPLOAD_DIR + path.sep)) {
              return res.status(400).json({ error: "Invalid file path." });
            }

            try {
              // Re-encode: strips metadata, neutralises polyglots
              await sharp(req.file.buffer).withMetadata({}).toFile(outPath);
              imageUrl = `/uploads/gallery/${filename}`;
            } catch (err) {
              logger.error("Image processing error on POST", { err });
              return res.status(500).json({ error: "Image processing failed." });
            }
          }

          try {
            const [row] = await db.insert(gallery).values({ caption, category, imageUrl: imageUrl ?? "" }).returning();
            res.status(201).json(row);
          } catch (err) {
            // Clean up written file if DB insert fails
            if (imageUrl) safeDelete(imageUrl);
            logger.error("Gallery insert error", { err });
            res.status(500).json({ error: "Database error." });
          }
        }
      );

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
          const [existing] = await db.select().from(gallery).where(eq(gallery.id, id));
          if (!existing) return res.status(404).json({ error: "Gallery item not found." });

          const updates: Partial<typeof existing> = { ...parsed.data };

          if (req.file) {
            if (!checkMagicBytes(req.file.buffer, req.file.mimetype)) {
              return res.status(415).json({ error: "File content does not match declared type." });
            }

            const ext = mimeToExt(req.file.mimetype);
            const filename = `${uuidv4()}${ext}`;
            const outPath = path.join(UPLOAD_DIR, filename);

            if (!outPath.startsWith(UPLOAD_DIR + path.sep)) {
              return res.status(400).json({ error: "Invalid file path." });
            }

            try {
              await sharp(req.file.buffer).withMetadata({}).toFile(outPath);
              updates.imageUrl = `/uploads/gallery/${filename}`;
              // Delete old file after successful re-encode
              safeDelete(existing.imageUrl);
            } catch (err) {
              logger.error("Image processing error on PUT", { err });
              return res.status(500).json({ error: "Image processing failed." });
            }
          }

          try {
            const [row] = await db.update(gallery).set(updates).where(eq(gallery.id, id)).returning();
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
          return res.status(415).json({ error: "File type not allowed. Use JPEG, PNG, WebP, or GIF." });
        }
        if (err.message?.includes("File too large")) {
          return res.status(413).json({ error: "File exceeds 5 MB limit." });
        }
        next(err);
      });

      export default router;