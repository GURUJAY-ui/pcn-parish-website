import { Router } from "express";
import { db } from "../db";
import { events } from "../db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", async (_req, res) => {
  const data = await db.select().from(events);
  res.json(data);
});

router.post("/", requireAuth, async (req, res) => {
  const data = await db.insert(events).values(req.body).returning();
  res.json(data[0]);
});

router.put("/:id", requireAuth, async (req, res) => {
  const data = await db.update(events).set(req.body).where(eq(events.id, Number(req.params.id))).returning();
  res.json(data[0]);
});

router.delete("/:id", requireAuth, async (req, res) => {
  await db.delete(events).where(eq(events.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;