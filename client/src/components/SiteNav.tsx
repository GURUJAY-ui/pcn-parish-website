/**
 * SiteNav — floating liquid-glass pill navbar shared across the
 * redesigned pages. Theme-aware via useGlassTheme.
 */

import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlassTheme, NAV_ITEMS } from "@/lib/glass";

export default function SiteNav() {
  const t = useGlassTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, navigate] = useLocation();

  const go = useCallback((r: string) => { setMobileOpen(false); navigate(r); }, [navigate]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 pt-4 md:pt-6">
        <nav className={`${t.glass} rounded-full max-w-6xl mx-auto pl-4 pr-2 py-2 flex items-center justify-between ${t.L ? "bg-[#fffaf0]/60" : "bg-black/30"}`}>
          <button onClick={() => go("/")} className="flex items-center gap-2.5 shrink-0">
            <img src="/assets/pcn-logo.png" alt="PCN Logo" className="w-8 h-8 object-contain" />
            <span className={`${t.ink} font-semibold text-sm tracking-tight whitespace-nowrap`}>PCN First Abuja</span>
          </button>

          <div className="hidden lg:flex items-center gap-1 mx-4">
            {NAV_ITEMS.map((n) => (
              <button key={n.route} onClick={() => go(n.route)}
                className={`${t.ink70} ${t.inkHover} transition-colors text-[13px] font-medium px-3 py-2 rounded-full ${t.hoverGlass}`}>
                {n.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => go("/donations")}
              className={`hidden md:block ${t.btnPrimary} text-sm font-medium rounded-full px-6 py-2.5 transition-colors whitespace-nowrap`}>
              Give Online
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu"
              className={`lg:hidden ${t.glass} rounded-full p-2.5 ${t.ink}`}>
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className={`fixed inset-0 z-40 backdrop-blur-sm lg:hidden ${t.L ? "bg-[#132744]/20" : "bg-black/70"}`} />
            <motion.div
              initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
              className={`fixed inset-y-0 right-0 z-50 w-72 backdrop-blur-2xl border-l flex flex-col pt-20 pb-8 px-6 lg:hidden ${
                t.L ? "bg-[#fffaf0]/96 border-[#132744]/10" : "bg-black/95 border-white/10"}`}>
              <button onClick={() => setMobileOpen(false)} aria-label="Close"
                className={`absolute top-5 right-5 ${t.glass} rounded-full p-2 ${t.ink}`}>
                <X className="w-4 h-4" />
              </button>
              <div className="flex flex-col gap-1 flex-1">
                {NAV_ITEMS.map((n, i) => (
                  <motion.button key={n.route}
                    initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => go(n.route)}
                    className={`${t.ink70} text-left text-base py-2.5 transition-colors`}>
                    {n.label}
                  </motion.button>
                ))}
              </div>
              <button onClick={() => go("/donations")}
                className={`${t.btnPrimary} text-sm font-medium rounded-full px-6 py-3 transition-colors`}>
                Give Online
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
