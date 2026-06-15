/**
 * Home.tsx — PCN First Abuja Parish
 * Liquid-glass cinematic design (MotionSites-inspired) with full
 * light/dark theme support. Shared design system lives in
 * "@/lib/glass"; Nav and Footer are shared components.
 */

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight, ArrowUpRight, Users, Globe, BookOpen, Church,
  Play, Heart, MapPin, Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  useGlassTheme, SERIF, SOCIAL_LINKS,
  isAllowedExternalUrl, SocialIcon,
} from "@/lib/glass";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { api } from "@/lib/api";

// Hero background videos — parish footage. The hero crossfades between
// them on each loop: the glowing-cross push-in and the frosted worship clip.
const HERO_VIDEOS = ["/assets/hero.mp4", "/assets/hero2.mp4"];

const FALLBACK_MINISTRIES = [
  { label: "Sermons & Archive",  desc: "Complete sermon library, weekly messages and spiritual resources",    icon: Globe,    accent: "#06b6d4", route: "/sermons"    },
  { label: "Events & Calendar",  desc: "Upcoming services, events and community gatherings",                  icon: Users,    accent: "#10b981", route: "/events"     },
  { label: "Giving & Donations", desc: "Support our ministry with secure, transparent online giving",         icon: Heart,    accent: "#f59e0b", route: "/donations"  },
  { label: "Prayer Requests",    desc: "Submit requests and join our interceding prayer community",           icon: BookOpen, accent: "#06b6d4", route: "/contact"    },
  { label: "Leadership",         desc: "Meet our pastoral team and ministry leaders",                         icon: Church,   accent: "#10b981", route: "/staff"      },
  { label: "Gallery",            desc: "Browse photos from services, events and community life",              icon: Play,     accent: "#f59e0b", route: "/gallery"    },
] as const;

