import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { siteContent, type SiteContent, type SiteContentPage } from "./site-content";

const SITE_CONTENT_FILE = path.resolve(process.cwd(), "server", "content", "site-content.store.json");

function cloneDefaultContent(): SiteContent {
  return JSON.parse(JSON.stringify(siteContent)) as SiteContent;
}

async function ensureStoreFile() {
  await mkdir(path.dirname(SITE_CONTENT_FILE), { recursive: true });

  try {
    await readFile(SITE_CONTENT_FILE, "utf8");
  } catch {
    await writeFile(SITE_CONTENT_FILE, JSON.stringify(cloneDefaultContent(), null, 2), "utf8");
  }
}

export async function getStoredSiteContent(): Promise<SiteContent> {
  await ensureStoreFile();

  try {
    const raw = await readFile(SITE_CONTENT_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    return {
      ...cloneDefaultContent(),
      ...parsed,
    };
  } catch {
    return cloneDefaultContent();
  }
}

export async function getStoredSiteContentPage(page: SiteContentPage) {
  const content = await getStoredSiteContent();
  return content[page];
}

export async function updateStoredSiteContentPage(page: SiteContentPage, payload: unknown) {
  const content = await getStoredSiteContent();
  const nextContent: SiteContent = {
    ...content,
    [page]: payload,
  } as SiteContent;

  await writeFile(SITE_CONTENT_FILE, JSON.stringify(nextContent, null, 2), "utf8");
  return nextContent[page];
}

export { SITE_CONTENT_FILE };
