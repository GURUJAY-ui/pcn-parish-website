import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/api";
import { ChevronRight, ChevronLeft, Quote, Star, Heart, Plus } from "lucide-react";

type Testimony = {
  id: number;
  quote: string;
  name: string;
  profession: string;
  category: string;
  initials?: string;
  color?: string;
};

const staticTestimonies: Testimony[] = [
  { id: 1, quote: "God is faithful, in the fact that he lives forever. His mercies are new every morning and I am a living witness of His goodness.", name: "Airbeato", profession: "IT Professional", category: "Faith", initials: "AI", color: "from-cyan-400 to-cyan-600" },
  { id: 2, quote: "After several weeks of praying and fasting, I got the admission I was looking for. Admitted to study Engineering! God answers prayers.", name: "Chukwuemeka Effiong", profession: "Student", category: "Answered Prayer", initials: "CE", color: "from-emerald-400 to-emerald-600" },
  { id: 3, quote: "I thank God for helping my family through the pandemic. When everything was uncertain, God was our anchor and our peace.", name: "Mr. Fayemi Jacob", profession: "Engineer", category: "Family", initials: "FJ", color: "from-amber-400 to-amber-600" },
  { id: 4, quote: "I want to thank God for saving my mother from a critical illness. The doctors had given up hope but God had the final say.", name: "Mrs. Ajadi", profession: "Accountant", category: "Healing", initials: "MA", color: "from-rose-400 to-rose-600" },
  { id: 5, quote: "I thank God for preserving my job throughout the pandemic when many were being laid off. His favour over my life is undeniable.", name: "Mrs. Chinenye", profession: "Air Hostess", category: "Provision", initials: "MC", color: "from-purple-400 to-purple-600" },
  { id: 6, quote: "I have grown in the knowledge of Christ and my eyes of understanding have been enlightened. This church has transformed my walk with God.", name: "Monday", profession: "Accountant", category: "Spiritual Growth", initials: "MO", color: "from-teal-400 to-teal-600" },
  { id: 7, quote: "God blessed me with a business breakthrough I had been believing Him for over three years. To God be all the glory!", name: "Brother Emeka", profession: "Entrepreneur", category: "Provision", initials: "BE", color: "from-orange-400 to-orange-600" },
  { id: 8, quote: "After years of waiting, God blessed my home with a child. I stood on His word and He did not disappoint. Hallelujah!", name: "Sister Adaeze", profession: "Civil Servant", category: "Family", initials: "SA", color: "from-pink-400 to-pink-600" },
  { id: 9, quote: "I was involved in a terrible accident and came out without a scratch. God's protection over my life is real and I am grateful.", name: "Mr. Okafor", profession: "Driver", category: "Protection", initials: "MO", color: "from-blue-400 to-blue-600" },
  { id: 10, quote: "Through the prayers of this church, I received my international visa after three previous rejections. God turned my story around.", name: "Miss Ngozi", profession: "Banker", category: "Answered Prayer", initials: "MN", color: "from-violet-400 to-violet-600" },
  { id: 11, quote: "I joined PCN First Abuja Parish not knowing anyone, and found a family. The love and fellowship here is unlike anything I have experienced.", name: "Elder Benson", profession: "Retired Officer", category: "Community", initials: "EB", color: "from-lime-400 to-lime-600" },
  { id: 12, quote: "God healed me of a condition doctors said was chronic. I stood on Isaiah 53:5 and today I am completely whole. Jesus is Lord!", name: "Mrs. Ukwu", profession: "Teacher", category: "Healing", initials: "MU", color: "from-amber-400 to-rose-500" },
];

const categoryColors: Record<string, string> = {
  "Faith": "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  "Answered Prayer": "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  "Family": "bg-amber-500/10 border-amber-500/20 text-amber-400",
  "Healing": "bg-rose-500/10 border-rose-500/20 text-rose-400",
  "Provision": "bg-purple-500/10 border-purple-500/20 text-purple-400",
  "Spiritual Growth": "bg-teal-500/10 border-teal-500/20 text-teal-400",
  "Protection": "bg-blue-500/10 border-blue-500/20 text-blue-400",
  "Community": "bg-lime-500/10 border-lime-500/20 text-lime-400",
};

const avatarColors = [
  "from-cyan-400 to-cyan-600", "from-emerald-400 to-emerald-600",
  "from-amber-400 to-amber-600", "from-rose-400 to-rose-600",
  "from-purple-400 to-purple-600", "from-teal-400 to-teal-600",
  "from-orange-400 to-orange-600", "from-pink-400 to-pink-600",
  "from-blue-400 to-blue-600", "from-violet-400 to-violet-600",
  "from-lime-400 to-lime-600", "from-amber-400 to-rose-500",
];

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ── Testimony Submit Form ──────────────────────────────────────────────────────

