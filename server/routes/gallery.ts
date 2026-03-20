import { Router } from "express";
import multer from "multer";
import path from "path";
import { db } from "../db";
import { gallery } from "../db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

const storage = multer.diskStorage({
  destination: "uploads/gallery/",
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"));
  },
});

router.get("/", async (_req, res) => {
  const data = await db.select().from(gallery);
  res.json(data);
});

router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  const imageUrl = req.file
    ? `/uploads/gallery/${req.file.filename}`
    : req.body.imageUrl;
  const data = await db.insert(gallery).values({ ...req.body, imageUrl }).returning();
  res.json(data[0]);
});

router.put("/:id", requireAuth, upload.single("image"), async (req, res) => {
  const updates: any = { ...req.body };
  if (req.file) updates.imageUrl = `/uploads/gallery/${req.file.filename}`;
  const data = await db.update(gallery).set(updates).where(eq(gallery.id, Number(req.params.id))).returning();
  res.json(data[0]);
});

router.delete("/:id", requireAuth, async (req, res) => {
  await db.delete(gallery).where(eq(gallery.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;