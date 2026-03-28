import { readFile } from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import { db } from "../db";
import { siteContentEntries } from "../db/schema";
import { siteContent, type SiteContent, type SiteContentPage } from "./site-content";

const LEGACY_SITE_CONTENT_FILE = path.resolve(process.cwd(), "server", "content", "site-content.store.json");
let storeReadyPromise: Promise<void> | null = null;

function cloneDefaultContent(): SiteContent {
  return JSON.parse(JSON.stringify(siteContent)) as SiteContent;
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
            payload: (legacy[page] ?? defaults[page]) as unknown,
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
      defaults[row.page as SiteContentPage] = row.payload as SiteContent[SiteContentPage];
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

  const [row] = await db
    .insert(siteContentEntries)
    .values({
      page,
      payload,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteContentEntries.page,
      set: {
        payload,
        updatedAt: new Date(),
      },
    })
    .returning();

  return row.payload as SiteContent[SiteContentPage];
}

export { LEGACY_SITE_CONTENT_FILE };
