/**
 * SiteFooter — liquid-glass card footer (MotionSites spec) shared
 * across the project. Floating rounded-3xl glass panel with a
 * 12-column top grid and a "Join the Journey" social bottom bar.
 */

import { useCallback } from "react";
import { useLocation } from "wouter";
import { Phone, Mail, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import {
  useGlassTheme, SERIF, SOCIAL_LINKS, CONTACT,
  isAllowedExternalUrl, SocialIcon,
} from "@/lib/glass";

export default function SiteFooter() {
  const t = useGlassTheme();
  const [location, navigate] = useLocation();

  // "Service Times" lives in a section on the homepage — scroll to it,
  // navigating home first if we're on another page.
  const goToServiceTimes = useCallback(() => {
    const scroll = () => document.getElementById("service-times")?.scrollIntoView({ behavior: "smooth" });
    if (location === "/") {
      scroll();
    } else {
      navigate("/");
      setTimeout(scroll, 120);
    }
  }, [location, navigate]);

  const cols = [
    {
      heading: "New Here?",
      links: [
        { label: "Service Times",    go: goToServiceTimes },
        { label: "Vision & Beliefs", go: () => navigate("/about") },
        { label: "Leadership",       go: () => navigate("/staff") },
        { label: "Testimonies",      go: () => navigate("/testimonies") },
        { label: "Gallery",          go: () => navigate("/gallery") },
      ],
    },
    {
      heading: "Ministries",
      links: [
        { label: "Children's Dept",  go: () => navigate("/ministries") },
        { label: "Teenage Ministry", go: () => navigate("/ministries") },
        { label: "Evangelism",       go: () => navigate("/ministries") },
        { label: "Family Life",      go: () => navigate("/ministries") },
        { label: "Prayer",           go: () => navigate("/ministries") },
      ],
    },
    {
      heading: "Connect",
      links: [
        { label: "Get in Touch",     go: () => navigate("/contact") },
        { label: "Give Online",      go: () => navigate("/donations") },
        { label: "Privacy Policy",   go: () => navigate("/privacy-policy") },
        { label: "Terms of Service", go: () => navigate("/terms-of-service") },
        { label: "Safeguarding",     go: () => navigate("/safeguarding") },
      ],
    },
  ];

  return (
    <footer className={`${t.pageBg} px-4 md:px-6 pb-6`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        className={`${t.glass} max-w-6xl mx-auto w-full rounded-3xl p-6 md:p-10 ${t.ink70}`}>

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-10">

          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/assets/pcn-logo.png" alt="PCN Logo" className="w-8 h-8 object-contain" />
              <span style={SERIF} className={`text-xl font-medium ${t.ink} tracking-tight`}>PCN First Abuja Parish</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm mb-6">
              Spreading the gospel with excellence and integrity across Abuja and beyond —
              transforming lives, changing destinies.
            </p>
            <ul className="space-y-2.5">
              <li><a href={CONTACT.phoneHref} className={`flex items-start gap-2 text-xs ${t.inkHover} transition-colors`}><Phone className="w-3.5 h-3.5 mt-px shrink-0 opacity-50" />{CONTACT.phone}</a></li>
              <li><a href={CONTACT.emailHref} className={`flex items-start gap-2 text-xs ${t.inkHover} transition-colors`}><Mail className="w-3.5 h-3.5 mt-px shrink-0 opacity-50" />{CONTACT.email}</a></li>
              <li><div className="flex items-start gap-2 text-xs opacity-80"><MapPin className="w-3.5 h-3.5 mt-px shrink-0 opacity-50" />{CONTACT.address}</div></li>
            </ul>
          </div>

          {/* Link columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {cols.map((col) => (
              <div key={col.heading}>
                <h4 className={`text-sm uppercase tracking-wider ${t.ink} font-medium mb-4`}>{col.heading}</h4>
                <ul className="text-xs space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <button onClick={l.go} className={`${t.inkHover} transition-colors text-left`}>{l.label}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className={`pt-6 border-t ${t.divider} flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4`}>
          <p className="text-[10px] uppercase tracking-widest opacity-50 text-center md:text-left">
            © 2026 Presbyterian Church of Nigeria — First Abuja Parish
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-widest opacity-50">Join the Journey:</span>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((s) =>
                isAllowedExternalUrl(s.href) ? (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    title={s.label} aria-label={s.label}
                    className={`opacity-70 hover:opacity-100 transition-colors ${t.inkHover}`}>
                    <SocialIcon s={s} className="w-4 h-4" />
                  </a>
                ) : null
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
