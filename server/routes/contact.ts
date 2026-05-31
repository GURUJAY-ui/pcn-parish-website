import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { contacts } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { submissionLimiter } from "../lib/security";
import { logger } from "../lib/logger";

const router = Router();

const contactSchema = z.object({
  name:      z.string().min(1).max(100).optional(),
  email:     z.string().email().max(200).optional(),
  phone:     z.string().max(20).optional(),
  subject:   z.string().max(200).optional(),
  message:   z.string().min(1).max(3000),
  type:      z.enum(["message", "prayer"]).default("message"),
  anonymous: z.boolean().default(false),
});

// Public — submit message or prayer
router.post("/", submissionLimiter, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
  }

  try {
    const data = await db.insert(contacts).values(parsed.data).returning();
    res.json({ message: "Received! We'll be in touch soon.", id: data[0].id });
  } catch (err) {
    logger.error("Contact insert error", { err });
    res.status(500).json({ error: "Failed to submit message" });
  }
});

// Admin — view all
router.get("/", requireAuth, async (_req, res) => {
  try {
    const data = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
    res.json(data);
  } catch (err) {
    logger.error("Contact fetch error", { err });
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Admin — mark as read
router.put("/:id/read", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const [existing] = await db.select().from(contacts).where(eq(contacts.id, id));
    if (!existing) return res.status(404).json({ error: "Message not found" });

    await db.update(contacts).set({ read: true }).where(eq(contacts.id, id));
    res.json({ success: true });
  } catch (err) {
    logger.error("Contact mark-read error", { err });
    res.status(500).json({ error: "Failed to update message" });
  }
});

// Admin — delete
router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const [existing] = await db.select().from(contacts).where(eq(contacts.id, id));
    if (!existing) return res.status(404).json({ error: "Message not found" });

    await db.delete(contacts).where(eq(contacts.id, id));
    res.json({ success: true });
  } catch (err) {
    logger.error("Contact delete error", { err });
    res.status(500).json({ error: "Failed to delete message" });
  }
});

export default router;