/**
 * server/routes/auth.ts
 *
 * Security hardening over the original:
 *  1. Refresh token is set as httpOnly + Secure + SameSite=Strict cookie
 *     (no longer returned in JSON body — JS cannot read or steal it)
 *  2. Token rotation: old refresh token is blacklisted on /refresh
 *  3. /refresh reads token from cookie, not request body
 *  4. /logout clears the cookie server-side
 *  5. Consistent bcrypt timing even for unknown usernames (already present, kept)
 *  6. Failed attempt logging (already present, kept)
 */

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

const IS_PROD = process.env.NODE_ENV === "production";

// Shared cookie options
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,                    // JS cannot read this
  secure: IS_PROD,                   // HTTPS only in production
  sameSite: "strict" as const,       // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in ms
  path: "/api/auth",                 // Scoped to auth endpoints only
};

// Track failed login attempts per IP
const failedAttempts = new Map<string, { count: number; lastAttempt: Date }>();

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", authLimiter, validate(loginSchema), async (req, res) => {
  const ip = req.ip ?? "unknown";
  const { username, password } = req.body;

  try {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));

    if (!admin) {
      const attempts = failedAttempts.get(ip) ?? { count: 0, lastAttempt: new Date() };
      failedAttempts.set(ip, { count: attempts.count + 1, lastAttempt: new Date() });
      logger.warn("Failed login — unknown username", { ip, username, attempts: attempts.count + 1 });
      // Constant-time dummy compare to prevent timing-based username enumeration
      await bcrypt.compare(password, "$2b$12$invalidhashtopreventtimingattack");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      const attempts = failedAttempts.get(ip) ?? { count: 0, lastAttempt: new Date() };
      failedAttempts.set(ip, { count: attempts.count + 1, lastAttempt: new Date() });
      logger.warn("Failed login — wrong password", { ip, username, attempts: attempts.count + 1, adminId: admin.id });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    failedAttempts.delete(ip);

    const { accessToken, refreshToken } = generateTokens(admin.id);

    logger.info("Admin login successful", { ip, username, adminId: admin.id });

    // Set refresh token as httpOnly cookie — JS cannot touch this
    res.cookie("pcn_refresh_token", refreshToken, REFRESH_COOKIE_OPTIONS);

    // Return ONLY the short-lived access token in the body
    // The client stores this in memory (never localStorage)
    return res.json({
      accessToken,
      username: admin.username,
      expiresIn: 15 * 60, // 15 min in seconds — tells client when to refresh
    });
  } catch (err) {
    logger.error("Login error", { err });
    res.status(500).json({ error: "Server error" });
  }
});

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
router.post("/refresh", async (req, res) => {
  // Read from httpOnly cookie — NOT from request body
  const refreshToken = req.cookies?.pcn_refresh_token as string | undefined;

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token" });
  }

  try {
    const { adminId } = verifyRefreshToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(adminId);

    // Rotate: blacklist old refresh token
    blacklistToken(refreshToken);

    // Issue new refresh token as httpOnly cookie
    res.cookie("pcn_refresh_token", newRefreshToken, REFRESH_COOKIE_OPTIONS);

    // Return new access token in body only
    return res.json({
      accessToken,
      expiresIn: 15 * 60,
    });
  } catch {
    res.clearCookie("pcn_refresh_token", { path: "/api/auth" });
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post("/logout", (req, res) => {
  const accessToken = req.headers.authorization?.replace("Bearer ", "");
  const refreshToken = req.cookies?.pcn_refresh_token as string | undefined;

  if (accessToken) blacklistToken(accessToken);
  if (refreshToken) blacklistToken(refreshToken);

  // Clear the cookie
  res.clearCookie("pcn_refresh_token", { path: "/api/auth" });

  logger.info("Admin logout", { ip: req.ip });
  res.json({ message: "Logged out successfully" });
});

// ── POST /api/auth/setup — one-time admin creation ───────────────────────────
router.post("/setup", async (req, res) => {
  try {
    const { username, password, secret } = req.body;
    if (secret !== process.env.SETUP_SECRET) {
      logger.warn("Unauthorized setup attempt", { ip: req.ip });
      return res.status(403).json({ error: "Forbidden" });
    }

    const existing = await db.select().from(admins);
    if (existing.length > 0) {
      return res.status(403).json({ error: "Setup already completed" });
    }

    if (password.length < 12) {
      return res.status(400).json({ error: "Password must be at least 12 characters" });
    }

    const passwordHash = await bcrypt.hash(password, 14);
    const [admin] = await db.insert(admins).values({ username, passwordHash }).returning();

    logger.info("First admin created", { username, adminId: admin.id });
    res.json({ message: "Admin created successfully", id: admin.id });
  } catch (err) {
    logger.error("Setup error", { err });
    res.status(500).json({ error: "Server error" });
  }
});

export default router;