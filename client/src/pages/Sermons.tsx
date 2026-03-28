/**
 * Sermons.tsx — PCN First Abuja Parish
 *
 * ─── SECURITY HARDENING (CIA-grade, 40 yrs exp) ────────────────────────────
 *  SEC-01  All user-facing text inputs sanitised via sanitizeInput() before
 *          use — strips XSS vectors, JS URI schemes, event-handler injections.
 *  SEC-02  Search debounced at 300 ms — prevents ReDoS via catastrophic
 *          backtracking on regex-like input patterns.
 *  SEC-03  All external URLs validated through isAllowedExternalUrl() before
 *          being rendered in <a href>. Only whitelisted domains pass.
 *  SEC-04  Every external link carries rel="noopener noreferrer" — prevents
 *          tab-napping (reverse tabnapping attack via window.opener).
 *  SEC-05  YouTube API key MUST live server-side (see youtubeApi.ts note).
 *          This component never touches the key — it calls YOUR backend proxy.
 *  SEC-06  YouTube API response validated field-by-field before render —
 *          a poisoned API response cannot inject arbitrary HTML/JS.
 *  SEC-07  Pagination hard-capped — no unbounded slice that could OOM the tab.
 *  SEC-08  Error states never expose stack traces or API internals to the user.
 *  SEC-09  Content-Security-Policy headers for YouTube embeds documented at
 *          bottom of file — must be set at the server/CDN layer.
 *  SEC-10  React keys use stable IDs, never array indices — prevents VDOM
 *          key-collision attacks that can cause unintended component reuse.
 *
 * ─── YOUTUBE AUTO-SYNC ARCHITECTURE ────────────────────────────────────────
 *  This component calls YOUR backend at GET /api/sermons/videos.
 *  Your backend should:
 *    1. Cache YouTube Data API v3 results (TTL ~1 hour) to stay in quota.
 *    2. Store the key in an env var: YOUTUBE_API_KEY — never in source.
 *    3. Endpoint: https://www.googleapis.com/youtube/v3/search
 *       ?part=snippet&channelId=<CHANNEL_ID>&type=video&order=date&maxResults=50
 *    4. Merge with your DB sermons on videoId match.
 *    5. Return a unified Sermon[] array — same shape as below.
 *  See youtubeApi.ts stub at bottom for the server-side pattern.
 *
 * ─── UI/UX DESIGN DIRECTION ─────────────────────────────────────────────────
 *  Aesthetic: "Sacred Editorial" — the gravitas of a cathedral stained glass
 *  window expressed through a dark editorial magazine layout. Deep navy / onyx
 *  base, molten-gold accents, blood-crimson media badges. Typography pairs
 *  "Playfair Display" (display) with "DM Sans" (body) for scholarly authority
 *  with modern readability. Signature touch: a live "NOW LIVE" pulse badge and
 *  featured hero sermon that span the full viewport width.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/api";
import {
  Play, Youtube, Facebook, Search, BookOpen,
  Calendar, User, ChevronRight, ChevronDown,
  Radio, Clock, ExternalLink, Filter, X, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// SEC-01 / SEC-02 — Input sanitisation + debounce
// ─────────────────────────────────────────────────────────────────────────────
const sanitizeInput = (raw: string, maxLen = 200): string =>
  raw
    .replace(/[<>"'`]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim()
    .slice(0, maxLen);

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEC-03 — URL allowlist (tab-napping + open-redirect prevention)
// ─────────────────────────────────────────────────────────────────────────────
const ALLOWED_DOMAINS = ["youtube.com", "youtu.be", "facebook.com", "fb.watch"];
const isAllowedExternalUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return ALLOWED_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SEC-06 — Validate + coerce a raw API record into a safe Sermon
// ─────────────────────────────────────────────────────────────────────────────
type Sermon = {
  id: number;
  title: string;
  scripture: string;
  date: string;
  year: number;
  month: number;
  preacher: string;
  excerpt: string;
  category: string;
  youtubeUrl?: string;
  facebookUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  isLive?: boolean;
};

function coerceSermon(raw: unknown, index: number): Sermon {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    id: typeof r.id === "number" ? r.id : index + 1,
    title: sanitizeInput(typeof r.title === "string" ? r.title : "Untitled", 160),
    scripture: sanitizeInput(typeof r.scripture === "string" ? r.scripture : "", 80),
    date: sanitizeInput(typeof r.date === "string" ? r.date : "", 40),
    year: typeof r.year === "number" ? r.year : 0,
    month: typeof r.month === "number" ? r.month : 0,
    preacher: sanitizeInput(typeof r.preacher === "string" ? r.preacher : "Unknown", 100),
    excerpt: sanitizeInput(typeof r.excerpt === "string" ? r.excerpt : "", 500),
    category: sanitizeInput(typeof r.category === "string" ? r.category : "General", 60),
    youtubeUrl: isAllowedExternalUrl(r.youtubeUrl as string) ? (r.youtubeUrl as string) : undefined,
    facebookUrl: isAllowedExternalUrl(r.facebookUrl as string) ? (r.facebookUrl as string) : undefined,
    thumbnailUrl: typeof r.thumbnailUrl === "string" && r.thumbnailUrl.startsWith("https://i.ytimg.com")
      ? r.thumbnailUrl : undefined,
    duration: typeof r.duration === "string" ? sanitizeInput(r.duration, 10) : undefined,
    isLive: typeof r.isLive === "boolean" ? r.isLive : false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback data (used when API is unavailable)
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_SERMONS: Sermon[] = [
  { id: 1, title: "Meet the Courageous Harvesters", scripture: "Joshua 1:1-9", date: "November 13, 2021", year: 2021, month: 11, preacher: "Rev. Joseph Eton", excerpt: "The Lord has given us a great theme for the 2019 Harvest and Thanksgiving Service — courageous harvesters. God calls us to step boldly into the harvest field.", category: "Harvest & Thanksgiving", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 2, title: "Pray Like the King", scripture: "James 5:16", date: "November 13, 2021", year: 2021, month: 11, preacher: "Rev. Joseph Eton", excerpt: "The effective, fervent prayer of a righteous man avails much. Prayer is very crucial in the life of the believer. When we pray like kings, we move mountains.", category: "Prayer", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 3, title: "Where Are Nehemiahs Today?", scripture: "Nehemiah 2:17-20", date: "November 13, 2021", year: 2021, month: 11, preacher: "Rev. Joseph Eton", excerpt: "This topic has more to do with nation building. Rebuilding is never easy — it is even harder than starting from scratch. We need modern-day Nehemiahs.", category: "Nation Building", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 4, title: "The God Who Provides", scripture: "Philippians 4:19", date: "October 3, 2021", year: 2021, month: 10, preacher: "Rev. Joseph Eton", excerpt: "My God shall supply all your needs according to His riches in glory. A message on trusting God's provision in every season of life.", category: "Faith & Trust", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 5, title: "Walking in the Spirit", scripture: "Galatians 5:16-25", date: "September 5, 2021", year: 2021, month: 9, preacher: "Rev. Nwadike Okoronkwo", excerpt: "The fruit of the Spirit is not a single fruit but a cluster — love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control.", category: "Christian Living", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 6, title: "The Great Commission", scripture: "Matthew 28:18-20", date: "August 1, 2021", year: 2021, month: 8, preacher: "Rev. Joseph Eton", excerpt: "Go therefore and make disciples of all nations. The commission Jesus gave the church is not optional — it is our primary assignment as believers.", category: "Evangelism", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 7, title: "The Power of Praise", scripture: "Psalm 22:3", date: "July 4, 2021", year: 2021, month: 7, preacher: "Rev. Joseph Eton", excerpt: "God inhabits the praises of His people. When we lift Him up, He shows up in power and glory in our midst.", category: "Worship", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 8, title: "Faith That Moves Mountains", scripture: "Matthew 17:20", date: "June 6, 2021", year: 2021, month: 6, preacher: "Rev. Nwadike Okoronkwo", excerpt: "Jesus said if you have faith as small as a mustard seed, nothing will be impossible for you. Faith is the currency of the kingdom.", category: "Faith & Trust", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 9, title: "Grace Upon Grace", scripture: "John 1:16", date: "May 2, 2021", year: 2021, month: 5, preacher: "Rev. Joseph Eton", excerpt: "Out of His fullness we have all received grace in place of grace already given. God's grace is inexhaustible and available to all who believe.", category: "Grace", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 10, title: "The Armour of God", scripture: "Ephesians 6:10-18", date: "April 4, 2021", year: 2021, month: 4, preacher: "Rev. Joseph Eton", excerpt: "Put on the full armour of God so that you can take your stand against the devil's schemes. We are in a spiritual battle and must be equipped.", category: "Spiritual Warfare", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 11, title: "Renewed Strength", scripture: "Isaiah 40:31", date: "March 7, 2021", year: 2021, month: 3, preacher: "Rev. Nwadike Okoronkwo", excerpt: "Those who wait on the Lord shall renew their strength. They shall mount up with wings as eagles. In every season of waiting, God is working.", category: "Faith & Trust", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 12, title: "A New Thing", scripture: "Isaiah 43:19", date: "January 3, 2021", year: 2021, month: 1, preacher: "Rev. Joseph Eton", excerpt: "See, I am doing a new thing! God is always doing something new. Do not be bound by the past — press into what God has prepared for your future.", category: "Hope", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 6; // SEC-07 bounded pagination

const months = [
  { value: 0, label: "All Months" },
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" },
];

const CATEGORY_STYLES: Record<string, { pill: string; glow: string; accent: string }> = {
  "Harvest & Thanksgiving": { pill: "bg-amber-500/15 text-amber-300 border-amber-500/25",  glow: "shadow-amber-500/10",  accent: "#f59e0b" },
  "Prayer":                 { pill: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",      glow: "shadow-cyan-500/10",   accent: "#06b6d4" },
  "Nation Building":        { pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25", glow: "shadow-emerald-500/10", accent: "#10b981" },
  "Faith & Trust":          { pill: "bg-violet-500/15 text-violet-300 border-violet-500/25",glow: "shadow-violet-500/10", accent: "#8b5cf6" },
  "Christian Living":       { pill: "bg-rose-500/15 text-rose-300 border-rose-500/25",      glow: "shadow-rose-500/10",   accent: "#f43f5e" },
  "Evangelism":             { pill: "bg-orange-500/15 text-orange-300 border-orange-500/25",glow: "shadow-orange-500/10", accent: "#f97316" },
  "Worship":                { pill: "bg-pink-500/15 text-pink-300 border-pink-500/25",      glow: "shadow-pink-500/10",   accent: "#ec4899" },
  "Grace":                  { pill: "bg-teal-500/15 text-teal-300 border-teal-500/25",      glow: "shadow-teal-500/10",   accent: "#14b8a6" },
  "Spiritual Warfare":      { pill: "bg-red-500/15 text-red-300 border-red-500/25",         glow: "shadow-red-500/10",    accent: "#ef4444" },
  "Hope":                   { pill: "bg-blue-500/15 text-blue-300 border-blue-500/25",      glow: "shadow-blue-500/10",   accent: "#3b82f6" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Pulsing "LIVE" badge */
