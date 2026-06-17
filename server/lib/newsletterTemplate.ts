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

export type NewsletterContext = {
  intro: string;
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

function paragraphs(intro: string): string {
  return intro
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px 0;line-height:1.6;color:#3c4452;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export function renderNewsletterHtml(ctx: NewsletterContext): string {
  const greeting = ctx.recipientName ? `Hello ${escapeHtml(ctx.recipientName)},` : "Hello,";

  const eventsHtml =
    ctx.events.length === 0
      ? `<p style="margin:0;color:#5b6577;font-style:italic;">No events scheduled in the coming week — we'll see you in worship on Sunday.</p>`
      : ctx.events
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

  const sermonHtml = ctx.sermon
    ? `
<div style="margin:28px 0 0 0;padding:20px 22px;background:#132744;border-radius:12px;color:#ffffff;">
  <div style="font-family:Georgia,serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c8972a;margin-bottom:8px;">Latest Sermon</div>
  <div style="font-family:Georgia,serif;font-size:20px;margin-bottom:6px;">${escapeHtml(ctx.sermon.title)}</div>
  <div style="font-size:13px;opacity:0.75;margin-bottom:10px;">${escapeHtml(ctx.sermon.preacher)} &nbsp;·&nbsp; ${escapeHtml(ctx.sermon.scripture)}</div>
  <div style="font-size:14px;line-height:1.6;opacity:0.9;">${escapeHtml(ctx.sermon.excerpt)}</div>
  ${
    ctx.sermon.youtubeUrl
      ? `<a href="${escapeHtml(ctx.sermon.youtubeUrl)}" style="display:inline-block;margin-top:14px;padding:10px 18px;background:#c8972a;color:#ffffff;text-decoration:none;border-radius:999px;font-size:13px;">Watch sermon ▸</a>`
      : ""
  }
</div>`
    : "";

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
        ${paragraphs(ctx.intro)}
      </td></tr>
      <tr><td style="padding:8px 36px 0 36px;">
        <div style="font-family:Georgia,serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c8972a;margin-bottom:14px;">This Week</div>
        ${eventsHtml}
        ${sermonHtml}
      </td></tr>
      <tr><td style="padding:32px 36px 28px 36px;text-align:center;">
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

export function renderNewsletterText(ctx: NewsletterContext): string {
  const greeting = ctx.recipientName ? `Hello ${ctx.recipientName},` : "Hello,";
  const eventsBlock =
    ctx.events.length === 0
      ? "No events scheduled in the coming week — we'll see you in worship on Sunday."
      : ctx.events
          .map(
            (e) =>
              `• ${e.month} ${e.day} — ${e.title}\n  ${e.time} · ${e.location}${e.description ? "\n  " + e.description : ""}`
          )
          .join("\n\n");
  const sermonBlock = ctx.sermon
    ? `\n\nLATEST SERMON\n${ctx.sermon.title} — ${ctx.sermon.preacher} (${ctx.sermon.scripture})\n${ctx.sermon.excerpt}${ctx.sermon.youtubeUrl ? `\nWatch: ${ctx.sermon.youtubeUrl}` : ""}`
    : "";

  return `PCN FIRST ABUJA PARISH — WEEKLY BULLETIN

${greeting}

${ctx.intro.trim()}

THIS WEEK
${eventsBlock}${sermonBlock}

Visit: ${ctx.siteUrl}

—
You signed up for updates at ${ctx.siteUrl}.
Unsubscribe: ${ctx.unsubscribeUrl}
`;
}
