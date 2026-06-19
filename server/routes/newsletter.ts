import { Router } from "express";
import { z } from "zod";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "../db";
import { events, newsletterSends, sermons, subscribers } from "../db/schema";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { admins } from "../db/schema";
import { logger } from "../lib/logger";
import {
  renderNewsletterHtml,
  renderNewsletterText,
  summarizeBlocks,
  type NewsletterBlock,
  type NewsletterContext,
} from "../lib/newsletterTemplate";
import { isEmailConfigured, sendEmail } from "../lib/email";
import { imageUpload, processAndUploadImage } from "../lib/imageUpload";
import { uploadLimiter } from "../lib/security";

const router = Router();

// ─── Newsletter content blocks — validation ──────────────────────────────────
// URLs are stored as plain strings; the template's safeUrl() neutralises any
// non-http(s) scheme before rendering, so we only cap length here.
const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text: z.string().min(1).max(200) }),
  z.object({ type: z.literal("text"), text: z.string().min(1).max(5000) }),
  z.object({
    type: z.literal("image"),
    url: z.string().min(1).max(2000),
    alt: z.string().max(300).optional(),
    caption: z.string().max(300).optional(),
    href: z.string().max(2000).optional(),
  }),
  z.object({ type: z.literal("button"), label: z.string().min(1).max(100), url: z.string().min(1).max(2000) }),
  z.object({ type: z.literal("divider") }),
  z.object({ type: z.literal("events") }),
  z.object({ type: z.literal("sermon") }),
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function siteUrl(): string {
  // First entry of CLIENT_URL (comma-separated) is the canonical public site.
  const fromEnv = process.env.CLIENT_URL?.split(",").map((s) => s.trim()).filter(Boolean)[0];
  return fromEnv || "https://pcn-parish-website.vercel.app";
}

function unsubscribeUrl(token: string): string {
  return `${siteUrl()}/unsubscribe?token=${encodeURIComponent(token)}`;
}

// Events table stores `day` and `month` as text (e.g. "12", "December"). We
// don't have a normalized date column, so for "upcoming this week" we lean on
// the existing `featured` boolean and recency. Caller can override by passing
// all=true to include every event.
async function fetchUpcomingEvents(limit = 6) {
  return db
    .select()
    .from(events)
    .orderBy(desc(events.featured), desc(events.createdAt))
    .limit(limit);
}

async function fetchLatestSermon() {
  const [row] = await db
    .select()
    .from(sermons)
    .orderBy(desc(sermons.createdAt))
    .limit(1);
  return row ?? null;
}

// A sensible starter bulletin: an intro line, the auto events list, and the
// latest sermon. Used when the admin hasn't built any blocks yet.
const DEFAULT_BLOCKS: NewsletterBlock[] = [
  { type: "text", text: "Here's what's coming up at the parish this week. We'd love to see you in worship." },
  { type: "events" },
  { type: "sermon" },
];

// ─── Admin — preview the bulletin ────────────────────────────────────────────

const previewSchema = z.object({
  subject: z.string().max(200).optional(),
  blocks: z.array(blockSchema).max(50).optional(),
});

router.post("/preview", requireAuth, async (req, res) => {
  const parsed = previewSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
  }
  const blocks = parsed.data.blocks?.length ? parsed.data.blocks : DEFAULT_BLOCKS;

  try {
    const [evts, sermon, activeCount] = await Promise.all([
      fetchUpcomingEvents(),
      fetchLatestSermon(),
      db
        .select({ id: subscribers.id })
        .from(subscribers)
        .where(isNull(subscribers.unsubscribedAt))
        .then((rows) => rows.length),
    ]);

    const ctx: NewsletterContext = {
      blocks,
      events: evts,
      sermon,
      recipientName: "Friend",
      unsubscribeUrl: unsubscribeUrl("PREVIEW_TOKEN_NOT_REAL"),
      siteUrl: siteUrl(),
    };

    res.json({
      subscriberCount: activeCount,
      events: evts,
      sermon,
      html: renderNewsletterHtml(ctx),
      text: renderNewsletterText(ctx),
      emailConfigured: isEmailConfigured(),
    });
  } catch (err) {
    logger.error("Newsletter preview error", { err });
    res.status(500).json({ error: "Failed to build preview" });
  }
});

