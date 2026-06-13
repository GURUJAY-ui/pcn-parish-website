/**
 * Sermons.tsx — PCN First Abuja Parish
 * Liquid-glass redesign with full light/dark support.
 *
 * Security measures retained:
 *  - sanitizeInput() on all text input; coerceSermon() validates every API
 *    record field-by-field before render.
 *  - Search debounced 300ms (ReDoS guard).
 *  - External URLs validated via isAllowedExternalUrl(); all carry
 *    rel="noopener noreferrer".
 *  - Pagination hard-capped; stable React keys (never indices for identity).
 *  - YouTube API key stays server-side — see the integration guide at the
 *    bottom of this file.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useGlassTheme, SERIF } from "@/lib/glass";
import { api } from "@/lib/api";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import {
  Play, Youtube, Facebook, Search, BookOpen,
  Calendar, User, ChevronDown,
  Radio, Clock, ExternalLink, Filter, X, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Input sanitisation + debounce ────────────────────────────────
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
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─── URL allowlist ────────────────────────────────────────────────
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

// ─── Validate + coerce a raw API record into a safe Sermon ────────
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

// ─── Fallback data (used when API is unavailable) ─────────────────
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

const PAGE_SIZE = 6; // bounded pagination

const months = [
  { value: 0, label: "All Months" },
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" },
];

// ─── Live badge ───────────────────────────────────────────────────
function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold tracking-widest uppercase">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
      Live
    </span>
  );
}

// ─── Featured / hero sermon card ──────────────────────────────────
function HeroSermonCard({ sermon }: { sermon: Sermon }) {
  const t = useGlassTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
      className={`${t.glass} relative rounded-3xl overflow-hidden`}>
      <div className="relative grid lg:grid-cols-2 gap-0">
        {/* Thumbnail side */}
        <div className="relative aspect-video lg:aspect-auto lg:min-h-[340px] overflow-hidden">
          {sermon.thumbnailUrl ? (
            <img src={sermon.thumbnailUrl} alt={sermon.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <img src="/assets/PCN-FAP-CONG.jpeg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0 bg-black/40" />
          {sermon.youtubeUrl && (
            <a href={sermon.youtubeUrl} target="_blank" rel="noopener noreferrer"
              aria-label={`Watch ${sermon.title} on YouTube`}
              className="absolute inset-0 flex items-center justify-center group">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                className="liquid-glass w-16 h-16 rounded-full flex items-center justify-center">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </motion.div>
            </a>
          )}
          {sermon.isLive && <div className="absolute top-4 left-4"><LiveBadge /></div>}
        </div>

        {/* Content side */}
        <div className="p-8 lg:p-10 flex flex-col justify-center gap-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`${t.label} text-[10px] font-medium tracking-[0.2em] uppercase`}>✦ Featured Sermon</span>
            <span className={`${t.glass} rounded-full px-3 py-1 text-xs ${t.ink60}`}>{sermon.category}</span>
          </div>
          <div>
            <h2 style={SERIF} className={`text-3xl lg:text-5xl ${t.ink} tracking-tight leading-tight mb-3`}>{sermon.title}</h2>
            <p className={`${t.label} text-sm flex items-center gap-2`}>
              <BookOpen className="w-3.5 h-3.5" /> {sermon.scripture}
            </p>
          </div>
          <p className={`${t.ink50} text-sm leading-relaxed line-clamp-3`}>{sermon.excerpt}</p>
          <div className={`flex items-center gap-4 text-xs ${t.ink40}`}>
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{sermon.preacher}</span>
            <span className={`w-1 h-1 rounded-full ${t.L ? "bg-[#132744]/30" : "bg-white/20"}`} />
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{sermon.date}</span>
          </div>
          <div className="flex gap-3 pt-1">
            {sermon.youtubeUrl && (
              <a href={sermon.youtubeUrl} target="_blank" rel="noopener noreferrer"
                className={`${t.btnPrimary} flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-colors`}>
                <Youtube className="w-4 h-4" /> Watch
              </a>
            )}
            {sermon.facebookUrl && (
              <a href={sermon.facebookUrl} target="_blank" rel="noopener noreferrer"
                className={`${t.glass} flex items-center gap-2 px-5 py-2.5 rounded-full ${t.ink} text-xs font-medium ${t.hoverGlass} transition-colors`}>
                <Facebook className="w-4 h-4" /> Facebook
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Standard sermon grid card ────────────────────────────────────
function SermonCard({ sermon, index }: { sermon: Sermon; index: number }) {
  const t = useGlassTheme();
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}>
      <div className={`${t.glass} group flex flex-col h-full overflow-hidden rounded-3xl`}>
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {sermon.thumbnailUrl ? (
            <img src={sermon.thumbnailUrl} alt={sermon.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <img src="/assets/PCN-FAP-CONG.jpeg" alt="" aria-hidden
              className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
          )}
          <div className="absolute inset-0 bg-black/35" />
          {sermon.isLive && <div className="absolute top-3 left-3"><LiveBadge /></div>}
          {sermon.duration && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 text-white/80 text-[10px] font-mono">
              <Clock className="w-2.5 h-2.5" />{sermon.duration}
            </div>
          )}
          {sermon.youtubeUrl && (
            <a href={sermon.youtubeUrl} target="_blank" rel="noopener noreferrer"
              aria-label={`Watch ${sermon.title}`}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="liquid-glass w-12 h-12 rounded-full flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
            </a>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6 gap-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className={`${t.glass} rounded-full px-2.5 py-1 text-[10px] ${t.ink60}`}>{sermon.category}</span>
          </div>
          <div className="space-y-1">
            <p className={`${t.label} text-[11px] flex items-center gap-1.5`}><BookOpen className="w-3 h-3" />{sermon.scripture}</p>
            <p className={`${t.ink40} text-[11px] flex items-center gap-1.5`}><Calendar className="w-3 h-3" />{sermon.date}</p>
          </div>
          <h3 style={SERIF} className={`text-xl md:text-2xl ${t.ink} tracking-tight leading-snug line-clamp-2`}>{sermon.title}</h3>
          <p className={`${t.ink40} text-[11px] flex items-center gap-1.5`}><User className="w-3 h-3" />{sermon.preacher}</p>
          <p className={`${t.ink50} text-xs leading-relaxed`}
            style={{ WebkitLineClamp: expanded ? undefined : 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {sermon.excerpt}
          </p>
          <button onClick={() => setExpanded(!expanded)}
            className={`${t.label} text-[10px] hover:opacity-70 transition-opacity text-left font-medium`}>
            {expanded ? "↑ Show less" : "↓ Read more"}
          </button>
          <div className={`mt-auto pt-3 border-t ${t.dividerSub} flex gap-2`}>
            {sermon.youtubeUrl && (
              <a href={sermon.youtubeUrl} target="_blank" rel="noopener noreferrer"
                className={`${t.glass} flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full ${t.ink70} text-[11px] font-medium ${t.hoverGlass} transition-all`}>
                <Youtube className="w-3 h-3" /> YouTube
              </a>
            )}
            {sermon.facebookUrl && (
              <a href={sermon.facebookUrl} target="_blank" rel="noopener noreferrer"
                className={`${t.glass} flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full ${t.ink70} text-[11px] font-medium ${t.hoverGlass} transition-all`}>
                <Facebook className="w-3 h-3" /> Facebook
              </a>
            )}
            {!sermon.youtubeUrl && !sermon.facebookUrl && (
              <span className={`${t.ink30} text-[10px] italic`}>Recording coming soon</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────
export default function Sermons() {
  const t = useGlassTheme();
  const [rawSearch, setRawSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sermonList, setSermonList] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const search = useDebounce(rawSearch, 300);

  useEffect(() => {
    let cancelled = false;
    api.getSermons()
      .then((data: unknown[]) => {
        if (cancelled) return;
        const safe = Array.isArray(data) && data.length > 0 ? data.map(coerceSermon) : FALLBACK_SERMONS;
        setSermonList(safe);
      })
      .catch(() => { if (!cancelled) setSermonList(FALLBACK_SERMONS); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const liveCategories = useMemo(() =>
    ["All", ...Array.from(new Set(sermonList.map((s) => s.category)))], [sermonList]);

  const liveYears = useMemo(() =>
    ["All Years", ...Array.from(new Set(
      sermonList.map((s) => s.year?.toString()).filter(Boolean)
    )).sort((a, b) => Number(b) - Number(a))], [sermonList]);

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

  const selectCls = `px-4 py-2.5 rounded-full text-sm ${t.ink70} ${t.glass} focus:outline-none transition-colors`;

  return (
    <div className={`page-shell min-h-screen ${t.pageBg} ${t.ink}`}>
      <SiteNav />

      {/* HERO */}
      <section className={`relative ${t.pageBg} pt-36 md:pt-44 pb-12 md:pb-16 px-6 overflow-hidden`}>
        <div className={`absolute inset-0 ${t.radial}`} />
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-end">
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className={`${t.glass} inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6`}>
                <Radio className={`w-3.5 h-3.5 ${t.label}`} />
                <span className={`${t.label} text-[10px] uppercase tracking-[0.25em]`}>Sermon Archive</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
                style={SERIF} className={`text-5xl md:text-7xl ${t.ink} tracking-tight leading-[1.02] mb-5`}>
                The Word, <em className={t.em}>alive.</em>
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
                className={`${t.ink50} text-base md:text-lg max-w-md leading-relaxed`}>
                Every sermon. Every Sunday. Preached with fire and rooted in Scripture from the First Abuja Parish pulpit.
              </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:justify-end">
              <a href="https://youtube.com/@pulpitfaptv" target="_blank" rel="noopener noreferrer"
                className={`${t.glass} group flex items-center gap-3 px-5 py-3.5 rounded-2xl ${t.hoverGlass} transition-all`}>
                <div className={`${t.glass} w-9 h-9 rounded-full flex items-center justify-center`}>
                  <Youtube className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className={`text-xs font-medium ${t.ink}`}>@pulpitfaptv</p>
                  <p className={`text-[10px] ${t.ink40}`}>Subscribe on YouTube</p>
                </div>
                <ExternalLink className={`w-3 h-3 ${t.ink30} ml-auto`} />
              </a>
              <a href="https://www.facebook.com/pcnfap" target="_blank" rel="noopener noreferrer"
                className={`${t.glass} group flex items-center gap-3 px-5 py-3.5 rounded-2xl ${t.hoverGlass} transition-all`}>
                <div className={`${t.glass} w-9 h-9 rounded-full flex items-center justify-center`}>
                  <Facebook className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className={`text-xs font-medium ${t.ink}`}>PCN First Abuja</p>
                  <p className={`text-[10px] ${t.ink40}`}>Follow on Facebook</p>
                </div>
                <ExternalLink className={`w-3 h-3 ${t.ink30} ml-auto`} />
              </a>
            </motion.div>
          </div>

          {/* Stats strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className={`flex flex-wrap gap-8 mt-12 pt-8 border-t ${t.divider}`}>
            {[
              { label: "Sermons Archived", value: sermonList.length.toString() },
              { label: "Years of Recordings", value: liveYears.length > 1 ? `${liveYears.length - 1}` : "–" },
              { label: "Preachers", value: Array.from(new Set(sermonList.map((s) => s.preacher))).length.toString() },
              { label: "Categories", value: (liveCategories.length - 1).toString() },
            ].map((stat) => (
              <div key={stat.label}>
                <p style={SERIF} className={`text-3xl ${t.ink}`}>{stat.value}</p>
                <p className={`text-xs ${t.ink40} mt-0.5`}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-8 space-y-12">
        {/* Featured */}
        {!loading && featuredSermon && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className={`w-4 h-4 ${t.label}`} />
              <span className={`${t.label} text-xs uppercase tracking-[0.2em]`}>
                {featuredSermon.isLive ? "Now Live" : "Latest Sermon"}
              </span>
            </div>
            <HeroSermonCard sermon={featuredSermon} />
          </section>
        )}

        {/* Search + filters */}
        <section className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-xl">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${t.ink40}`} />
              <input
                value={rawSearch}
                onChange={(e) => { setRawSearch(sanitizeInput(e.target.value, 200)); setVisibleCount(PAGE_SIZE); }}
                placeholder="Search title, scripture, preacher…"
                aria-label="Search sermons"
                className={`${t.glass} w-full pl-11 pr-10 py-3 rounded-full ${t.ink} text-sm focus:outline-none transition-all placeholder:${t.L ? "text-[#132744]/40" : "text-white/30"}`}
              />
              {rawSearch && (
                <button onClick={() => setRawSearch("")}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.ink40} hover:${t.ink} transition-colors`}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`${t.glass} flex items-center gap-2 px-4 py-3 rounded-full text-sm font-medium ${t.ink70} ${t.hoverGlass} transition-all`}>
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {(selectedYear !== "All Years" || selectedMonth !== 0) && <span className={`w-2 h-2 rounded-full ${t.dot} ml-0.5`} />}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                <div className="flex flex-wrap gap-3 pb-1 pt-1">
                  <select value={selectedYear} onChange={(e) => { setSelectedYear(e.target.value); setVisibleCount(PAGE_SIZE); }}
                    aria-label="Filter by year" className={selectCls}>
                    {liveYears.map((y) => <option key={y} value={y} className="bg-neutral-900 text-white">{y}</option>)}
                  </select>
                  <select value={selectedMonth} onChange={(e) => { setSelectedMonth(Number(e.target.value)); setVisibleCount(PAGE_SIZE); }}
                    aria-label="Filter by month" className={selectCls}>
                    {months.map((m) => <option key={m.value} value={m.value} className="bg-neutral-900 text-white">{m.label}</option>)}
                  </select>
                  {hasActiveFilters && (
                    <button onClick={resetFilters}
                      className={`${t.glass} flex items-center gap-1.5 px-4 py-2.5 rounded-full ${t.ink50} text-sm ${t.hoverGlass} transition-colors`}>
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
              <button key={cat} onClick={() => { setActiveCategory(cat); setVisibleCount(PAGE_SIZE); }}
                aria-pressed={activeCategory === cat}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeCategory === cat ? t.btnPrimary : `${t.glass} ${t.ink50} ${t.hoverGlass}`}`}>
                {cat}
              </button>
            ))}
          </div>

          <p className={`text-xs ${t.ink40}`}>
            Showing <span className={t.ink}>{Math.min(visibleCount, filtered.length)}</span> of{" "}
            <span className={t.ink}>{filtered.length}</span> sermon{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "All" && <> · <span className={t.label}>{activeCategory}</span></>}
            {selectedYear !== "All Years" && <> · <span className={t.ink50}>{selectedYear}</span></>}
          </p>
        </section>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5">
            <div className="relative w-14 h-14">
              <div className={`absolute inset-0 rounded-full border-2 ${t.L ? "border-[#132744]/10" : "border-white/10"}`} />
              <div className={`absolute inset-0 rounded-full border-2 ${t.L ? "border-t-[#c8972a]" : "border-t-white"} animate-spin`} />
              <BookOpen className={`absolute inset-0 m-auto w-5 h-5 ${t.ink40}`} />
            </div>
            <p className={`text-xs ${t.ink40} tracking-widest uppercase`}>Loading sermons…</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-28 space-y-4">
            <div className={`${t.glass} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto`}>
              <BookOpen className={`w-7 h-7 ${t.ink30}`} />
            </div>
            <p style={SERIF} className={`text-2xl ${t.ink40}`}>No sermons found</p>
            <p className={`text-sm ${t.ink30}`}>Try adjusting your search or filters</p>
            <button onClick={resetFilters}
              className={`${t.glass} mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full ${t.ink} text-sm font-medium ${t.hoverGlass} transition-all`}>
              <X className="w-3.5 h-3.5" /> Reset filters
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((sermon, i) => <SermonCard key={sermon.id} sermon={sermon} index={i} />)}
            </div>
            <div ref={loadMoreRef} className="text-center pt-2">
              {hasMore ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className={`${t.glass} inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-medium ${t.ink70} ${t.hoverGlass} transition-all`}>
                  <ChevronDown className="w-4 h-4" />
                  Load {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more
                  <span className={`${t.ink30} text-xs ml-1`}>({filtered.length - visibleCount} remaining)</span>
                </motion.button>
              ) : filtered.length > PAGE_SIZE && (
                <p className={`text-[11px] ${t.ink30} tracking-widest uppercase`}>✦ All {filtered.length} sermons loaded ✦</p>
              )}
            </div>
          </>
        )}

        {/* Subscribe CTA */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className={`${t.glass} relative overflow-hidden rounded-3xl p-12 text-center`}>
          <div className="relative space-y-6">
            <div className={`${t.glass} w-14 h-14 rounded-full flex items-center justify-center mx-auto`}>
              <Play className={`w-6 h-6 ${t.ink70} ${t.L ? "fill-[#132744]/30" : "fill-white/30"}`} />
            </div>
            <div>
              <p style={SERIF} className={`text-4xl md:text-5xl ${t.ink} tracking-tight mb-3`}>
                Never miss a <em className={t.em}>sermon.</em>
              </p>
              <p className={`${t.ink50} max-w-md mx-auto text-sm leading-relaxed`}>
                Subscribe to be notified the moment a new message goes live. The Word is always on time.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://youtube.com/@pulpitfaptv" target="_blank" rel="noopener noreferrer"
                className={`${t.btnPrimary} inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full font-medium text-sm transition-colors`}>
                <Youtube className="w-4 h-4" /> Subscribe on YouTube
              </a>
              <a href="https://www.facebook.com/pcnfap" target="_blank" rel="noopener noreferrer"
                className={`${t.glass} inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full ${t.ink} font-medium text-sm ${t.hoverGlass} transition-all`}>
                <Facebook className="w-4 h-4" /> Follow on Facebook
              </a>
            </div>
          </div>
        </motion.section>
      </div>

      <SiteFooter />
    </div>
  );
}

/*
 * ════════════════════════════════════════════════════════════════
 * YOUTUBE AUTO-SYNC — SERVER-SIDE IMPLEMENTATION GUIDE (youtubeApi.ts)
 * ════════════════════════════════════════════════════════════════
 *  1. Get a YouTube Data API v3 key (Google Cloud Console). Store as env
 *     var YOUTUBE_API_KEY — never expose to the browser.
 *  2. Channel ID for @pulpitfaptv via View Source → "channelId".
 *  3. Backend route GET /api/sermons/videos: cache (NodeCache, 1h TTL),
 *     call https://www.googleapis.com/youtube/v3/search
 *       ?part=snippet&channelId=<ID>&type=video&order=date&maxResults=50&key=<KEY>
 *     map items → Sermon shape (same as above), merge with DB sermons.
 *  4. CSP at CDN/server: frame-src https://www.youtube.com; img-src https://i.ytimg.com
 *  5. Optional cron every 30 min to pre-warm the cache.
 * ════════════════════════════════════════════════════════════════
 */
