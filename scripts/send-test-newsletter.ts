/**
 * One-off: send a single TEST newsletter to one address (does NOT touch the
 * subscriber list). Used to preview the Recharge Conference 2026 bulletin.
 *
 *   pnpm tsx scripts/send-test-newsletter.ts <path-to-banner-image> [registrationUrl]
 *
 * Requires: BREVO_API_KEY, NEWSLETTER_FROM_EMAIL, CLOUDINARY_* in .env
 */
import "dotenv/config";
import { readFileSync } from "fs";
import { processAndUploadImage } from "../server/lib/imageUpload";
import { isEmailConfigured, sendEmail } from "../server/lib/email";
import {
  renderNewsletterHtml,
  renderNewsletterText,
  type NewsletterBlock,
  type NewsletterContext,
} from "../server/lib/newsletterTemplate";

// ─── Test config — edit copy here, then re-run ───────────────────────────────
const TO = { email: "mary.itobo2@gmail.com", name: "Mary" };
const SUBJECT = "You're invited — Recharge Conference 2026";
const SITE_URL =
  process.env.CLIENT_URL?.split(",")[0]?.trim() || "https://pcn-parish-website.vercel.app";

function mimeFromPath(p: string): string {
  const ext = p.toLowerCase().split(".").pop();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "image/jpeg";
}

async function main() {
  const bannerPath = process.argv[2];
  const registrationUrl = process.argv[3];
  if (!bannerPath) {
    console.error("Usage: pnpm tsx scripts/send-test-newsletter.ts <banner> [registrationUrl]");
    process.exit(1);
  }
  if (!isEmailConfigured()) {
    console.error("Email not configured — set BREVO_API_KEY and NEWSLETTER_FROM_EMAIL in .env");
    process.exit(1);
  }

  console.log("Uploading banner…");
  const buf = readFileSync(bannerPath);
  const bannerUrl = await processAndUploadImage(buf, mimeFromPath(bannerPath), "newsletter");
  console.log("Banner hosted at:", bannerUrl);

  const link = registrationUrl || "https://www.rechargeconferenceabuja.com/";
  const blocks: NewsletterBlock[] = [
    { type: "heading", text: "Recharge Conference 2026 — Intimacy With God" },
    {
      type: "image",
      url: bannerUrl,
      alt: "Recharge Conference 2026 — Intimacy With God (Psalm 42:1-2)",
      href: link,
    },
    {
      type: "text",
      text:
        "PCN First Abuja Parish invites you to Recharge Conference 2026, a season of renewal, worship and the Word.\n\n" +
        "Theme: Intimacy With God (Psalm 42:1-2)\n" +
        "Dates: Tuesday 21 - Sunday 26 July 2026\n" +
        "Morning sessions: 9:00 AM (Wed-Sat) · Evening sessions: 5:30 PM · Sunday: Thanksgiving\n" +
        "Prayer School: 9:00 AM (Wed-Sat)\n" +
        "Venue: No. 5 Boke Close, off Sakono Street, opposite AP Plaza, Wuse II, FCT, Abuja\n" +
        "Enquiries: 0817 577 7773",
    },
    { type: "text", text: "Can't make it in person? Join the livestream on YouTube @pulpitfaptv or facebook.com/pcnfap." },
    { type: "button", label: "Conference details", url: link },
  ];

  const ctx: NewsletterContext = {
    blocks,
    events: [],
    sermon: null,
    recipientName: TO.name,
    unsubscribeUrl: `${SITE_URL}/unsubscribe?token=TEST_PREVIEW_ONLY`,
    siteUrl: SITE_URL,
  };

  console.log(`Sending test to ${TO.email}…`);
  await sendEmail({
    to: [TO],
    subject: SUBJECT,
    htmlContent: renderNewsletterHtml(ctx),
    textContent: renderNewsletterText(ctx),
  });
  console.log("✅ Sent.");
  process.exit(0);
}

void main();