// ─── Admin — upload a banner/poster image ────────────────────────────────────

router.post("/image", requireAuth, uploadLimiter, imageUpload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Image file is required." });
  try {
    const url = await processAndUploadImage(req.file.buffer, req.file.mimetype, "newsletter");
    res.json({ url });
  } catch (err: any) {
    if (err?.message === "BAD_MAGIC") {
      return res.status(415).json({ error: "File content does not match declared type." });
    }
    logger.error("Newsletter image upload error", { err });
    res.status(500).json({ error: "Image processing failed." });
  }
});

// ─── Admin — send to all active subscribers ─────────────────────────────────

const sendSchema = z.object({
  blocks: z.array(blockSchema).min(1).max(50),
  subject: z.string().min(1).max(200).optional(),
});

router.post("/send", requireAuth, async (req: AuthRequest, res) => {
  if (!isEmailConfigured()) {
    return res.status(503).json({
      error:
        "Email provider not configured. Set BREVO_API_KEY and NEWSLETTER_FROM_EMAIL on the API server.",
    });
  }

  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
  }
  const blocks = parsed.data.blocks;
  const subject = parsed.data.subject?.trim() || "This week at PCN First Abuja Parish";

  try {
    const recipients = await db
      .select()
      .from(subscribers)
      .where(isNull(subscribers.unsubscribedAt));

    if (recipients.length === 0) {
      return res.status(400).json({ error: "No active subscribers to send to." });
    }

    const evts = await fetchUpcomingEvents();
    const sermon = await fetchLatestSermon();

    // Send one email per subscriber so each gets a personalised unsubscribe
    // link. With a 300/day free tier and a parish list, this is fine. If the
    // list grows past 300, the caller will see a 429 from Brevo on the
    // overflow recipients; we record the partial success and stop.
    let sent = 0;
    let failed = 0;
    for (const sub of recipients) {
      const ctx: NewsletterContext = {
        blocks,
        events: evts,
        sermon,
        recipientName: sub.name,
        unsubscribeUrl: unsubscribeUrl(sub.unsubscribeToken),
        siteUrl: siteUrl(),
      };
      try {
        await sendEmail({
          to: [{ email: sub.email, name: sub.name ?? undefined }],
          subject,
          htmlContent: renderNewsletterHtml(ctx),
          textContent: renderNewsletterText(ctx),
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl(sub.unsubscribeToken)}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });
        sent++;
      } catch (e) {
        failed++;
        logger.warn("Newsletter send to one recipient failed", { email: sub.email, error: String(e) });
        // If Brevo is rate-limiting, stop hammering it.
        if (String(e).includes("429")) break;
      }
    }

    let sentByLabel = `admin#${req.adminId ?? "unknown"}`;
    if (req.adminId) {
      const [adminRow] = await db.select({ username: admins.username }).from(admins).where(eq(admins.id, req.adminId));
      if (adminRow) sentByLabel = adminRow.username;
    }
    await db.insert(newsletterSends).values({
      intro: summarizeBlocks(blocks),
      recipientCount: sent,
      sentBy: sentByLabel,
    });

    res.json({ sent, failed, totalAttempted: recipients.length });
  } catch (err) {
    logger.error("Newsletter send error", { err });
    res.status(500).json({ error: "Failed to send newsletter" });
  }
});

// ─── Admin — list past sends (audit trail) ──────────────────────────────────

router.get("/sends", requireAuth, async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(newsletterSends)
      .orderBy(desc(newsletterSends.sentAt))
      .limit(50);
    res.json(rows);
  } catch (err) {
    logger.error("Newsletter sends fetch error", { err });
    res.status(500).json({ error: "Failed to fetch sends" });
  }
});

