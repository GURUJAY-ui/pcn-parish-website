import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { admins } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { verifyAccessToken } from "../lib/tokens";
import { logger } from "../lib/logger";

const router = Router();

const DEFAULT_SETTINGS = {
  role: "admin",
  roleLabel: "Administrator",
};

// GET /api/settings
router.get("/", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.json(DEFAULT_SETTINGS);
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const { adminId } = verifyAccessToken(token);
    const [admin] = await db.select().from(admins).where(eq(admins.id, adminId));

    if (!admin) {
      return res.json(DEFAULT_SETTINGS);
    }

    return res.json({
      role: "admin",
      roleLabel: admin.username || "Administrator",
    });
  } catch (err: any) {
    logger.warn("Invalid settings auth token", { error: err?.message, path: req.path });
    return res.json(DEFAULT_SETTINGS);
  }
});

// PUT /api/settings
router.put("/", requireAuth, async (req, res) => {
  const updatedSettings = {
    ...DEFAULT_SETTINGS,
    ...req.body,
  };

  // This route is currently a pass-through for future settings persistence.
  return res.json(updatedSettings);
});

export default router;
