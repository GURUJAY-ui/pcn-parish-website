import { Router } from "express";
import { db } from "../db";
import { heroSlides } from "../db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { validate, heroSchema } from "../lib/validate";
import { logger } from "../lib/logger";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const slides = await db.select().from(heroSlides).orderBy(heroSlides.order);
    res.json(slides);
  } catch (err) {
    logger.error("Hero fetch error", { err });
    res.status(500).json({ error: "Failed to fetch hero slides" });
  }
});

router.post("/", requireAuth, validate(heroSchema), async (req, res) => {
  try {
    const [slide] = await db.insert(heroSlides).values(req.body).returning();
    res.status(201).json(slide);
  } catch (err) {
    logger.error("Hero create error", { err });
    res.status(500).json({ error: "Failed to create hero slide" });
  }
});

router.put("/:id", requireAuth, validate(heroSchema.partial()), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const [existing] = await db.select().from(heroSlides).where(eq(heroSlides.id, id));
    if (!existing) return res.status(404).json({ error: "Hero slide not found" });

    const [slide] = await db.update(heroSlides).set(req.body).where(eq(heroSlides.id, id)).returning();
    res.json(slide);
  } catch (err) {
    logger.error("Hero update error", { err });
    res.status(500).json({ error: "Failed to update hero slide" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const [existing] = await db.select().from(heroSlides).where(eq(heroSlides.id, id));
    if (!existing) return res.status(404).json({ error: "Hero slide not found" });

    await db.delete(heroSlides).where(eq(heroSlides.id, id));
    res.json({ success: true });
  } catch (err) {
    logger.error("Hero delete error", { err });
    res.status(500).json({ error: "Failed to delete hero slide" });
  }
});

export default router;
