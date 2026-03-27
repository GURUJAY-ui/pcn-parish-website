import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { logger } from "./logger";

// ── General API rate limit ─────────────────────────────────────────────────
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      path: req.path,
      userAgent: req.headers["user-agent"],
    });
    res.status(429).json({
      error: "Too many requests. Please try again later.",
    });
  },
});

// ── Auth rate limit — very strict ─────────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // only 5 login attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    logger.warn("Auth rate limit exceeded — possible brute force", {
      ip: req.ip,
      username: req.body?.username,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    });
    res.status(429).json({
      error: "Too many login attempts. Try again in 15 minutes.",
    });
  },
});

// ── Upload rate limit ──────────────────────────────────────────────────────
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({ error: "Upload limit reached. Try again later." });
  },
});

// ── Contact/submission rate limit ─────────────────────────────────────────
export const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({ error: "Submission limit reached. Try again later." });
  },
});

import { sanitizeBody } from "./validate";
export { sanitizeBody };