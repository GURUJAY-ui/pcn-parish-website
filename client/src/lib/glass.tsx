/**
 * glass.tsx — shared liquid-glass design system for the parish site.
 * Theme tokens, brand constants, security validators and the social
 * icon set used by SiteNav, SiteFooter and the redesigned pages.
 */

import { useTheme } from "@/contexts/ThemeContext";

export const SERIF = { fontFamily: "'Instrument Serif', Georgia, serif" } as const;

// Theme tokens for the liquid-glass design system.
// Dark = monochrome black/white glass; light = ivory with PCN navy + gold.
export function useGlassTheme() {
  const { theme } = useTheme();
  const L = theme === "light";
  return {
    L,
    glass:      L ? "liquid-glass-light" : "liquid-glass",
    pageBg:     L ? "bg-[#fffaf0]" : "bg-black",
    ink:        L ? "text-[#132744]" : "text-white",
    ink70:      L ? "text-[#132744]/70" : "text-white/70",
    ink60:      L ? "text-[#132744]/65" : "text-white/60",
    ink50:      L ? "text-[#132744]/60" : "text-white/50",
    ink40:      L ? "text-[#1a3a6b]/55" : "text-white/40",
    ink30:      L ? "text-[#1a3a6b]/40" : "text-white/30",
    inkHover:   L ? "hover:text-[#132744]" : "hover:text-white",
    inkGroupHover: L ? "group-hover:text-[#132744]" : "group-hover:text-white",
    em:         L ? "italic text-[#1a3a6b]/75" : "italic text-white/60",
    label:      L ? "text-[#c8972a]" : "text-white/40",
    dot:        L ? "bg-[#c8972a]" : "bg-amber-400",
    btnPrimary: L ? "bg-[#132744] text-white hover:bg-[#1a3a6b]" : "bg-white text-black hover:bg-neutral-200",
    hoverGlass: L ? "hover:bg-[#132744]/5" : "hover:bg-white/5",
    playFill:   L ? "fill-[#132744]/70" : "fill-white/70",
    divider:    L ? "border-[#132744]/10" : "border-white/10",
    dividerSub: L ? "border-[#132744]/5" : "border-white/5",
    radial:     L
      ? "bg-[radial-gradient(ellipse_at_top,_rgba(26,58,107,0.05)_0%,_transparent_70%)]"
      : "bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)]",
    radialMid:  L
      ? "bg-[radial-gradient(ellipse_at_center,_rgba(26,58,107,0.04)_0%,_transparent_60%)]"
      : "bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)]",
  };
}
export type GlassTheme = ReturnType<typeof useGlassTheme>;

// ── SEC-02 — URL allowlist ────────────────────────────────────────
const ALLOWED_SOCIAL_DOMAINS = [
  "facebook.com", /* "x.com", */   "twitter.com",
  "youtube.com", "youtu.be",  "instagram.com", "tiktok.com",
];
export const isAllowedExternalUrl = (url: string): boolean => {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_SOCIAL_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith(`.${d}`)
    );
  } catch { return false; }
};

// ── SEC-05 — Safe image URL validator ────────────────────────────
const ALLOWED_IMG_HOSTS = ["d2xsxph8kpxj0f.cloudfront.net"];
export const isSafeImageUrl = (url: string): boolean => {
  if (url.startsWith("/")) return true;
  try {
    const { hostname } = new URL(url);
    return ALLOWED_IMG_HOSTS.includes(hostname);
  } catch { return false; }
};

// ── SEC-04 — Frozen social icon data ─────────────────────────────
export const SOCIAL_LINKS = Object.freeze([
  { label: "Facebook",  href: "https://facebook.com/pcnfap",              isInstagram: false, isTikTok: false, path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  // { label: "X",         href: "https://x.com/firstabujapresbyterian",     isInstagram: false, isTikTok: false, path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.6l-5.165-6.75-5.913 6.75h-3.308l7.73-8.835L2.56 2.25h6.772l4.681 6.187 5.431-6.187zM17.7 20.005h1.813L6.283 3.993H4.366l13.334 16.012z" },
  { label: "YouTube",   href: "https://youtube.com/@pulpitfaptv",         isInstagram: false, isTikTok: false, path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
   { label: "Instagram", href: "https://instagram.com/pcnfap",             isInstagram: true,  isTikTok: false, path: "" },
  { label: "TikTok",    href: "https://www.tiktok.com/@pcnfap",           isInstagram: false, isTikTok: true,  path: "" },
] as const);

// ── SEC-08 — Hardcoded contact constants ─────────────────────────
export const CONTACT = Object.freeze({
  phone:     "+234 (0) 8151111877",
  phoneHref: "tel:+2348151111877",
  email:     "pulpitfap@gmail.com",
  emailHref: "mailto:pulpitfap@gmail.com",
  address:   "No. 5 Boke Close, off Sakono Street, Opposite AP Plaza, Wuse II, Abuja",
});

export const NAV_ITEMS = [
  { label: "Home",        route: "/"           },
  { label: "About",       route: "/about"      },
  { label: "Leadership",  route: "/staff"      },
  { label: "Sermons",     route: "/sermons"    },
  { label: "Testimonies", route: "/testimonies"},
  { label: "Ministries",  route: "/ministries" },
  { label: "Events",      route: "/events"     },
  { label: "Contact",     route: "/contact"    },
] as const;

export function SocialIcon({ s, className = "w-5 h-5" }: { s: (typeof SOCIAL_LINKS)[number]; className?: string }) {
  if (s.isInstagram) {
    return (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="2.17" y="2.17" width="19.66" height="19.66" rx="4.58" />
        <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
        <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
      </svg>
    );
  }
  if (s.isTikTok) {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.41a8.16 8.16 0 0 0 4.78 1.52V7.49a4.85 4.85 0 0 1-1.01-.8z"/>
      </svg>
    );
  }
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d={s.path} />
    </svg>
  );
}
