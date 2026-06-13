/**
 * Ministries.tsx — PCN First Abuja Parish
 * Liquid-glass redesign. Data from the HARMONISED CHURCH MINISTRIES register.
 *
 * Security measures retained from the prior audit:
 *  - sanitize() applied to every rendered string (XSS defence if data ever
 *    comes from the API).
 *  - Navigation only via the ROUTES constant (no arbitrary navigate strings).
 *  - Tab id validated against a whitelist (isValidTab) — no `as any`.
 *  - Interactive cards are keyboard accessible (role/tabIndex/aria/onKeyDown).
 *  - Tab switching gated behind a transition lock.
 */

import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { useGlassTheme, SERIF } from "@/lib/glass";
import {
  Users, Music, Shield, Monitor, Baby,
  Heart, Globe, BookOpen, Star, UserCheck, Crosshair,
  HandHeart, Leaf, Home, ChevronDown, ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Centralised routes — never pass arbitrary strings to navigate().
const ROUTES = { home: "/", about: "/about", donations: "/donations", contact: "/contact" } as const;

// Sanitisation helper — applied to every string at render time.
const sanitize = (s: unknown, maxLen = 300): string => {
  if (typeof s !== "string") return "";
  return s
    .replace(/[<>"'`]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim()
    .slice(0, maxLen);
};

// Safe tab type + runtime whitelist guard.
type TabId = "ministries" | "arms" | "outreach";
const VALID_TABS = new Set<TabId>(["ministries", "arms", "outreach"]);
function isValidTab(id: string): id is TabId {
  return VALID_TABS.has(id as TabId);
}

// ─── DATA — from HARMONISED_CHURCH_MINISTRY register ──────────────
type Ministry = {
  id: string;
  icon: React.ElementType;
  name: string;
  tagline: string;
  description: string;
  convener?: string;
  units: string[];
  members: string[];
};

const MAIN_MINISTRIES: Ministry[] = [
  {
    id: "worship", icon: Music,
    name: "Worship Ministry",
    tagline: "Lifting His Name in Every Service",
    description: "Leading the congregation in Spirit-filled worship across all services — from the earliest morning gathering to the Teen & Children's Church.",
    convener: "Rev. Agan",
    units: ["First Service", "Second Service", "Fresh Anointing", "Mid Week Service", "Teen/Youth Church", "Children Church"],
    members: ["Eld. Dr. E. Nkang", "Eld. Dr. E. Asanga", "Eld. Dr. Nnachi Ibiam", "Eld. Mrs. Nkata", "Rev. Mrs. Onu", "Eld. Mike Oti"],
  },
  {
    id: "evangelism", icon: Globe,
    name: "Evangelism, Discipleship & Follow Up Ministry",
    tagline: "Going Into All the World",
    description: "Active gospel outreach, systematic discipleship and diaspora engagement — taking the Word beyond the walls of the sanctuary.",
    convener: "Rev. Dr. U. Ukiwo",
    units: ["Evangelism & Missions", "Discipleship", "Diaspora"],
    members: ["Eld. Dr. A. K. Allotey", "Eld. Ikechukwu Okoro", "Eld. Allojoe Ayang"],
  },
  {
    id: "prayer", icon: Star,
    name: "Prayer & Teaching Ministry",
    tagline: "The Intercession Engine of the Parish",
    description: "Fuelling every department through corporate and individual prayer, and grounding the congregation in deep, systematic Bible teaching.",
    convener: "Rev. Iyke Anaga",
    units: ["Prayer", "Teaching"],
    members: ["Eld. Mrs. Ijeoma Amanabu", "Eld. Mike Oti", "Eld. Iyke Okoro"],
  },
  {
    id: "music", icon: Music,
    name: "Music Ministry",
    tagline: "Excellence in Every Note of Praise",
    description: "Five distinct choral and orchestral ensembles — from the Awesome Choir to the Church Orchestra — lifting worship to the highest standard.",
    convener: "Eld. Sam Etum",
    units: ["Awesome Choir", "Christ Anointed Singers", "Children Choir", "Teen Choir", "Church Orchestra"],
    members: ["Eld. Mrs. Dee Nkang", "Eld. Etum Ukpai", "Eld. Emmanuel Ononokpono", "Eld. Otu Ekpenyong", "Eld. Dr. E. Nkang"],
  },
  {
    id: "ushering", icon: UserCheck,
    name: "Ushering, Protocol & Follow Up Ministry",
    tagline: "First Impressions of God's House",
    description: "Dedicated to orderliness, warm hospitality, and diligent follow-up — ensuring every member and visitor feels the excellence of God's presence.",
    convener: "Eld. Dr. A. K. Allotey",
    units: ["Ushering", "Protocol", "Follow Up"],
    members: ["Eld. Dr. E. J. Okorie", "Eld. Mary Itobo", "Eld. Dr. Irene Ijoma"],
  },
  {
    id: "media", icon: Monitor,
    name: "Media, ICT, Library & Documentation Ministry",
    tagline: "Bridging Church and the Digital World",
    description: "End-to-end digital ministry: live streaming, social media, publications, documentation, and managing the parish library and bookshop resources.",
    convener: "Eld. Dr. E. Nkang",
    units: ["Media/ICT", "Publication", "Documentation", "Library", "Bookshop", "Kiosks"],
    members: ["Eld. Felix Onwuchekwa", "Eld. E. E. Esege", "Eld. Mrs. A. V. Ukpanyang", "Eld. Mike Ani Agwu"],
  },
  {
    id: "lovecare", icon: Heart,
    name: "Love & Care Ministry",
    tagline: "Carrying One Another's Burdens",
    description: "Upholding the spiritual and physical welfare of Parish families — overseeing church arms, organisations, and supporting members through every season of life.",
    convener: "Most Rev. Mba Idika",
    units: ["Love and Care", "Welfare of Church Members", "Oversight of Church Arms & Organisations"],
    members: ["Eld. Mrs. Ogbonne Nnachi Ibiam", "Eld. Mrs. A. V. Ukpanyang", "Eld. Dr. Enefiok Asanga"],
  },
  {
    id: "family", icon: Home,
    name: "Christian Home & Family Life Ministry",
    tagline: "Strengthening Every Home",
    description: "Walking with families through every stage of life — from pre-marriage preparation to post-marriage counselling and sustained family life balance.",
    convener: "Eld. Mrs. B. Umoga",
    units: ["Pre-Marriage Preparation", "Post Marriage Counselling", "Family Life Balance"],
    members: ["Eld. A. K. Allotey", "Eld. Dr. Enefiok Asanga", "Eld. Mrs. Ebere Ukandu"],
  },
  {
    id: "csr", icon: HandHeart,
    name: "Neighbourhood Intervention & Corporate Social Responsibility Ministry",
    tagline: "The Church in the Community",
    description: "Executing the church's social responsibility through scholarships, community programmes, and strategic interventions in the Wuse host community.",
    convener: "Rev. Mrs. Victoria Onu",
    units: ["Church CSR Programmes", "Host Community Scholarships", "Other Community Social Interventions"],
    members: ["Eld. Mary Itobo", "Eld. E. J. Okorie", "Eld. Mrs. Nkata"],
  },
  {
    id: "environment", icon: Leaf,
    name: "Environment, Aesthetics & Sanctuary Keepers Ministry",
    tagline: "Keeping God's House in Excellence",
    description: "Maintaining the beauty, order and sanctity of the church environment — from landscaping and aesthetics to the dedicated sanctuary keepers team.",
    convener: "Eld. Otu Ekpenyong",
    units: ["Church Environment", "Beautification & Aesthetics", "Sanctuary Keepers"],
    members: ["Eld. Ugochi Chima", "Eld. Mrs. Ebere Ukandu", "Eld. Mike Oti"],
  },
];

type ChurchArm = {
  id: string;
  icon: React.ElementType;
  name: string;
  shortName: string;
  description: string;
  leader: string;
  leaderTitle: string;
  activities: string[];
};

const CHURCH_ARMS: ChurchArm[] = [
  { id: "mca",   icon: Users,     name: "Men's Christian Association",    shortName: "MCA",  description: "Monthly breakfast meetings hosted by different MCA families, building brotherhood and accountability among men of the parish.",     leader: "Dr. Roy Ndoma-Egba",       leaderTitle: "President",          activities: ["Monthly breakfast", "Family hosting", "Men's discipleship"] },
  { id: "wg",    icon: Heart,     name: "Women's Guild",                  shortName: "WG",   description: "Monthly fellowship every second Saturday and business meetings on the last Thursday — empowering women in faith and purposeful living.",  leader: "Sis Adeola Ijeoma Eleri",  leaderTitle: "President",          activities: ["2nd Saturday fellowship", "Last Thursday meetings", "Community service"] },
  { id: "pypan", icon: Crosshair, name: "PYPAN",                          shortName: "Youth",description: "The vibrant youth arm of the parish. Fellowships twice monthly on the first and last Friday evenings — raising the next generation.",        leader: "Chidinma Onwuchekwa",      leaderTitle: "President",          activities: ["1st & last Friday fellowships", "Youth outreach", "Leadership development"] },
  { id: "cgit",  icon: Star,      name: "Christian Girls in Training",    shortName: "CGIT", description: "Raising godly girls through intentional grooming, moral formation, and practical skills development for purposeful living in Christ.",       leader: "Mrs. Ada Agama",           leaderTitle: "Mother Coordinator", activities: ["Character formation", "Skills training", "Moral development"] },
  { id: "bb",    icon: Shield,    name: "Boy's Brigade",                  shortName: "BB",   description: "Promoting obedience, reverence, discipline and self-respect in young boys through structured, faith-based activities.",                    leader: "Mr. Ikechukwu Paul",       leaderTitle: "Company Captain",    activities: ["Drill & discipline", "Character building", "Outdoor activities"] },
];

type OutreachArm = {
  id: string;
  icon: React.ElementType;
  name: string;
  description: string;
  leader: string;
  activities: string[];
};

const OUTREACH_ARMS: OutreachArm[] = [
  { id: "child",  icon: Baby,     name: "Children's Department",      description: "Five age-grouped classes serving 50–100 children regularly with dedicated Sunday school teachers nurturing faith from the earliest years.", leader: "Mrs. Anda Nsa (Superintendent)",      activities: ["5 age-grouped classes", "50–100 children", "Sunday school"] },
  { id: "teen",   icon: Star,     name: "Teenage Department",         description: "Investing in teenagers (ages 13–21) for a fruitful future generation through mentorship, discipleship, and fellowship.",                     leader: "Elder Mike Ani Agwu (Co-ordinator)",  activities: ["Youth discipleship", "Leadership training", "Monthly fellowships"] },
  { id: "friends",icon: Globe,    name: "Friends of the Lost",        description: "A dedicated support structure for missionaries in the field — connecting the parish to gospel frontlines across Nigeria and beyond.",           leader: "Elder Dr. A. K. Allotey",             activities: ["Missionary support", "Mission giving", "Prayer for the field"] },
  { id: "prison", icon: BookOpen, name: "Prison & Hospital Ministry", description: "Active outreach to hospitals, prisons, and vulnerable communities — taking the love of Christ to those the world often forgets.",              leader: "Evangelism & Missions Team",          activities: ["Hospital visitation", "Prison ministry", "Community evangelism"] },
];

const MINISTRY_ICON_MAP = { Music, Globe, Star, UserCheck, Monitor, Heart, Home, HandHeart, Leaf } as const;
const ARM_ICON_MAP = { Users, Heart, Crosshair, Star, Shield } as const;
const OUTREACH_ICON_MAP = { Baby, Star, Globe, BookOpen } as const;

const CARD_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: (i % 3) * 0.1, ease: CARD_EASE } }),
};