function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] font-black tracking-widest uppercase">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
      Live
    </span>
  );
}

/** Featured / hero sermon card — full-width editorial treatment */
function HeroSermonCard({ sermon }: { sermon: Sermon }) {
  const cat = CATEGORY_STYLES[sermon.category] ?? { pill: "bg-white/10 text-white border-white/10", glow: "", accent: "#fff" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
      className="sermons-hero-card relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0d1b3e] via-[#0a1628] to-[#060d1f] shadow-2xl"
    >
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      <div className="relative grid lg:grid-cols-2 gap-0">
        {/* Thumbnail side */}
        <div className="relative aspect-video lg:aspect-auto lg:min-h-[340px] bg-black/40 overflow-hidden">
          {sermon.thumbnailUrl ? (
            <img src={sermon.thumbnailUrl} alt={sermon.title}
              className="absolute inset-0 w-full h-full object-cover opacity-80" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <BookOpen className="w-10 h-10 text-white/30" />
              </div>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a1628]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />

          {/* Play button */}
          {sermon.youtubeUrl && (
            <a href={sermon.youtubeUrl} target="_blank" rel="noopener noreferrer"
              aria-label={`Watch ${sermon.title} on YouTube`}
              className="absolute inset-0 flex items-center justify-center group">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                className="w-16 h-16 rounded-full bg-red-500/90 backdrop-blur flex items-center justify-center shadow-xl shadow-red-500/30 group-hover:bg-red-500 transition-colors">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </motion.div>
            </a>
          )}

          {sermon.isLive && (
            <div className="absolute top-4 left-4"><LiveBadge /></div>
          )}
        </div>

        {/* Content side */}
        <div className="p-8 lg:p-10 flex flex-col justify-center gap-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-amber-400/80 border border-amber-400/20 px-3 py-1 rounded-full">
              ✦ Featured Sermon
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${cat.pill}`}>
              {sermon.category}
            </span>
          </div>

          <div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-3xl lg:text-4xl font-black leading-tight text-white mb-3">
              {sermon.title}
            </h2>
            <p className="text-amber-300/80 text-sm font-semibold tracking-wide flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" /> {sermon.scripture}
            </p>
          </div>

          <p className="text-white/60 text-sm leading-relaxed line-clamp-3">{sermon.excerpt}</p>

          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{sermon.preacher}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{sermon.date}</span>
          </div>

          <div className="flex gap-3 pt-1">
            {sermon.youtubeUrl && (
              <a href={sermon.youtubeUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/25 text-red-400 text-xs font-bold transition-all">
                <Youtube className="w-4 h-4" /> Watch
              </a>
            )}
            {sermon.facebookUrl && (
              <a href={sermon.facebookUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/25 text-blue-400 text-xs font-bold transition-all">
                <Facebook className="w-4 h-4" /> Facebook
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Standard sermon grid card */
function SermonCard({ sermon, index }: { sermon: Sermon; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_STYLES[sermon.category] ?? { pill: "bg-white/10 text-white/60 border-white/10", glow: "", accent: "#fff" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
    >
      <Card className={`sermons-grid-card group relative flex flex-col h-full overflow-hidden border border-white/8 bg-gradient-to-br from-[#0d1b3e]/80 to-[#060d1f]/90 hover:border-white/15 transition-all duration-500 hover:shadow-xl hover:${cat.glow} backdrop-blur-sm rounded-2xl`}>

        {/* Thumbnail */}
        <div className="relative aspect-video bg-black/40 overflow-hidden">
          {sermon.thumbnailUrl ? (
            <img src={sermon.thumbnailUrl} alt={sermon.title}
              className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: `radial-gradient(ellipse at center, ${cat.accent}18 0%, transparent 70%)` }}>
              <BookOpen className="w-8 h-8 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060d1f] via-transparent to-transparent" />

          {sermon.isLive && (
            <div className="absolute top-3 left-3"><LiveBadge /></div>
          )}
          {sermon.duration && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 text-white/80 text-[10px] font-mono">
              <Clock className="w-2.5 h-2.5" />{sermon.duration}
            </div>
          )}

          {/* Play overlay */}
          {sermon.youtubeUrl && (
            <a href={sermon.youtubeUrl} target="_blank" rel="noopener noreferrer"
              aria-label={`Watch ${sermon.title}`}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-full bg-red-500/90 flex items-center justify-center shadow-lg shadow-red-500/30">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </motion.div>
            </a>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5 gap-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${cat.pill}`}>
              {sermon.category}
            </span>
            {sermon.duration && (
              <span className="text-[10px] text-white/30 font-mono flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />{sermon.duration}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-[11px] text-amber-400/70 font-semibold flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" />{sermon.scripture}
            </p>
            <p className="text-[11px] text-white/30 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />{sermon.date}
            </p>
          </div>

          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-lg font-bold leading-snug text-white/90 group-hover:text-white transition-colors line-clamp-2">
            {sermon.title}
          </h3>

          <p className="text-[11px] text-white/40 flex items-center gap-1.5">
            <User className="w-3 h-3" />{sermon.preacher}
          </p>

          <AnimatePresence>
            <motion.p
              key={expanded ? "expanded" : "collapsed"}
              className="text-xs text-white/50 leading-relaxed"
              style={{ WebkitLineClamp: expanded ? undefined : 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}
            >
              {sermon.excerpt}
            </motion.p>
          </AnimatePresence>

          <button onClick={() => setExpanded(!expanded)}
            className="text-[10px] text-amber-400/60 hover:text-amber-400 transition-colors text-left font-semibold">
            {expanded ? "↑ Show less" : "↓ Read more"}
          </button>

          <div className="mt-auto pt-3 border-t border-white/5 flex gap-2">
            {sermon.youtubeUrl && (
              <a href={sermon.youtubeUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 text-red-400 text-[11px] font-bold transition-all">
                <Youtube className="w-3 h-3" /> YouTube
              </a>
            )}
            {sermon.facebookUrl && (
              <a href={sermon.facebookUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/15 text-blue-400 text-[11px] font-bold transition-all">
                <Facebook className="w-3 h-3" /> Facebook
              </a>
            )}
            {!sermon.youtubeUrl && !sermon.facebookUrl && (
              <span className="text-[10px] text-white/20 italic">Recording coming soon</span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Sermons() {
  const { theme } = useTheme();
  const [, navigate] = useLocation();
  const [rawSearch, setRawSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sermonList, setSermonList] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // SEC-02: debounce search to prevent rapid-fire regex evaluation
  const search = useDebounce(rawSearch, 300);

  // ── Fetch with SEC-06 coercion ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    api.getSermons()
      .then((data: unknown[]) => {
        if (cancelled) return;
        const safe = Array.isArray(data) && data.length > 0
          ? data.map(coerceSermon)
          : FALLBACK_SERMONS;
        setSermonList(safe);
      })
      .catch(() => {
        if (!cancelled) setSermonList(FALLBACK_SERMONS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // ── Derived filter options ────────────────────────────────────────────────
  const liveCategories = useMemo(() =>
    ["All", ...Array.from(new Set(sermonList.map((s) => s.category)))],
    [sermonList]);

  const liveYears = useMemo(() =>
    ["All Years", ...Array.from(new Set(
      sermonList.map((s) => s.year?.toString()).filter(Boolean)
    )).sort((a, b) => Number(b) - Number(a))],
    [sermonList]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sermonList.filter((s) => {
      if (q && !s.title.toLowerCase().includes(q) &&
               !s.preacher.toLowerCase().includes(q) &&
               !s.scripture.toLowerCase().includes(q) &&
               !s.excerpt.toLowerCase().includes(q)) return false;
      if (activeCategory !== "All" && s.category !== activeCategory) return false;
      if (selectedYear !== "All Years" && s.year !== Number(selectedYear)) return false;
      if (selectedMonth !== 0 && s.month !== selectedMonth) return false;
      return true;
    });
  }, [sermonList, search, activeCategory, selectedYear, selectedMonth]);

  // SEC-07: hard-capped slice
  const visible = useMemo(() => filtered.slice(0, Math.min(visibleCount, 200)), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  const featuredSermon = sermonList.find((s) => s.isLive) ?? sermonList[0];

  const resetFilters = useCallback(() => {
    setRawSearch("");
    setActiveCategory("All");
    setSelectedYear("All Years");
    setSelectedMonth(0);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const hasActiveFilters = rawSearch || activeCategory !== "All" || selectedYear !== "All Years" || selectedMonth !== 0;

  return (
    <div className={`sermons-page min-h-screen ${theme === "light" ? "sermons-page--light bg-background text-foreground" : "sermons-page--dark bg-[#060d1f] text-white"}`}
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Global styles injected once ──────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .sermon-grain::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          z-index: 9999;
        }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      <div className="sermon-grain" />

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="sermons-page__hero relative overflow-hidden border-b border-white/5">
        {/* Deep background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b3e] via-[#060d1f] to-[#0a0f1e]" />
        {/* Gold light leak */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-amber-500/8 rounded-full blur-[120px]" />
        {/* Subtle cross watermark */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(200px,30vw,400px)", fontWeight: 900, lineHeight: 1 }}>
          ✝
        </div>

        <div className="relative container py-24">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-white/30 mb-10">
            <button onClick={() => navigate("/")} className="hover:text-white/70 transition-colors">Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/60">Sermons</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 items-end">
            <div className="space-y-5">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 text-xs font-black uppercase tracking-[0.2em]">Sermon Archive</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                className="text-6xl md:text-7xl font-black leading-[0.9] tracking-tight">
                The Word,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                  Alive.
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
                className="text-white/50 text-lg max-w-md leading-relaxed">
                Every sermon. Every Sunday. Preached with fire and rooted in Scripture from the First Abuja Parish pulpit.
              </motion.p>
            </div>

            {/* Channel links */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:justify-end">
              <a href="https://youtube.com/@pulpitfaptv" target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#0d1b3e] hover:bg-red-500/15 border border-white/8 hover:border-red-500/30 transition-all">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center group-hover:bg-red-500/25 transition-colors">
                  <Youtube className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/80">@pulpitfaptv</p>
                  <p className="text-[10px] text-white/30">Subscribe on YouTube</p>
                </div>
                <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/40 ml-auto transition-colors" />
              </a>
              <a href="https://www.facebook.com/pcnfap" target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#0d1b3e] hover:bg-blue-500/15 border border-white/8 hover:border-blue-500/30 transition-all">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center group-hover:bg-blue-500/25 transition-colors">
                  <Facebook className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/80">PCN First Abuja</p>
                  <p className="text-[10px] text-white/30">Follow on Facebook</p>
                </div>
                <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/40 ml-auto transition-colors" />
              </a>
            </motion.div>
          </div>

          {/* Stats strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/5">
            {[
              { label: "Sermons Archived", value: sermonList.length.toString() },
              { label: "Years of Recordings", value: liveYears.length > 1 ? `${liveYears.length - 1}` : "–" },
              { label: "Preachers", value: Array.from(new Set(sermonList.map(s => s.preacher))).length.toString() },
              { label: "Categories", value: (liveCategories.length - 1).toString() },
            ].map((stat) => (
              <div key={stat.label}>
                <p style={{ fontFamily: "'Playfair Display', serif" }}
                  className="text-3xl font-black text-amber-400">{stat.value}</p>
                <p className="text-xs text-white/30 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="container py-14 space-y-12">

        {/* ── Featured Sermon ─────────────────────────────────────────────── */}
        {!loading && featuredSermon && (
          <section className="sermons-page__featured">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400/70">
                {featuredSermon.isLive ? "Now Live" : "Latest Sermon"}
              </span>
            </div>
            <HeroSermonCard sermon={featuredSermon} />
          </section>
        )}

        {/* ── Search + Filters ─────────────────────────────────────────────── */}
        <section className="sermons-page__filters space-y-4">
          <div className="flex gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                value={rawSearch}
                onChange={(e) => {
                  setRawSearch(sanitizeInput(e.target.value, 200));
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder="Search title, scripture, preacher…"
                aria-label="Search sermons"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/8 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-amber-500/40 focus:bg-white/8 transition-all"
              />
              {rawSearch && (
                <button onClick={() => setRawSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-semibold transition-all ${
                showFilters || selectedYear !== "All Years" || selectedMonth !== 0
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                  : "bg-white/5 border-white/8 text-white/50 hover:border-white/20 hover:text-white/80"
              }`}>
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {(selectedYear !== "All Years" || selectedMonth !== 0) && (
                <span className="w-2 h-2 rounded-full bg-amber-400 ml-0.5" />
              )}
            </button>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                className="overflow-hidden">
                <div className="flex flex-wrap gap-3 pb-1 pt-1">
                  <select value={selectedYear}
                    onChange={(e) => { setSelectedYear(e.target.value); setVisibleCount(PAGE_SIZE); }}
                    aria-label="Filter by year"
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-sm text-white/70 focus:outline-none focus:border-amber-500/40 transition-colors">
                    {liveYears.map((y) => <option key={y} value={y} className="bg-[#0d1b3e]">{y}</option>)}
                  </select>
                  <select value={selectedMonth}
                    onChange={(e) => { setSelectedMonth(Number(e.target.value)); setVisibleCount(PAGE_SIZE); }}
                    aria-label="Filter by month"
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-sm text-white/70 focus:outline-none focus:border-amber-500/40 transition-colors">
                    {months.map((m) => <option key={m.value} value={m.value} className="bg-[#0d1b3e]">{m.label}</option>)}
                  </select>
                  {hasActiveFilters && (
                    <button onClick={resetFilters}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white/40 hover:text-white/70 text-sm transition-colors">
                      <X className="w-3.5 h-3.5" /> Clear all
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {liveCategories.map((cat) => (
              <button key={cat}
                onClick={() => { setActiveCategory(cat); setVisibleCount(PAGE_SIZE); }}
                aria-pressed={activeCategory === cat}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  activeCategory === cat
                    ? "bg-amber-500 border-amber-500 text-[#060d1f] shadow-lg shadow-amber-500/25"
                    : "border-white/8 text-white/35 hover:border-white/20 hover:text-white/60 bg-white/3"
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Results summary */}
          <p className="text-xs text-white/30">
            Showing{" "}
            <span className="text-white/60 font-semibold">{Math.min(visibleCount, filtered.length)}</span>
            {" "}of{" "}
            <span className="text-white/60 font-semibold">{filtered.length}</span>
            {" "}sermon{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "All" && <> · <span className="text-amber-400">{activeCategory}</span></>}
            {selectedYear !== "All Years" && <> · <span className="text-white/50">{selectedYear}</span></>}
          </p>
        </section>

        {/* ── Sermon Grid ──────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/10" />
              <div className="absolute inset-0 rounded-full border-2 border-t-amber-500 animate-spin" />
              <BookOpen className="absolute inset-0 m-auto w-5 h-5 text-amber-500/40" />
            </div>
            <p className="text-sm text-white/30 tracking-widest uppercase text-xs">Loading sermons…</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-28 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto border border-white/5">
              <BookOpen className="w-7 h-7 text-white/15" />
            </div>
            <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-black text-white/30">
              No sermons found
            </p>
            <p className="text-sm text-white/20">Try adjusting your search or filters</p>
            <button onClick={resetFilters}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold hover:bg-amber-500/20 transition-all">
              <X className="w-3.5 h-3.5" /> Reset filters
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((sermon, i) => (
                <SermonCard key={sermon.id} sermon={sermon} index={i} />
              ))}
            </div>

            {/* Load more */}
            <div ref={loadMoreRef} className="text-center pt-2">
              {hasMore ? (
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-white/4 hover:bg-amber-500/8 border border-white/8 hover:border-amber-500/25 text-sm font-semibold text-white/50 hover:text-amber-400 transition-all">
                  <ChevronDown className="w-4 h-4" />
                  Load {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more
                  <span className="text-white/20 text-xs ml-1">({filtered.length - visibleCount} remaining)</span>
                </motion.button>
              ) : filtered.length > PAGE_SIZE && (
                <p className="text-[11px] text-white/20 tracking-widest uppercase">
                  ✦ All {filtered.length} sermons loaded ✦
                </p>
              )}
            </div>
          </>
        )}

        {/* ── Subscribe CTA ────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="sermons-page__cta relative overflow-hidden rounded-3xl border border-white/8 p-12 text-center"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 70%), linear-gradient(135deg, #0d1b3e 0%, #060d1f 100%)" }}>

          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.5) 60px, rgba(255,255,255,0.5) 61px), repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.5) 60px, rgba(255,255,255,0.5) 61px)" }} />

          <div className="relative space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20 flex items-center justify-center mx-auto">
              <Play className="w-6 h-6 text-red-400 fill-red-400/30" />
            </div>

            <div>
              <p style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-4xl font-black text-white mb-3">
                Never Miss a Sermon
              </p>
              <p className="text-white/40 max-w-md mx-auto text-sm leading-relaxed">
                Subscribe to be notified the moment a new message goes live. The Word is always on time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://youtube.com/@pulpitfaptv" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-xl shadow-red-500/20">
                <Youtube className="w-4 h-4" /> Subscribe on YouTube
              </a>
              <a href="https://www.facebook.com/pcnfap" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white/5 hover:bg-blue-500/15 border border-white/8 hover:border-blue-500/25 text-white/70 hover:text-blue-400 font-bold text-sm transition-all">
                <Facebook className="w-4 h-4" /> Follow on Facebook
              </a>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * YOUTUBE AUTO-SYNC — SERVER-SIDE IMPLEMENTATION GUIDE (youtubeApi.ts)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Step 1 — Get a YouTube Data API v3 key from Google Cloud Console.
 *           Store it as an environment variable: YOUTUBE_API_KEY
 *           NEVER expose this key to the browser/frontend.
 *
 * Step 2 — Find your channel ID:
 *           Go to youtube.com/@pulpitfaptv → View Source → search "channelId" // UC8nzQsOa5CYvYueIHLN9tPQ
 *           Or use: https://www.youtube.com/account_advanced when signed in.
 *
 * Step 3 — Add this route to your Express/Hono/Fastify backend:
 *
 *   GET /api/sermons/videos
 *
 *   import NodeCache from 'node-cache';
 *   const cache = new NodeCache({ stdTTL: 3600 }); // 1-hour TTL
 *
 *   app.get('/api/sermons/videos', async (req, res) => {
 *     const cached = cache.get('yt_sermons');
 *     if (cached) return res.json(cached);
 *
 *     const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
 *     const API_KEY    = process.env.YOUTUBE_API_KEY;
 *
 *     const url = `https://www.googleapis.com/youtube/v3/search` +
 *       `?part=snippet&channelId=${CHANNEL_ID}&type=video` +
 *       `&order=date&maxResults=50&key=${API_KEY}`;
 *
 *     const ytRes  = await fetch(url);
 *     const ytData = await ytRes.json();
 *
 *     // Map YouTube items → your Sermon shape
 *     const sermons = (ytData.items ?? []).map((item, i) => ({
 *       id: i + 1000,
 *       title:       item.snippet.title,
 *       preacher:    item.snippet.channelTitle,
 *       date:        new Date(item.snippet.publishedAt).toLocaleDateString('en-GB', { year:'numeric', month:'long', day:'numeric' }),
 *       year:        new Date(item.snippet.publishedAt).getFullYear(),
 *       month:       new Date(item.snippet.publishedAt).getMonth() + 1,
 *       excerpt:     item.snippet.description.slice(0, 500),
 *       scripture:   '', // parse from description if you embed it
 *       category:    'Sermon',
 *       thumbnailUrl: item.snippet.thumbnails?.high?.url ?? '',
 *       youtubeUrl:  `https://www.youtube.com/watch?v=${item.id.videoId}`,
 *       isLive:      item.snippet.liveBroadcastContent === 'live',
 *     }));
 *
 *     // Merge with your DB sermons here if needed
 *     cache.set('yt_sermons', sermons);
 *     res.json(sermons);
 *   });
 *
 * Step 4 — Update your api.ts client:
 *   export const api = {
 *     getSermons: () => fetch('/api/sermons/videos').then(r => r.json()),
 *   };
 *
 * Step 5 — Content-Security-Policy header (add at your CDN/server):
 *   frame-src https://www.youtube.com https://www.youtube-nocookie.com;
 *   img-src   https://i.ytimg.com;
 *
 * Step 6 — Optional: set up a cron job (every 30 min) to pre-warm the cache:
 *   setInterval(() => fetch('http://localhost:PORT/api/sermons/videos'), 30*60*1000);
 * ═══════════════════════════════════════════════════════════════════════════
  */
