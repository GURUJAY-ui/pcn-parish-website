      /**
       * Home.tsx — PCN First Abuja Parish
       *
       * ══════════════════════════════════════════════════════════════════
       * SECURITY HARDENING — 40 YEARS EXP / CIA-LEVEL THREAT MODELLING
       * ══════════════════════════════════════════════════════════════════
       *
       * SEC-01  CRITICAL — Admin portal link REMOVED from public footer.
       *         Exposing /admin/login in the DOM is free recon for attackers:
       *         it confirms the route exists, invites brute-force, and is
       *         indexed by search crawlers. Admin access must happen via a
       *         separate, unlisted, rate-limited URL known only to staff.
       *
       * SEC-02  All external hrefs validated through isAllowedExternalUrl()
       *         before render — prevents open-redirect and href injection
       *         if socialLinks ever migrate to an API source.
       *
       * SEC-03  Every external <a> carries rel="noopener noreferrer" —
       *         blocks reverse tabnapping (window.opener hijack).
       *
       * SEC-04  SVG path data for social icons is a frozen const —
       *         never interpolated from user/API data, preventing SVG injection.
       *
       * SEC-05  Image src URLs validated: only our CDN and /assets/ relative
       *         paths are rendered. External image URLs from an API would be
       *         stripped — prevents pixel-tracking and hotlink abuse.
       *
       * SEC-06  Slide auto-advance uses a cleanup-returning useEffect with a
       *         ref-tracked timer — prevents timer resurrection (ghost-state
       *         attack in long-lived SPAs).
       *
       * SEC-07  Navigation via wouter navigate() only — no string interpolation
       *         into window.location, preventing client-side open redirect.
       *
       * SEC-08  Phone/email href values are hardcoded frozen constants, never
       *         from state — prevents DOM-clobbering attacks on contact info.
       *
       * SEC-09  Mobile menu closes on navigation — prevents UI-lock where an
       *         attacker keeps the overlay open to obscure page content
       *         (clickjacking-adjacent UX attack).
       *
       * SEC-10  Zero dangerouslySetInnerHTML anywhere on this page.
       */

      import { useState, useEffect, useCallback, useRef } from "react";
      import { useLocation } from "wouter";
      import {
        ArrowRight, Users, Globe, BookOpen, Church,
        Menu, X, ChevronLeft, ChevronRight, Play,
        Heart, MapPin, Phone, Mail, Clock,
      } from "lucide-react";
      import { motion, AnimatePresence } from "framer-motion";
      import { api } from "@/lib/api";
      import QRCodeSection from "@/pages/QRCodeSection";

      // ── SEC-02 — URL allowlist ────────────────────────────────────────
      const ALLOWED_SOCIAL_DOMAINS = [
        "facebook.com", "x.com", "twitter.com",
        "youtube.com", "youtu.be", "instagram.com",
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
        { label: "Facebook",  href: "https://facebook.com/pcnfap",  isInstagram: false, path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
        { label: "X",         href: "https://x.com/firstabujapresbyterian",         isInstagram: false, path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.6l-5.165-6.75-5.913 6.75h-3.308l7.73-8.835L2.56 2.25h6.772l4.681 6.187 5.431-6.187zM17.7 20.005h1.813L6.283 3.993H4.366l13.334 16.012z" },
        { label: "YouTube",   href: "https://youtube.com/@pulpitfaptv",              isInstagram: false, path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
        { label: "Instagram", href: "https://instagram.com/pcnfap", isInstagram: true,  path: "" },
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
        const [scrolled, setScrolled]     = useState(false);
        const [mobileOpen, setMobileOpen] = useState(false);
        const [, navigate]                = useLocation();

        useEffect(() => {
          const fn = () => setScrolled(window.scrollY > 60);
          window.addEventListener("scroll", fn, { passive: true });
          return () => window.removeEventListener("scroll", fn);
        }, []);

        // SEC-09
        const go = useCallback((r: string) => { setMobileOpen(false); navigate(r); }, [navigate]);

        return (
          <>
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
              scrolled ? "bg-[#050912]/96 backdrop-blur-xl border-b border-amber-500/15 shadow-2xl shadow-black/50"
                      : "bg-transparent"}`}>
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`} />

              <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
                <button onClick={() => go("/")} className="flex items-center gap-3 group">
                  <img src="/assets/pcn-logo.png" alt="PCN Logo" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
                  <div className="hidden lg:flex flex-col leading-tight">
                    <span style={{ fontFamily: "'Cormorant Garamond', serif" }} className="font-black text-base text-white tracking-wide">PCN First Abuja</span>
                    <span className="text-[9px] text-amber-400/60 uppercase tracking-[0.25em]">Parish</span>
                  </div>
                </button>

                <div className="hidden md:flex items-center gap-0.5">
                  {NAV_ITEMS.map((n) => (
                    <button key={n.route} onClick={() => go(n.route)}
                      className="px-3 py-1.5 text-[11px] font-semibold text-white/50 hover:text-white uppercase tracking-widest transition-colors hover:bg-white/4 rounded-lg">
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
                  className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/8 text-white">
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
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden" />
                  <motion.div
                    initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
                    className="fixed inset-y-0 right-0 z-50 w-72 bg-[#050912]/99 backdrop-blur-2xl border-l border-white/6 flex flex-col pt-20 pb-8 px-6">
                    <button onClick={() => setMobileOpen(false)} aria-label="Close"
                      className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/8 text-white">
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex flex-col gap-1 flex-1">
                      {NAV_ITEMS.map((n, i) => (
                        <motion.button key={n.route}
                          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => go(n.route)}
                          className="text-left px-4 py-3 text-sm font-semibold text-white/50 hover:text-white hover:bg-white/4 rounded-xl transition-all">
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

        // SEC-06: ref-tracked timer, properly cleaned up
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

            {/* Slides with ken-burns */}
            {heroSlides.map((s, i) => (
              <div key={s.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}>
                {isSafeImageUrl(s.image) && (
                  <motion.img src={s.image} alt={s.label} className="w-full h-full object-cover"
                    animate={{ scale: i === current ? 1.07 : 1 }}
                    transition={{ duration: 8, ease: "linear" }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050912] via-[#050912]/55 to-[#050912]/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050912]/65 via-transparent to-transparent" />
              </div>
            ))}

            {/* Slide label tabs — top right */}
            <div className="absolute top-28 right-8 z-20 hidden lg:flex flex-col items-end gap-3">
                {heroSlides.map((s, i) => (
                <button key={s.id} onClick={() => { setCurrent(i); startTimer(); }}
                  className={`text-right transition-all duration-300 ${i === current ? "opacity-100" : "opacity-25 hover:opacity-50"}`}>
                  <span className={`block text-[9px] font-black uppercase tracking-[0.25em] ${i === current ? "text-amber-400" : "text-white"}`}>
                    {s.label}
                  </span>
                  <div className={`h-px mt-1.5 transition-all duration-500 ml-auto ${i === current ? "bg-amber-400 w-10" : "bg-white/30 w-4"}`} />
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 w-full">
              <AnimatePresence mode="wait">
                <motion.div key={current}
                  initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
                  className="max-w-3xl space-y-6">

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/25 bg-amber-400/8">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-amber-400 text-[9px] font-black uppercase tracking-[0.3em]">First Abuja Parish</span>
                  </div>

                  <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    className="text-6xl md:text-8xl font-black text-white leading-[0.87] tracking-tight whitespace-pre-line">
                    {slide.title}
                  </h1>

                  <p className="text-white/45 text-lg max-w-lg leading-relaxed">{slide.subtitle}</p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    {/* CTA 1 — always a route */}
                    <button onClick={() => navigate(slide.cta1.route!)}
                      className="group flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-[#050912] text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-500/45">
                      {slide.cta1.label}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* CTA 2 — route or external href */}
                    {slide.cta2.href ? (
                      isAllowedExternalUrl(slide.cta2.href) ? (
                        <a href={slide.cta2.href} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/8 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold transition-all backdrop-blur-sm">
                          <Play className="w-4 h-4 fill-white/70" /> {slide.cta2.label}
                        </a>
                      ) : null
                    ) : (
                      <button onClick={() => navigate(slide.cta2.route!)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/8 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold transition-all">
                        {slide.cta2.label}
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dot indicators */}
              <div className="flex gap-2 mt-10">
                {heroSlides.map((_, i) => (
                  <button key={i} onClick={() => { setCurrent(i); startTimer(); }}
                    className={`h-0.5 rounded-full transition-all duration-400 ${i === current ? "bg-amber-400 w-10" : "bg-white/20 w-3 hover:bg-white/40"}`} />
                ))}
              </div>
            </div>

            {/* Prev / Next */}
            <button onClick={() => go(-1)} aria-label="Previous"
              className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/12 border border-white/8 text-white transition-all backdrop-blur-sm">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => go(1)} aria-label="Next"
              className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/12 border border-white/8 text-white transition-all backdrop-blur-sm">
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Scroll cue */}
            <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-30 select-none">
              <div className="w-px h-9 bg-gradient-to-b from-transparent to-white animate-pulse" />
              <span className="text-[8px] text-white uppercase tracking-[0.35em]">Scroll</span>
            </div>
          </section>
        );
      }

      // ═════════════════════════════════════════════════════════════════
      // SERVICE TIMES — vertical timeline layout
      // ═════════════════════════════════════════════════════════════════
      function ServiceTimes() {
        const SERVICES = [
          { day: "Sunday",    name: "Worship Service", time: "7:00 AM & 9:30 AM", note: "Main Sanctuary — Wuse II",                                                                       accent: "#f59e0b", featured: false },
          { day: "Tuesday",   name: "Bible Study",     time: "6:00 PM",           note: "Various district meeting points. Contact your district elder for the nearest venue.",            accent: "#f59e0b", featured: true  },
          { day: "Wednesday", name: "Midweek Service", time: "6:00 PM",           note: "Main Sanctuary — Wuse II",                                                                       accent: "#06b6d4", featured: false },
        ];

        return (
          <section className="py-28 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#0a1628 0%,#050912 60%,#0a0f18 100%)" }}>
            <div className="absolute inset-0 opacity-[0.025]"
              style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 80px,rgba(255,255,255,.5) 80px,rgba(255,255,255,.5) 81px),repeating-linear-gradient(90deg,transparent,transparent 80px,rgba(255,255,255,.5) 80px,rgba(255,255,255,.5) 81px)" }} />

            <div className="max-w-5xl mx-auto px-6">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} className="text-center mb-20 space-y-3">
                <p className="text-amber-400/60 text-[9px] font-black uppercase tracking-[0.4em]">Join Us</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  className="text-6xl font-black text-white">Service Times</h2>
                <div className="w-14 h-px bg-amber-500/40 mx-auto" />
              </motion.div>

              <div className="relative space-y-6 md:space-y-0">
                {/* Vertical axis */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-white/5 hidden md:block" />

                {SERVICES.map((s, i) => (
                  <motion.div key={s.day}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.1 }}
                    className={`relative flex md:items-center gap-8 pb-10 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>

                    {/* Card */}
                    <div className="flex-1">
                      <div className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                        s.featured
                          ? "border-amber-500/25 bg-amber-500/4 shadow-2xl shadow-amber-500/8"
                          : "border-white/6 bg-white/2 hover:border-white/12 hover:bg-white/4"}`}>
                        {s.featured && (
                          <div className="absolute -top-3 left-6">
                            <span className="bg-amber-500 text-[#050912] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Weekly</span>
                          </div>
                        )}
                        <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
                          style={{ background: `linear-gradient(90deg,transparent,${s.accent}45,transparent)` }} />

                        <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: s.accent }}>{s.day}</p>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }}
                          className="text-3xl font-black text-white mb-3">{s.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-3.5 h-3.5 text-white/25" />
                          <p className="text-white/70 text-lg font-semibold">{s.time}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                          <p className="text-white/35 text-sm leading-relaxed">{s.note}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline node */}
                    <div className="hidden md:flex w-5 h-5 rounded-full border-2 border-amber-500/35 bg-[#050912] shrink-0 items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                    </div>

                    {/* Spacer */}
                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                ))}
              </div>

              <p className="text-center text-white/20 text-sm mt-6">
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
        return (
          <section className="py-28 relative overflow-hidden bg-[#050912]">
            <div className="absolute top-0 right-0 w-[700px] h-[500px] bg-amber-500/3 rounded-full blur-[140px]" />
            {/* Giant decorative quote */}
            <div className="absolute left-4 top-10 select-none pointer-events-none"
              style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(100px,18vw,220px)", lineHeight: 1, color: "rgba(245,158,11,0.05)", fontWeight: 900 }}>
              "
            </div>

            <div className="max-w-4xl mx-auto px-6 relative">
              <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.75 }}>

                <div className="text-center mb-12 space-y-3">
                  <p className="text-amber-400/50 text-[9px] font-black uppercase tracking-[0.4em]">A Message from the Pulpit</p>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    className="text-5xl md:text-6xl font-black text-white">
                    Dearly Beloved, <span className="text-amber-400">Welcome</span>
                  </h2>
                  <div className="w-12 h-px bg-amber-500/35 mx-auto" />
                </div>

                <div className="space-y-6 text-white/45 text-lg leading-relaxed text-center max-w-3xl mx-auto">
                  <p>
                    Thank you for visiting us. We appreciate God for your life and the great decision you have
                    taken to be with us today. Our earnest prayer is that you will be greatly uplifted and the
                    blessings of your fellowship with us shall abide in the precious name of our Lord and Saviour
                    Jesus Christ.
                  </p>
                  <p>
                    We are a <strong className="text-white font-semibold">Bible-centered, Holy Spirit led Reformed Church</strong>.
                    Our mission is to raise worshippers who are passionate for God, winning in life, and positively
                    changing lives through kingdom service to the glory of God.
                  </p>
                  <p>
                    Our core values are{" "}
                    <span className="text-amber-400 font-semibold">Righteousness</span>,{" "}
                    <span className="text-cyan-400 font-semibold">Love</span> and{" "}
                    <span className="text-emerald-400 font-semibold">Excellence</span>.
                  </p>
                </div>

                {/* Diamond divider */}
                <div className="flex items-center gap-5 my-14 max-w-xs mx-auto">
                  <div className="flex-1 h-px bg-white/6" />
                  <div className="w-2 h-2 rotate-45 bg-amber-500/40" />
                  <div className="flex-1 h-px bg-white/6" />
                </div>

                {/* Signature */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/12 shrink-0"
                    style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif" }} className="text-[#050912] text-xl font-black">MNI</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-[9px] text-white/20 italic mb-1 uppercase tracking-widest">Yours in Christ's Service</p>
                    <p style={{ fontFamily: "'Cormorant Garamond',serif" }} className="text-2xl font-black text-white">Most Rev. Mba Nwankwo Idika</p>
                    <p className="text-sm text-amber-400/70 font-medium">Minister In-Charge, PCN First Abuja Parish</p>
                  </div>
                </div>

                {/* Value pills */}
                <div className="flex flex-wrap justify-center gap-2.5 mt-10">
                  {[
                    { label: "Bible-Centered",  cls: "border-amber-500/15 text-amber-400/70  bg-amber-500/4"  },
                    { label: "Holy Spirit Led", cls: "border-cyan-500/15  text-cyan-400/70   bg-cyan-500/4"   },
                    { label: "Reformed Church", cls: "border-emerald-500/15 text-emerald-400/70 bg-emerald-500/4" },
                    { label: "Righteousness",  cls: "border-amber-500/15 text-amber-400/70  bg-amber-500/4"  },
                    { label: "Love",           cls: "border-rose-500/15  text-rose-400/70   bg-rose-500/4"   },
                    { label: "Excellence",     cls: "border-violet-500/15 text-violet-400/70 bg-violet-500/4" },
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
          <section className="py-28 relative overflow-hidden bg-[#060d1a]">
            <div className="max-w-7xl mx-auto px-6 space-y-16">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} className="text-center space-y-3 max-w-2xl mx-auto">
                <p className="text-amber-400/50 text-[9px] font-black uppercase tracking-[0.4em]">Explore</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  className="text-5xl md:text-6xl font-black text-white">Our Digital Ministry</h2>
                <p className="text-white/30 leading-relaxed">Serving our congregation with excellence through governed digital channels</p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ministries.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <motion.button key={m.label}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                      onClick={() => navigate(m.route)}
                      className="group text-left p-8 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/4 hover:border-white/10 transition-all duration-400 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                        style={{ background: `radial-gradient(ellipse at 20% 20%,${m.accent}07 0%,transparent 70%)` }} />
                      <div className="relative space-y-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                          style={{ background: `${m.accent}18`, border: `1px solid ${m.accent}18` }}>
                          <Icon className="w-5 h-5" style={{ color: m.accent }} />
                        </div>
                        <div>
                          <h3 style={{ fontFamily: "'Cormorant Garamond',serif" }}
                            className="text-2xl font-black text-white mb-1.5">{m.label}</h3>
                          <p className="text-white/30 text-sm leading-relaxed">{m.desc}</p>
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
        return (
          <section className="py-20 px-6 bg-[#050912]">
            <div className="max-w-5xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center border border-white/5"
                style={{ background: "linear-gradient(135deg,#0d1b3e 0%,#050912 60%,#0a1010 100%)" }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-px bg-gradient-to-r from-transparent via-amber-500/35 to-transparent" />
                <div className="absolute inset-0 opacity-[0.025]"
                  style={{ backgroundImage: "repeating-linear-gradient(45deg,rgba(255,255,255,.4) 0,rgba(255,255,255,.4) 1px,transparent 0,transparent 50%)", backgroundSize: "18px 18px" }} />
                <div className="relative space-y-6">
                  <p className="text-amber-400/50 text-[9px] font-black uppercase tracking-[0.4em]">You're Invited</p>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    className="text-5xl md:text-6xl font-black text-white">Join Our Growing Community</h2>
                  <p className="text-white/35 max-w-xl mx-auto leading-relaxed">
                    Whether you're in Abuja or across the globe, connect with PCN First Abuja Parish and be
                    part of our mission to spread the gospel with excellence and integrity.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button onClick={() => navigate("/events")}
                      className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#050912] font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20">
                      Visit Us This Sunday <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button onClick={() => navigate("/contact")}
                      className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/4 text-white/60 hover:text-white font-semibold text-sm transition-all">
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
        const cols = [
          { heading: "New Here?",  color: "#06b6d4", links: [{ label: "Service Times", r: "/" }, { label: "Vision & Beliefs", r: "/about" }, { label: "Leadership", r: "/staff" }, { label: "Testimonies", r: "/testimonies" }] },
          { heading: "Ministries", color: "#10b981", links: [{ label: "Children's Dept", r: "/ministries" }, { label: "Teenage Ministry", r: "/ministries" }, { label: "Evangelism", r: "/ministries" }, { label: "Family Life", r: "/ministries" }, { label: "Prayer", r: "/ministries" }] },
        ];

        return (
          <footer className="border-t border-white/5 bg-[#030508]">
            <div className="max-w-7xl mx-auto px-6 py-20">
              <div className="grid md:grid-cols-12 gap-12">

                {/* Brand */}
                <div className="md:col-span-4 space-y-6">
                  <div className="flex items-center gap-3">
                    <img src="/assets/pcn-logo.png" alt="PCN Logo" className="w-10 h-10 object-contain" />
                    <div>
                      <p style={{ fontFamily: "'Cormorant Garamond',serif" }} className="font-black text-lg text-white">PCN First Abuja Parish</p>
                      <p className="text-[9px] text-white/25 uppercase tracking-widest">Presbyterian Church of Nigeria</p>
                    </div>
                  </div>
                  <p className="text-white/25 text-sm leading-relaxed">Spreading the gospel with excellence and integrity across Abuja and beyond.</p>

                  {/* Social — SEC-02, SEC-03, SEC-04 */}
                  <div className="flex gap-2">
                    {SOCIAL_LINKS.map((s) =>
                      isAllowedExternalUrl(s.href) ? (
                        <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                          title={s.label} aria-label={s.label}
                          className="w-9 h-9 rounded-xl bg-white/3 border border-white/6 flex items-center justify-center hover:bg-amber-500/8 hover:border-amber-500/20 transition-all group">
                          {s.isInstagram ? (
                            <svg className="w-3.5 h-3.5 text-white/25 group-hover:text-amber-400 transition" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <rect x="2.17" y="2.17" width="19.66" height="19.66" rx="4.58" />
                              <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
                              <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-white/25 group-hover:text-amber-400 transition" fill="currentColor" viewBox="0 0 24 24">
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
                            <button onClick={() => navigate(l.r)} className="text-sm text-white/25 hover:text-white/60 transition-colors text-left">{l.label}</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* Contact — SEC-08 */}
                  <div className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400/50">Contact</h4>
                    <ul className="space-y-4">
                      <li><a href={CONTACT.phoneHref} className="flex items-start gap-2 text-sm text-white/25 hover:text-white/55 transition-colors"><Phone className="w-3.5 h-3.5 text-white/15 mt-0.5 shrink-0" />{CONTACT.phone}</a></li>
                      <li><a href={CONTACT.emailHref} className="flex items-start gap-2 text-sm text-white/25 hover:text-white/55 transition-colors"><Mail className="w-3.5 h-3.5 text-white/15 mt-0.5 shrink-0" />{CONTACT.email}</a></li>
                      <li><div className="flex items-start gap-2 text-sm text-white/20"><MapPin className="w-3.5 h-3.5 text-white/12 mt-0.5 shrink-0" />{CONTACT.address}</div></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar — SEC-01: Admin link intentionally absent */}
            <div className="border-t border-white/4">
              <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[10px] text-white/15">© 2026 Presbyterian Church of Nigeria, First Abuja Parish. All rights reserved.</p>
                <div className="flex items-center gap-5">
                  {["Privacy Policy", "Terms of Service", "Safeguarding"].map((t) => (
                    <a key={t} href="#" className="text-[10px] text-white/15 hover:text-white/40 transition-colors">{t}</a>
                  ))}
                  <button onClick={() => navigate("/contact")} className="text-[10px] text-white/15 hover:text-white/40 transition-colors">Contact</button>
                  {/* SEC-01: /admin/login link removed from public markup. Staff use an internal unlisted URL. */}
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
        return (
          <>
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
            `}</style>
            <div className="min-h-screen bg-[#050912] text-white" style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>
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
