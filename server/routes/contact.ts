import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { db } from "../db";
import { contacts, subscribers } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { submissionLimiter, newsletterLimiter } from "../lib/security";
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

// Public — homepage newsletter signup. Dedicated rate-limit bucket so it
// doesn't compete with contact-form / prayer-request submissions.
const newsletterSchema = z.object({
  name:  z.string().min(1).max(100).optional(),
  email: z.string().email().max(200),
});

router.post("/newsletter", newsletterLimiter, async (req, res) => {
  const parsed = newsletterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
  }

  try {
    // Keep writing to contacts so the admin Contacts inbox still shows signups.
    const data = await db
      .insert(contacts)
      .values({
        name: parsed.data.name ?? "",
        email: parsed.data.email,
        phone: "",
        subject: "Newsletter Signup",
        message: "Homepage bulletin / newsletter signup.",
        type: "message",
        anonymous: false,
      })
      .returning();

    // Upsert into subscribers — the authoritative list for newsletter sends.
    // If the address was previously unsubscribed, re-subscribing clears the
    // unsubscribedAt flag so they receive future bulletins again.
    await db
      .insert(subscribers)
      .values({
        email: parsed.data.email,
        name: parsed.data.name ?? null,
        unsubscribeToken: randomUUID(),
        unsubscribedAt: null,
      })
      .onConflictDoUpdate({
        target: subscribers.email,
        set: {
          name: sql`COALESCE(EXCLUDED.name, ${subscribers.name})`,
          unsubscribedAt: null,
        },
      });

    res.json({ message: "Subscribed", id: data[0].id });
  } catch (err) {
    logger.error("Newsletter signup insert error", { err });
    res.status(500).json({ error: "Failed to sign up" });
  }
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