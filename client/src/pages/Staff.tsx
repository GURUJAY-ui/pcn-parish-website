import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, BriefcaseBusiness, Mail, MapPin, Menu, Phone, ShieldCheck, Sparkles, X } from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/api";

type CommitteeLead = {
  title: string;
  name: string;
  phone?: string;
};

type Leader = {
  name: string;
  role: string;
  accent?: "cyan" | "amber" | "emerald" | "purple";
};

type Congregation = {
  name: string;
  minister: string;
  role: string;
};

type Committee = {
  id: number;
  name: string;
  duties: string[];
  leads: CommitteeLead[];
};

const pcnLeadership: Leader[] = [
  { name: "His Eminence, Ekpenyong Nyong Akpanika", role: "Prelate & Moderator of the General Assembly", accent: "amber" },
  { name: "Most Rev. Uche Dan-Okafor", role: "Moderator of Abuja Synod", accent: "amber" },
  { name: "Rt Rev. Nwadike Okoronkwo", role: "Moderator of Abuja Central Presbytery", accent: "amber" },
];

const parishLeadership: Leader[] = [
  { name: "Most. Rev. Mba Nwankwo Idika", role: "Minister-in-Charge", accent: "cyan" },
  { name: "Rev. Agan Ekpo Agan", role: "Associate Minister", accent: "cyan" },
  { name: "Rev. Ikechukwu Anaga", role: "Associate Minister", accent: "cyan" },
  { name: "Rev. Dr. Ukoha Ukiwo", role: "Associate Minister", accent: "cyan" },
  { name: "Rev. Mrs. Victoria Onu", role: "Associate Minister", accent: "cyan" },
  { name: "Elder Mrs. Akom Violet Ukpanyang", role: "Session Clerk", accent: "cyan" },
];

const boardExecutive: Leader[] = [
  { name: "Elder Dr. Joseph E. Okorie", role: "Board Chairman", accent: "emerald" },
  { name: "Bro. Duke Ezikpe Mma", role: "Board Clerk", accent: "emerald" },
  { name: "Arc. Kingsley Okoro", role: "Asst. Board Clerk", accent: "emerald" },
  { name: "Elder Allojoe Ayang", role: "Board Treasurer", accent: "emerald" },
  { name: "Mrs Ugo Ijoma", role: "Financial Secretary", accent: "emerald" },
];

const congregations: Congregation[] = [
  { name: "PCN Wuse (Main)", minister: "Most. Rev. Mba Nwankwo Idika", role: "Minister-in-Charge" },
  { name: "PCN Abaji", minister: "Rev. Richardfee Otta Okoro", role: "Associate Minister" },
  { name: "PCN Jeida", minister: "Rev. Dr. John Chima Orioha", role: "Associate Minister" },
  { name: "PCN Kabusa", minister: "Rev. Edet Anidot", role: "Associate Minister" },
  { name: "PCN Kwali", minister: "Rev. Mrs. Ada Kalu", role: "Associate Minister" },
  { name: "PCN Ogaminana", minister: "Evang. David Adeiza", role: "Evangelist" },
  { name: "PCN Pegi", minister: "Rev. Bassey Ogba", role: "Associate Minister" },
  { name: "PCN Wuye", minister: "Rev. Ukoha Ukiwo", role: "Associate Minister" },
  { name: "PCN Piyanko", minister: "Rt. Rev. Akporom Ukih Job", role: "Associate Minister" },
  { name: "PCN Rafin-kwara", minister: "Rev. Elisha Azubuko Samuel", role: "Associate Minister" },
  { name: "PCN JKC", minister: "Rev. Chika Utulor", role: "Associate Minister (Chaplain)" },
  { name: "PCN Waru", minister: "Evang. Sam Kalu", role: "Evangelist" },
];

