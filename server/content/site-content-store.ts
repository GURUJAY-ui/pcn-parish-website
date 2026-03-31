import { readFile } from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import { db } from "../db";
import { siteContentEntries } from "../db/schema";
import {
  siteContent,
  type SiteContent,
  type SiteContentPage,
} from "./site-content";

const LEGACY_SITE_CONTENT_FILE = path.resolve(process.cwd(), "server", "content", "site-content.store.json");
let storeReadyPromise: Promise<void> | null = null;

function normalizeArrayLike<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeArrayLike(item)) as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    const allNumericKeys = entries.length > 0 && entries.every(([key]) => /^\d+$/.test(key));

    if (allNumericKeys) {
      return entries
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([, nestedValue]) => normalizeArrayLike(nestedValue)) as T;
    }

    const normalized: Record<string, unknown> = {};
    for (const [key, nestedValue] of entries) {
      normalized[key] = normalizeArrayLike(nestedValue);
    }
    return normalized as T;
  }

  return value;
}

function cloneDefaultContent(): SiteContent {
  return JSON.parse(JSON.stringify(siteContent)) as SiteContent;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isHeroSlideContent(value: unknown): value is SiteContent["home"]["heroSlides"][number] {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "number") return false;
  if (!isNonEmptyString(value.label) || !isNonEmptyString(value.title) || !isNonEmptyString(value.subtitle) || !isNonEmptyString(value.image)) return false;
  if (!isRecord(value.cta1) || !isRecord(value.cta2)) return false;
  if (!isNonEmptyString(value.cta1.label) || !isNonEmptyString(value.cta2.label)) return false;
  return true;
}

export function isContactContent(value: unknown): value is SiteContent["contact"] {
  if (!isRecord(value)) return false;
  return Array.isArray(value.cards) && Array.isArray(value.serviceTimes) && Array.isArray(value.socials);
}

export function isDonationContent(value: unknown): value is SiteContent["donations"] {
  if (!isRecord(value)) return false;
  return Array.isArray(value.categories) && isRecord(value.accounts);
}

export function isSiteContentPage(page: string): page is SiteContentPage {
  return page in siteContent;
}

async function loadLegacyStore(): Promise<Partial<SiteContent>> {
  try {
    const raw = await readFile(LEGACY_SITE_CONTENT_FILE, "utf8");
    return JSON.parse(raw) as Partial<SiteContent>;
  } catch {
    return {};
  }
}

async function ensureStoreReady() {
  if (!storeReadyPromise) {
    storeReadyPromise = (async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS site_content (
          page text PRIMARY KEY,
          payload jsonb NOT NULL,
          updated_at timestamp NOT NULL DEFAULT now()
        )
      `);

      const defaults = cloneDefaultContent();
      const legacy = await loadLegacyStore();

      for (const page of Object.keys(defaults) as SiteContentPage[]) {
        await db
          .insert(siteContentEntries)
          .values({
            page,
            payload: normalizeArrayLike((legacy[page] ?? defaults[page]) as unknown),
          })
          .onConflictDoNothing();
      }
    })().catch((error) => {
      storeReadyPromise = null;
      throw error;
    });
  }

  await storeReadyPromise;
}

export async function getStoredSiteContent(): Promise<SiteContent> {
  await ensureStoreReady();
  const defaults = cloneDefaultContent() as Record<SiteContentPage, SiteContent[SiteContentPage]>;
  const rows = await db.select().from(siteContentEntries);

  for (const row of rows) {
    if (row.page in defaults) {
      defaults[row.page as SiteContentPage] = normalizeArrayLike(row.payload) as SiteContent[SiteContentPage];
    }
  }

  return defaults as SiteContent;
}

export async function getStoredSiteContentPage(page: SiteContentPage) {
  const content = await getStoredSiteContent();
  return content[page];
}

export async function updateStoredSiteContentPage(page: SiteContentPage, payload: unknown) {
  await ensureStoreReady();
  const normalizedPayload = normalizeArrayLike(payload);

  const [row] = await db
    .insert(siteContentEntries)
    .values({
      page,
      payload: normalizedPayload,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteContentEntries.page,
      set: {
        payload: normalizedPayload,
        updatedAt: new Date(),
      },
    })
    .returning();

  return row.payload as SiteContent[SiteContentPage];
}

export { LEGACY_SITE_CONTENT_FILE };