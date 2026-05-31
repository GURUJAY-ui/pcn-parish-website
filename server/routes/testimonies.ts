import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { testimonies } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { submissionLimiter } from "../lib/security";
import { logger } from "../lib/logger";

const router = Router();

// ── Schemas ───────────────────────────────────────────────────────────────
const testimonySchema = z.object({
  name: z.string().min(1).max(100),
  profession: z.string().max(100).optional().default(""),
  quote: z.string().min(10).max(2000),
  category: z.string().min(1).max(100),
});

// Admin may also toggle approval; public submissions never can.
const adminTestimonySchema = testimonySchema.extend({
  approved: z.boolean().optional(),
});

// ── Public — list APPROVED testimonies only ─────────────────────────────────
router.get("/", async (_req, res) => {
  try {
    const data = await db
      .select()
      .from(testimonies)
      .where(eq(testimonies.approved, true))
      .orderBy(desc(testimonies.createdAt));
    res.json(data);
  } catch (err) {
    logger.error("Testimonies fetch error", { err });
    res.status(500).json({ error: "Failed to fetch testimonies" });
  }
});

// ── Admin — list ALL testimonies (including pending) ────────────────────────
router.get("/all", requireAuth, async (_req, res) => {
  try {
    const data = await db.select().from(testimonies).orderBy(desc(testimonies.createdAt));
    res.json(data);
  } catch (err) {
    logger.error("Testimonies (admin) fetch error", { err });
    res.status(500).json({ error: "Failed to fetch testimonies" });
  }
});

// ── Public submission — always stored unapproved, pending review ────────────
router.post("/submit", submissionLimiter, async (req, res) => {
  const parsed = testimonySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
  }

  try {
    const [row] = await db
      .insert(testimonies)
      .values({ ...parsed.data, approved: false })
      .returning();
    res.status(201).json({ message: "Testimony submitted for review", id: row.id });
  } catch (err) {
    logger.error("Testimony submit error", { err });
    res.status(500).json({ error: "Failed to submit testimony" });
  }
});

// ── Admin — create (approved by default) ────────────────────────────────────
router.post("/", requireAuth, async (req, res) => {
  const parsed = adminTestimonySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
  }

  try {
    const [row] = await db
      .insert(testimonies)
      .values({ ...parsed.data, approved: parsed.data.approved ?? true })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    logger.error("Testimony create error", { err });
    res.status(500).json({ error: "Failed to create testimony" });
  }
});

// ── Admin — update / approve ────────────────────────────────────────────────
router.put("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const parsed = adminTestimonySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
  }

  try {
    const [existing] = await db.select().from(testimonies).where(eq(testimonies.id, id));
    if (!existing) return res.status(404).json({ error: "Testimony not found" });

    const [row] = await db
      .update(testimonies)
      .set(parsed.data)
      .where(eq(testimonies.id, id))
      .returning();
    res.json(row);
  } catch (err) {
    logger.error("Testimony update error", { err });
    res.status(500).json({ error: "Failed to update testimony" });
  }
});

// ── Admin — delete ──────────────────────────────────────────────────────────
router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const [existing] = await db.select().from(testimonies).where(eq(testimonies.id, id));
    if (!existing) return res.status(404).json({ error: "Testimony not found" });

    await db.delete(testimonies).where(eq(testimonies.id, id));
    res.json({ success: true });
  } catch (err) {
    logger.error("Testimony delete error", { err });
    res.status(500).json({ error: "Failed to delete testimony" });
  }
});

export default router;
