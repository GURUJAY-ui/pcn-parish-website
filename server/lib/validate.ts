import { z } from "zod";
import xss from "xss";
import { Request, Response, NextFunction } from "express";

// ── XSS sanitizer ─────────────────────────────────────────────────────────
export function sanitizeString(str: string): string {
  return xss(str.trim());
}

export function sanitizeObject<T>(value: T): T {
  if (typeof value === "string") {
    return sanitizeString(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeObject(item)) as T;
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      result[key] = sanitizeObject(nestedValue);
    }
    return result as T;
  }

  return value;
}

// ── Middleware: sanitize all body inputs ──────────────────────────────────
export function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
}

// ── Zod validation middleware factory ────────────────────────────────────
export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
}

// ── Schemas ────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric only"),
  password: z.string().min(8).max(100),
});

export const sermonSchema = z.object({
  title: z.string().min(1).max(200),
  scripture: z.string().min(1).max(100),
  date: z.string().min(1).max(50),
  preacher: z.string().min(1).max(100),
  excerpt: z.string().min(1).max(1000),
  category: z.string().min(1).max(100),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
});

export const eventSchema = z.object({
  day: z.string().min(1).max(2),
  month: z.string().min(1).max(10),
  title: z.string().min(1).max(200),
  time: z.string().min(1).max(50),
  location: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.string().min(1).max(100),
  featured: z.boolean().optional(),
});

export const testimonySchema = z.object({
  name: z.string().min(1).max(100),
  profession: z.string().min(1).max(100),
  quote: z.string().min(10).max(1000),
  category: z.string().min(1).max(100),
});

export const contactSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email().max(200).optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(5).max(2000),
  type: z.enum(["message", "prayer"]),
  anonymous: z.boolean().optional(),
});

export const donationSchema = z.object({
  donorName: z.string().max(100).optional(),
  donorEmail: z.string().email().max(200).optional().or(z.literal("")),
  amount: z.number().int().positive().max(100_000_000),
  currency: z.enum(["NGN", "USD", "EUR", "GBP"]).default("NGN"),
  category: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
  anonymous: z.boolean().optional(),
  reference: z.string().max(200).optional(),
});

export const heroSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().min(1).max(300),
  image: z.string().url().max(500),
  cta1: z.string().max(50).optional(),
  cta2: z.string().max(50).optional(),
  order: z.number().int().min(0).optional(),
});