function TestimonySubmitForm() {
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

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <span className="text-3xl">🙏</span>
        </div>
        <p className="text-emerald-400 font-semibold text-lg">Thank you!</p>
        <p className="text-muted-foreground text-sm text-center max-w-sm">Your testimony has been submitted for review. It will appear on this page once approved.</p>
        <button onClick={() => setSubmitted(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-2">
          Submit another testimony
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4 text-left">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Name *</label>
          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Your name"
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-amber-500/50 transition-colors" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profession</label>
          <input value={form.profession} onChange={(e) => setForm((p) => ({ ...p, profession: e.target.value }))}
            placeholder="e.g. Engineer"
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-amber-500/50 transition-colors" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
        <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm focus:outline-none focus:border-amber-500/50 transition-colors">
          {["Faith", "Healing", "Provision", "Answered Prayer", "Family", "Spiritual Growth", "Protection", "Community"].map((c) => (
            <option key={c} value={c} className="bg-background">{c}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Testimony *</label>
        <textarea value={form.quote} onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))}
          placeholder="Share what God has done in your life..."
          rows={4}
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none focus:border-amber-500/50 transition-colors" />
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      <button onClick={handleSubmit} disabled={submitting || !form.name.trim() || !form.quote.trim()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20">
        {submitting
          ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
          : <><Heart className="w-4 h-4" /> Submit Testimony</>}
      </button>
      <p className="text-xs text-muted-foreground text-center">
        Submitted testimonies are reviewed before being published.
      </p>
    </div>
  );
}

// ── Featured Slider ────────────────────────────────────────────────────────────

function FeaturedSlider({ items }: { items: Testimony[] }) {
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

  const t = items[current];
  const initials = t.initials ?? getInitials(t.name);
  const color = t.color ?? avatarColors[current % avatarColors.length];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a2a6e] to-[#0f1a4a] border border-[#2a3a80] p-10 md:p-16 text-white">
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute top-6 left-8 text-[100px] leading-none text-amber-500/10 font-serif select-none">"</div>

      <div className="relative">
        <div className="flex justify-center gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
          ))}
        </div>

        <div className="transition-all duration-350 text-center"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating
              ? `translateX(${direction === "right" ? "-40px" : "40px"})`
              : "translateX(0)",
          }}>
          <p className="text-xl md:text-2xl text-blue-100 leading-relaxed italic max-w-3xl mx-auto mb-8">
            "{t.quote}"
          </p>
          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-xl`}>
              <span className="text-white font-bold text-lg">{initials}</span>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{t.name}</p>
              <p className="text-blue-300 text-sm">{t.profession}</p>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border mt-2 inline-block ${categoryColors[t.category] ?? "bg-white/10 border-white/10 text-white"}`}>
                {t.category}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-10">
          <button onClick={prev}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all hover:scale-110">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {items.map((_, i) => (
              <button key={i} onClick={() => goTo(i, i > current ? "right" : "left")}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "bg-amber-500 w-6 h-2" : "bg-white/20 w-2 h-2 hover:bg-white/40"
                }`} />
            ))}
          </div>
          <button onClick={next}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all hover:scale-110">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <p className="text-center text-blue-300/50 text-xs mt-4">{current + 1} of {items.length}</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function Testimonies() {
  const { theme } = useTheme();
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState("All");
  const [testimoniesList, setTestimoniesList] = useState<Testimony[]>(staticTestimonies);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTestimonies()
      .then((data) => {
        if (data && data.length > 0) setTestimoniesList(data);
      })
      .catch(() => {}) // keep static fallback silently
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(testimoniesList.map((t) => t.category)))];

  const filtered = activeCategory === "All"
    ? testimoniesList
    : testimoniesList.filter((t) => t.category === activeCategory);

  return (
    <div className={`themed-page min-h-screen ${theme === "light" ? "themed-page--light bg-background text-foreground" : "themed-page--dark bg-background text-foreground"}`}>

      {/* Hero */}
      <div className="relative overflow-hidden py-28 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-background to-rose-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl" />
        <div className="container relative">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Testimonies</span>
          </div>
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Heart className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">God's Faithfulness</span>
            </div>
            <h1 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-5xl md:text-6xl font-bold">Testimonies</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              "God is faithful, by whom ye were called unto the fellowship of his Son Jesus Christ our Lord." — 1 Corinthians 1:9
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              {[
                { value: `${testimoniesList.length}+`, label: "Testimonies", color: "text-amber-400" },
                { value: `${categories.length - 1}`, label: "Categories", color: "text-cyan-400" },
                { value: "∞", label: "God's Faithfulness", color: "text-emerald-400" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16 space-y-16">

        {/* Featured Slider */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold">Featured Testimonies</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
            </div>
          ) : (
            <FeaturedSlider items={testimoniesList} />
          )}
        </div>

        {/* All Testimonies Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center">
                <Quote className="w-4 h-4 text-white" />
              </div>
              <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold">All Testimonies</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    activeCategory === cat
                      ? "bg-amber-500 border-amber-500 text-white"
                      : "border-white/15 text-muted-foreground hover:border-white/30 hover:text-foreground"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 h-48 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((t, i) => {
                const initials = t.initials ?? getInitials(t.name);
                const color = t.color ?? avatarColors[i % avatarColors.length];
                return (
                  <Card key={t.id} className="glass-lg p-6 flex flex-col gap-4 hover:border-white/20 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-3 right-4 text-[60px] leading-none text-white/3 font-serif select-none group-hover:text-white/5 transition-colors">"</div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border w-fit ${categoryColors[t.category] ?? "bg-white/10 border-white/10 text-white"}`}>
                      {t.category}
                    </span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1 italic">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shrink-0`}>
                        <span className="text-white font-bold text-sm">{initials}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.profession}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Share Your Testimony CTA */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-rose-500/10 border border-amber-500/20 p-12 text-center space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
            <Plus className="w-7 h-7 text-white" />
          </div>
          <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-4xl font-bold">
            Share Your Testimony
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Has God done something amazing in your life? Your story could be the encouragement someone else needs today. Share your testimony with the PCN First Abuja Parish family.
          </p>
          <TestimonySubmitForm />
        </div>

      </div>
    </div>
  );
}
