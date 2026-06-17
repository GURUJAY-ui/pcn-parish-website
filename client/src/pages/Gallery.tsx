/**
 * Gallery.tsx — public gallery page, read-only for visitors.
 * Images load from the real backend (GET /api/gallery); all photo
 * management lives in the Admin panel. Liquid-glass redesign.
 */

import { useState, useEffect } from "react";
import { Image, Upload, X, ZoomIn, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useGlassTheme, SERIF } from "@/lib/glass";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────

type GalleryCategory = {
  id: string;
  label: string;
  tag: string;
};

type GalleryItem = {
  id: number;
  category: string;
  imageUrl: string | null;
  caption: string;
};

const categories: GalleryCategory[] = [
  { id: "all",     label: "All Photos",           tag: "All"     },
  { id: "worship", label: "Sunday Worship",       tag: "Worship" },
  { id: "events",  label: "Harvest Thanksgiving", tag: "Events"  },
  { id: "youth",   label: "Youth Fellowship",     tag: "Youth"   },
  { id: "music",   label: "Choir Ministration",   tag: "Music"   },
];

// ─── Component ────────────────────────────────────────────────────

export default function Gallery() {
  const t = useGlassTheme();
  const [items, setItems]                   = useState<GalleryItem[]>([]);
  const [loading, setLoading]               = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxItem, setLightboxItem]     = useState<GalleryItem | null>(null);

  // Submission modal state
  const [submitOpen, setSubmitOpen]         = useState(false);
  const [submitFile, setSubmitFile]         = useState<File | null>(null);
  const [submitCaption, setSubmitCaption]   = useState("");
  const [submitCategory, setSubmitCategory] = useState<"worship" | "events" | "youth" | "music">("worship");
  const [submitName, setSubmitName]         = useState("");
  const [submitEmail, setSubmitEmail]       = useState("");
  const [submitting, setSubmitting]         = useState(false);
  const [submitError, setSubmitError]       = useState<string | null>(null);
  const [submitDone, setSubmitDone]         = useState(false);

  const resetSubmit = () => {
    setSubmitFile(null); setSubmitCaption(""); setSubmitCategory("worship");
    setSubmitName(""); setSubmitEmail(""); setSubmitError(null); setSubmitDone(false);
  };

  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!submitFile) { setSubmitError("Please choose a photo to upload."); return; }
    if (submitFile.size > 5 * 1024 * 1024) { setSubmitError("Photo must be under 5 MB."); return; }
    if (!submitCaption.trim()) { setSubmitError("Please add a short caption."); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("image", submitFile);
      fd.append("caption", submitCaption.trim());
      fd.append("category", submitCategory);
      if (submitName.trim())  fd.append("submitterName", submitName.trim());
      if (submitEmail.trim()) fd.append("submitterEmail", submitEmail.trim());
      await api.submitGalleryPhoto(fd);
      setSubmitDone(true);
    } catch (err: any) {
      setSubmitError(err?.message ?? "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    api.getGallery()
      .then((data: GalleryItem[]) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "all"
    ? items
    : items.filter((g) => g.category === activeCategory);

  const getCategoryInfo = (categoryId: string) =>
    categories.find((c) => c.id === categoryId) ?? categories[0];

  return (
    <div className={`page-shell min-h-screen ${t.pageBg} ${t.ink}`}>
      <SiteNav />

      {/* ── Lightbox ───────────────────────────────────────────── */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <button aria-label="Close" className="absolute top-4 right-4 liquid-glass rounded-full p-3 text-white hover:bg-white/5 transition-all">
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            {lightboxItem.imageUrl ? (
              <img
                src={lightboxItem.imageUrl}
                alt={lightboxItem.caption}
                className="w-full rounded-3xl object-cover max-h-[70vh]"
              />
            ) : (
              <div className="liquid-glass w-full h-96 rounded-3xl flex flex-col items-center justify-center gap-4">
                <Image className="w-16 h-16 text-white/20" />
                <p className="text-white/40 text-sm">{lightboxItem.caption}</p>
              </div>
            )}
            <div className="mt-5 text-center">
              <p style={SERIF} className="text-white text-xl tracking-tight">{lightboxItem.caption}</p>
              <p className="text-white/50 text-sm mt-1">{getCategoryInfo(lightboxItem.category).label}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Submission modal ───────────────────────────────────── */}
      {submitOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !submitting && setSubmitOpen(false)}
        >
          <div
            className={`relative w-full max-w-md ${t.glass} rounded-3xl p-7`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              disabled={submitting}
              onClick={() => setSubmitOpen(false)}
              className={`absolute top-3 right-3 rounded-full p-2 ${t.hoverGlass} ${t.ink60} disabled:opacity-40`}
            >
              <X className="w-4 h-4" />
            </button>

            {submitDone ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                <h3 style={SERIF} className={`text-2xl ${t.ink} tracking-tight mb-2`}>Thank you.</h3>
                <p className={`${t.ink50} text-sm mb-6 leading-relaxed`}>
                  Your photo has been received. Our team will review it and add approved photos to the gallery soon.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitOpen(false)}
                  className={`inline-flex items-center gap-2 ${t.btnPrimary} rounded-full px-6 py-2.5 text-sm font-medium`}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitPhoto} className="space-y-4">
                <div>
                  <h3 style={SERIF} className={`text-2xl ${t.ink} tracking-tight`}>Send a photo</h3>
                  <p className={`${t.ink50} text-xs mt-1`}>JPEG, PNG, WebP or GIF · max 5 MB · admin reviews before publishing.</p>
                </div>

                <label className={`block ${t.ink60} text-xs uppercase tracking-widest`}>Photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => setSubmitFile(e.target.files?.[0] ?? null)}
                    className={`mt-1 block w-full text-sm ${t.ink} file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium ${t.btnPrimary.includes('file') ? '' : ''}`}
                  />
                </label>

                <label className={`block ${t.ink60} text-xs uppercase tracking-widest`}>Caption
                  <input
                    type="text" maxLength={200} value={submitCaption}
                    onChange={(e) => setSubmitCaption(e.target.value)}
                    placeholder="What's happening in this photo?"
                    className={`mt-1 block w-full rounded-xl px-3 py-2 text-sm ${t.glass} ${t.ink} placeholder:${t.ink40}`}
                  />
                </label>

                <label className={`block ${t.ink60} text-xs uppercase tracking-widest`}>Category
                  <select
                    value={submitCategory}
                    onChange={(e) => setSubmitCategory(e.target.value as any)}
                    className={`mt-1 block w-full rounded-xl px-3 py-2 text-sm ${t.glass} ${t.ink}`}
                  >
                    <option value="worship">Sunday Worship</option>
                    <option value="events">Events</option>
                    <option value="youth">Youth Fellowship</option>
                    <option value="music">Choir / Music</option>
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className={`block ${t.ink60} text-xs uppercase tracking-widest`}>Your name (optional)
                    <input
                      type="text" maxLength={100} value={submitName}
                      onChange={(e) => setSubmitName(e.target.value)}
                      className={`mt-1 block w-full rounded-xl px-3 py-2 text-sm ${t.glass} ${t.ink}`}
                    />
                  </label>
                  <label className={`block ${t.ink60} text-xs uppercase tracking-widest`}>Email (optional)
                    <input
                      type="email" maxLength={200} value={submitEmail}
                      onChange={(e) => setSubmitEmail(e.target.value)}
                      className={`mt-1 block w-full rounded-xl px-3 py-2 text-sm ${t.glass} ${t.ink}`}
                    />
                  </label>
                </div>

                {submitError && (
                  <p className="text-red-500 text-xs">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full inline-flex items-center justify-center gap-2 ${t.btnPrimary} rounded-full px-6 py-3 text-sm font-medium disabled:opacity-60`}
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Submit for review</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className={`relative ${t.pageBg} pt-36 md:pt-44 pb-12 md:pb-16 px-6 overflow-hidden`}>
        <div className={`absolute inset-0 ${t.radial}`} />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`${t.label} text-sm tracking-widest uppercase mb-6`}>
            Moments of Worship
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={SERIF}
            className={`text-5xl md:text-7xl ${t.ink} tracking-tight leading-[1.05] mb-6`}>
            The <em className={t.em}>gallery.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`${t.ink50} text-base md:text-lg max-w-xl mx-auto`}>
            Capturing the beautiful moments of faith, fellowship and worship at PCN First Abuja Parish.
          </motion.p>
        </div>
      </section>

      <section className={`${t.pageBg} pb-24 px-6`}>
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? t.btnPrimary
                    : `${t.glass} ${t.ink60} ${t.hoverGlass}`
                }`}
              >
                {cat.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? "bg-white/20" : t.L ? "bg-[#132744]/8" : "bg-white/10"}`}>
                  {cat.id === "all" ? items.length : items.filter((g) => g.category === cat.id).length}
                </span>
              </button>
            ))}
          </div>

          {/* Gallery grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className={`w-8 h-8 animate-spin ${t.ink40}`} />
            </div>
          ) : filtered.length === 0 ? (
            <div className={`text-center py-24 ${t.ink40}`}>
              <Image className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">No photos in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((item, i) => {
                const catInfo = getCategoryInfo(item.category);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
                    className={`group relative rounded-3xl overflow-hidden ${t.glass} aspect-square cursor-pointer`}
                    onClick={() => setLightboxItem(item)}
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.caption}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                        <Image className={`w-10 h-10 ${t.ink30}`} />
                        <p className={`${t.ink40} text-xs text-center px-3 leading-relaxed`}>{item.caption}</p>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="liquid-glass flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-medium">
                        <ZoomIn className="w-3.5 h-3.5" /> View
                      </div>
                    </div>

                    {/* Caption bar */}
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-xs font-medium">{item.caption}</p>
                      <span className="text-white/50 text-xs uppercase tracking-widest">{catInfo.tag}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8 }}
            className={`${t.glass} rounded-3xl p-10 md:p-14 text-center`}>
            <h2 style={SERIF} className={`text-3xl md:text-4xl ${t.ink} tracking-tight mb-4`}>
              Share your <em className={t.em}>photos.</em>
            </h2>
            <p className={`${t.ink50} max-w-lg mx-auto text-sm leading-relaxed mb-8`}>
              Were you at a service or event? Send your photos to us and our team will review and upload
              them to the gallery.
            </p>
            <button
              type="button"
              onClick={() => { resetSubmit(); setSubmitOpen(true); }}
              className={`inline-flex items-center gap-2 ${t.btnPrimary} rounded-full px-8 py-3 text-sm font-medium transition-colors`}
            >
              <Upload className="w-4 h-4" /> Send Photos
            </button>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
