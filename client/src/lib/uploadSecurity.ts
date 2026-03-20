import multer from "multer";
import path from "path";
import crypto from "crypto";
import { Request } from "express";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/gallery/");
  },
  filename: (_req, file, cb) => {
    // Random filename — never trust original filename
    const random = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${random}${ext}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase();

  // Check both MIME type and extension
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error("Only image files are allowed (JPEG, PNG, WebP, GIF)"));
  }
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error("Invalid file extension"));
  }

  // Prevent path traversal
  if (file.originalname.includes("..") || file.originalname.includes("/")) {
    return cb(new Error("Invalid filename"));
  }

  cb(null, true);
}

export const secureUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // max 1 file per request
    fields: 10,
  },
  fileFilter,
});