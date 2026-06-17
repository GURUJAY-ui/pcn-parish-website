import "dotenv/config";
import { db } from "../server/db/index";
import { gallery } from "../server/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const r = await db
    .update(gallery)
    .set({ approved: true })
    .where(eq(gallery.approved, false))
    .returning({ id: gallery.id });
  console.log(`Approved ${r.length} existing rows`);
  process.exit(0);
}

void main();
