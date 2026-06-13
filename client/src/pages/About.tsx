/**
 * About.tsx — PCN First Abuja Parish
 * Liquid-glass redesign. Intro section follows the MotionSites
 * "About" spec (numbered badge, clamp heading, text-roll CTA,
 * flanking images); content sections keep their API-driven data.
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Target, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useGlassTheme, SERIF } from "@/lib/glass";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { api } from "@/lib/api";

const fallbackTimeline = [
  { year: "1846", event: "Rev. Hope Masterdon Waddell and five Jamaicans arrive in Calabar at the invitation of King Evamba V and King Eyo II." },
  { year: "1858", event: "The Presbytery of Biafra is created on September 1st, marking a landmark in Nigerian church history." },
  { year: "1872", event: "Rev. Esien Esien Ukpabio becomes the first indigenous Nigerian minister, ordained on April 9th." },
  { year: "1921", event: "The Synod of Biafra is formed on May 4th, a major step toward church independence." },
  { year: "1952", event: "The church is renamed The Presbyterian Church of Eastern Nigeria in June." },
  { year: "1960", event: "In June, the church adopts its current name — The Presbyterian Church of Nigeria." },
  { year: "1984", event: "PCN First Abuja Parish is inaugurated on 8th April, comprising Wuse, Zauda and Jeida Congregations." },
];

const fallbackDoctrines = [
  { title: "The Holy Scripture", description: "We believe the Bible is the inspired, infallible Word of God and the supreme authority for faith and practice." },
  { title: "The Holy Trinity", description: "We believe in one God, eternally existing in three persons: Father, Son, and Holy Spirit." },
  { title: "Jesus Christ", description: "We believe in the deity and humanity of Jesus Christ, His virgin birth, sinless life, atoning death, bodily resurrection, and ascension." },
  { title: "Salvation by Grace", description: "We believe that salvation is by grace alone, through faith alone, in Christ alone — not by works." },
  { title: "The Holy Spirit", description: "We believe in the person and work of the Holy Spirit, who convicts, regenerates, indwells, and empowers believers." },
  { title: "The Church", description: "We believe in the universal Church, the body of Christ, composed of all true believers from every nation and generation." },
  { title: "The Second Coming", description: "We believe in the personal, visible, and bodily return of Jesus Christ to judge the living and the dead." },
  { title: "Eternal Life", description: "We believe in the resurrection of the dead — the saved unto eternal life, and the lost unto eternal separation from God." },
];

// Gold CTA with the MotionSites text-roll hover + rotating arrow circle.
function RollButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="group bg-[#c8972a] hover:bg-[#b8861f] text-white text-[13px] sm:text-[14px] font-medium rounded-full pl-5 sm:pl-6 pr-2 py-2 flex items-center gap-3 transition-colors">
      <span className="overflow-hidden h-[20px]">
        <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
          <span className="h-[20px] flex items-center">{label}</span>
          <span className="h-[20px] flex items-center">{label}</span>
        </span>
      </span>
      <span className="bg-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center">
        <ArrowRight size={14} className="text-[#c8972a] -rotate-45 group-hover:rotate-0 transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]" />
      </span>
    </button>
  );
}

// ═════════════════════════════════════════════════════════════════
// INTRO — MotionSites "About" section layout
// ═════════════════════════════════════════════════════════════════
function Intro() {
  const t = useGlassTheme();
  const [, navigate] = useLocation();

  const SMALL_IMG = "/assets/Pcn-fap-cong 2.jpeg";
  const LARGE_IMG = "/assets/PCN-FAP-CONG.jpeg";
  const paragraphMobile =
    "Rooted in the Reformation and planted in Abuja since 1984, we raise worshippers who are passionate for God and positively changing lives.";

  return (
    <section className={`${t.pageBg} pt-32 sm:pt-36 lg:pt-44 pb-12 sm:pb-16 lg:pb-24 overflow-hidden`}>
      <div className="max-w-[1440px] mx-auto">

        {/* Badge row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="px-5 sm:px-8 lg:px-12 flex items-center gap-3 mb-6 sm:mb-8">
          <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${t.L ? "bg-[#132744] text-white" : "bg-white text-black"} flex items-center justify-center text-[11px] sm:text-[12px] font-semibold`}>1</span>
          <span className={`${t.ink60} text-[12px] sm:text-[13px] font-medium rounded-full px-3 sm:px-4 py-1 sm:py-1.5 uppercase tracking-widest`}>About PCN First Abuja</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={SERIF}
          className={`px-5 sm:px-8 lg:px-12 text-[clamp(1.8rem,4.5vw,3.8rem)] leading-[1.12] tracking-[-0.02em] ${t.ink} mb-12 sm:mb-16 lg:mb-28`}>
          Transforming lives, changing destinies —<span className="sm:hidden"> </span><br className="hidden sm:block" />
          a Bible-centered, <em className={t.em}>Reformed church.</em>
        </motion.h1>

        {/* MOBILE / TABLET */}
        <div className="lg:hidden px-5 sm:px-8">
          <p className={`text-[15px] sm:text-[17px] leading-[1.6] font-medium ${t.ink70} mb-6`}>
            {paragraphMobile}
          </p>
          <div className="mb-8">
            <RollButton label="Meet our leaders" onClick={() => navigate("/staff")} />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
            <div className="sm:w-[45%]">
              <img src={SMALL_IMG} alt="PCN First Abuja Parish congregation"
                className="w-full aspect-[438/346] rounded-xl sm:rounded-2xl object-cover" />
            </div>
            <div className="sm:w-[55%]">
              <img src={LARGE_IMG} alt="Worship at PCN First Abuja Parish"
                className="w-full aspect-[900/600] rounded-xl sm:rounded-2xl object-cover" />
            </div>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden lg:grid grid-cols-[26%_1fr_48%] items-end gap-6 xl:gap-8 px-5 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8 }}
            className="self-end">
            <img src={SMALL_IMG} alt="PCN First Abuja Parish congregation"
              className="w-full aspect-[438/346] rounded-2xl object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, delay: 0.1 }}
            className="self-start flex flex-col justify-end">
            <p className={`text-[16px] xl:text-[18px] leading-[1.65] font-medium ${t.ink70} mb-6 max-w-[34ch]`}>
              Rooted in the Reformation and planted in Abuja since 1984, we raise worshippers
              passionate for God and His kingdom.
            </p>
            <div>
              <RollButton label="Meet our leaders" onClick={() => navigate("/staff")} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, delay: 0.15 }}
            className="self-end">
            <img src={LARGE_IMG} alt="Worship at PCN First Abuja Parish"
              className="w-full aspect-[3/2] rounded-2xl object-cover" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════
