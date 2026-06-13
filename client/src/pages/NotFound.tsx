/**
 * NotFound.tsx — 404 page, liquid-glass style.
 */

import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useGlassTheme, SERIF } from "@/lib/glass";
import SiteNav from "@/components/SiteNav";

export default function NotFound() {
  const t = useGlassTheme();
  const [, navigate] = useLocation();

  return (
    <div className={`page-shell min-h-screen ${t.pageBg} ${t.ink} flex flex-col`}>
      <SiteNav />

      <div className={`relative flex-1 flex items-center justify-center px-6 py-32 overflow-hidden`}>
        <div className={`absolute inset-0 ${t.radial}`} />

        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`relative ${t.glass} rounded-3xl p-10 md:p-16 max-w-lg w-full text-center`}>
          <p className={`${t.label} text-sm tracking-widest uppercase mb-6`}>Error 404</p>
          <h1 style={SERIF} className={`text-7xl md:text-8xl ${t.ink} tracking-tight leading-none mb-6`}>
            Lost, <em className={t.em}>friend?</em>
          </h1>
          <p className={`${t.ink50} text-sm md:text-base leading-relaxed mb-10`}>
            Sorry, the page you are looking for doesn't exist. It may have been moved or deleted —
            but you're always welcome home.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/")}
              className={`group ${t.btnPrimary} rounded-full px-8 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors`}>
              Go Home
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate("/contact")}
              className={`${t.glass} rounded-full px-8 py-3 ${t.ink} text-sm font-medium ${t.hoverGlass} transition-colors`}>
              Contact Us
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
