import { Router } from "express";
import { db } from "../db";
import { sermons } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { validate, sermonSchema } from "../lib/validate";
import { logger } from "../lib/logger";
import NodeCache from "node-cache";
import type { Response } from "express";

const router = Router();

// ── Cache configuration ────────────────────────────────────────────────────
const cache = new NodeCache({ stdTTL: 1800, checkperiod: 600 }); // 30 min cache
const CACHE_KEY_YOUTUBE = "yt_sermons";
const CACHE_KEY_DB = "db_sermons";

// ── YouTube API Types ──────────────────────────────────────────────────────
interface YouTubeThumbnail {
  url: string;
  width?: number;
  height?: number;
}

interface YouTubeThumbnails {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
}

interface YouTubeSnippet {
  publishedAt: string;
  channelTitle: string;
  title: string;
  description?: string;
  liveBroadcastContent: "none" | "upcoming" | "live";
  thumbnails?: YouTubeThumbnails;
}

interface YouTubeItem {
  id: { videoId: string };
  snippet: YouTubeSnippet;
}

interface YouTubeResponse {
  items?: YouTubeItem[];
  error?: { code: number; message: string };
}

interface SermonFromYouTube {
  id: string;
  title: string;
  preacher: string;
  date: string;
  year: number;
  month: number;
  excerpt: string;
  scripture: string;
  category: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  isLive: boolean;
  facebookUrl?: string;
}

// ── Helper: Fetch YouTube videos with error handling ────────────────────────
async function fetchYouTubeVideos(): Promise<SermonFromYouTube[]> {
  const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!CHANNEL_ID || !API_KEY) {
    logger.warn("YouTube credentials not configured");
    return [];
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&type=video&order=date&maxResults=50&key=${API_KEY}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      logger.error("YouTube API error", {
        status: response.status,
        statusText: response.statusText,
      });
      return [];
    }

    const data: YouTubeResponse = await response.json();

    if (data.error) {
      logger.error("YouTube API returned error", {
        code: data.error.code,
        message: data.error.message,
      });
      return [];
    }

    const ytSermons: SermonFromYouTube[] = (data.items ?? [])
      .filter((item): item is YouTubeItem => !!item.id?.videoId && !!item.snippet)
      .map((item) => {
        const published = new Date(item.snippet.publishedAt);
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          preacher: item.snippet.channelTitle,
          date: published.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          year: published.getFullYear(),
          month: published.getMonth() + 1,
          excerpt: item.snippet.description?.slice(0, 500) ?? "",
          scripture: "",
          category: "Sermon",
          thumbnailUrl: item.snippet.thumbnails?.high?.url ?? "",
          youtubeUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          isLive: item.snippet.liveBroadcastContent === "live",
          facebookUrl: process.env.FACEBOOK_URL,
        };
      });

    logger.info("YouTube sermons fetched successfully", {
      count: ytSermons.length,
    });

    return ytSermons;
  } catch (err) {
    logger.error("YouTube fetch failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

// ── GET /api/sermons - Get all sermons (DB + cached YouTube) ────────────────
router.get("/", async (_req, res) => {
  try {
    // Get database sermons
    const dbSermons = await db
      .select()
      .from(sermons)
      .orderBy(desc(sermons.createdAt));

    // Get cached YouTube sermons
    let ytSermons: SermonFromYouTube[] = cache.get(CACHE_KEY_YOUTUBE) ?? [];

    // If YouTube cache is empty, fetch fresh data (but don't block the response)
    if (ytSermons.length === 0) {
      ytSermons = await fetchYouTubeVideos();
      if (ytSermons.length > 0) {
        cache.set(CACHE_KEY_YOUTUBE, ytSermons);
      }
    }

    // Combine and return
    const combined = [
      ...dbSermons,
      ...ytSermons.map((yt) => ({
        ...yt,
        id: `yt_${yt.id}`, // Prefix YouTube IDs to avoid conflicts
      })),
    ];

    res.json(combined);
  } catch (err) {
    logger.error("Failed to fetch sermons", {
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to fetch sermons" });
  }
});

// ── POST /api/sermons - Create new sermon (admin only) ──────────────────────
router.post("/", requireAuth, validate(sermonSchema), async (req: AuthRequest, res: Response) => {
  try {
    const data = await db
      .insert(sermons)
      .values({
        title: req.body.title,
        scripture: req.body.scripture,
        date: req.body.date,
        preacher: req.body.preacher,
        excerpt: req.body.excerpt,
        category: req.body.category,
        youtubeUrl: req.body.youtubeUrl || null,
        facebookUrl: req.body.facebookUrl || null,
      })
      .returning();

    // Invalidate cache
    cache.del(CACHE_KEY_DB);

    logger.info("Sermon created", {
      id: data[0].id,
      title: data[0].title,
      adminId: req.adminId,
    });

    res.status(201).json(data[0]);
  } catch (err) {
    logger.error("Failed to create sermon", {
      error: err instanceof Error ? err.message : String(err),
      adminId: req.adminId,
    });
    res.status(500).json({ error: "Failed to create sermon" });
  }
});

// ── PUT /api/sermons/:id - Update sermon (admin only) ──────────────────────
router.put("/:id", requireAuth, validate(sermonSchema), async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid sermon ID" });
    }

    // Check if sermon exists
    const [existing] = await db
      .select()
      .from(sermons)
      .where(eq(sermons.id, id));

    if (!existing) {
      return res.status(404).json({ error: "Sermon not found" });
    }

    const data = await db
      .update(sermons)
      .set({
        title: req.body.title,
        scripture: req.body.scripture,
        date: req.body.date,
        preacher: req.body.preacher,
        excerpt: req.body.excerpt,
        category: req.body.category,
        youtubeUrl: req.body.youtubeUrl || null,
        facebookUrl: req.body.facebookUrl || null,
      })
      .where(eq(sermons.id, id))
      .returning();

    // Invalidate cache
    cache.del(CACHE_KEY_DB);

    logger.info("Sermon updated", {
      id,
      title: data[0].title,
      adminId: req.adminId,
    });

    res.json(data[0]);
  } catch (err) {
    logger.error("Failed to update sermon", {
      error: err instanceof Error ? err.message : String(err),
      adminId: req.adminId,
    });
    res.status(500).json({ error: "Failed to update sermon" });
  }
});

// ── DELETE /api/sermons/:id - Delete sermon (admin only) ────────────────────
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid sermon ID" });
    }

    // Check if sermon exists
    const [existing] = await db
      .select()
      .from(sermons)
      .where(eq(sermons.id, id));

    if (!existing) {
      return res.status(404).json({ error: "Sermon not found" });
    }

    await db.delete(sermons).where(eq(sermons.id, id));

    // Invalidate cache
    cache.del(CACHE_KEY_DB);

    logger.info("Sermon deleted", {
      id,
      title: existing.title,
      adminId: req.adminId,
    });

    res.json({ success: true, message: "Sermon deleted" });
  } catch (err) {
    logger.error("Failed to delete sermon", {
      error: err instanceof Error ? err.message : String(err),
      adminId: req.adminId,
    });
    res.status(500).json({ error: "Failed to delete sermon" });
  }
});

