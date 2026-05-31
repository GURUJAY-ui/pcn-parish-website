import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { donations } from "../db/schema";
import { desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { submissionLimiter } from "../lib/security";
import { logger } from "../lib/logger";

const router = Router();

const donationSchema = z.object({
  donorName:  z.string().min(1).max(100).optional(),
  donorEmail: z.string().email().max(200).optional(),
  amount:     z.number().int().positive().max(100_000_000), // max 1M NGN in kobo, adjust as needed
  currency:   z.enum(["NGN", "USD", "GBP", "EUR"]).default("NGN"),
  category:   z.string().max(100).optional(),
  message:    z.string().max(500).optional(),
  anonymous:  z.boolean().default(false),
  reference:  z.string().max(100).optional(),
  // status is intentionally excluded — only the server sets this
});

// Public — record a donation attempt
router.post("/", submissionLimiter, async (req, res) => {
  const parsed = donationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
  }

  try {
    // Always insert with status="pending" regardless of what client sends
    const data = await db.insert(donations).values({
      ...parsed.data,
      status: "pending",
    }).returning();
    res.json({ message: "Donation recorded", id: data[0].id });
  } catch (err) {
    logger.error("Donation insert error", { err });
    res.status(500).json({ error: "Failed to record donation" });
  }
});

// Admin — view all donations
router.get("/", requireAuth, async (_req, res) => {
  try {
    const data = await db.select().from(donations).orderBy(desc(donations.createdAt));
    res.json(data);
  } catch (err) {
    logger.error("Donation fetch error", { err });
    res.status(500).json({ error: "Failed to fetch donations" });
  }
});

export default router;