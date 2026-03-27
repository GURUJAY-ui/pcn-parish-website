import { Router } from "express";
import { db } from "../db";
import { heroSlides } from "../db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", async (_req, res) => {
  const slides = await db.select().from(heroSlides).orderBy(heroSlides.order);
  res.json(slides);
});

router.post("/", requireAuth, async (req, res) => {
  const slide = await db.insert(heroSlides).values(req.body).returning();
  res.json(slide[0]);
});

router.put("/:id", requireAuth, async (req, res) => {
  const slide = await db.update(heroSlides).set(req.body).where(eq(heroSlides.id, Number(req.params.id))).returning();
  res.json(slide[0]);
});

router.delete("/:id", requireAuth, async (req, res) => {
  await db.delete(heroSlides).where(eq(heroSlides.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;