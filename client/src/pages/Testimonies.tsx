/**
 * Testimonies.tsx — testimonies wall + submit form (API-driven).
 * Liquid-glass redesign; slider, category filter and submit
 * logic unchanged.
 */

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useGlassTheme, SERIF, type GlassTheme } from "@/lib/glass";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { api } from "@/lib/api";
import { ChevronRight, ChevronLeft, Quote, Star, Heart } from "lucide-react";

type Testimony = {
  id: number;
  quote: string;
  name: string;
  profession: string;
  category: string;
  initials?: string;
  color?: string;
};

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ── Testimony Submit Form ─────────────────────────────────────────

function TestimonySubmitForm({ t }: { t: GlassTheme }) {
  const [form, setForm] = useState({ name: "", profession: "", quote: "", category: "Faith" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.quote.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await api.submitTestimony(form);
      setSubmitted(true);
      setForm({ name: "", profession: "", quote: "", category: "Faith" });
    } catch {
      setError("Failed to submit. Please try again or email pulpitfap@gmail.com");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = `w-full p-3 rounded-xl ${t.glass} ${t.ink} placeholder:${t.L ? "text-[#132744]/35" : "text-white/30"} text-sm focus:outline-none transition-colors bg-transparent`;

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className={`${t.glass} w-14 h-14 rounded-full flex items-center justify-center`}>
          <span className="text-3xl">🙏</span>
        </div>
        <p style={SERIF} className={`${t.ink} text-2xl tracking-tight`}>Thank you!</p>
        <p className={`${t.ink50} text-sm text-center max-w-sm`}>Your testimony has been submitted for review. It will appear on this page once approved.</p>
        <button onClick={() => setSubmitted(false)}
          className={`text-xs ${t.ink40} ${t.inkHover} transition-colors mt-2`}>
          Submit another testimony
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4 text-left">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className={`text-xs ${t.label} uppercase tracking-widest`}>Your Name *</label>
          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Your name" className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className={`text-xs ${t.label} uppercase tracking-widest`}>Profession</label>
          <input value={form.profession} onChange={(e) => setForm((p) => ({ ...p, profession: e.target.value }))}
            placeholder="e.g. Engineer" className={inputCls} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className={`text-xs ${t.label} uppercase tracking-widest`}>Category</label>
        <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
          className={inputCls}>
          {["Faith", "Healing", "Provision", "Answered Prayer", "Family", "Spiritual Growth", "Protection", "Community"].map((c) => (
            <option key={c} value={c} className={t.L ? "bg-white" : "bg-black"}>{c}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className={`text-xs ${t.label} uppercase tracking-widest`}>Your Testimony *</label>
        <textarea value={form.quote} onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))}
          placeholder="Share what God has done in your life..."
          rows={4}
          className={`${inputCls} resize-none`} />
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      <button onClick={handleSubmit} disabled={submitting || !form.name.trim() || !form.quote.trim()}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-full ${t.btnPrimary} font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed`}>
        {submitting
          ? <><div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> Submitting...</>
          : <><Heart className="w-4 h-4" /> Submit Testimony</>}
      </button>
      <p className={`text-xs ${t.ink40} text-center`}>
        Submitted testimonies are reviewed before being published.
      </p>
    </div>
  );
}

// ── Featured Slider ───────────────────────────────────────────────

function FeaturedSlider({ items, t }: { items: Testimony[]; t: GlassTheme }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (index: number, dir: "left" | "right") => {
    if (animating || items.length === 0) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 350);
  };

  const prev = () => goTo((current - 1 + items.length) % items.length, "left");
  const next = () => goTo((current + 1) % items.length, "right");

  useEffect(() => {
    if (items.length === 0) return;
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current, items.length]);

  // Keep current index in bounds when items change
  useEffect(() => {
    if (items.length > 0 && current >= items.length) setCurrent(0);
  }, [items.length]);

  if (items.length === 0) return null;

  const item = items[current];
  const initials = item.initials ?? getInitials(item.name);

  return (
    <div className={`${t.glass} relative overflow-hidden rounded-3xl p-10 md:p-16`}>
      <div style={SERIF} className={`absolute top-4 left-8 text-[120px] leading-none select-none ${t.L ? "text-[#132744]/6" : "text-white/5"}`}>"</div>

      <div className="relative">
        <div className="flex justify-center gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
          ))}
        </div>

        <div className="transition-all duration-350 text-center"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating
              ? `translateX(${direction === "right" ? "-40px" : "40px"})`
              : "translateX(0)",
          }}>
          <p style={SERIF} className={`text-2xl md:text-3xl ${t.ink} leading-relaxed italic max-w-3xl mx-auto mb-8`}>
            "{item.quote}"
          </p>
          <div className="flex flex-col items-center gap-3">
            <div className={`${t.glass} w-14 h-14 rounded-full flex items-center justify-center`}>
              <span style={SERIF} className={`${t.ink} text-lg`}>{initials}</span>
            </div>
            <div className="text-center">
              <p className={`${t.ink} font-medium text-lg`}>{item.name}</p>
              <p className={`${t.ink50} text-sm`}>{item.profession}</p>
              <span className={`${t.glass} text-[10px] uppercase tracking-widest px-3 py-1 rounded-full mt-2 inline-block ${t.ink60}`}>
                {item.category}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-10">
          <button onClick={prev} aria-label="Previous"
            className={`${t.glass} w-10 h-10 rounded-full flex items-center justify-center transition-all ${t.hoverGlass} ${t.ink70}`}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {items.map((_, i) => (
              <button key={i} onClick={() => goTo(i, i > current ? "right" : "left")}
                aria-label={`Go to testimony ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? `${t.L ? "bg-[#c8972a]" : "bg-white"} w-6 h-2`
                    : `${t.L ? "bg-[#132744]/20 hover:bg-[#132744]/40" : "bg-white/20 hover:bg-white/40"} w-2 h-2`
                }`} />
            ))}
          </div>
          <button onClick={next} aria-label="Next"
            className={`${t.glass} w-10 h-10 rounded-full flex items-center justify-center transition-all ${t.hoverGlass} ${t.ink70}`}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <p className={`text-center ${t.ink30} text-xs mt-4`}>{current + 1} of {items.length}</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────

export default function Testimonies() {
  const t = useGlassTheme();
  const [activeCategory, setActiveCategory] = useState("All");
  const [testimoniesList, setTestimoniesList] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTestimonies()
      .then((data) => {
        if (Array.isArray(data)) setTestimoniesList(data);
      })
      .catch(() => {}) // network/server error → show empty state
      .finally(() => setLoading(false));
  }, []);

  const isEmpty = !loading && testimoniesList.length === 0;

  const categories = ["All", ...Array.from(new Set(testimoniesList.map((x) => x.category)))];

  const filtered = activeCategory === "All"
    ? testimoniesList
    : testimoniesList.filter((x) => x.category === activeCategory);

  return (
    <div className={`page-shell min-h-screen ${t.pageBg} ${t.ink}`}>
      <SiteNav />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className={`relative ${t.pageBg} pt-36 md:pt-44 pb-12 md:pb-16 px-6 overflow-hidden`}>
        <div className={`absolute inset-0 ${t.radial}`} />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`${t.label} text-sm tracking-widest uppercase mb-6`}>
            God's Faithfulness
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={SERIF}
            className={`text-5xl md:text-7xl ${t.ink} tracking-tight leading-[1.05] mb-6`}>
            <em className={t.em}>Testimonies.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`${t.ink50} text-base md:text-lg leading-relaxed max-w-2xl mx-auto`}>
            "God is faithful, by whom ye were called unto the fellowship of his Son Jesus Christ our Lord."
            — 1 Corinthians 1:9
          </motion.p>
        </div>
      </section>

      <section className={`${t.pageBg} pb-24 px-6`}>
        <div className="max-w-6xl mx-auto space-y-16">

          {/* Featured slider */}
          {(loading || testimoniesList.length > 0) && (
            <div className="space-y-6">
              <h2 style={SERIF} className={`text-3xl md:text-4xl ${t.ink} tracking-tight`}>
                Featured <em className={t.em}>stories.</em>
              </h2>
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className={`w-10 h-10 rounded-full border-2 animate-spin ${t.L ? "border-[#132744]/15 border-t-[#132744]" : "border-white/15 border-t-white"}`} />
                </div>
              ) : (
                <FeaturedSlider items={testimoniesList} t={t} />
              )}
            </div>
          )}

          {/* All testimonies */}
          <div className="space-y-8">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <h2 style={SERIF} className={`text-3xl md:text-4xl ${t.ink} tracking-tight`}>
                Every <em className={t.em}>testimony.</em>
              </h2>
              {testimoniesList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                        activeCategory === cat
                          ? t.btnPrimary
                          : `${t.glass} ${t.ink60} ${t.hoverGlass}`
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`${t.glass} rounded-3xl p-6 h-48 animate-pulse`} />
                ))}
              </div>
            ) : isEmpty ? (
              <div className={`${t.glass} rounded-3xl flex flex-col items-center gap-3 py-16 text-center`}>
                <div className={`${t.glass} w-14 h-14 rounded-full flex items-center justify-center`}>
                  <Quote className={`w-6 h-6 ${t.ink50}`} />
                </div>
                <p style={SERIF} className={`text-2xl ${t.ink} tracking-tight`}>No testimonies yet</p>
                <p className={`text-sm ${t.ink50} max-w-sm`}>Be the first to share what God has done in your life using the form below.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((item, i) => {
                  const initials = item.initials ?? getInitials(item.name);
                  return (
                    <motion.div key={item.id}
                      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
                      className={`${t.glass} rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group`}>
                      <div style={SERIF} className={`absolute top-2 right-5 text-[70px] leading-none select-none ${t.L ? "text-[#132744]/5" : "text-white/4"}`}>"</div>
                      <span className={`${t.glass} text-[10px] uppercase tracking-widest px-3 py-1 rounded-full w-fit ${t.ink60}`}>
                        {item.category}
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <p style={SERIF} className={`text-base ${t.ink70} leading-relaxed flex-1 italic`}>
                        "{item.quote}"
                      </p>
                      <div className={`flex items-center gap-3 pt-3 border-t ${t.divider}`}>
                        <div className={`${t.glass} w-10 h-10 rounded-full flex items-center justify-center shrink-0`}>
                          <span style={SERIF} className={`${t.ink} text-sm`}>{initials}</span>
                        </div>
                        <div>
                          <p className={`${t.ink} font-medium text-sm`}>{item.name}</p>
                          <p className={`text-xs ${t.ink40}`}>{item.profession}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Share CTA + form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8 }}
            className={`${t.glass} relative overflow-hidden rounded-3xl p-10 md:p-14 text-center space-y-6`}>
            <h2 style={SERIF} className={`text-3xl md:text-5xl ${t.ink} tracking-tight`}>
              Share your <em className={t.em}>testimony.</em>
            </h2>
            <p className={`${t.ink50} max-w-xl mx-auto leading-relaxed text-sm md:text-base`}>
              Has God done something amazing in your life? Your story could be the encouragement someone
              else needs today. Share your testimony with the PCN First Abuja Parish family.
            </p>
            <TestimonySubmitForm t={t} />
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
