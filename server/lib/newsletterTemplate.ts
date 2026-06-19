type Event = {
  id: number;
  day: string;
  month: string;
  title: string;
  time: string;
  location: string;
  description: string | null;
  category: string;
};

type Sermon = {
  id: number;
  title: string;
  scripture: string;
  date: string;
  preacher: string;
  excerpt: string;
  youtubeUrl: string | null;
};

// ─── Content blocks ──────────────────────────────────────────────────────────
// The admin builds the bulletin body from an ordered list of blocks. "events"
// and "sermon" are auto blocks: they render data pulled from the database at
// send time, so they stay fresh without the admin re-typing them.
export type NewsletterBlock =
  | { type: "heading"; text: string }
  | { type: "text"; text: string }
  | { type: "image"; url: string; alt?: string; caption?: string; href?: string }
  | { type: "button"; label: string; url: string }
  | { type: "divider" }
  | { type: "events" }
  | { type: "sermon" };

export type NewsletterContext = {
  blocks: NewsletterBlock[];
  events: Event[];
  sermon: Sermon | null;
  recipientName?: string | null;
  unsubscribeUrl: string;
  siteUrl: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Only allow http(s) (and mailto: for buttons) — never javascript:/data: in an
// href or img src, even though the editor is admin-only.
function safeUrl(url: string | undefined, allowMailto = false): string {
  if (!url) return "";
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (allowMailto && /^mailto:/i.test(u)) return u;
  return "";
}

function paragraphs(text: string): string {
  return text
    .trim()
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="margin:0 0 16px 0;line-height:1.6;color:#3c4452;font-size:15px;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`
    )
    .join("");
}

// ─── Block → HTML renderers ──────────────────────────────────────────────────

function renderEventsHtml(events: Event[]): string {
  const label = `<div style="font-family:Georgia,serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c8972a;margin:0 0 14px 0;">This Week</div>`;
  const body =
    events.length === 0
      ? `<p style="margin:0;color:#5b6577;font-style:italic;">No events scheduled in the coming week — we'll see you in worship on Sunday.</p>`
      : events
          .map(
            (e) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 14px 0;border-collapse:collapse;">
  <tr>
    <td width="68" valign="top" style="padding:14px 16px;background:#132744;border-radius:10px 0 0 10px;text-align:center;">
      <div style="color:#c8972a;font-family:Georgia,serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(e.month)}</div>
      <div style="color:#ffffff;font-family:Georgia,serif;font-size:26px;line-height:1;margin-top:4px;">${escapeHtml(e.day)}</div>
    </td>
    <td valign="top" style="padding:14px 18px;background:#f5f3ec;border-radius:0 10px 10px 0;">
      <div style="font-family:Georgia,serif;color:#132744;font-size:17px;margin-bottom:6px;">${escapeHtml(e.title)}</div>
      <div style="color:#5b6577;font-size:13px;line-height:1.5;">${escapeHtml(e.time)} &nbsp;·&nbsp; ${escapeHtml(e.location)}</div>
      ${e.description ? `<div style="color:#5b6577;font-size:13px;line-height:1.5;margin-top:6px;">${escapeHtml(e.description)}</div>` : ""}
    </td>
  </tr>
</table>`
          )
          .join("");
  return `<div style="margin:8px 0;">${label}${body}</div>`;
}

function renderSermonHtml(sermon: Sermon | null): string {
  if (!sermon) return "";
  return `
<div style="margin:8px 0;padding:20px 22px;background:#132744;border-radius:12px;color:#ffffff;">
  <div style="font-family:Georgia,serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c8972a;margin-bottom:8px;">Latest Sermon</div>
  <div style="font-family:Georgia,serif;font-size:20px;margin-bottom:6px;">${escapeHtml(sermon.title)}</div>
  <div style="font-size:13px;opacity:0.75;margin-bottom:10px;">${escapeHtml(sermon.preacher)} &nbsp;·&nbsp; ${escapeHtml(sermon.scripture)}</div>
  <div style="font-size:14px;line-height:1.6;opacity:0.9;">${escapeHtml(sermon.excerpt)}</div>
  ${
    sermon.youtubeUrl && safeUrl(sermon.youtubeUrl)
      ? `<a href="${escapeHtml(safeUrl(sermon.youtubeUrl))}" style="display:inline-block;margin-top:14px;padding:10px 18px;background:#c8972a;color:#ffffff;text-decoration:none;border-radius:999px;font-size:13px;">Watch sermon ▸</a>`
      : ""
  }
</div>`;
}

function renderImageHtml(block: Extract<NewsletterBlock, { type: "image" }>): string {
  const src = safeUrl(block.url);
  if (!src) return "";
  const alt = escapeHtml(block.alt ?? "");
  const img = `<img src="${escapeHtml(src)}" alt="${alt}" width="528" style="display:block;width:100%;max-width:528px;height:auto;border:0;border-radius:12px;margin:0 auto;" />`;
  const href = safeUrl(block.href);
  const linked = href ? `<a href="${escapeHtml(href)}" style="text-decoration:none;">${img}</a>` : img;
  const caption = block.caption?.trim()
    ? `<div style="margin-top:8px;color:#8a93a3;font-size:12px;text-align:center;font-style:italic;">${escapeHtml(block.caption)}</div>`
    : "";
  return `<div style="margin:20px 0;text-align:center;">${linked}${caption}</div>`;
}

function renderBlockHtml(block: NewsletterBlock, ctx: NewsletterContext): string {
  switch (block.type) {
    case "heading":
      return `<h2 style="font-family:Georgia,serif;font-size:22px;line-height:1.3;color:#132744;margin:24px 0 12px 0;">${escapeHtml(block.text)}</h2>`;
    case "text":
      return paragraphs(block.text);
    case "image":
      return renderImageHtml(block);
    case "button": {
      const href = safeUrl(block.url, true);
      if (!href) return "";
      return `<div style="text-align:center;margin:24px 0;"><a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 28px;background:#132744;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;">${escapeHtml(block.label)}</a></div>`;
    }
    case "divider":
      return `<div style="border-top:1px solid #eceadf;margin:24px 0;"></div>`;
    case "events":
      return renderEventsHtml(ctx.events);
    case "sermon":
      return renderSermonHtml(ctx.sermon);
    default:
      return "";
  }
}

