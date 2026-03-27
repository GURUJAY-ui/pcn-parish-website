import { Router } from "express";
import { db } from "../db";
import { testimonies } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", async (_req, res) => {
  const data = await db.select().from(testimonies).orderBy(desc(testimonies.createdAt));
  res.json(data);
});

// Public submission
router.post("/submit", async (req, res) => {
  const data = await db.insert(testimonies).values({ ...req.body, approved: false }).returning();
  res.json({ message: "Testimony submitted for review", id: data[0].id });
});

router.post("/", requireAuth, async (req, res) => {
  const data = await db.insert(testimonies).values(req.body).returning();
  res.json(data[0]);
});

router.put("/:id", requireAuth, async (req, res) => {
  const data = await db.update(testimonies).set(req.body).where(eq(testimonies.id, Number(req.params.id))).returning();
  res.json(data[0]);
});

router.delete("/:id", requireAuth, async (req, res) => {
  await db.delete(testimonies).where(eq(testimonies.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;