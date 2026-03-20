import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { admins } from "../db/schema";
import { eq } from "drizzle-orm";
import { authLimiter } from "../lib/security";
import { validate, loginSchema } from "../lib/validate";
import { generateTokens, blacklistToken, verifyRefreshToken } from "../lib/tokens";
import { logger } from "../lib/logger";

const router = Router();

// Track failed login attempts per IP
const failedAttempts = new Map<string, { count: number; lastAttempt: Date }>();

router.post("/login", authLimiter, validate(loginSchema), async (req, res) => {
  const ip = req.ip ?? "unknown";
  const { username, password } = req.body;

  try {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));

    if (!admin) {
      // Log failed attempt
      const attempts = failedAttempts.get(ip) ?? { count: 0, lastAttempt: new Date() };
      failedAttempts.set(ip, { count: attempts.count + 1, lastAttempt: new Date() });

      logger.warn("Failed login — unknown username", { ip, username, attempts: attempts.count + 1 });

      // Consistent timing to prevent username enumeration
      await bcrypt.compare(password, "$2b$12$invalidhashtopreventtimingattack");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);

    if (!valid) {
      const attempts = failedAttempts.get(ip) ?? { count: 0, lastAttempt: new Date() };
      failedAttempts.set(ip, { count: attempts.count + 1, lastAttempt: new Date() });

      logger.warn("Failed login — wrong password", {
        ip,
        username,
        attempts: attempts.count + 1,
        adminId: admin.id,
      });

      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Clear failed attempts on success
    failedAttempts.delete(ip);

    const { accessToken, refreshToken } = generateTokens(admin.id);

    logger.info("Admin login successful", { ip, username, adminId: admin.id });

    res.json({ accessToken, refreshToken, username: admin.username });
  } catch (err) {
    logger.error("Login error", { err });
    res.status(500).json({ error: "Server error" });
  }
});

// Refresh access token
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  try {
    const { adminId } = verifyRefreshToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(adminId);

    // Blacklist old refresh token (rotation)
    blacklistToken(refreshToken);

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

// Logout — blacklist both tokens
router.post("/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const { refreshToken } = req.body;

  if (token) blacklistToken(token);
  if (refreshToken) blacklistToken(refreshToken);

  logger.info("Admin logout", { ip: req.ip });
  res.json({ message: "Logged out successfully" });
});

// One-time setup — DISABLE AFTER USE
router.post("/setup", async (req, res) => {
  try {
    const { username, password, secret } = req.body;
    if (secret !== process.env.SETUP_SECRET) {
      logger.warn("Unauthorized setup attempt", { ip: req.ip });
      return res.status(403).json({ error: "Forbidden" });
    }

    // Check if any admin already exists
    const existing = await db.select().from(admins);
    if (existing.length > 0) {
      return res.status(403).json({ error: "Setup already completed" });
    }

    if (password.length < 12) {
      return res.status(400).json({ error: "Password must be at least 12 characters" });
    }

    const passwordHash = await bcrypt.hash(password, 14); // bcrypt cost 14
    const [admin] = await db.insert(admins).values({ username, passwordHash }).returning();

    logger.info("First admin created", { username, adminId: admin.id });
    res.json({ message: "Admin created successfully", id: admin.id });
  } catch (err) {
    logger.error("Setup error", { err });
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