export function renderNewsletterHtml(ctx: NewsletterContext): string {
  const greeting = ctx.recipientName ? `Hello ${escapeHtml(ctx.recipientName)},` : "Hello,";
  const body = ctx.blocks.map((b) => renderBlockHtml(b, ctx)).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>PCN First Abuja Parish — Weekly Bulletin</title>
</head>
<body style="margin:0;padding:0;background:#efece1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#3c4452;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#efece1;">
  <tr><td align="center" style="padding:28px 16px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">
      <tr><td style="padding:32px 36px 8px 36px;text-align:center;">
        <div style="font-family:Georgia,serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c8972a;">Weekly Bulletin</div>
        <div style="font-family:Georgia,serif;font-size:28px;color:#132744;margin-top:6px;">PCN First Abuja Parish</div>
      </td></tr>
      <tr><td style="padding:24px 36px 8px 36px;">
        <div style="color:#132744;font-size:16px;margin-bottom:14px;">${greeting}</div>
        ${body}
      </td></tr>
      <tr><td style="padding:8px 36px 28px 36px;text-align:center;">
        <a href="${escapeHtml(ctx.siteUrl)}" style="display:inline-block;padding:12px 28px;background:#132744;color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;">Visit the parish site</a>
      </td></tr>
      <tr><td style="padding:18px 36px 28px 36px;border-top:1px solid #eceadf;color:#8a93a3;font-size:11px;line-height:1.6;text-align:center;">
        You're receiving this because you signed up for updates at <a href="${escapeHtml(ctx.siteUrl)}" style="color:#8a93a3;">pcn-parish-website.vercel.app</a>.<br/>
        <a href="${escapeHtml(ctx.unsubscribeUrl)}" style="color:#8a93a3;text-decoration:underline;">Unsubscribe</a> at any time.
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Block → plain text renderers ────────────────────────────────────────────

function renderBlockText(block: NewsletterBlock, ctx: NewsletterContext): string {
  switch (block.type) {
    case "heading":
      return `\n${block.text.toUpperCase()}`;
    case "text":
      return block.text.trim();
    case "image":
      return [block.caption?.trim() ? `[Image: ${block.caption.trim()}]` : "[Image]", safeUrl(block.href)]
        .filter(Boolean)
        .join(" ");
    case "button": {
      const href = safeUrl(block.url, true);
      return href ? `${block.label}: ${href}` : block.label;
    }
    case "divider":
      return "—".repeat(20);
    case "events":
      return ctx.events.length === 0
        ? "THIS WEEK\nNo events scheduled in the coming week — we'll see you in worship on Sunday."
        : "THIS WEEK\n" +
            ctx.events
              .map(
                (e) =>
                  `• ${e.month} ${e.day} — ${e.title}\n  ${e.time} · ${e.location}${e.description ? "\n  " + e.description : ""}`
              )
              .join("\n\n");
    case "sermon":
      return ctx.sermon
        ? `LATEST SERMON\n${ctx.sermon.title} — ${ctx.sermon.preacher} (${ctx.sermon.scripture})\n${ctx.sermon.excerpt}${ctx.sermon.youtubeUrl ? `\nWatch: ${ctx.sermon.youtubeUrl}` : ""}`
        : "";
    default:
      return "";
  }
}

export function renderNewsletterText(ctx: NewsletterContext): string {
  const greeting = ctx.recipientName ? `Hello ${ctx.recipientName},` : "Hello,";
  const body = ctx.blocks
    .map((b) => renderBlockText(b, ctx))
    .filter((s) => s.trim())
    .join("\n\n");

  return `PCN FIRST ABUJA PARISH — WEEKLY BULLETIN

${greeting}

${body}

Visit: ${ctx.siteUrl}

—
You signed up for updates at ${ctx.siteUrl}.
Unsubscribe: ${ctx.unsubscribeUrl}
`;
}

// A short plain-text summary of the body, for the send audit log (newsletter_sends.intro).
export function summarizeBlocks(blocks: NewsletterBlock[]): string {
  const text = blocks
    .map((b) => {
      if (b.type === "heading" || b.type === "text") return b.text;
      if (b.type === "image") return b.caption ? `[image: ${b.caption}]` : "[image]";
      if (b.type === "button") return `[${b.label}]`;
      if (b.type === "events") return "[events]";
      if (b.type === "sermon") return "[sermon]";
      return "";
    })
    .filter(Boolean)
    .join(" · ")
    .trim();
  return text.slice(0, 1000) || "(no text content)";
}