export default function About() {
  const t = useGlassTheme();
  const [, navigate] = useLocation();
  const [timeline, setTimeline] = useState(fallbackTimeline);
  const [doctrines, setDoctrines] = useState(fallbackDoctrines);
  const [stats, setStats] = useState([
    { value: "1846", label: "Year Founded in Nigeria", color: "text-amber-400" },
    { value: "178+", label: "Years of Ministry", color: "text-cyan-400" },
    { value: "11", label: "Congregations in Abuja", color: "text-emerald-400" },
    { value: "1984", label: "First Abuja Parish Est.", color: "text-purple-400" },
  ]);
  const [originParagraphs, setOriginParagraphs] = useState([
    "The Presbyterian Church of Nigeria is aware of its origins in the Reformation, especially the enlightening ministries of John Calvin in Switzerland and John Knox in Scotland.",
    "The PCN is indebted to the Presbyterian Church in Jamaica for sending five Jamaicans and Rev. Hope Masterdon Waddell to Calabar in 1846 at the invitation of King Evamba V and King Eyo II.",
    "The PCN First Abuja Parish was inaugurated on 8th April, 1984. It comprises Wuse, Zauda and Jeida Congregations with Mission Stations at Apo, Pegi, Abaji, Ogaminana, Kabusa, Kwali, Piyanko and Wuye.",
  ]);
  const [vision, setVision] = useState("To be a Bible-based Church, proclaiming to the world by preaching and example, the good news of the love of God through Jesus Christ His Son under the guidance of the Holy Spirit.");
  const [mission, setMission] = useState("To carry the gospel to all parts of Nigeria and beyond through evangelism, discipleship, service and promotion of social righteousness.");

  useEffect(() => {
    api.getSiteContent("about")
      .then((data) => {
        if (Array.isArray(data?.timeline) && data.timeline.length > 0) setTimeline(data.timeline);
        if (Array.isArray(data?.doctrines) && data.doctrines.length > 0) setDoctrines(data.doctrines);
        if (Array.isArray(data?.stats) && data.stats.length > 0) setStats(data.stats);
        if (Array.isArray(data?.origin?.paragraphs) && data.origin.paragraphs.length > 0) setOriginParagraphs(data.origin.paragraphs);
        if (typeof data?.vision === "string" && data.vision.trim()) setVision(data.vision);
        if (typeof data?.mission === "string" && data.mission.trim()) setMission(data.mission);
      })
      .catch(() => {});
  }, []);

  return (
    <div className={`page-shell min-h-screen ${t.pageBg} ${t.ink}`}>
      <SiteNav />
      <Intro />

      {/* Origin Story + Stats */}
      <section className={`relative ${t.pageBg} py-20 md:py-28 px-6 overflow-hidden`}>
        <div className={`absolute inset-0 ${t.radialMid}`} />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8 }}
            className="space-y-6">
            <p className={`${t.label} text-sm tracking-widest uppercase`}>Our Origins</p>
            <h2 style={SERIF} className={`text-3xl md:text-5xl ${t.ink} tracking-tight`}>
              Rooted in the <em className={t.em}>Reformation.</em>
            </h2>
            <div className={`space-y-4 ${t.ink50} leading-relaxed`}>
              {originParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <motion.div key={stat.label}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay: i * 0.1 }}
                className={`${t.glass} rounded-3xl p-6 text-center`}>
                <p style={SERIF} className={`text-4xl ${t.ink} mb-2`}>{stat.value}</p>
                <p className={`text-xs ${t.ink50} leading-snug`}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className={`relative ${t.pageBg} py-20 md:py-28 px-6 overflow-hidden`}>
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}
            className="flex items-end justify-between mb-12 md:mb-16">
            <h2 style={SERIF} className={`text-3xl md:text-5xl ${t.ink} tracking-tight`}>
              Our journey through <em className={t.em}>time.</em>
            </h2>
            <span className={`hidden md:block ${t.label} text-sm tracking-widest uppercase`}>History</span>
          </motion.div>

          <div className="relative">
            <div className={`absolute left-[88px] top-0 bottom-0 w-px hidden md:block ${t.L ? "bg-[#132744]/10" : "bg-white/10"}`} />
            <div className="space-y-2">
              {timeline.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
                  className="flex gap-6 items-start group">
                  <div className="shrink-0 w-[72px] text-right hidden md:block pt-0.5">
                    <span style={SERIF} className="text-lg text-[#c8972a]">{item.year}</span>
                  </div>
                  <div className={`shrink-0 w-3 h-3 rounded-full ${t.L ? "bg-[#c8972a]" : "bg-amber-400"} mt-2 hidden md:block group-hover:scale-125 transition-transform`} />
                  <div className="flex-1 pb-8">
                    <div style={SERIF} className="md:hidden text-lg text-[#c8972a] mb-1">{item.year}</div>
                    <p className={`text-sm ${t.ink50} leading-relaxed ${t.inkGroupHover} transition-colors`}>
                      {item.event}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className={`relative ${t.pageBg} py-12 md:py-16 px-6 overflow-hidden`}>
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          {[
            { icon: Target, title: "Our Vision",  body: vision },
            { icon: Heart,  title: "Our Mission", body: mission },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.title}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay: i * 0.15 }}
                className={`${t.glass} rounded-3xl p-8 md:p-10 space-y-5`}>
                <div className={`${t.glass} rounded-full w-12 h-12 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${t.ink70}`} />
                </div>
                <h3 style={SERIF} className={`text-2xl md:text-3xl ${t.ink} tracking-tight`}>{card.title}</h3>
                <p className={`${t.ink50} leading-relaxed`}>{card.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Statement of Faith */}
      <section className={`relative ${t.pageBg} py-20 md:py-28 px-6 overflow-hidden`}>
        <div className={`absolute inset-0 ${t.radialMid}`} />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto mb-12 md:mb-16 space-y-5">
            <p className={`${t.label} text-sm tracking-widest uppercase`}>Doctrine</p>
            <h2 style={SERIF} className={`text-3xl md:text-5xl ${t.ink} tracking-tight`}>
              Statement of <em className={t.em}>faith.</em>
            </h2>
            <p className={`${t.ink50} text-sm md:text-base leading-relaxed`}>
              These are the statements of Bible doctrine as believed and taught by the Presbyterian Church
              of Nigeria — directly deduced from the Bible and constituting the fundamental doctrines and
              tenets of the Christian faith.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {doctrines.map((doc, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.7, delay: (i % 4) * 0.1 }}
                className={`${t.glass} rounded-3xl p-6 space-y-3`}>
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-full ${t.L ? "bg-[#132744] text-white" : "bg-white text-black"} flex items-center justify-center text-[11px] font-semibold shrink-0`}>{i + 1}</span>
                  <h4 style={SERIF} className={`${t.ink} text-lg tracking-tight`}>{doc.title}</h4>
                </div>
                <p className={`text-xs ${t.ink50} leading-relaxed`}>{doc.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`relative ${t.pageBg} py-20 md:py-28 px-6 overflow-hidden`}>
        <div className={`absolute inset-0 ${t.L
          ? "bg-[radial-gradient(ellipse_at_bottom,_rgba(200,151,42,0.08)_0%,_transparent_70%)]"
          : "bg-[radial-gradient(ellipse_at_bottom,_rgba(255,255,255,0.04)_0%,_transparent_70%)]"}`} />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8 }}
            style={SERIF}
            className={`text-4xl md:text-6xl ${t.ink} leading-[1.1] tracking-tight mb-6`}>
            Come worship <em className={t.em}>with us.</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}
            className={`${t.ink50} leading-relaxed max-w-xl mx-auto mb-10`}>
            Whether you're new to faith or a lifelong believer, you are welcome at PCN First Abuja Parish.
            Join us this Sunday.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.25 }}
            className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/staff")}
              className={`${t.btnPrimary} rounded-full px-8 py-3.5 text-sm font-medium transition-colors`}>
              Meet Our Leaders
            </button>
            <button onClick={() => navigate("/donations")}
              className={`${t.glass} rounded-full px-8 py-3.5 ${t.ink} text-sm font-medium ${t.hoverGlass} transition-colors`}>
              Support Our Ministry
            </button>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