const sessionMembers = [
  "Elder (Mrs) A.V. Ukpanyang", "Elder (Dr) Eniang Nkang", "Elder (Mrs) D. Nkang",
  "Elder (Mrs) B. Umoga", "Elder (Barr) E. J. Okorie", "Elder Emmanuel Ononokpono",
  "Elder Dr. Enefiok A. Asanga", "Elder Felix O. Onwuchekwa", "Elder (Mrs). Lucy Dickson",
  "Elder Dr. Asuquo Allotey", "Elder (Mrs) Nnenna Ukonu", "Elder (Mrs) I. Amanambu",
  "Elder (Mrs) Ebere Ukandu", "Elder David Godwin Lamba", "Elder (Mrs) Promise Rabo",
  "Elder Ikechukwu John Okoro", "Elder Esege E. Esege", "Elder Okorie Agbafor",
  "Elder (Mrs) Offiong Aliyu", "Elder Dr. Irene Ijoma", "Elder Mary Itobo", "Elder Allojoe Ayang",
  "Elder Micheal Oti", "Elder (Mrs) Ugochi Chima", "Elder Mike Ani Agwu", "Elder (Mrs) Ogbonne Nnachi-Ibiam",
  "Elder Barr. Efa Ita", "Elder Victor Nwakpa", "Elder Ukpai Orji Etum",
  "Elder Ngozi Obasi Ukonu", "Elder Agatha Bature Salami", "Elder (Mrs) Onyinyechi Nkata", "Elder Patricia K. Igbalum",
  "Elder Sunday Madu", "Elder Ifenyi Nwano", "Elder Akuma Adi James", "Elder (Mrs) Lucy Eleanya", "Elder (Mrs) Precious Rabo",
];

const fallbackCommittees: Committee[] = [
  { id: 1, name: "Legal", duties: ["Internal legal advisory", "External legal representation"], leads: [{ title: "Convener / Legal Adviser", name: "Barr Darlington Onyekwere", phone: "08032892640" }, { title: "Chairman", name: "Chief Solo Akuma, SAN", phone: "08055927374" }] },
  { id: 2, name: "Education", duties: ["JKC school management", "Jeida schools management", "Other schools", "Scholarships"], leads: [{ title: "Convener", name: "Elder Mrs Elly Kama", phone: "08037881561" }] },
  { id: 3, name: "Medical", duties: ["Hospitals management", "Health insurance", "Health education", "Medical outreach", "Immunization", "First aid"], leads: [{ title: "Convener", name: "Dr Ochea Uka", phone: "08037864463" }] },
  { id: 4, name: "Works & Projects", duties: ["Project development and supervision"], leads: [{ title: "Convener", name: "Arc Kingsley Okoro", phone: "07060909444" }] },
  { id: 5, name: "Property Maintenance & Equipment Maintenance", duties: ["Church buildings maintenance", "Church equipment maintenance", "Vehicle and GenSet maintenance"], leads: [{ title: "Convener", name: "Engr Bassey Ekpenyong", phone: "08035015372" }, { title: "Convener", name: "Engr Ifemezue Uma", phone: "07035656848" }] },
  { id: 6, name: "Property Inventory & Documentation", duties: ["Land and fixed assets inventory and documentation", "Land registry liaison"], leads: [{ title: "Convener", name: "Bro Duke Mma Ezikpe", phone: "07068565402" }, { title: "Chairman", name: "Barr Akpabio Ekpa", phone: "08033142396" }] },
  { id: 7, name: "Strategic Planning", duties: ["Project planning, monitoring, and measuring"], leads: [{ title: "Convener", name: "Elder E.E. Esege", phone: "07069319381" }] },
  { id: 8, name: "Finance & Kingdom Wealth Creation", duties: ["Resource mobilization for project implementation"], leads: [{ title: "Convener", name: "Elder Allojoe Ayang", phone: "07088710204" }, { title: "Convener", name: "Bro Nnanna Anyim-Ude", phone: "08032550211" }] },
  { id: 9, name: "Security & Safety", duties: ["Internal safety and security", "External security representation"], leads: [{ title: "Convener", name: "Capt. Bassey Ayi", phone: "08034525021" }] },
  { id: 10, name: "Mary Slessor Centre Project", duties: ["Project implementation"], leads: [{ title: "Convener / Chairman", name: "Barr Obo Effanga", phone: "08033248854" }] },
  { id: 11, name: "Digital Database, Website & Online Presence", duties: ["Create and manage central FAP membership data and website", "Manage FAP-PCN presence on social media", "Promote digital skills development"], leads: [{ title: "Convener", name: "Bro Itobo Ofem", phone: "07033775244" }] },
  { id: 12, name: "PresbyFAP Investments", duties: ["FAP business portfolios", "New businesses"], leads: [{ title: "Convener / Chairman", name: "Bro Nnanna Ude", phone: "08032550211" }, { title: "Secretary", name: "Dr Emma Akuma" }] },
  { id: 13, name: "Ogaminana Church Dev Committee", duties: ["Facilitate development and future handover of Ogaminana Church in Kogi State to PCN Board of Missions"], leads: [{ title: "Convener", name: "Elder Mrs. Ugochi Chima", phone: "09051521996" }] },
];

