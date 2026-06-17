import { logger } from "./logger";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export type BrevoRecipient = { email: string; name?: string };

export type BrevoSendInput = {
  to: BrevoRecipient[];
  subject: string;
  htmlContent: string;
  textContent: string;
  headers?: Record<string, string>;
};

function senderConfig() {
  return {
    apiKey: process.env.BREVO_API_KEY,
    fromEmail: process.env.NEWSLETTER_FROM_EMAIL,
    fromName: process.env.NEWSLETTER_FROM_NAME || "PCN First Abuja Parish",
    replyTo: process.env.NEWSLETTER_REPLY_TO || process.env.NEWSLETTER_FROM_EMAIL,
  };
}

export function isEmailConfigured(): boolean {
  const cfg = senderConfig();
  return Boolean(cfg.apiKey && cfg.fromEmail);
}

// Send a single email to a batch of recipients. Brevo's API accepts up to
// 1000 recipients per request; we batch larger lists. Recipients are placed
// in `to` (not bcc) since each subscriber should receive an individualised
// unsubscribe link — callers loop subscriber-by-subscriber for personalised
// content.
export async function sendEmail(input: BrevoSendInput): Promise<void> {
  const cfg = senderConfig();
  if (!cfg.apiKey || !cfg.fromEmail) {
    throw new Error(
      "Email not configured. Set BREVO_API_KEY and NEWSLETTER_FROM_EMAIL."
    );
  }

  const res = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": cfg.apiKey,
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: cfg.fromEmail, name: cfg.fromName },
      replyTo: cfg.replyTo ? { email: cfg.replyTo } : undefined,
      to: input.to,
      subject: input.subject,
      htmlContent: input.htmlContent,
      textContent: input.textContent,
      headers: input.headers,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.error("Brevo send failed", { status: res.status, body });
    throw new Error(`Brevo send failed: HTTP ${res.status} — ${body.slice(0, 200)}`);
  }
}
