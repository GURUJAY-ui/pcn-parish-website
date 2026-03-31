import "tsx/esm";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./server/db/index.ts";
import { admins } from "./server/db/schema.ts";

const username = "pcnadmin";
const password = "YourStrongPassword123!";

const passwordHash = await bcrypt.hash(password, 14);
const existing = await db.select().from(admins).where(eq(admins.username, username));

if (existing.length) {
  await db.update(admins).set({ passwordHash }).where(eq(admins.username, username));
  console.log("updated");
} else {
  await db.insert(admins).values({ username, passwordHash });
  console.log("inserted");
}