// ─── Ministry card (expandable, accessible) ───────────────────────
function MinistryCard({ ministry, index }: { ministry: Ministry; index: number }) {
  const t = useGlassTheme();
  const [expanded, setExpanded] = useState(false);
  const Icon = ministry.icon;
  const panelId = `ministry-panel-${ministry.id}`;
  const btnId = `ministry-btn-${ministry.id}`;

  const toggle = useCallback(() => setExpanded((v) => !v), []);
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
  };

  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
      <div
        id={btnId} role="button" tabIndex={0} aria-expanded={expanded} aria-controls={panelId}
        onClick={toggle} onKeyDown={handleKey}
        className={`${t.glass} group h-full rounded-3xl p-7 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/20 flex flex-col`}>
        <div className="flex items-start justify-between mb-5">
          <div className={`${t.glass} rounded-full p-3 ${t.ink70}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`${t.glass} rounded-full px-2.5 py-1 text-[10px] ${t.ink50} uppercase tracking-widest`}>{ministry.units.length} units</span>
            <ChevronDown className={`w-4 h-4 ${t.ink40} transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
          </div>
        </div>

        <h3 style={SERIF} className={`text-xl md:text-2xl ${t.ink} tracking-tight mb-2 leading-tight`}>{sanitize(ministry.name)}</h3>
        <p className={`${t.label} text-[10px] uppercase tracking-widest mb-3`}>{sanitize(ministry.tagline)}</p>
        <p className={`${t.ink50} text-sm leading-relaxed`}>{sanitize(ministry.description)}</p>

        <AnimatePresence>
          {expanded && (
            <motion.div id={panelId} role="region" aria-labelledby={btnId}
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
              <div className={`pt-5 mt-5 border-t ${t.divider} space-y-4`}>
                <div>
                  <p className={`${t.ink40} text-[9px] uppercase tracking-[0.35em] mb-2`}>Unit / Focus Areas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ministry.units.map((u) => (
                      <span key={u} className={`${t.glass} rounded-full px-2.5 py-1 text-[10px] ${t.ink60}`}>{sanitize(u)}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={`${t.ink40} text-[9px] uppercase tracking-[0.35em] mb-2`}>Elders / Members</p>
                  <div className="space-y-1">
                    {ministry.members.map((m) => (
                      <p key={m} className={`${t.ink50} text-xs flex items-center gap-2`}>
                        <span className={`w-1 h-1 rounded-full shrink-0 ${t.L ? "bg-[#c8972a]" : "bg-amber-400"}`} />
                        {sanitize(m)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`mt-auto pt-5 border-t ${t.dividerSub}`}>
          <p className={`${t.ink40} text-[9px] uppercase tracking-widest mb-1`}>Convener</p>
          <p className={`text-sm ${t.ink}`}>{ministry.convener ? sanitize(ministry.convener) : "—"}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ArmCard({ arm, index }: { arm: ChurchArm; index: number }) {
  const t = useGlassTheme();
  const Icon = arm.icon;
  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
      className={`${t.glass} group rounded-3xl p-7 flex flex-col gap-4`}>
      <div className="flex items-start gap-4">
        <div className={`${t.glass} rounded-full p-3 ${t.ink70} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <span className={`${t.glass} rounded-full px-2.5 py-1 text-[10px] ${t.label} uppercase tracking-widest mb-2 inline-block`}>{arm.shortName}</span>
          <h3 style={SERIF} className={`text-xl md:text-2xl ${t.ink} tracking-tight leading-tight`}>{sanitize(arm.name)}</h3>
        </div>
      </div>
      <p className={`${t.ink50} text-sm leading-relaxed`}>{sanitize(arm.description)}</p>
      <div>
        <p className={`${t.ink40} text-[9px] uppercase tracking-[0.35em] mb-2`}>Activities</p>
        <div className="flex flex-wrap gap-1.5">
          {arm.activities.map((a) => (
            <span key={a} className={`${t.glass} rounded-full px-2.5 py-1 text-[10px] ${t.ink60}`}>{sanitize(a)}</span>
          ))}
        </div>
      </div>
      <div className={`mt-auto pt-4 border-t ${t.dividerSub}`}>
        <p className={`${t.ink40} text-[9px] uppercase tracking-widest mb-0.5`}>{sanitize(arm.leaderTitle)}</p>
        <p className={`text-sm ${t.ink}`}>{sanitize(arm.leader)}</p>
      </div>
    </motion.div>
  );
}

function OutreachCard({ arm, index }: { arm: OutreachArm; index: number }) {
  const t = useGlassTheme();
  const Icon = arm.icon;
  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
      className={`${t.glass} group rounded-3xl p-7 flex gap-5`}>
      <div className={`${t.glass} rounded-full p-4 ${t.ink70} shrink-0 self-start`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 space-y-3">
        <h3 style={SERIF} className={`text-xl md:text-2xl ${t.ink} tracking-tight`}>{sanitize(arm.name)}</h3>
        <p className={`${t.ink50} text-sm leading-relaxed`}>{sanitize(arm.description)}</p>
        <div className="flex flex-wrap gap-1.5">
          {arm.activities.map((a) => (
            <span key={a} className={`${t.glass} rounded-full px-2.5 py-1 text-[10px] ${t.ink60}`}>{sanitize(a)}</span>
          ))}
        </div>
        <div className={`pt-2 border-t ${t.dividerSub}`}>
          <p className={`text-sm ${t.ink}`}>{sanitize(arm.leader)}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function Ministries() {
  const t = useGlassTheme();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<TabId>("ministries");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mainMinistries, setMainMinistries] = useState(MAIN_MINISTRIES);
  const [churchArms, setChurchArms] = useState(CHURCH_ARMS);
  const [outreachArms, setOutreachArms] = useState(OUTREACH_ARMS);

  const goTo = useCallback((path: string) => navigate(path), [navigate]);

  useEffect(() => {
    api.getSiteContent("ministries")
      .then((data) => {
        if (Array.isArray(data?.mainMinistries) && data.mainMinistries.length > 0) {
          setMainMinistries(
            data.mainMinistries.map((item: Omit<Ministry, "icon"> & { icon: keyof typeof MINISTRY_ICON_MAP }) => ({
              ...item, icon: MINISTRY_ICON_MAP[item.icon] ?? Music,
            }))
          );
        }
        if (Array.isArray(data?.churchArms) && data.churchArms.length > 0) {
          setChurchArms(
            data.churchArms.map((item: Omit<ChurchArm, "icon"> & { icon: keyof typeof ARM_ICON_MAP }) => ({
              ...item, icon: ARM_ICON_MAP[item.icon] ?? Users,
            }))
          );
        }
        if (Array.isArray(data?.outreachArms) && data.outreachArms.length > 0) {
          setOutreachArms(
            data.outreachArms.map((item: Omit<OutreachArm, "icon"> & { icon: keyof typeof OUTREACH_ICON_MAP }) => ({
              ...item, icon: OUTREACH_ICON_MAP[item.icon] ?? Baby,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleTabChange = useCallback((id: string) => {
    if (!isValidTab(id) || isTransitioning || id === activeTab) return;
    setIsTransitioning(true);
    setActiveTab(id);
    setTimeout(() => setIsTransitioning(false), 350);
  }, [activeTab, isTransitioning]);

  const TABS = [
    { id: "ministries" as TabId, label: "10 Ministries", count: mainMinistries.length },
    { id: "arms"       as TabId, label: "Church Arms",   count: churchArms.length },
    { id: "outreach"   as TabId, label: "Outreach",      count: outreachArms.length },
  ];

  const STATS = [
    { value: "10", label: "Ministries" },
    { value: "5", label: "Church Arms" },
    { value: "4", label: "Outreach Arms" },
    { value: "40+", label: "Elder Leaders" },
  ];

  return (
    <div className={`page-shell min-h-screen ${t.pageBg} ${t.ink}`}>
      <SiteNav />

      {/* HERO */}
      <section className={`relative ${t.pageBg} pt-36 md:pt-44 pb-12 md:pb-16 px-6 overflow-hidden`}>
        <div className={`absolute inset-0 ${t.radial}`} />
        <div className="relative max-w-6xl mx-auto">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className={`${t.label} text-sm tracking-widest uppercase mb-6`}>Get Involved</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            style={SERIF} className={`text-4xl md:text-6xl lg:text-7xl ${t.ink} tracking-tight leading-[1.1] mb-6`}>
            Our <em className={t.em}>ministries.</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className={`${t.ink50} text-base md:text-lg leading-relaxed max-w-2xl mb-10`}>
            Every member has a place to serve, grow, and belong. Discover all 10 official ministries, church
            arms, and outreach organisations of PCN First Abuja Parish.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-3">
            {STATS.map((s) => (
              <div key={s.label} className={`${t.glass} rounded-2xl px-5 py-3 text-center`}>
                <p style={SERIF} className={`text-2xl ${t.ink}`}>{s.value}</p>
                <p className={`${t.ink40} text-[10px] uppercase tracking-widest mt-0.5`}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-8 space-y-10">
        {/* TABS */}
        <div className={`${t.glass} flex flex-wrap gap-1.5 p-1.5 rounded-full w-fit max-w-full`} role="tablist" aria-label="Ministry sections">
          {TABS.map((tab) => (
            <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
                activeTab === tab.id ? t.btnPrimary : `${t.ink50} ${t.hoverGlass}`}`}>
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20" : t.glass}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* PANELS */}
        <AnimatePresence mode="wait">
          {activeTab === "ministries" && (
            <motion.div key="ministries" id="panel-ministries" role="tabpanel"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}
              className="space-y-8">
              <div>
                <h2 style={SERIF} className={`text-2xl md:text-4xl ${t.ink} tracking-tight mb-2`}>The 10 harmonised ministries.</h2>
                <p className={`${t.ink50} text-sm`}>Officially structured per the parish register. Tap any card to expand units and elder assignments.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mainMinistries.map((m, i) => <MinistryCard key={m.id} ministry={m} index={i} />)}
              </div>
            </motion.div>
          )}

          {activeTab === "arms" && (
            <motion.div key="arms" id="panel-arms" role="tabpanel"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}
              className="space-y-8">
              <div>
                <h2 style={SERIF} className={`text-2xl md:text-4xl ${t.ink} tracking-tight mb-2`}>Church arms & organisations.</h2>
                <p className={`${t.ink50} text-sm`}>Fellowship groups for every member — men, women, youth, boys, and girls. A place for everyone.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {churchArms.map((arm, i) => <ArmCard key={arm.id} arm={arm} index={i} />)}
              </div>
            </motion.div>
          )}

          {activeTab === "outreach" && (
            <motion.div key="outreach" id="panel-outreach" role="tabpanel"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}
              className="space-y-8">
              <div>
                <h2 style={SERIF} className={`text-2xl md:text-4xl ${t.ink} tracking-tight mb-2`}>Outreach & specialist arms.</h2>
                <p className={`${t.ink50} text-sm`}>Outward-facing departments serving children, teenagers, missionaries, hospitals and the community at large.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {outreachArms.map((arm, i) => <OutreachCard key={arm.id} arm={arm} index={i} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <section className={`relative ${t.pageBg} py-20 md:py-28 px-6 overflow-hidden`}>
        <div className={`absolute inset-0 ${t.L
          ? "bg-[radial-gradient(ellipse_at_bottom,_rgba(200,151,42,0.08)_0%,_transparent_70%)]"
          : "bg-[radial-gradient(ellipse_at_bottom,_rgba(255,255,255,0.04)_0%,_transparent_70%)]"}`} />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.h2 initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8 }}
            style={SERIF} className={`text-4xl md:text-6xl ${t.ink} leading-[1.1] tracking-tight mb-6`}>
            Find your place to <em className={t.em}>serve.</em>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}
            className={`${t.ink50} leading-relaxed max-w-xl mx-auto mb-10`}>
            Every believer is called to serve. Whether your gift is music, hospitality, prayer, technology, or
            outreach — there is a ministry waiting for you at PCN First Abuja Parish.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.25 }}
            className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => goTo(ROUTES.about)}
              className={`${t.btnPrimary} rounded-full px-8 py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors`}>
              Learn About Us <ArrowUpRight className="w-4 h-4" />
            </button>
            <button onClick={() => goTo(ROUTES.donations)}
              className={`${t.glass} rounded-full px-8 py-3.5 ${t.ink} text-sm font-medium ${t.hoverGlass} transition-colors`}>
              Support Our Work
            </button>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
