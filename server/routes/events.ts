import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { events } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { logger } from "../lib/logger";

const router = Router();

const eventSchema = z.object({
  day:         z.string().min(1).max(2),
  month:       z.string().min(1).max(20),
  title:       z.string().min(1).max(200),
  time:        z.string().min(1).max(50),
  location:    z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  category:    z.string().min(1).max(100),
  featured:    z.boolean().default(false),
});

// Public — get all events
router.get("/", async (_req, res) => {
  try {
    const data = await db.select().from(events).orderBy(desc(events.createdAt));
    res.json(data);
  } catch (err) {
    logger.error("Events fetch error", { err });
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Admin — create event
router.post("/", requireAuth, async (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
  }

  try {
    const data = await db.insert(events).values(parsed.data).returning();
    res.status(201).json(data[0]);
  } catch (err) {
    logger.error("Event insert error", { err });
    res.status(500).json({ error: "Failed to create event" });
  }
});

// Admin — update event
router.put("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const parsed = eventSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
  }

  try {
    const [existing] = await db.select().from(events).where(eq(events.id, id));
    if (!existing) return res.status(404).json({ error: "Event not found" });

    const data = await db.update(events).set(parsed.data).where(eq(events.id, id)).returning();
    res.json(data[0]);
  } catch (err) {
    logger.error("Event update error", { err });
    res.status(500).json({ error: "Failed to update event" });
  }
});

// Admin — delete event
router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const [existing] = await db.select().from(events).where(eq(events.id, id));
    if (!existing) return res.status(404).json({ error: "Event not found" });

    await db.delete(events).where(eq(events.id, id));
    res.json({ success: true });
  } catch (err) {
    logger.error("Event delete error", { err });
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;