// ── GET /api/sermons/youtube/sync - Manually sync YouTube videos ────────────
router.get("/youtube/sync", requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const ytSermons = await fetchYouTubeVideos();
    cache.set(CACHE_KEY_YOUTUBE, ytSermons);

    logger.info("YouTube sermons synced manually", {
      count: ytSermons.length,
      adminId: _req.adminId,
    });

    res.json({
      success: true,
      message: `Synced ${ytSermons.length} YouTube videos`,
      data: ytSermons,
    });
  } catch (err) {
    logger.error("YouTube sync failed", {
      error: err instanceof Error ? err.message : String(err),
      adminId: _req.adminId,
    });
    res.status(500).json({ error: "Failed to sync YouTube videos" });
  }
});

// ── GET /api/sermons/youtube/videos - Get cached YouTube videos ────────────
router.get("/youtube/videos", async (_req, res) => {
  try {
    let ytSermons: SermonFromYouTube[] = cache.get(CACHE_KEY_YOUTUBE) ?? [];

    // If cache is empty, fetch fresh data
    if (ytSermons.length === 0) {
      ytSermons = await fetchYouTubeVideos();
      if (ytSermons.length > 0) {
        cache.set(CACHE_KEY_YOUTUBE, ytSermons);
      }
    }

    res.json(ytSermons);
  } catch (err) {
    logger.error("Failed to get YouTube videos", {
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to fetch YouTube videos" });
  }
});

// ── Auto-refresh YouTube cache every 30 minutes ────────────────────────────
setInterval(async () => {
  try {
    const ytSermons = await fetchYouTubeVideos();
    if (ytSermons.length > 0) {
      cache.set(CACHE_KEY_YOUTUBE, ytSermons);
      logger.info("YouTube sermons cache auto-refreshed", {
        count: ytSermons.length,
      });
    }
  } catch (err) {
    logger.error("Auto-refresh YouTube cache failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}, 30 * 60 * 1000); // 30 minutes

export default router;
