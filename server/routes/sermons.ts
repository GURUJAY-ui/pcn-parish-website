import { Router } from "express";
import { db } from "../db";
import { sermons } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", async (_req, res) => {
  const data = await db.select().from(sermons).orderBy(desc(sermons.createdAt));
  res.json(data);
});

router.post("/", requireAuth, async (req, res) => {
  const data = await db.insert(sermons).values(req.body).returning();
  res.json(data[0]);
});

router.put("/:id", requireAuth, async (req, res) => {
  const data = await db.update(sermons).set(req.body).where(eq(sermons.id, Number(req.params.id))).returning();
  res.json(data[0]);
});

router.delete("/:id", requireAuth, async (req, res) => {
  await db.delete(sermons).where(eq(sermons.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;