const SOCIAL_LINKS = Object.freeze([
  { label: "Facebook", href: "https://facebook.com/pcnfap", isInstagram: false, path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { label: "X", href: "https://x.com/firstabujapresbyterian", isInstagram: false, path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.6l-5.165-6.75-5.913 6.75h-3.308l7.73-8.835L2.56 2.25h6.772l4.681 6.187 5.431-6.187zM17.7 20.005h1.813L6.283 3.993H4.366l13.334 16.012z" },
  { label: "YouTube", href: "https://youtube.com/@pulpitfaptv", isInstagram: false, path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  { label: "Instagram", href: "https://instagram.com/pcnfap", isInstagram: true, path: "" },
] as const);

const CONTACT = Object.freeze({
  phone: "+234 (0) 8151111877",
  phoneHref: "tel:+2348151111877",
  email: "pulpitfap@gmail.com",
  emailHref: "mailto:pulpitfap@gmail.com",
  address: "No. 5 Boke Close, off Sakono Street, Opposite AP Plaza, Wuse II, Abuja",
});

const NAV_ITEMS = [
  { label: "Home", route: "/" },
  { label: "About", route: "/about" },
  { label: "Leadership", route: "/staff" },
  { label: "Sermons", route: "/sermons" },
  { label: "Testimonies", route: "/testimonies" },
  { label: "Ministries", route: "/ministries" },
  { label: "Events", route: "/events" },
  { label: "Contact", route: "/contact" },
] as const;

const ALLOWED_SOCIAL_DOMAINS = ["facebook.com", "x.com", "twitter.com", "youtube.com", "youtu.be", "instagram.com"];
const isAllowedExternalUrl = (url: string): boolean => {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_SOCIAL_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`));
  } catch { return false; }
};

const fallbackStats = [
  { label: "Congregations", value: "12", color: "text-cyan-400" },
  { label: "Session Members", value: "39", color: "text-emerald-400" },
  { label: "Board Committees", value: "13", color: "text-amber-400" },
] as const;

// ═════════════════════════════════════════════════════════════════
// NAV
// ═════════════════════════════════════════════════════════════════
function Nav() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = useCallback((route: string) => { setMobileOpen(false); navigate(route); }, [navigate]);

  return (
    <>
      <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? isLight
            ? "bg-[#fffaf0]/88 backdrop-blur-xl border-b border-[#1a3a6b]/10 shadow-xl shadow-[#1a3a6b]/8"
            : "bg-[#050912]/96 border-b border-amber-500/15 shadow-2xl shadow-black/50 backdrop-blur-xl"
          : "bg-transparent"
      }`}>
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLight ? "via-[#c8972a]" : "via-amber-400"} to-transparent transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`} />
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <button onClick={() => go("/")} className="group flex items-center gap-3">
            <img src="/assets/pcn-logo.png" alt="PCN Logo" className="h-9 w-9 object-contain transition-transform group-hover:scale-105" />
            <div className="hidden flex-col leading-tight lg:flex">
              <span style={{ fontFamily: "'Cormorant Garamond', serif" }} className={`text-base font-black tracking-wide ${isLight ? "text-[#132744]" : "text-white"}`}>PCN First Abuja</span>
              <span className={`text-[9px] uppercase tracking-[0.25em] ${isLight ? "text-[#c8972a]" : "text-amber-400/60"}`}>Parish</span>
            </div>
          </button>

          <div className="hidden items-center gap-0.5 md:flex">
            {NAV_ITEMS.map((item) => (
              <button key={item.route} onClick={() => go(item.route)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                  isLight ? "text-[#1a3a6b]/65 hover:text-[#1a3a6b] hover:bg-[#1a3a6b]/6" : "text-white/50 hover:bg-white/4 hover:text-white"
                }`}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:block">
            <button onClick={() => go("/donations")}
              className="rounded-xl bg-amber-500 px-5 py-2 text-[11px] font-black uppercase tracking-widest text-[#050912] shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 hover:shadow-amber-500/35">
              Give Online
            </button>
          </div>

          <button onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu"
            className={`flex h-9 w-9 items-center justify-center rounded-lg border md:hidden ${
              isLight ? "border-[#1a3a6b]/10 bg-white/80 text-[#132744]" : "border-white/8 bg-white/5 text-white"
            }`}>
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className={`fixed inset-0 z-40 backdrop-blur-sm md:hidden ${isLight ? "bg-[#132744]/18" : "bg-black/70"}`} />
            <motion.div
              initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col px-6 pt-20 pb-8 backdrop-blur-2xl ${
                isLight ? "border-l border-[#1a3a6b]/10 bg-[#fffaf0]/96" : "border-l border-white/6 bg-[#050912]/99"
              }`}>
              <button onClick={() => setMobileOpen(false)} aria-label="Close"
                className={`absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-lg border ${
                  isLight ? "border-[#1a3a6b]/10 bg-white/85 text-[#132744]" : "border-white/8 bg-white/5 text-white"
                }`}>
                <X className="h-4 w-4" />
              </button>
              <div className="flex flex-1 flex-col gap-1">
                {NAV_ITEMS.map((item, i) => (
                  <motion.button key={item.route} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => go(item.route)}
                    className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
                      isLight ? "text-[#1a3a6b]/65 hover:bg-[#1a3a6b]/6 hover:text-[#1a3a6b]" : "text-white/50 hover:bg-white/4 hover:text-white"
                    }`}>
                    {item.label}
                  </motion.button>
                ))}
              </div>
              <button onClick={() => go("/donations")} className="w-full rounded-xl bg-amber-500 py-3 text-sm font-black uppercase tracking-widest text-[#050912]">
                Give Online
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════
// STAT CARD
// ═════════════════════════════════════════════════════════════════
function StatCard({ value, label, color, isLight }: { value: string; label: string; color: string; isLight: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 backdrop-blur-sm ${
      isLight ? "border-[#1a3a6b]/10 bg-white/70 shadow-lg shadow-[#1a3a6b]/5" : "border-white/6 bg-white/[0.03]"
    }`}>
      <p className={`text-2xl md:text-3xl font-black ${color}`}>{value}</p>
      <p className={`mt-2 text-sm ${isLight ? "text-[#1a3a6b]/50" : "text-white/35"}`}>{label}</p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// SECTION HEADER
// ═════════════════════════════════════════════════════════════════
function SectionHeader({ title, eyebrow, icon: Icon, accent, isLight }: { title: string; eyebrow: string; icon: any; accent: string; isLight: boolean }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br ${accent} ${isLight ? "border-white/20" : "border-white/8"}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${isLight ? "text-[#1a3a6b]/35" : "text-white/30"}`}>{eyebrow}</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className={`text-3xl font-black md:text-4xl ${isLight ? "text-[#132744]" : "text-white"}`}>
          {title}
        </h2>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// LEADER CARD
// ═════════════════════════════════════════════════════════════════
function LeaderCard({ leader, isLight }: { leader: Leader; isLight: boolean }) {
  const darkColorMap = {
    cyan:    "border-cyan-500/20 bg-cyan-500/8",
    amber:   "border-amber-500/20 bg-amber-500/8",
    emerald: "border-emerald-500/20 bg-emerald-500/8",
    purple:  "border-purple-500/20 bg-purple-500/8",
  };
  const lightColorMap = {
    cyan:    "border-cyan-500/20 bg-cyan-500/6",
    amber:   "border-amber-500/20 bg-amber-500/6",
    emerald: "border-emerald-500/20 bg-emerald-500/6",
    purple:  "border-purple-500/20 bg-purple-500/6",
  };

  return (
    <div className={`rounded-2xl border p-5 ${isLight ? lightColorMap[leader.accent || "cyan"] : darkColorMap[leader.accent || "cyan"]}`}>
      <p className={`text-base font-semibold ${isLight ? "text-[#132744]" : "text-white"}`}>{leader.name}</p>
      <p className={`mt-2 text-sm ${isLight ? "text-[#1a3a6b]/55" : "text-white/45"}`}>{leader.role}</p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// CONGREGATION CARD
// ═════════════════════════════════════════════════════════════════
function CongregationCard({ congregation, isLight }: { congregation: Congregation; isLight: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${
      isLight ? "border-[#1a3a6b]/10 bg-white/70 shadow-sm" : "border-white/8 bg-white/[0.03]"
    }`}>
      <p className={`text-sm font-bold ${isLight ? "text-[#132744]" : "text-white"}`}>{congregation.name}</p>
      <p className={`mt-3 text-sm ${isLight ? "text-[#1a3a6b]/75" : "text-white/75"}`}>{congregation.minister}</p>
      <p className={`text-xs ${isLight ? "text-[#1a3a6b]/40" : "text-white/35"}`}>{congregation.role}</p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// COMMITTEE CARD
// ═════════════════════════════════════════════════════════════════
function CommitteeCard({ committee, isLight }: { committee: Committee; isLight: boolean }) {
  return (
    <article className={`group relative overflow-hidden rounded-[28px] border p-6 transition-all duration-300 hover:-translate-y-1 ${
      isLight
        ? "border-[#1a3a6b]/10 bg-white/80 hover:border-amber-500/25 hover:bg-white shadow-sm hover:shadow-xl hover:shadow-amber-500/8"
        : "border-white/6 bg-white/[0.03] hover:border-amber-500/20 hover:bg-white/[0.045]"
    }`}>
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-12 right-0 h-40 w-40 rounded-full bg-amber-500/8 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-cyan-500/8 blur-3xl" />
      </div>

      <div className="relative space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/15 bg-amber-500/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-amber-500">
              Committee {committee.id}
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className={`text-2xl font-black ${isLight ? "text-[#132744]" : "text-white"}`}>
              {committee.name}
            </h3>
          </div>
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
            isLight ? "border-cyan-500/20 bg-cyan-500/8" : "border-cyan-500/15 bg-cyan-500/10"
          }`}>
            <ShieldCheck className="h-5 w-5 text-cyan-500" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500/80">
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            Duties
          </div>
          <div className="flex flex-wrap gap-2">
            {committee.duties.map((duty) => (
              <span key={duty} className={`rounded-full border px-3 py-2 text-xs leading-relaxed ${
                isLight ? "border-[#1a3a6b]/10 bg-[#1a3a6b]/4 text-[#1a3a6b]/65" : "border-white/8 bg-white/[0.03] text-white/70"
              }`}>
                {duty}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/80">
            <BookOpen className="h-3.5 w-3.5" />
            Convener Details
          </div>
          <div className="space-y-3">
            {committee.leads.map((lead) => (
              <div key={`${committee.id}-${lead.title}-${lead.name}`} className={`rounded-2xl border p-4 ${
                isLight ? "border-[#1a3a6b]/8 bg-[#f8f7f4]" : "border-white/6 bg-[#08101d]"
              }`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.28em] ${isLight ? "text-[#1a3a6b]/35" : "text-white/30"}`}>{lead.title}</p>
                <p className={`mt-2 text-base font-semibold ${isLight ? "text-[#132744]" : "text-white"}`}>{lead.name}</p>
                {lead.phone ? (
                  <a href={`tel:${lead.phone}`} className="mt-3 inline-flex items-center gap-2 text-sm text-amber-600 transition-colors hover:text-amber-500">
                    <Phone className="h-3.5 w-3.5" />
                    {lead.phone}
                  </a>
                ) : (
                  <p className={`mt-3 text-sm ${isLight ? "text-[#1a3a6b]/30" : "text-white/30"}`}>Phone not listed</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

// ═════════════════════════════════════════════════════════════════
// FOOTER
// ═════════════════════════════════════════════════════════════════
function Footer() {
  const [, navigate] = useLocation();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const columns = [
    { heading: "New Here?", color: "#06b6d4", links: [{ label: "Service Times", route: "/" }, { label: "Vision & Beliefs", route: "/about" }, { label: "Leadership", route: "/staff" }, { label: "Testimonies", route: "/testimonies" }] },
    { heading: "Ministries", color: "#10b981", links: [{ label: "Children's Dept", route: "/ministries" }, { label: "Teenage Ministry", route: "/ministries" }, { label: "Evangelism", route: "/ministries" }, { label: "Family Life", route: "/ministries" }, { label: "Prayer", route: "/ministries" }] },
  ] as const;

  return (
    <footer className={`border-t ${isLight ? "border-[#1a3a6b]/10 bg-[#f0ede8]" : "border-white/5 bg-[#030508]"}`}>
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="space-y-6 md:col-span-4">
            <div className="flex items-center gap-3">
              <img src="/assets/pcn-logo.png" alt="PCN Logo" className="h-10 w-10 object-contain" />
              <div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif" }} className={`text-lg font-black ${isLight ? "text-[#132744]" : "text-white"}`}>PCN First Abuja Parish</p>
                <p className={`text-[9px] uppercase tracking-widest ${isLight ? "text-[#1a3a6b]/35" : "text-white/25"}`}>Presbyterian Church of Nigeria</p>
              </div>
            </div>
            <p className={`text-sm leading-relaxed ${isLight ? "text-[#1a3a6b]/45" : "text-white/25"}`}>Spreading the gospel with excellence and integrity across Abuja and beyond.</p>
            <div className="flex gap-2">
              {SOCIAL_LINKS.map((link) =>
                isAllowedExternalUrl(link.href) ? (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" title={link.label} aria-label={link.label}
                    className={`group flex h-9 w-9 items-center justify-center rounded-xl border transition-all hover:border-amber-500/20 hover:bg-amber-500/8 ${
                      isLight ? "border-[#1a3a6b]/10 bg-white/70" : "border-white/6 bg-white/3"
                    }`}>
                    {link.isInstagram ? (
                      <svg className={`h-3.5 w-3.5 transition group-hover:text-amber-500 ${isLight ? "text-[#1a3a6b]/35" : "text-white/25"}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <rect x="2.17" y="2.17" width="19.66" height="19.66" rx="4.58" />
                        <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
                        <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg className={`h-3.5 w-3.5 transition group-hover:text-amber-500 ${isLight ? "text-[#1a3a6b]/35" : "text-white/25"}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d={link.path} />
                      </svg>
                    )}
                  </a>
                ) : null
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-8 md:grid-cols-3">
            {columns.map((col) => (
              <div key={col.heading} className="space-y-4">
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: col.color }}>{col.heading}</h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <button onClick={() => navigate(l.route)} className={`text-left text-sm transition-colors ${isLight ? "text-[#1a3a6b]/35 hover:text-[#1a3a6b]/70" : "text-white/25 hover:text-white/60"}`}>{l.label}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="space-y-4">
              <h4 className={`text-[9px] font-black uppercase tracking-[0.3em] ${isLight ? "text-amber-600/60" : "text-amber-400/50"}`}>Contact</h4>
              <ul className="space-y-4">
                <li><a href={CONTACT.phoneHref} className={`flex items-start gap-2 text-sm transition-colors ${isLight ? "text-[#1a3a6b]/35 hover:text-[#1a3a6b]/70" : "text-white/25 hover:text-white/55"}`}><Phone className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isLight ? "text-[#1a3a6b]/20" : "text-white/15"}`} />{CONTACT.phone}</a></li>
                <li><a href={CONTACT.emailHref} className={`flex items-start gap-2 text-sm transition-colors ${isLight ? "text-[#1a3a6b]/35 hover:text-[#1a3a6b]/70" : "text-white/25 hover:text-white/55"}`}><Mail className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isLight ? "text-[#1a3a6b]/20" : "text-white/15"}`} />{CONTACT.email}</a></li>
                <li><div className={`flex items-start gap-2 text-sm ${isLight ? "text-[#1a3a6b]/30" : "text-white/20"}`}><MapPin className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isLight ? "text-[#1a3a6b]/15" : "text-white/12"}`} />{CONTACT.address}</div></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={`border-t ${isLight ? "border-[#1a3a6b]/8" : "border-white/4"}`}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
          <p className={`text-[10px] ${isLight ? "text-[#1a3a6b]/25" : "text-white/15"}`}>© 2026 Presbyterian Church of Nigeria, First Abuja Parish. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Service", "Safeguarding"].map((t) => (
              <a key={t} href="#" className={`text-[10px] transition-colors ${isLight ? "text-[#1a3a6b]/25 hover:text-[#1a3a6b]/50" : "text-white/15 hover:text-white/40"}`}>{t}</a>
            ))}
            <button onClick={() => navigate("/contact")} className={`text-[10px] transition-colors ${isLight ? "text-[#1a3a6b]/25 hover:text-[#1a3a6b]/50" : "text-white/15 hover:text-white/40"}`}>Contact</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ═════════════════════════════════════════════════════════════════
// PAGE ROOT
// ═════════════════════════════════════════════════════════════════
export default function Staff() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [committees, setCommittees] = useState<Committee[]>(fallbackCommittees);
  const [stats, setStats] = useState<{ label: string; value: string; color: string }[]>([...fallbackStats]);

  useEffect(() => {
    api.getSiteContent("staff")
      .then((data) => {
        if (Array.isArray(data?.committees) && data.committees.length > 0) setCommittees(data.committees);
        if (Array.isArray(data?.stats) && data.stats.length > 0) setStats(data.stats);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      <div
        className={`themed-page min-h-screen ${isLight ? "themed-page--light bg-background text-foreground" : "themed-page--dark bg-[#050912] text-white"}`}
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        <Nav />

        {/* Hero */}
        <section className={`relative overflow-hidden border-b ${isLight ? "border-[#1a3a6b]/10" : "border-white/6"}`}>
          <div className={`absolute inset-0 ${isLight
            ? "bg-[radial-gradient(circle_at_top,rgba(200,151,42,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(26,58,107,0.10),transparent_28%),linear-gradient(180deg,#f8f7f4_0%,#ffffff_65%,#f3efe6_100%)]"
            : "bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.14),transparent_28%),linear-gradient(180deg,#081120_0%,#050912_65%,#04070d_100%)]"
          }`} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.4) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

          <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 pt-32 pb-24 md:pt-36 md:pb-28">
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/15 bg-amber-500/8 px-4 py-2 text-[11px] font-black uppercase tracking-[0.35em] text-amber-500">
                <Sparkles className="h-4 w-4" />
                Leadership Structure
              </div>

              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className={`max-w-4xl text-5xl font-black leading-none md:text-7xl ${isLight ? "text-[#132744]" : "text-white"}`}>
                Our Leadership
                <span className="block text-amber-500">Serving First Abuja Parish in 2026</span>
              </h1>

              <p className={`max-w-2xl text-base leading-relaxed md:text-lg ${isLight ? "text-[#1a3a6b]/55" : "text-white/40"}`}>
                Meet the spiritual, administrative, and governance leaders serving PCN First Abuja Parish,
                together with the 2026 board committees coordinating the practical work that strengthens parish life.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {stats.map((stat) => (
                <StatCard key={stat.label} value={stat.value} label={stat.label} color={stat.color} isLight={isLight} />
              ))}
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="relative py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className={`rounded-[32px] border p-8 md:p-10 ${
              isLight
                ? "border-[#1a3a6b]/10 bg-white/80 shadow-lg shadow-[#1a3a6b]/5"
                : "border-white/6 bg-[linear-gradient(135deg,rgba(13,27,62,0.72),rgba(5,9,18,0.94),rgba(8,16,29,0.9))]"
            }`}>
              <div className="max-w-3xl space-y-4">
                <p className={`text-[10px] font-black uppercase tracking-[0.45em] ${isLight ? "text-amber-600/60" : "text-amber-400/60"}`}>Leadership Directory 2026</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className={`text-4xl md:text-5xl font-black ${isLight ? "text-[#132744]" : "text-white"}`}>
                  PCN First Abuja Parish Leadership & Board Committees
                </h2>
                <p className={`text-base leading-relaxed ${isLight ? "text-[#1a3a6b]/50" : "text-white/35"}`}>
                  A structured overview of parish leadership, congregational oversight, session membership,
                  and the 2026 board committees serving governance, welfare, development, stewardship,
                  digital presence, and mission expansion across First Abuja Parish.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership sections */}
        <section className="pb-12">
          <div className="mx-auto max-w-7xl space-y-16 px-6">
            <div>
              <SectionHeader title="PCN Leadership" eyebrow="Church Governance" icon={ShieldCheck} accent="from-amber-500/90 to-amber-700/90" isLight={isLight} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pcnLeadership.map((l) => <LeaderCard key={l.name} leader={l} isLight={isLight} />)}
              </div>
            </div>

            <div>
              <SectionHeader title="Parish Leadership" eyebrow="Pastoral Team" icon={Sparkles} accent="from-cyan-500/90 to-cyan-700/90" isLight={isLight} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {parishLeadership.map((l) => <LeaderCard key={l.name} leader={l} isLight={isLight} />)}
              </div>
            </div>

            <div>
              <SectionHeader title="Board Executive Committee" eyebrow="Administration" icon={BriefcaseBusiness} accent="from-emerald-500/90 to-emerald-700/90" isLight={isLight} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {boardExecutive.map((l) => <LeaderCard key={l.name} leader={l} isLight={isLight} />)}
              </div>
            </div>

            <div>
              <SectionHeader title="Congregations & Preaching Posts" eyebrow="Parish Spread" icon={MapPin} accent="from-purple-500/90 to-purple-700/90" isLight={isLight} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {congregations.map((c) => <CongregationCard key={c.name} congregation={c} isLight={isLight} />)}
              </div>
            </div>

            <div>
              <SectionHeader title="Kirk Session Members" eyebrow="Session" icon={BookOpen} accent="from-cyan-500/90 to-emerald-700/90" isLight={isLight} />
              <div className={`rounded-[28px] border p-6 md:p-8 ${isLight ? "border-[#1a3a6b]/10 bg-white/70" : "border-white/6 bg-white/[0.03]"}`}>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {sessionMembers.map((member, i) => (
                    <div key={member} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                      isLight ? "border-[#1a3a6b]/8 bg-[#f8f7f4]" : "border-white/6 bg-[#08101d]"
                    }`}>
                      <span className={`w-7 shrink-0 text-right text-xs ${isLight ? "text-[#1a3a6b]/30" : "text-white/25"}`}>{i + 1}</span>
                      <span className={`h-4 w-px shrink-0 ${isLight ? "bg-[#1a3a6b]/10" : "bg-white/10"}`} />
                      <span className={`text-sm ${isLight ? "text-[#1a3a6b]/75" : "text-white/75"}`}>{member}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Committees */}
        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeader title="Board Committees" eyebrow="2026 Committee Directory" icon={ShieldCheck} accent="from-amber-500/90 to-rose-600/90" isLight={isLight} />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {committees.map((c) => <CommitteeCard key={c.id} committee={c} isLight={isLight} />)}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
