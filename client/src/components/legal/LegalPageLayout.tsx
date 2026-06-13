/**
 * LegalPageLayout — shared liquid-glass shell for legal/policy pages.
 */

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useGlassTheme, SERIF } from "@/lib/glass";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

interface LegalPageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function LegalPageLayout({
  title,
  description,
  children,
}: LegalPageLayoutProps) {
  const t = useGlassTheme();

  return (
    <div className={`page-shell min-h-screen ${t.pageBg} ${t.ink}`}>
      <SiteNav />

      {/* HERO */}
      <section className={`relative ${t.pageBg} pt-36 md:pt-44 pb-12 md:pb-16 px-6 overflow-hidden`}>
        <div className={`absolute inset-0 ${t.radial}`} />
        <div className="relative max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`${t.label} text-sm tracking-widest uppercase mb-6`}>
            PCN First Abuja Parish
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={SERIF}
            className={`text-4xl md:text-6xl ${t.ink} tracking-tight leading-[1.1] mb-6`}>
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`${t.ink50} text-base md:text-lg leading-relaxed max-w-2xl`}>
            {description}
          </motion.p>
        </div>
      </section>

      {/* CONTENT */}
      <section className={`${t.pageBg} pb-20 px-6`}>
        <div className={`max-w-4xl mx-auto ${t.glass} rounded-3xl p-6 sm:p-10 md:p-14`}>
          <div className={`prose max-w-none ${t.L ? "prose-neutral" : "prose-invert"}`}>
            {children}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