// ═════════════════════════════════════════════════════════════════
// HERO — full viewport video background (MotionSites "Asme" spec)
// Always dark (white-on-video) in both themes for legibility.
// ═════════════════════════════════════════════════════════════════
function Hero() {
  const [, navigate] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fadedOut = useRef(false);
  const videoIndex = useRef(0);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  // Crossfade-through-black loop that alternates between the hero clips.
  // Opacity is driven by a CSS transition (robust against rAF throttling in
  // background tabs); JS toggles the target value to fade in, fade out near
  // the end, then swap to the next video and fade back in. The src is set
  // here (not as a JSX prop) so re-renders — e.g. typing in the email field —
  // never reset playback.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.style.transition = "opacity 500ms ease";
    v.src = HERO_VIDEOS[0];
    v.load();

    const fadeIn = () => { v.play().catch(() => {}); v.style.opacity = "1"; };
    const onTimeUpdate = () => {
      if (v.duration && v.duration - v.currentTime <= 0.55 && !fadedOut.current) {
        fadedOut.current = true;
        v.style.opacity = "0";
      }
    };
    const onEnded = () => {
      v.style.opacity = "0";
      setTimeout(() => {
        videoIndex.current = (videoIndex.current + 1) % HERO_VIDEOS.length;
        v.src = HERO_VIDEOS[videoIndex.current];
        v.load();
        v.currentTime = 0;
        v.play().catch(() => {});
        fadedOut.current = false;
        v.style.opacity = "1";
      }, 100);
    };

    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("ended", onEnded);
    fadeIn();
    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("ended", onEnded);
    };
  }, []);

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    try {
      await api.createContact({
        name: "", email, phone: "",
        subject: "Newsletter Signup",
        message: "Homepage bulletin / newsletter signup.",
        type: "message", anonymous: false,
      });
      setSubscribed(true);
      setEmail("");
    } catch {
      /* keep the field so they can retry */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-black">
      {/* Background video — alternates between the hero clips, crossfading
          through black each loop. src is managed in the effect, not here. */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover object-bottom"
        style={{ opacity: 0 }}
        muted
        autoPlay
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40" />

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
          className="flex flex-col items-center gap-7 max-w-4xl w-full">

          <h1 style={SERIF}
            className="text-5xl sm:text-6xl md:text-8xl text-white tracking-tight leading-[1.02]">
            You're welcome <em className="italic text-white/70">home.</em>
          </h1>

          {/* Email capture pill */}
          {subscribed ? (
            <div className="liquid-glass rounded-full px-6 py-3.5 flex items-center gap-2.5 text-white text-sm">
              <span className="text-emerald-400 text-base">✓</span>
              You're on the list — see you Sunday.
            </div>
          ) : (
            <form onSubmit={submitEmail} className="max-w-xl w-full">
              <div className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3">
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for weekly updates"
                  className="flex-1 min-w-0 bg-transparent text-white placeholder:text-white/40 text-sm focus:outline-none"
                />
                <button type="submit" disabled={submitting} aria-label="Subscribe"
                  className="bg-white rounded-full p-3 text-black hover:bg-neutral-200 transition-colors disabled:opacity-60 shrink-0">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}

          <p className="text-white/70 text-sm leading-relaxed px-4 max-w-lg">
            Join us in worship at Wuse II, Abuja. Stay updated with our weekly bulletin and never miss a
            service, event, or moment of grace.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate("/contact")}
              className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors">
              Plan Your Visit
            </button>
            <a href="https://youtube.com/@pulpitfaptv" target="_blank" rel="noopener noreferrer"
              className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/5 transition-colors">
              <Play className="w-4 h-4 fill-white/70" /> Watch Live
            </a>
          </div>
        </motion.div>
      </div>

      {/* Social icons footer */}
      <div className="relative z-10 flex justify-center gap-4 pb-10">
        {SOCIAL_LINKS.map((s) =>
          isAllowedExternalUrl(s.href) ? (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              title={s.label} aria-label={s.label}
              className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
              <SocialIcon s={s} />
            </a>
          ) : null
        )}
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════
// PASTOR'S WELCOME — editorial section
// ═════════════════════════════════════════════════════════════════
function PastorWelcome() {
  const t = useGlassTheme();
  return (
    <section className={`relative ${t.pageBg} pt-32 md:pt-44 pb-16 md:pb-24 px-6 overflow-hidden`}>
      <div className={`absolute inset-0 ${t.radial}`} />

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
          className={`${t.label} text-sm tracking-widest uppercase mb-8`}>
          A Message from the Pulpit
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.1 }}
          style={SERIF}
          className={`text-4xl md:text-6xl lg:text-7xl ${t.ink} leading-[1.1] tracking-tight mb-12`}>
          Dearly beloved, <em className={t.em}>welcome</em>
          <span className="hidden md:block" />
          {" "}<em className={t.em}>home.</em>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, delay: 0.2 }}
          className={`space-y-6 ${t.ink50} text-base md:text-lg leading-relaxed max-w-3xl mx-auto`}>
          <p>
            Thank you for visiting us. We appreciate God for your life and the great decision you have
            taken to be with us today. Our earnest prayer is that you will be greatly uplifted and the
            blessings of your fellowship with us shall abide in the precious name of our Lord and Saviour
            Jesus Christ.
          </p>
          <p>
            We are a <span className={t.ink}>Bible-centered, Holy Spirit led Reformed Church</span>.
            Our mission is to raise worshippers who are passionate for God, winning in life, and positively
            changing lives through kingdom service to the glory of God.
          </p>
          <p>
            Our core values are <em style={SERIF} className={`italic ${t.ink}`}>Righteousness</em>,{" "}
            <em style={SERIF} className={`italic ${t.ink}`}>Love</em> and{" "}
            <em style={SERIF} className={`italic ${t.ink}`}>Excellence</em>.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-14 flex flex-col items-center gap-6">
          <div className={`${t.glass} rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center gap-5`}>
            <div className={`${t.glass} rounded-full w-14 h-14 flex items-center justify-center shrink-0`}>
              <span style={SERIF} className={`${t.ink} text-lg`}>MNI</span>
            </div>
            <div className="text-center sm:text-left">
              <p className={`${t.label} text-[10px] uppercase tracking-widest mb-1`}>Yours in Christ's Service</p>
              <p style={SERIF} className={`${t.ink} text-2xl tracking-tight`}>Most Rev. Mba Nwankwo Idika</p>
              <p className={`${t.ink50} text-sm`}>Minister In-Charge, PCN First Abuja Parish</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5">
            {["Bible-Centered", "Holy Spirit Led", "Reformed Church", "Righteousness", "Love", "Excellence"].map((label) => (
              <span key={label} className={`${t.glass} rounded-full px-4 py-1.5 text-[11px] ${t.ink60}`}>{label}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════
// SERVICE TIMES — liquid-glass cards
// ═════════════════════════════════════════════════════════════════
function ServiceTimes() {
  const t = useGlassTheme();
  const SERVICES = [
    { day: "Sunday",    name: "Worship Service", time: "7:00 AM & 9:30 AM", note: "Main Sanctuary — Wuse II",                                                                       featured: false },
    { day: "Tuesday",   name: "Bible Study",     time: "6:00 PM",           note: "Various district meeting points. Contact your district elder for the nearest venue.",            featured: true  },
    { day: "Wednesday", name: "Midweek Service", time: "6:00 PM",           note: "Main Sanctuary — Wuse II",                                                                       featured: false },
  ];

  return (
    <section id="service-times" className={`relative ${t.pageBg} py-24 md:py-32 px-6 overflow-hidden scroll-mt-24`}>
      <div className={`absolute inset-0 ${t.radialMid}`} />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }}
          className="flex items-end justify-between mb-12 md:mb-16">
          <h2 style={SERIF} className={`text-3xl md:text-5xl ${t.ink} tracking-tight`}>
            Join us in <em className={t.em}>worship.</em>
          </h2>
          <span className={`hidden md:block ${t.label} text-sm tracking-widest uppercase`}>Service Times</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => (
            <motion.div key={s.day}
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, delay: i * 0.15 }}
              className={`${t.glass} rounded-3xl p-8 relative`}>
              {s.featured && (
                <span className={`absolute top-6 right-6 ${t.glass} rounded-full px-3 py-1 text-[10px] ${t.L ? "text-[#c8972a]" : "text-white/70"} uppercase tracking-widest`}>Weekly</span>
              )}
              <p className={`${t.label} text-xs tracking-widest uppercase mb-4`}>{s.day}</p>
              <h3 style={SERIF} className={`${t.ink} text-2xl md:text-3xl tracking-tight mb-5`}>{s.name}</h3>
              <div className="flex items-center gap-2.5 mb-4">
                <Clock className={`w-4 h-4 ${t.ink40}`} />
                <p className={`${t.ink} text-base md:text-lg`}>{s.time}</p>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${t.ink30}`} />
                <p className={`${t.ink50} text-sm leading-relaxed`}>{s.note}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
          className={`text-center ${t.ink30} text-sm mt-10`}>
          All are welcome. Come as you are and experience the love of God.
        </motion.p>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════
// FEATURED — congregation image with glass overlay card
// (overlay stays dark in both themes for legibility over the photo)
// ═════════════════════════════════════════════════════════════════
function FeaturedSection() {
  const t = useGlassTheme();
  return (
    <section className={`${t.pageBg} pt-6 md:pt-10 pb-20 md:pb-28 px-6 overflow-hidden`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.9 }}
          className="rounded-3xl overflow-hidden relative aspect-[4/5] sm:aspect-[4/3] md:aspect-video group">
          <img src="/assets/PCN-FAP-CONG.jpeg" alt="PCN First Abuja Parish congregation"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="liquid-glass rounded-2xl p-6 md:p-8 max-w-md">
              <p className="text-white/50 text-xs tracking-widest uppercase mb-3">Worship With Us</p>
              <p className="text-white text-sm md:text-base leading-relaxed">
                Happy Presbyterians! From glory to glory. Join us in the sanctuary at Wuse II, or worship
                with us live from anywhere in the world.
              </p>
            </div>
            <motion.a
              href="https://youtube.com/@pulpitfaptv" target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium flex items-center gap-2 self-start md:self-auto">
              <Play className="w-4 h-4 fill-white/70" /> Watch Live
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════
// MINISTRY GRID — glass cards
// ═════════════════════════════════════════════════════════════════
function MinistryGrid() {
  const t = useGlassTheme();
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
    <section className={`relative ${t.pageBg} py-24 md:py-32 px-6 overflow-hidden`}>
      <div className={`absolute inset-0 ${t.radialMid}`} />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }}
          className="flex items-end justify-between mb-12 md:mb-16">
          <h2 style={SERIF} className={`text-3xl md:text-5xl ${t.ink} tracking-tight`}>
            Explore the <em className={t.em}>parish.</em>
          </h2>
          <span className={`hidden md:block ${t.label} text-sm tracking-widest uppercase`}>Stay Connected</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministries.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.button key={m.label}
                initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay: (i % 3) * 0.15 }}
                onClick={() => navigate(m.route)}
                className={`${t.glass} rounded-3xl p-7 md:p-8 text-left group`}>
                <div className="flex items-start justify-between mb-6">
                  <div className={`${t.glass} rounded-full p-3 ${t.ink70}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={`${t.glass} rounded-full p-2 ${t.ink60} ${t.inkGroupHover} transition-colors`}>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
                <h3 style={SERIF} className={`${t.ink} text-xl md:text-2xl tracking-tight mb-3`}>{m.label}</h3>
                <p className={`${t.ink50} text-sm leading-relaxed`}>{m.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════
// CTA — closing invitation
// ═════════════════════════════════════════════════════════════════
function CTABanner() {
  const t = useGlassTheme();
  const [, navigate] = useLocation();

  return (
    <section className={`relative ${t.pageBg} py-28 md:py-40 px-6 overflow-hidden`}>
      <div className={`absolute inset-0 ${t.L
        ? "bg-[radial-gradient(ellipse_at_bottom,_rgba(200,151,42,0.08)_0%,_transparent_70%)]"
        : "bg-[radial-gradient(ellipse_at_bottom,_rgba(255,255,255,0.04)_0%,_transparent_70%)]"}`} />

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
          className={`${t.label} text-sm tracking-widest uppercase mb-8`}>
          You're Invited
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.1 }}
          style={SERIF}
          className={`text-4xl md:text-6xl lg:text-7xl ${t.ink} leading-[1.1] tracking-tight mb-8`}>
          Join our growing <em className={t.em}>family.</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}
          className={`${t.ink50} text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-10`}>
          Whether you're in Abuja or across the globe, connect with PCN First Abuja Parish and be
          part of our mission to spread the gospel with excellence and integrity.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate("/events")}
            className={`group ${t.btnPrimary} rounded-full px-8 py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors`}>
            Visit Us This Sunday
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={() => navigate("/contact")}
            className={`${t.glass} rounded-full px-8 py-3.5 ${t.ink} text-sm font-medium ${t.hoverGlass} transition-colors`}>
            Contact Us
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════
// PAGE ROOT
// ═════════════════════════════════════════════════════════════════
export default function Home() {
  const t = useGlassTheme();
  return (
    <div className={`page-shell min-h-screen ${t.pageBg} ${t.ink}`}>
      <SiteNav />
      <Hero />
      <PastorWelcome />
      <ServiceTimes />
      <FeaturedSection />
      <MinistryGrid />
      <CTABanner />
      <SiteFooter />
    </div>
  );
}
