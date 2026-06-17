/**
 * One-off: migrate existing newsletter signups from the contacts table
 * into the new subscribers table. Idempotent — re-running is safe.
 *
 *   pnpm tsx scripts/backfill-subscribers.ts
 */
import "dotenv/config";
import { randomUUID } from "crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../server/db/index";
import { contacts, subscribers } from "../server/db/schema";

async function main() {
  const rows = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.subject, "Newsletter Signup"), sql`${contacts.email} is not null`));

  let inserted = 0;
  let skipped = 0;
  for (const r of rows) {
    if (!r.email) {
      skipped++;
      continue;
    }
    try {
      await db
        .insert(subscribers)
        .values({
          email: r.email,
          name: r.name || null,
          unsubscribeToken: randomUUID(),
        })
        .onConflictDoNothing({ target: subscribers.email });
      inserted++;
    } catch (e) {
      skipped++;
      console.warn("Skipped", r.email, String(e));
    }
  }

  const total = await db.select().from(subscribers);
  console.log(`Processed ${rows.length} legacy signup rows.`);
  console.log(`Inserted/updated: ${inserted} · Skipped: ${skipped}`);
  console.log(`Subscribers table now has ${total.length} row(s).`);
  process.exit(0);
}

void main();