// ─── Public — one-click unsubscribe via tokenized link ──────────────────────

router.get("/unsubscribe", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!token || token.length < 8 || token.length > 200) {
    return res.status(400).json({ error: "Invalid unsubscribe link." });
  }

  try {
    const [row] = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.unsubscribeToken, token));

    if (!row) {
      return res.status(404).json({ error: "Unsubscribe link not found." });
    }

    if (row.unsubscribedAt) {
      return res.json({ message: "You were already unsubscribed.", email: row.email });
    }

    await db
      .update(subscribers)
      .set({ unsubscribedAt: new Date() })
      .where(eq(subscribers.id, row.id));

    res.json({ message: "Unsubscribed.", email: row.email });
  } catch (err) {
    logger.error("Newsletter unsubscribe error", { err });
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

// RFC 8058 one-click unsubscribe — invoked by mail clients on the user's
// behalf via the List-Unsubscribe-Post header. Same effect as the GET above
// but accepts an empty POST body.
router.post("/unsubscribe", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!token) return res.status(400).json({ error: "Invalid unsubscribe link." });

  try {
    await db
      .update(subscribers)
      .set({ unsubscribedAt: new Date() })
      .where(and(eq(subscribers.unsubscribeToken, token), isNull(subscribers.unsubscribedAt)));
    res.json({ message: "Unsubscribed." });
  } catch (err) {
    logger.error("Newsletter one-click unsubscribe error", { err });
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

// ─── Admin — list subscribers ───────────────────────────────────────────────

router.get("/subscribers", requireAuth, async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: subscribers.id,
        email: subscribers.email,
        name: subscribers.name,
        subscribedAt: subscribers.subscribedAt,
        unsubscribedAt: subscribers.unsubscribedAt,
      })
      .from(subscribers)
      .orderBy(desc(subscribers.subscribedAt));
    res.json(rows);
  } catch (err) {
    logger.error("Subscribers list error", { err });
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

// ─── Admin — toggle a subscriber's opt-in status ────────────────────────────

router.patch("/subscribers/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  const active = req.body?.active;
  if (typeof active !== "boolean") {
    return res.status(400).json({ error: "Body must include { active: boolean }" });
  }
  try {
    const [row] = await db
      .update(subscribers)
      .set({ unsubscribedAt: active ? null : new Date() })
      .where(eq(subscribers.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Subscriber not found" });
    res.json(row);
  } catch (err) {
    logger.error("Subscriber toggle error", { err });
    res.status(500).json({ error: "Failed to update subscriber" });
  }
});

// ─── Admin — remove a subscriber entirely ───────────────────────────────────

router.delete("/subscribers/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  try {
    const result = await db.delete(subscribers).where(eq(subscribers.id, id)).returning({ id: subscribers.id });
    if (result.length === 0) return res.status(404).json({ error: "Subscriber not found" });
    res.json({ success: true });
  } catch (err) {
    logger.error("Subscriber delete error", { err });
    res.status(500).json({ error: "Failed to delete subscriber" });
  }
});

// ─── Admin — subscriber stats ───────────────────────────────────────────────

router.get("/stats", requireAuth, async (_req, res) => {
  try {
    const all = await db.select().from(subscribers);
    const active = all.filter((s) => !s.unsubscribedAt).length;
    const unsubscribed = all.length - active;
    res.json({ total: all.length, active, unsubscribed });
  } catch (err) {
    logger.error("Newsletter stats error", { err });
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ─── Multer error handler (must be last in this router) ───────────────────────
router.use((err: any, _req: any, res: any, next: any) => {
  if (err.message === "INVALID_MIME_TYPE") {
    return res.status(415).json({ error: "File type not allowed. Use JPEG, PNG, WebP, or GIF." });
  }
  if (err.message?.includes("File too large")) {
    return res.status(413).json({ error: "File exceeds 5 MB limit." });
  }
  next(err);
});

export default router;
