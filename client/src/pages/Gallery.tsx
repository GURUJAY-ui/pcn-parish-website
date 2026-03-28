/**
 * client/src/pages/Gallery.tsx
 *
 * Public gallery page — read-only for visitors.
 * Images are loaded from the real backend (GET /api/gallery).
 * Upload is completely absent from this page.
 * All photo management is done in the Admin panel (/admin → Gallery tab).
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { ChevronRight, Image, Upload, X, ZoomIn, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type GalleryCategory = {
  id: string;
  label: string;
  tag: string;
  color: string;
  accent: string;
};

type GalleryItem = {
  id: number;
  category: string;
  imageUrl: string | null;
  caption: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const categories: GalleryCategory[] = [
  { id: "all",     label: "All Photos",          tag: "All",     color: "from-cyan-400 to-cyan-600",      accent: "text-cyan-400"    },
  { id: "worship", label: "Sunday Worship",       tag: "Worship", color: "from-amber-400 to-amber-600",    accent: "text-amber-400"   },
  { id: "events",  label: "Harvest Thanksgiving", tag: "Events",  color: "from-emerald-400 to-emerald-600", accent: "text-emerald-400" },
  { id: "youth",   label: "Youth Fellowship",     tag: "Youth",   color: "from-purple-400 to-purple-600",  accent: "text-purple-400"  },
  { id: "music",   label: "Choir Ministration",   tag: "Music",   color: "from-rose-400 to-rose-600",     accent: "text-rose-400"    },
];

const placeholderGradients = [
  "from-amber-500/20 to-amber-600/5",
  "from-cyan-500/20 to-cyan-600/5",
  "from-emerald-500/20 to-emerald-600/5",
  "from-purple-500/20 to-purple-600/5",
  "from-rose-500/20 to-rose-600/5",
  "from-blue-500/20 to-blue-600/5",
  "from-teal-500/20 to-teal-600/5",
  "from-orange-500/20 to-orange-600/5",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Gallery() {
  const { theme } = useTheme();
  const [, navigate] = useLocation();
  const [items, setItems]                   = useState<GalleryItem[]>([]);
  const [loading, setLoading]               = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxItem, setLightboxItem]     = useState<GalleryItem | null>(null);

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
    <div className={`themed-page min-h-screen ${theme === "light" ? "themed-page--light bg-background text-foreground" : "themed-page--dark bg-background text-foreground"}`}>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            {lightboxItem.imageUrl ? (
              <img
                src={lightboxItem.imageUrl}
                alt={lightboxItem.caption}
                className="w-full rounded-2xl object-cover max-h-[70vh]"
              />
            ) : (
              <div className={`w-full h-96 rounded-2xl bg-gradient-to-br ${placeholderGradients[lightboxItem.id % placeholderGradients.length]} border border-white/10 flex flex-col items-center justify-center gap-4`}>
                <Image className="w-16 h-16 text-white/20" />
                <p className="text-white/40 text-sm">{lightboxItem.caption}</p>
              </div>
            )}
            <div className="mt-4 text-center">
              <p className="text-white font-semibold">{lightboxItem.caption}</p>
              <p className="text-white/50 text-sm">{getCategoryInfo(lightboxItem.category).label}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden py-28 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-background to-purple-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="container relative">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Gallery</span>
          </div>
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20">
              <Image className="w-4 h-4 text-rose-400" />
              <span className="text-rose-400 text-sm font-semibold uppercase tracking-widest">Moments of Worship</span>
            </div>
            <h1 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-5xl md:text-6xl font-bold">Gallery</h1>
            <p className="text-lg text-muted-foreground">
              Capturing the beautiful moments of faith, fellowship and worship at PCN First Abuja Parish.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-16 space-y-10">

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                activeCategory === cat.id
                  ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-lg`
                  : "border-white/15 text-muted-foreground hover:border-white/30 hover:text-foreground"
              }`}
            >
              {cat.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? "bg-white/20" : "bg-white/5"}`}>
                {cat.id === "all" ? items.length : items.filter((g) => g.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Image className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">No photos in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item, i) => {
              const catInfo = getCategoryInfo(item.category);
              return (
                <div
                  key={item.id}
                  className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/25 transition-all duration-300 hover:shadow-xl aspect-square cursor-pointer"
                  onClick={() => setLightboxItem(item)}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.caption} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${placeholderGradients[i % placeholderGradients.length]} flex flex-col items-center justify-center gap-3`}>
                      <Image className="w-10 h-10 text-white/20" />
                      <p className="text-white/30 text-xs text-center px-3 leading-relaxed">{item.caption}</p>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 border border-white/20 text-white text-xs font-semibold">
                      <ZoomIn className="w-3.5 h-3.5" /> View
                    </div>
                  </div>

                  {/* Caption bar */}
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs font-semibold">{item.caption}</p>
                    <span className={`text-xs ${catInfo.accent}`}>{catInfo.tag}</span>
                  </div>

                  {/* Category dot */}
                  <div className={`absolute top-3 left-3 w-2 h-2 rounded-full bg-gradient-to-br ${catInfo.color}`} />
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1a2a6e] to-[#0f1a4a] border border-[#2a3a80] p-10 text-white text-center space-y-5">
          <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-3xl font-bold">Share Your Photos</h2>
          <p className="text-blue-200 max-w-lg mx-auto text-sm leading-relaxed">
            Were you at a service or event? Send your photos to us and our team will review and upload them to the gallery.
          </p>
          <a
            href="mailto:pulpitfap@gmail.com?subject=Gallery Photos — PCN First Abuja Parish"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all shadow-lg shadow-amber-500/20"
          >
            <Upload className="w-4 h-4" /> Send Photos
          </a>
        </div>

      </div>
    </div>
  );
}
