import { Router } from "express";
import { db } from "../db";
import { donations } from "../db/schema";
import { desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Public — record a donation attempt
router.post("/", async (req, res) => {
  const data = await db.insert(donations).values(req.body).returning();
  res.json({ message: "Donation recorded", id: data[0].id });
});

// Admin — view all donations
router.get("/", requireAuth, async (_req, res) => {
  const data = await db.select().from(donations).orderBy(desc(donations.createdAt));
  res.json(data);
});

export default router;