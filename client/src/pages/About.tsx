import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ChevronRight, BookOpen, Target, Heart, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
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

export default function About() {
  const { theme } = useTheme();
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
    <div className={`themed-page min-h-screen ${theme === "light" ? "themed-page--light bg-background text-foreground" : "themed-page--dark bg-background text-foreground"}`}>

      {/* Hero Header */}
      <div className="relative overflow-hidden py-28 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-background to-emerald-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="container relative">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">About Us</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">About Us</span>
            </div>
            <h1 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-5xl md:text-6xl font-bold leading-tight">
              About The Presbyterian Church of Nigeria
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Transforming Lives, Changing Destinies
            </p>
          </div>
        </div>
      </div>

      <div className="container py-20 space-y-24">

        {/* Origin Story */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Our Origins</span>
            </div>
            <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-4xl font-bold leading-tight">
              Rooted in the Reformation
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {originParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="glass-lg p-6 text-center hover:border-white/20 transition-all">
                <p className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground leading-snug">{stat.label}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">History</span>
            </div>
            <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-4xl font-bold">Our Journey Through Time</h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[88px] top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/50 via-cyan-500/30 to-transparent hidden md:block" />

            <div className="space-y-6">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-6 items-start group">
                  {/* Year badge */}
                  <div className="shrink-0 w-[72px] text-right hidden md:block">
                    <span className="text-sm font-bold text-amber-400">{item.year}</span>
                  </div>

                  {/* Dot */}
                  <div className="shrink-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-background shadow-lg shadow-amber-500/30 mt-1 hidden md:block group-hover:scale-125 transition-transform" />

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="md:hidden text-sm font-bold text-amber-400 mb-1">{item.year}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                      {item.event}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              {vision}
            </p>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              {mission}
            </p>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
          </div>
        </section>

        {/* Statement of Faith */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-400 text-xs font-bold uppercase tracking-widest">Doctrine</span>
            </div>
            <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-4xl font-bold">Statement of Faith</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These are the statements of Bible doctrine as believed and taught by the Presbyterian Church of Nigeria — directly deduced from the Bible and constituting the fundamental doctrines and tenets of the Christian faith.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {doctrines.map((doc, i) => (
              <Card key={i} className="glass-lg p-6 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <span className="text-purple-400 text-xs font-bold">{i + 1}</span>
                  </div>
                  <h4 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold text-sm group-hover:text-purple-300 transition-colors">{doc.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{doc.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="rounded-2xl bg-gradient-to-br from-[#1a2a6e] to-[#0f1a4a] border border-[#2a3a80] p-12 text-center text-white space-y-6">
            <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-4xl font-bold">
              Come Worship With Us
            </h2>
            <p className="text-blue-200 max-w-xl mx-auto">
              Whether you're new to faith or a lifelong believer, you are welcome at PCN First Abuja Parish. Join us this Sunday.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/staff")}
                className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all shadow-lg shadow-amber-500/20"
              >
                Meet Our Leaders
              </button>
              <button
                onClick={() => navigate("/donations")}
                className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all"
              >
                Support Our Ministry
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
