import { Router } from "express";
import { db } from "../db";
import { contacts } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Public — submit message or prayer
router.post("/", async (req, res) => {
  const data = await db.insert(contacts).values(req.body).returning();
  res.json({ message: "Received! We'll be in touch soon.", id: data[0].id });
});

// Admin — view all
router.get("/", requireAuth, async (_req, res) => {
  const data = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  res.json(data);
});

// Admin — mark as read
router.put("/:id/read", requireAuth, async (req, res) => {
  await db.update(contacts).set({ read: true }).where(eq(contacts.id, Number(req.params.id)));
  res.json({ success: true });
});

router.delete("/:id", requireAuth, async (req, res) => {
  await db.delete(contacts).where(eq(contacts.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;