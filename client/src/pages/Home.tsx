/**
 * Home.tsx — PCN First Abuja Parish
 * Full light/dark theme support across all sections
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight, Users, Globe, BookOpen, Church,
  Menu, X, ChevronLeft, ChevronRight, Play,
  Heart, MapPin, Phone, Mail, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/api";
import QRCodeSection from "@/pages/QRCodeSection";

// ── SEC-02 — URL allowlist ────────────────────────────────────────
const ALLOWED_SOCIAL_DOMAINS = [
  "facebook.com", "x.com", "twitter.com",
  "youtube.com", "youtu.be", "instagram.com","tiktok.com",
];
const isAllowedExternalUrl = (url: string): boolean => {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_SOCIAL_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith(`.${d}`)
    );
  } catch { return false; }
};

// ── SEC-04 — Frozen social icon data ─────────────────────────────
const SOCIAL_LINKS = Object.freeze([
  { label: "Facebook",  href: "https://facebook.com/pcnfap",              isInstagram: false, isTikTok: false, path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { label: "X",         href: "https://x.com/firstabujapresbyterian",     isInstagram: false, isTikTok: false, path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.6l-5.165-6.75-5.913 6.75h-3.308l7.73-8.835L2.56 2.25h6.772l4.681 6.187 5.431-6.187zM17.7 20.005h1.813L6.283 3.993H4.366l13.334 16.012z" },
  { label: "YouTube",   href: "https://youtube.com/@pulpitfaptv",         isInstagram: false, isTikTok: false, path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  { label: "Instagram", href: "https://instagram.com/pcnfap",             isInstagram: true,  isTikTok: false, path: "" },
  { label: "TikTok",    href: "https://www.tiktok.com/@pcnfap",           isInstagram: false, isTikTok: true,  path: "" },
] as const);

// ── SEC-05 — Safe image URL validator ────────────────────────────
const ALLOWED_IMG_HOSTS = ["d2xsxph8kpxj0f.cloudfront.net"];
const isSafeImageUrl = (url: string): boolean => {
  if (url.startsWith("/")) return true;
  try {
    const { hostname } = new URL(url);
    return ALLOWED_IMG_HOSTS.includes(hostname);
  } catch { return false; }
};

// ── Hero slides ───────────────────────────────────────────────────
const FALLBACK_HERO_SLIDES = [
  {
    id: 1, label: "Welcome",
    title: "Welcome to The\nPresbyterian\nChurch of Nigeria",
    subtitle: "Transforming Lives, Changing Destinies",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663442941753/aGVKkYmkpS8dwgNiKtJuPS/hero-church-community-XpYfXsab73HbnPsjgMAM8h.webp",
    cta1: { label: "Learn More",  route: "/about"  as string, href: undefined as string | undefined },
    cta2: { label: "Watch Live",  route: undefined as string | undefined, href: "https://youtube.com/@pulpitfaptv" },
  },
  {
    id: 2, label: "Community",
    title: "Join Our\nGrowing\nFamily",
    subtitle: "Experience Faith, Fellowship, and Purpose",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663442941753/aGVKkYmkpS8dwgNiKtJuPS/hero-safeguarding-DaMHzJv7ufA7TMjb5jH9wR.webp",
    cta1: { label: "Visit Us",    route: "/contact" as string, href: undefined as string | undefined },
    cta2: { label: "Our Story",   route: "/about"   as string, href: undefined as string | undefined },
  },
  {
    id: 3, label: "Grace",
    title: "Grace\nUpon\nGrace",
    subtitle: "Happy Presbyterians! From glory to glory!",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663442941753/aGVKkYmkpS8dwgNiKtJuPS/ministry-background-VH63ZYgwAZ2uQP63B7gG3J.webp",
    cta1: { label: "Our Mission", route: "/about"      as string, href: undefined as string | undefined },
    cta2: { label: "Get Involved",route: "/ministries" as string, href: undefined as string | undefined },
  },
] as const;

// ── SEC-08 — Hardcoded contact constants ─────────────────────────
const CONTACT = Object.freeze({
  phone:     "+234 (0) 8151111877",
  phoneHref: "tel:+2348151111877",
  email:     "pulpitfap@gmail.com",
  emailHref: "mailto:pulpitfap@gmail.com",
  address:   "No. 5 Boke Close, off Sakono Street, Opposite AP Plaza, Wuse II, Abuja",
});

const NAV_ITEMS = [
  { label: "Home",        route: "/"           },
  { label: "About",       route: "/about"      },
  { label: "Leadership",  route: "/staff"      },
  { label: "Sermons",     route: "/sermons"    },
  { label: "Testimonies", route: "/testimonies"},
  { label: "Ministries",  route: "/ministries" },
  { label: "Events",      route: "/events"     },
  { label: "Contact",     route: "/contact"    },
] as const;

const FALLBACK_MINISTRIES = [
  { label: "Sermons & Archive",  desc: "Complete sermon library, weekly messages and spiritual resources",    icon: Globe,    accent: "#06b6d4", route: "/sermons"    },
  { label: "Events & Calendar",  desc: "Upcoming services, events and community gatherings",                  icon: Users,    accent: "#10b981", route: "/events"     },
  { label: "Giving & Donations", desc: "Support our ministry with secure, transparent online giving",         icon: Heart,    accent: "#f59e0b", route: "/donations"  },
  { label: "Prayer Requests",    desc: "Submit requests and join our interceding prayer community",           icon: BookOpen, accent: "#06b6d4", route: "/contact"    },
  { label: "Leadership",         desc: "Meet our pastoral team and ministry leaders",                         icon: Church,   accent: "#10b981", route: "/staff"      },
  { label: "Gallery",            desc: "Browse photos from services, events and community life",              icon: Play,     accent: "#f59e0b", route: "/gallery"    },
] as const;

// ═════════════════════════════════════════════════════════════════
// NAV
// ═════════════════════════════════════════════════════════════════
function Nav() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, navigate]                = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = useCallback((r: string) => { setMobileOpen(false); navigate(r); }, [navigate]);

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? isLight
            ? "bg-[#fffaf0]/88 backdrop-blur-xl border-b border-[#1a3a6b]/10 shadow-xl shadow-[#1a3a6b]/8"
            : "bg-[#050912]/96 backdrop-blur-xl border-b border-amber-500/15 shadow-2xl shadow-black/50"
          : isLight
            ? "bg-gradient-to-b from-[#fffaf0]/92 via-[#fffaf0]/50 to-transparent"
            : "bg-transparent"}`}>
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLight ? "via-[#c8972a]" : "via-amber-400"} to-transparent transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`} />

        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <button onClick={() => go("/")} className="flex items-center gap-3 group">
            <img src="/assets/pcn-logo.png" alt="PCN Logo" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
            <div className="hidden lg:flex flex-col leading-tight">
              <span style={{ fontFamily: "'Cormorant Garamond', serif" }} className={`font-black text-base tracking-wide ${isLight ? "text-[#132744]" : "text-white"}`}>PCN First Abuja</span>
              <span className={`text-[9px] uppercase tracking-[0.25em] ${isLight ? "text-[#c8972a]" : "text-amber-400/60"}`}>Parish</span>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map((n) => (
              <button key={n.route} onClick={() => go(n.route)}
                className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-colors rounded-lg ${
                  isLight
                    ? "text-[#1a3a6b]/65 hover:text-[#1a3a6b] hover:bg-[#1a3a6b]/6"
                    : "text-white/50 hover:text-white hover:bg-white/4"
                }`}>
                {n.label}
              </button>
            ))}
          </div>

          <div className="hidden md:block">
            <button onClick={() => go("/donations")}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#050912] text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35">
              Give Online
            </button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu"
            className={`md:hidden w-9 h-9 flex items-center justify-center rounded-lg ${
              isLight
                ? "bg-white/80 border border-[#1a3a6b]/10 text-[#132744] shadow-lg shadow-[#1a3a6b]/8"
                : "bg-white/5 border border-white/8 text-white"
            }`}>
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className={`fixed inset-0 z-40 backdrop-blur-sm md:hidden ${isLight ? "bg-[#132744]/18" : "bg-black/70"}`} />
            <motion.div
              initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
              className={`fixed inset-y-0 right-0 z-50 w-72 backdrop-blur-2xl flex flex-col pt-20 pb-8 px-6 ${
                isLight
                  ? "bg-[#fffaf0]/96 border-l border-[#1a3a6b]/10"
                  : "bg-[#050912]/99 border-l border-white/6"
              }`}>
              <button onClick={() => setMobileOpen(false)} aria-label="Close"
                className={`absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-lg ${
                  isLight
                    ? "bg-white/85 border border-[#1a3a6b]/10 text-[#132744]"
                    : "bg-white/5 border border-white/8 text-white"
                }`}>
                <X className="w-4 h-4" />
              </button>
              <div className="flex flex-col gap-1 flex-1">
                {NAV_ITEMS.map((n, i) => (
                  <motion.button key={n.route}
                    initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => go(n.route)}
                    className={`text-left px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                      isLight
                        ? "text-[#1a3a6b]/65 hover:text-[#1a3a6b] hover:bg-[#1a3a6b]/6"
                        : "text-white/50 hover:text-white hover:bg-white/4"
                    }`}>
                    {n.label}
                  </motion.button>
                ))}
              </div>
              <button onClick={() => go("/donations")}
                className="w-full py-3 rounded-xl bg-amber-500 text-[#050912] text-sm font-black uppercase tracking-widest">
                Give Online
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════
// HERO CAROUSEL
// ═════════════════════════════════════════════════════════════════
function HeroCarousel() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [current, setCurrent] = useState(0);
  const [, navigate]          = useLocation();
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null);
  const [heroSlides, setHeroSlides] = useState(FALLBACK_HERO_SLIDES as readonly {
    id: number;
    label: string;
    title: string;
    subtitle: string;
    image: string;
    cta1: { label: string; route?: string; href?: string };
    cta2: { label: string; route?: string; href?: string };
  }[]);

  useEffect(() => {
    api.getSiteContent("home")
      .then((data) => {
        if (Array.isArray(data?.heroSlides) && data.heroSlides.length > 0) {
          setHeroSlides(data.heroSlides);
        }
      })
      .catch(() => {});
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() =>
      setCurrent((p) => (p + 1) % heroSlides.length), 6000);
  }, [heroSlides.length]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const go = (dir: 1 | -1) => {
    setCurrent((p) => (p + dir + heroSlides.length) % heroSlides.length);
    startTimer();
  };

  const slide = heroSlides[current];

  return (
    <section className="relative h-screen min-h-[700px] flex items-end overflow-hidden">
      {heroSlides.map((s, i) => (
        <div key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}>
          {isSafeImageUrl(s.image) && (
            <motion.img src={s.image} alt={s.label} className="w-full h-full object-cover"
              animate={{ scale: i === current ? 1.07 : 1 }}
              transition={{ duration: 8, ease: "linear" }} />
          )}
          <div className={`absolute inset-0 ${isLight
            ? "bg-gradient-to-t from-[#fffaf0] via-[#fffaf0]/52 to-[#fffaf0]/10"
            : "bg-gradient-to-t from-[#050912] via-[#050912]/55 to-[#050912]/10"}`} />
          <div className={`absolute inset-0 ${isLight
            ? "bg-gradient-to-r from-[#fffaf0]/82 via-[#fffaf0]/22 to-transparent"
            : "bg-gradient-to-r from-[#050912]/65 via-transparent to-transparent"}`} />
          {isLight && <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,151,42,0.18),transparent_28%)]" />}
        </div>
      ))}

      <div className="absolute top-28 right-8 z-20 hidden lg:flex flex-col items-end gap-3">
        {heroSlides.map((s, i) => (
          <button key={s.id} onClick={() => { setCurrent(i); startTimer(); }}
            className={`text-right transition-all duration-300 ${i === current ? "opacity-100" : "opacity-25 hover:opacity-50"}`}>
            <span className={`block text-[9px] font-black uppercase tracking-[0.25em] ${i === current ? "text-amber-500" : isLight ? "text-[#1a3a6b]" : "text-white"}`}>
              {s.label}
            </span>
            <div className={`h-px mt-1.5 transition-all duration-500 ml-auto ${i === current ? "bg-amber-500 w-10" : isLight ? "bg-[#1a3a6b]/25 w-4" : "bg-white/30 w-4"}`} />
          </button>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 w-full">
        <AnimatePresence mode="wait">
          <motion.div key={current}
            initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
            className="max-w-3xl space-y-6">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/25 bg-amber-400/8">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-500 text-[9px] font-black uppercase tracking-[0.3em]">First Abuja Parish</span>
            </div>

            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className={`text-6xl md:text-8xl font-black leading-[0.87] tracking-tight whitespace-pre-line ${isLight ? "text-[#132744] drop-shadow-[0_10px_32px_rgba(255,250,240,0.4)]" : "text-white"}`}>
              {slide.title}
            </h1>

            <p className={`text-lg max-w-lg leading-relaxed ${isLight ? "text-[#1a3a6b]/72" : "text-white/45"}`}>{slide.subtitle}</p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={() => navigate(slide.cta1.route!)}
                className="group flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-[#050912] text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-500/45">
                {slide.cta1.label}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {slide.cta2.href ? (
                isAllowedExternalUrl(slide.cta2.href) ? (
                  <a href={slide.cta2.href} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all backdrop-blur-sm ${
                      isLight
                        ? "bg-white/78 hover:bg-white/92 border border-[#1a3a6b]/10 text-[#132744] shadow-lg shadow-[#1a3a6b]/8"
                        : "bg-white/8 hover:bg-white/15 border border-white/15 text-white"
                    }`}>
                    <Play className={`w-4 h-4 ${isLight ? "fill-[#1a3a6b]/70" : "fill-white/70"}`} /> {slide.cta2.label}
                  </a>
                ) : null
              ) : (
                <button onClick={() => navigate(slide.cta2.route!)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                    isLight
                      ? "bg-white/78 hover:bg-white/92 border border-[#1a3a6b]/10 text-[#132744] shadow-lg shadow-[#1a3a6b]/8"
                      : "bg-white/8 hover:bg-white/15 border border-white/15 text-white"
                  }`}>
                  {slide.cta2.label}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 mt-10">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => { setCurrent(i); startTimer(); }}
              className={`h-0.5 rounded-full transition-all duration-400 ${i === current ? "bg-amber-500 w-10" : isLight ? "bg-[#1a3a6b]/20 w-3 hover:bg-[#1a3a6b]/40" : "bg-white/20 w-3 hover:bg-white/40"}`} />
          ))}
        </div>
      </div>

      <button onClick={() => go(-1)} aria-label="Previous"
        className={`absolute left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full transition-all backdrop-blur-sm ${
          isLight
            ? "bg-white/82 hover:bg-white border border-[#1a3a6b]/10 text-[#132744] shadow-lg shadow-[#1a3a6b]/10"
            : "bg-white/6 hover:bg-white/12 border border-white/8 text-white"
        }`}>
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => go(1)} aria-label="Next"
        className={`absolute right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full transition-all backdrop-blur-sm ${
          isLight
            ? "bg-white/82 hover:bg-white border border-[#1a3a6b]/10 text-[#132744] shadow-lg shadow-[#1a3a6b]/10"
            : "bg-white/6 hover:bg-white/12 border border-white/8 text-white"
        }`}>
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-30 select-none">
        <div className={`w-px h-9 bg-gradient-to-b from-transparent ${isLight ? "to-[#1a3a6b]" : "to-white"} animate-pulse`} />
        <span className={`text-[8px] uppercase tracking-[0.35em] ${isLight ? "text-[#1a3a6b]" : "text-white"}`}>Scroll</span>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════
// SERVICE TIMES
// ═════════════════════════════════════════════════════════════════
function ServiceTimes() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const SERVICES = [
    { day: "Sunday",    name: "Worship Service", time: "7:00 AM & 9:30 AM", note: "Main Sanctuary — Wuse II",                                                                       accent: "#f59e0b", featured: false },
    { day: "Tuesday",   name: "Bible Study",     time: "6:00 PM",           note: "Various district meeting points. Contact your district elder for the nearest venue.",            accent: "#f59e0b", featured: true  },
    { day: "Wednesday", name: "Midweek Service", time: "6:00 PM",           note: "Main Sanctuary — Wuse II",                                                                       accent: "#06b6d4", featured: false },
  ];

  return (
    <section className="py-28 relative overflow-hidden"
      style={{
        background: isLight
          ? "linear-gradient(135deg,#f8f7f4 0%,#ffffff 60%,#f3efe6 100%)"
          : "linear-gradient(135deg,#0a1628 0%,#050912 60%,#0a0f18 100%)"
      }}>
      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 80px,rgba(0,0,0,.5) 80px,rgba(0,0,0,.5) 81px),repeating-linear-gradient(90deg,transparent,transparent 80px,rgba(0,0,0,.5) 80px,rgba(0,0,0,.5) 81px)" }} />

      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-20 space-y-3">
          <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${isLight ? "text-amber-600/70" : "text-amber-400/60"}`}>Join Us</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className={`text-6xl font-black ${isLight ? "text-[#132744]" : "text-white"}`}>Service Times</h2>
          <div className="w-14 h-px bg-amber-500/40 mx-auto" />
        </motion.div>

        <div className="relative space-y-6 md:space-y-0">
          <div className={`absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px hidden md:block ${isLight ? "bg-[#1a3a6b]/10" : "bg-white/5"}`} />

          {SERVICES.map((s, i) => (
            <motion.div key={s.day}
              initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.1 }}
              className={`relative flex md:items-center gap-8 pb-10 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>

              <div className="flex-1">
                <div className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                  s.featured
                    ? isLight
                      ? "border-amber-500/30 bg-amber-500/6 shadow-xl shadow-amber-500/10"
                      : "border-amber-500/25 bg-amber-500/4 shadow-2xl shadow-amber-500/8"
                    : isLight
                      ? "border-[#1a3a6b]/10 bg-white/70 hover:border-[#1a3a6b]/20 hover:bg-white/90 shadow-lg shadow-[#1a3a6b]/5"
                      : "border-white/6 bg-white/2 hover:border-white/12 hover:bg-white/4"
                }`}>
                  {s.featured && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-amber-500 text-[#050912] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Weekly</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
                    style={{ background: `linear-gradient(90deg,transparent,${s.accent}45,transparent)` }} />

                  <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: s.accent }}>{s.day}</p>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    className={`text-3xl font-black mb-3 ${isLight ? "text-[#132744]" : "text-white"}`}>{s.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className={`w-3.5 h-3.5 ${isLight ? "text-[#1a3a6b]/30" : "text-white/25"}`} />
                    <p className={`text-lg font-semibold ${isLight ? "text-[#1a3a6b]/80" : "text-white/70"}`}>{s.time}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isLight ? "text-[#1a3a6b]/20" : "text-white/20"}`} />
                    <p className={`text-sm leading-relaxed ${isLight ? "text-[#1a3a6b]/50" : "text-white/35"}`}>{s.note}</p>
                  </div>
                </div>
              </div>

              <div className={`hidden md:flex w-5 h-5 rounded-full border-2 border-amber-500/35 shrink-0 items-center justify-center z-10 ${isLight ? "bg-[#f8f7f4]" : "bg-[#050912]"}`}>
                <div className="w-2 h-2 rounded-full bg-amber-500" />
              </div>

              <div className="flex-1 hidden md:block" />
            </motion.div>
          ))}
        </div>

        <p className={`text-center text-sm mt-6 ${isLight ? "text-[#1a3a6b]/35" : "text-white/20"}`}>
          All are welcome. Come as you are and experience the love of God.
        </p>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════
// PASTOR'S WELCOME
// ═════════════════════════════════════════════════════════════════
function PastorWelcome() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <section className={`py-28 relative overflow-hidden ${isLight ? "bg-[#f0ede8]" : "bg-[#050912]"}`}>
      <div className={`absolute top-0 right-0 w-[700px] h-[500px] rounded-full blur-[140px] ${isLight ? "bg-amber-500/8" : "bg-amber-500/3"}`} />
      <div className="absolute left-4 top-10 select-none pointer-events-none"
        style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(100px,18vw,220px)", lineHeight: 1, color: isLight ? "rgba(200,151,42,0.07)" : "rgba(245,158,11,0.05)", fontWeight: 900 }}>
        "
      </div>

      <div className="max-w-4xl mx-auto px-6 relative">
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.75 }}>

          <div className="text-center mb-12 space-y-3">
            <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${isLight ? "text-amber-600/60" : "text-amber-400/50"}`}>A Message from the Pulpit</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className={`text-5xl md:text-6xl font-black ${isLight ? "text-[#132744]" : "text-white"}`}>
              Dearly Beloved, <span className="text-amber-500">Welcome</span>
            </h2>
            <div className="w-12 h-px bg-amber-500/35 mx-auto" />
          </div>

          <div className={`space-y-6 text-lg leading-relaxed text-center max-w-3xl mx-auto ${isLight ? "text-[#1a3a6b]/60" : "text-white/45"}`}>
            <p>
              Thank you for visiting us. We appreciate God for your life and the great decision you have
              taken to be with us today. Our earnest prayer is that you will be greatly uplifted and the
              blessings of your fellowship with us shall abide in the precious name of our Lord and Saviour
              Jesus Christ.
            </p>
            <p>
              We are a <strong className={`font-semibold ${isLight ? "text-[#132744]" : "text-white"}`}>Bible-centered, Holy Spirit led Reformed Church</strong>.
              Our mission is to raise worshippers who are passionate for God, winning in life, and positively
              changing lives through kingdom service to the glory of God.
            </p>
            <p>
              Our core values are{" "}
              <span className="text-amber-500 font-semibold">Righteousness</span>,{" "}
              <span className="text-cyan-500 font-semibold">Love</span> and{" "}
              <span className="text-emerald-500 font-semibold">Excellence</span>.
            </p>
          </div>

          <div className="flex items-center gap-5 my-14 max-w-xs mx-auto">
            <div className={`flex-1 h-px ${isLight ? "bg-[#1a3a6b]/10" : "bg-white/6"}`} />
            <div className="w-2 h-2 rotate-45 bg-amber-500/40" />
            <div className={`flex-1 h-px ${isLight ? "bg-[#1a3a6b]/10" : "bg-white/6"}`} />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/12 shrink-0"
              style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif" }} className="text-[#050912] text-xl font-black">MNI</span>
            </div>
            <div className="text-center sm:text-left">
              <p className={`text-[9px] italic mb-1 uppercase tracking-widest ${isLight ? "text-[#1a3a6b]/30" : "text-white/20"}`}>Yours in Christ's Service</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif" }} className={`text-2xl font-black ${isLight ? "text-[#132744]" : "text-white"}`}>Most Rev. Mba Nwankwo Idika</p>
              <p className={`text-sm font-medium ${isLight ? "text-amber-600/80" : "text-amber-400/70"}`}>Minister In-Charge, PCN First Abuja Parish</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 mt-10">
            {[
              { label: "Bible-Centered",  cls: isLight ? "border-amber-500/20 text-amber-700/70  bg-amber-500/6"  : "border-amber-500/15 text-amber-400/70  bg-amber-500/4"  },
              { label: "Holy Spirit Led", cls: isLight ? "border-cyan-500/20  text-cyan-700/70   bg-cyan-500/6"   : "border-cyan-500/15  text-cyan-400/70   bg-cyan-500/4"   },
              { label: "Reformed Church", cls: isLight ? "border-emerald-500/20 text-emerald-700/70 bg-emerald-500/6" : "border-emerald-500/15 text-emerald-400/70 bg-emerald-500/4" },
              { label: "Righteousness",  cls: isLight ? "border-amber-500/20 text-amber-700/70  bg-amber-500/6"  : "border-amber-500/15 text-amber-400/70  bg-amber-500/4"  },
              { label: "Love",           cls: isLight ? "border-rose-500/20  text-rose-700/70   bg-rose-500/6"   : "border-rose-500/15  text-rose-400/70   bg-rose-500/4"   },
              { label: "Excellence",     cls: isLight ? "border-violet-500/20 text-violet-700/70 bg-violet-500/6" : "border-violet-500/15 text-violet-400/70 bg-violet-500/4" },
            ].map((p) => (
              <span key={p.label} className={`text-[10px] font-bold px-4 py-1.5 rounded-full border ${p.cls}`}>{p.label}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════
// MINISTRY GRID
// ═════════════════════════════════════════════════════════════════
function MinistryGrid() {
  const [, navigate] = useLocation();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [ministries, setMinistries] = useState(FALLBACK_MINISTRIES as readonly {
    label: string;
    desc: string;
    icon: typeof Globe;
    accent: string;
    route: string;
  }[]);

  const homeIconMap = { Globe, Users, Heart, BookOpen, Church, Play } as const;

  useEffect(() => {
    api.getSiteContent("home")
      .then((data) => {
        if (Array.isArray(data?.digitalMinistries) && data.digitalMinistries.length > 0) {
          setMinistries(
            data.digitalMinistries.map((item: { label: string; desc: string; icon: keyof typeof homeIconMap; accent: string; route: string }) => ({
              ...item,
              icon: homeIconMap[item.icon] ?? Globe,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className={`py-28 relative overflow-hidden ${isLight ? "bg-white" : "bg-[#060d1a]"}`}>
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center space-y-3 max-w-2xl mx-auto">
          <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${isLight ? "text-amber-600/60" : "text-amber-400/50"}`}>Explore</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className={`text-5xl md:text-6xl font-black ${isLight ? "text-[#132744]" : "text-white"}`}>Our Digital Ministry</h2>
          <p className={`leading-relaxed ${isLight ? "text-[#1a3a6b]/45" : "text-white/30"}`}>Serving our congregation with excellence through governed digital channels</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ministries.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.button key={m.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                onClick={() => navigate(m.route)}
                className={`group text-left p-8 rounded-2xl border transition-all duration-400 relative overflow-hidden ${
                  isLight
                    ? "border-[#1a3a6b]/8 bg-[#f8f7f4] hover:bg-white hover:border-[#1a3a6b]/15 shadow-sm hover:shadow-lg hover:shadow-[#1a3a6b]/6"
                    : "border-white/5 bg-white/2 hover:bg-white/4 hover:border-white/10"
                }`}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at 20% 20%,${m.accent}07 0%,transparent 70%)` }} />
                <div className="relative space-y-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ background: `${m.accent}18`, border: `1px solid ${m.accent}18` }}>
                    <Icon className="w-5 h-5" style={{ color: m.accent }} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond',serif" }}
                      className={`text-2xl font-black mb-1.5 ${isLight ? "text-[#132744]" : "text-white"}`}>{m.label}</h3>
                    <p className={`text-sm leading-relaxed ${isLight ? "text-[#1a3a6b]/45" : "text-white/30"}`}>{m.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest" style={{ color: m.accent }}>
                    Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <QRCodeSection />
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════
// CTA BANNER
// ═════════════════════════════════════════════════════════════════
function CTABanner() {
  const [, navigate] = useLocation();
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <section className={`py-20 px-6 ${isLight ? "bg-[#f8f7f4]" : "bg-[#050912]"}`}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`relative rounded-3xl overflow-hidden p-12 md:p-16 text-center border ${
            isLight ? "border-[#1a3a6b]/10 shadow-xl shadow-[#1a3a6b]/6" : "border-white/5"
          }`}
          style={{
            background: isLight
              ? "linear-gradient(135deg,#ffffff 0%,#f8f7f4 60%,#f0ede8 100%)"
              : "linear-gradient(135deg,#0d1b3e 0%,#050912 60%,#0a1010 100%)"
          }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-px bg-gradient-to-r from-transparent via-amber-500/35 to-transparent" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg,rgba(0,0,0,.4) 0,rgba(0,0,0,.4) 1px,transparent 0,transparent 50%)", backgroundSize: "18px 18px" }} />
          <div className="relative space-y-6">
            <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${isLight ? "text-amber-600/60" : "text-amber-400/50"}`}>You're Invited</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className={`text-5xl md:text-6xl font-black ${isLight ? "text-[#132744]" : "text-white"}`}>Join Our Growing Community</h2>
            <p className={`max-w-xl mx-auto leading-relaxed ${isLight ? "text-[#1a3a6b]/50" : "text-white/35"}`}>
              Whether you're in Abuja or across the globe, connect with PCN First Abuja Parish and be
              part of our mission to spread the gospel with excellence and integrity.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button onClick={() => navigate("/events")}
                className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#050912] font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20">
                Visit Us This Sunday <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => navigate("/contact")}
                className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm transition-all ${
                  isLight
                    ? "border border-[#1a3a6b]/15 hover:border-[#1a3a6b]/30 hover:bg-[#1a3a6b]/4 text-[#1a3a6b]/60 hover:text-[#1a3a6b]"
                    : "border border-white/10 hover:border-white/20 hover:bg-white/4 text-white/60 hover:text-white"
                }`}>
                Contact Us
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════
// FOOTER
// ═════════════════════════════════════════════════════════════════
function Footer() {
  const [, navigate] = useLocation();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const cols = [
    { heading: "New Here?",  color: "#06b6d4", links: [{ label: "Service Times", r: "/" }, { label: "Vision & Beliefs", r: "/about" }, { label: "Leadership", r: "/staff" }, { label: "Testimonies", r: "/testimonies" }] },
    { heading: "Ministries", color: "#10b981", links: [{ label: "Children's Dept", r: "/ministries" }, { label: "Teenage Ministry", r: "/ministries" }, { label: "Evangelism", r: "/ministries" }, { label: "Family Life", r: "/ministries" }, { label: "Prayer", r: "/ministries" }] },
  ];

  return (
    <footer className={`border-t ${isLight ? "border-[#1a3a6b]/10 bg-[#f0ede8]" : "border-white/5 bg-[#030508]"}`}>
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-12 gap-12">

          {/* Brand */}
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <img src="/assets/pcn-logo.png" alt="PCN Logo" className="w-10 h-10 object-contain" />
              <div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif" }} className={`font-black text-lg ${isLight ? "text-[#132744]" : "text-white"}`}>PCN First Abuja Parish</p>
                <p className={`text-[9px] uppercase tracking-widest ${isLight ? "text-[#1a3a6b]/35" : "text-white/25"}`}>Presbyterian Church of Nigeria</p>
              </div>
            </div>
            <p className={`text-sm leading-relaxed ${isLight ? "text-[#1a3a6b]/45" : "text-white/25"}`}>Spreading the gospel with excellence and integrity across Abuja and beyond.</p>

            <div className="flex gap-2">
              {SOCIAL_LINKS.map((s) =>
                isAllowedExternalUrl(s.href) ? (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    title={s.label} aria-label={s.label}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all group ${
                      isLight
                        ? "bg-white/70 border border-[#1a3a6b]/10 hover:bg-amber-500/10 hover:border-amber-500/25"
                        : "bg-white/3 border border-white/6 hover:bg-amber-500/8 hover:border-amber-500/20"
                    }`}>
                    {s.isInstagram ? (
                        <svg className={`w-3.5 h-3.5 transition group-hover:text-amber-500 ${isLight ? "text-[#1a3a6b]/35" : "text-white/25"}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <rect x="2.17" y="2.17" width="19.66" height="19.66" rx="4.58" />
                          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
                          <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
                        </svg>
                      ) : s.isTikTok ? (
                        <svg className={`w-3.5 h-3.5 transition group-hover:text-amber-500 ${isLight ? "text-[#1a3a6b]/35" : "text-white/25"}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.41a8.16 8.16 0 0 0 4.78 1.52V7.49a4.85 4.85 0 0 1-1.01-.8z"/>
                        </svg>
                      ) : (
                        <svg className={`w-3.5 h-3.5 transition group-hover:text-amber-500 ${isLight ? "text-[#1a3a6b]/35" : "text-white/25"}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d={s.path} />
                        </svg>
                      )}
                  </a>
                ) : null
              )}
            </div>
          </div>

          {/* Link columns */}
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {cols.map((col) => (
              <div key={col.heading} className="space-y-4">
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: col.color }}>{col.heading}</h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <button onClick={() => navigate(l.r)} className={`text-sm transition-colors text-left ${isLight ? "text-[#1a3a6b]/35 hover:text-[#1a3a6b]/70" : "text-white/25 hover:text-white/60"}`}>{l.label}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact */}
            <div className="space-y-4">
              <h4 className={`text-[9px] font-black uppercase tracking-[0.3em] ${isLight ? "text-amber-600/60" : "text-amber-400/50"}`}>Contact</h4>
              <ul className="space-y-4">
                <li><a href={CONTACT.phoneHref} className={`flex items-start gap-2 text-sm transition-colors ${isLight ? "text-[#1a3a6b]/35 hover:text-[#1a3a6b]/70" : "text-white/25 hover:text-white/55"}`}><Phone className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isLight ? "text-[#1a3a6b]/20" : "text-white/15"}`} />{CONTACT.phone}</a></li>
                <li><a href={CONTACT.emailHref} className={`flex items-start gap-2 text-sm transition-colors ${isLight ? "text-[#1a3a6b]/35 hover:text-[#1a3a6b]/70" : "text-white/25 hover:text-white/55"}`}><Mail className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isLight ? "text-[#1a3a6b]/20" : "text-white/15"}`} />{CONTACT.email}</a></li>
                <li><div className={`flex items-start gap-2 text-sm ${isLight ? "text-[#1a3a6b]/30" : "text-white/20"}`}><MapPin className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isLight ? "text-[#1a3a6b]/15" : "text-white/12"}`} />{CONTACT.address}</div></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={`border-t ${isLight ? "border-[#1a3a6b]/8" : "border-white/4"}`}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className={`text-[10px] ${isLight ? "text-[#1a3a6b]/25" : "text-white/15"}`}>© 2026 Presbyterian Church of Nigeria, First Abuja Parish. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Service", "Safeguarding"].map((t) => (
              <a key={t} href="#" className={`text-[10px] transition-colors ${isLight ? "text-[#1a3a6b]/25 hover:text-[#1a3a6b]/50" : "text-white/15 hover:text-white/40"}`}>{t}</a>
            ))}
            <button onClick={() => navigate("/contact")} className={`text-[10px] transition-colors ${isLight ? "text-[#1a3a6b]/25 hover:text-[#1a3a6b]/50" : "text-white/15 hover:text-white/40"}`}>Contact</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ═════════════════════════════════════════════════════════════════
// PAGE ROOT
// ═════════════════════════════════════════════════════════════════
export default function Home() {
  const { theme } = useTheme();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      `}</style>
      <div
        className={`home-theme min-h-screen ${theme === "dark" ? "home-theme--dark bg-[#050912] text-white" : "home-theme--light bg-background text-foreground"}`}
        style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}
      >
        <Nav />
        <HeroCarousel />
        <ServiceTimes />
        <PastorWelcome />
        <MinistryGrid />
        <CTABanner />
        <Footer />
      </div>
    </>
  );
}
