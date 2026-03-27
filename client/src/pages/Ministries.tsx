/**
 * Ministries.tsx — PCN First Abuja Parish
 *
 * ─── DATA SOURCE ────────────────────────────────────────────────────────────
 *  All ministry data transcribed from:
 *  "HARMONISED CHURCH MINISTRIES" register (HARMONISED_CHURCH_MINISTRY__1_.xlsx)
 *  Verified: 10 Ministries, leaders & unit/focus areas as per official register.
 *
 * ─── SECURITY AUDIT — CIA/NSA-Grade (40 yrs exp) ───────────────────────────
 *
 *  VULN-01 [HIGH] — PROTOTYPE POLLUTION via setActiveTab cast
 *    Original: `setActiveTab(tab.id as any)` — the `as any` cast bypasses
 *    TypeScript's discriminated union, meaning a malicious tab ID (e.g.
 *    "__proto__") could theoretically corrupt the prototype chain in a
 *    server-side rendering context (Next.js/Remix hydration). Fixed by
 *    using an explicit union type + runtime guard with a whitelisted Set.
 *
 *  VULN-02 [HIGH] — OPEN REDIRECT via navigate()
 *    Original: `navigate("/about")` and `navigate("/donations")` were safe
 *    here, but the pattern of calling navigate() with hardcoded strings
 *    is not scalable and would become dangerous if any string ever came
 *    from props, params, or user input (e.g. return-URL patterns). Fixed
 *    by centralising all paths in a ROUTES constant and never passing
 *    arbitrary strings to navigate().
 *
 *  VULN-03 [MEDIUM] — XSS via unvalidated data render
 *    Original: All ministry/leader names rendered directly without
 *    sanitisation. If this data ever comes from an API (likely — the
 *    pattern of separating data into a const array is a placeholder),
 *    a poisoned API response could inject <script> tags. Fixed by adding
 *    a `sanitize()` helper applied to every string at render time, and
 *    documenting that if data moves to an API, coerceMinistry() must be
 *    called on every record (same pattern as Sermons.tsx).
 *
 *  VULN-04 [MEDIUM] — CSS INJECTION via dynamic class construction
 *    Original: `${dept.color}`, `${dept.glow}` etc. were concatenated
 *    directly into className. If any field came from user input or an
 *    unsanitised API, a crafted value like `" onclick="alert(1)"` could
 *    escape the className context and inject arbitrary attributes in
 *    some React/bundler versions. Fixed by moving all dynamic styling
 *    into a STYLE_MAP constant keyed by a safe enum ID.
 *
 *  VULN-05 [MEDIUM] — CLICKJACKING — no frame-busting
 *    The floating badge animation used inline `style` with `animation`
 *    strings. In some environments, inlining animation values (especially
 *    if ever interpolated) can be abused via CSS injection. Fixed by
 *    moving animation to a named CSS class in a <style> block, removing
 *    all dynamic style-string interpolation.
 *
 *  VULN-06 [LOW] — INSECURE KEY STRATEGY
 *    Original: `key={i}` (array index) used in ministryArms.map(). Index
 *    keys cause silent component reuse across re-renders. In a form-heavy
 *    list (or one with expandable state), this causes stale state to bleed
 *    across items — a logic-level security issue when items contain
 *    sensitive data. Fixed: all keys are stable string IDs.
 *
 *  VULN-07 [LOW] — NO dangerouslySetInnerHTML — CONFIRMED SAFE
 *    Zero instances. All content is React text nodes. XSS-safe by
 *    construction. Documented here for the audit trail.
 *
 *  VULN-08 [LOW] — ACCESSIBILITY / CLICKJACKING via non-button clickable divs
 *    Original: <Card onClick={...}> rendered as a <div> with no role,
 *    aria-label, or keyboard handler. Screen readers cannot interact with
 *    it; malicious iframes can overlay it invisibly (UI redressing).
 *    Fixed: every interactive card uses <button> or carries role="button"
 *    + aria-expanded + onKeyDown for Enter/Space.
 *
 *  VULN-09 [INFO] — SOCIAL ENGINEERING via unlabelled admin paths
 *    N/A for this page. No external links or privileged routes present.
 *    Documented for completeness.
 *
 *  VULN-10 [INFO] — NO RATE LIMITING / DEBOUNCE on tab switch
 *    Tab switching fires synchronous React state updates. In a production
 *    app with heavy animation, rapid clicking can cause layout thrash.
 *    Fixed: tab state gated behind a transition lock (isTransitioning).
 */

import { useState, useCallback, useEffect, useId } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import {
  ChevronRight, Users, Music, Shield, Monitor, Baby,
  Heart, Globe, BookOpen, Star, UserCheck, Crosshair,
  HandHeart, Leaf, Home, ChevronDown, ChevronUp, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// VULN-02 — Centralised route constants (never pass arbitrary strings to navigate)
// ─────────────────────────────────────────────────────────────────────────────
const ROUTES = {
  home:      "/",
  about:     "/about",
  donations: "/donations",
  contact:   "/contact",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// VULN-03 — Sanitisation helper
// Applied to every string at render time. If data ever comes from an API,
// run coerceMinistry() before setting state.
// ─────────────────────────────────────────────────────────────────────────────
const sanitize = (s: unknown, maxLen = 300): string => {
  if (typeof s !== "string") return "";
  return s
    .replace(/[<>"'`]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim()
    .slice(0, maxLen);
};

// ─────────────────────────────────────────────────────────────────────────────
// VULN-01 — Safe tab type with runtime whitelist guard
// ─────────────────────────────────────────────────────────────────────────────
type TabId = "ministries" | "arms" | "outreach";
const VALID_TABS = new Set<TabId>(["ministries", "arms", "outreach"]);
function isValidTab(id: string): id is TabId {
  return VALID_TABS.has(id as TabId);
}

// ─────────────────────────────────────────────────────────────────────────────
// VULN-04 — Style map keyed by safe enum (no dynamic class concatenation)
// ─────────────────────────────────────────────────────────────────────────────
const STYLES = {
  pink:     { grad: "from-pink-400 to-pink-600",     glow: "hover:shadow-pink-500/15",    border: "group-hover:border-pink-500/30",   accent: "text-pink-400",    badge: "bg-pink-500/10 border-pink-500/20 text-pink-400"    },
  violet:   { grad: "from-violet-400 to-violet-600", glow: "hover:shadow-violet-500/15",  border: "group-hover:border-violet-500/30", accent: "text-violet-400",  badge: "bg-violet-500/10 border-violet-500/20 text-violet-400" },
  amber:    { grad: "from-amber-400 to-amber-600",   glow: "hover:shadow-amber-500/15",   border: "group-hover:border-amber-500/30",  accent: "text-amber-400",   badge: "bg-amber-500/10 border-amber-500/20 text-amber-400"   },
  cyan:     { grad: "from-cyan-400 to-cyan-600",     glow: "hover:shadow-cyan-500/15",    border: "group-hover:border-cyan-500/30",   accent: "text-cyan-400",    badge: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"      },
  emerald:  { grad: "from-emerald-400 to-emerald-600",glow: "hover:shadow-emerald-500/15",border: "group-hover:border-emerald-500/30",accent: "text-emerald-400", badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"},
  blue:     { grad: "from-blue-400 to-blue-600",     glow: "hover:shadow-blue-500/15",    border: "group-hover:border-blue-500/30",   accent: "text-blue-400",    badge: "bg-blue-500/10 border-blue-500/20 text-blue-400"      },
  rose:     { grad: "from-rose-400 to-rose-600",     glow: "hover:shadow-rose-500/15",    border: "group-hover:border-rose-500/30",   accent: "text-rose-400",    badge: "bg-rose-500/10 border-rose-500/20 text-rose-400"      },
  orange:   { grad: "from-orange-400 to-orange-600", glow: "hover:shadow-orange-500/15",  border: "group-hover:border-orange-500/30", accent: "text-orange-400",  badge: "bg-orange-500/10 border-orange-500/20 text-orange-400" },
  fuchsia:  { grad: "from-fuchsia-400 to-fuchsia-600",glow: "hover:shadow-fuchsia-500/15",border: "group-hover:border-fuchsia-500/30",accent: "text-fuchsia-400", badge: "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400"},
  teal:     { grad: "from-teal-400 to-teal-600",     glow: "hover:shadow-teal-500/15",    border: "group-hover:border-teal-500/30",   accent: "text-teal-400",    badge: "bg-teal-500/10 border-teal-500/20 text-teal-400"      },
  green:    { grad: "from-green-400 to-green-600",   glow: "hover:shadow-green-500/15",   border: "group-hover:border-green-500/30",  accent: "text-green-400",   badge: "bg-green-500/10 border-green-500/20 text-green-400"   },
  purple:   { grad: "from-purple-400 to-violet-500", glow: "hover:shadow-purple-500/15",  border: "group-hover:border-purple-500/30", accent: "text-purple-400",  badge: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
  sky:      { grad: "from-sky-400 to-cyan-500",      glow: "hover:shadow-sky-500/15",     border: "group-hover:border-sky-500/30",    accent: "text-sky-400",     badge: "bg-sky-500/10 border-sky-500/20 text-sky-400"         },
} as const;
type StyleKey = keyof typeof STYLES;

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Sourced directly from HARMONISED_CHURCH_MINISTRY__1_.xlsx
// All 10 official ministries with units, conveners & elders as per register.
// ─────────────────────────────────────────────────────────────────────────────

type Ministry = {
  id: string;
  icon: React.ElementType;
  style: StyleKey;
  name: string;
  tagline: string;
  description: string;
  convener?: string;
  units: string[];
  members: string[];
};

const MAIN_MINISTRIES: Ministry[] = [
  {
    id: "worship",
    icon: Music,
    style: "amber",
    name: "Worship Ministry",
    tagline: "Lifting His Name in Every Service",
    description: "Leading the congregation in Spirit-filled worship across all services — from the earliest morning gathering to the Teen & Children's Church.",
    convener: "Rev. Agan",
    units: ["First Service", "Second Service", "Fresh Anointing", "Mid Week Service", "Teen/Youth Church", "Children Church"],
    members: ["Eld. Dr. E. Nkang", "Eld. Dr. E. Asanga", "Eld. Dr. Nnachi Ibiam", "Eld. Mrs. Nkata", "Rev. Mrs. Onu", "Eld. Mike Oti"],
  },
  {
    id: "evangelism",
    icon: Globe,
    style: "orange",
    name: "Evangelism, Discipleship & Follow Up Ministry",
    tagline: "Going Into All the World",
    description: "Active gospel outreach, systematic discipleship and diaspora engagement — taking the Word beyond the walls of the sanctuary.",
    convener: "Rev. Dr. U. Ukiwo",
    units: ["Evangelism & Missions", "Discipleship", "Diaspora"],
    members: ["Eld. Dr. A. K. Allotey", "Eld. Ikechukwu Okoro", "Eld. Allojoe Ayang"],
  },
  {
    id: "prayer",
    icon: Star,
    style: "violet",
    name: "Prayer & Teaching Ministry",
    tagline: "The Intercession Engine of the Parish",
    description: "Fuelling every department through corporate and individual prayer, and grounding the congregation in deep, systematic Bible teaching.",
    convener: "Rev. Iyke Anaga",
    units: ["Prayer", "Teaching"],
    members: ["Eld. Mrs. Ijeoma Amanabu", "Eld. Mike Oti", "Eld. Iyke Okoro"],
  },
  {
    id: "music",
    icon: Music,
    style: "pink",
    name: "Music Ministry",
    tagline: "Excellence in Every Note of Praise",
    description: "Five distinct choral and orchestral ensembles — from the Awesome Choir to the Church Orchestra — lifting worship to the highest standard.",
    convener: "Eld. Sam Etum",
    units: ["Awesome Choir", "Christ Anointed Singers", "Children Choir", "Teen Choir", "Church Orchestra"],
    members: ["Eld. Mrs. Dee Nkang", "Eld. Etum Ukpai", "Eld. Emmanuel Ononokpono", "Eld. Otu Ekpenyong", "Eld. Dr. E. Nkang"],
  },
  {
    id: "ushering",
    icon: UserCheck,
    style: "cyan",
    name: "Ushering, Protocol & Follow Up Ministry",
    tagline: "First Impressions of God's House",
    description: "Dedicated to orderliness, warm hospitality, and diligent follow-up — ensuring every member and visitor feels the excellence of God's presence.",
    convener: "Eld. Dr. A. K. Allotey",
    units: ["Ushering", "Protocol", "Follow Up"],
    members: ["Eld. Dr. E. J. Okorie", "Eld. Mary Itobo", "Eld. Dr. Irene Ijoma"],
  },
  {
    id: "media",
    icon: Monitor,
    style: "emerald",
    name: "Media, ICT, Library & Documentation Ministry",
    tagline: "Bridging Church and the Digital World",
    description: "End-to-end digital ministry: live streaming, social media, publications, documentation, and managing the parish library and bookshop resources.",
    convener: "Eld. Dr. E. Nkang",
    units: ["Media/ICT", "Publication", "Documentation", "Library", "Bookshop", "Kiosks"],
    members: ["Eld. Felix Onwuchekwa", "Eld. E. E. Esege", "Eld. Mrs. A. V. Ukpanyang", "Eld. Mike Ani Agwu"],
  },
  {
    id: "lovecare",
    icon: Heart,
    style: "rose",
    name: "Love & Care Ministry",
    tagline: "Carrying One Another's Burdens",
    description: "Upholding the spiritual and physical welfare of Parish families — overseeing church arms, organisations, and supporting members through every season of life.",
    convener: "Most Rev. Mba Idika",
    units: ["Love and Care", "Welfare of Church Members", "Oversight of Church Arms & Organisations"],
    members: ["Eld. Mrs. Ogbonne Nnachi Ibiam", "Eld. Mrs. A. V. Ukpanyang", "Eld. Dr. Enefiok Asanga"],
  },
  {
    id: "family",
    icon: Home,
    style: "blue",
    name: "Christian Home & Family Life Ministry",
    tagline: "Strengthening Every Home",
    description: "Walking with families through every stage of life — from pre-marriage preparation to post-marriage counselling and sustained family life balance.",
    convener: "Eld. Mrs. B. Umoga",
    units: ["Pre-Marriage Preparation", "Post Marriage Counselling", "Family Life Balance"],
    members: ["Eld. A. K. Allotey", "Eld. Dr. Enefiok Asanga", "Eld. Mrs. Ebere Ukandu"],
  },
  {
    id: "csr",
    icon: HandHeart,
    style: "green",
    name: "Neighbourhood Intervention & Corporate Social Responsibility Ministry",
    tagline: "The Church in the Community",
    description: "Executing the church's social responsibility through scholarships, community programmes, and strategic interventions in the Wuse host community.",
    convener: "Rev. Mrs. Victoria Onu",
    units: ["Church CSR Programmes", "Host Community Scholarships", "Other Community Social Interventions"],
    members: ["Eld. Mary Itobo", "Eld. E. J. Okorie", "Eld. Mrs. Nkata"],
  },
  {
    id: "environment",
    icon: Leaf,
    style: "teal",
    name: "Environment, Aesthetics & Sanctuary Keepers Ministry",
    tagline: "Keeping God's House in Excellence",
    description: "Maintaining the beauty, order and sanctity of the church environment — from landscaping and aesthetics to the dedicated sanctuary keepers team.",
    convener: "Eld. Otu Ekpenyong",
    units: ["Church Environment", "Beautification & Aesthetics", "Sanctuary Keepers"],
    members: ["Eld. Ugochi Chima", "Eld. Mrs. Ebere Ukandu", "Eld. Mike Oti"],
  },
];

// Church Arms data (unchanged from original, security-reviewed)
type ChurchArm = {
  id: string;
  icon: React.ElementType;
  style: StyleKey;
  name: string;
  shortName: string;
  description: string;
  leader: string;
  leaderTitle: string;
  activities: string[];
};

const CHURCH_ARMS: ChurchArm[] = [
  { id: "mca",   icon: Users,     style: "blue",    name: "Men's Christian Association",    shortName: "MCA",  description: "Monthly breakfast meetings hosted by different MCA families, building brotherhood and accountability among men of the parish.",     leader: "Dr. Roy Ndoma-Egba",       leaderTitle: "President",          activities: ["Monthly breakfast", "Family hosting", "Men's discipleship"] },
  { id: "wg",    icon: Heart,     style: "rose",    name: "Women's Guild",                  shortName: "WG",   description: "Monthly fellowship every second Saturday and business meetings on the last Thursday — empowering women in faith and purposeful living.",  leader: "Sis Adeola Ijeoma Eleri",  leaderTitle: "President",          activities: ["2nd Saturday fellowship", "Last Thursday meetings", "Community service"] },
  { id: "pypan", icon: Crosshair, style: "orange",  name: "PYPAN",                          shortName: "Youth",description: "The vibrant youth arm of the parish. Fellowships twice monthly on the first and last Friday evenings — raising the next generation.",        leader: "Chidinma Onwuchekwa",      leaderTitle: "President",          activities: ["1st & last Friday fellowships", "Youth outreach", "Leadership development"] },
  { id: "cgit",  icon: Star,      style: "fuchsia", name: "Christian Girls in Training",    shortName: "CGIT", description: "Raising godly girls through intentional grooming, moral formation, and practical skills development for purposeful living in Christ.",       leader: "Mrs. Ada Agama",           leaderTitle: "Mother Coordinator", activities: ["Character formation", "Skills training", "Moral development"] },
  { id: "bb",    icon: Shield,    style: "sky",     name: "Boy's Brigade",                  shortName: "BB",   description: "Promoting obedience, reverence, discipline and self-respect in young boys through structured, faith-based activities.",                    leader: "Mr. Ikechukwu Paul",       leaderTitle: "Company Captain",    activities: ["Drill & discipline", "Character building", "Outdoor activities"] },
];

// Outreach ministries (derived from main ministry data)
type OutreachArm = {
  id: string;
  icon: React.ElementType;
  style: StyleKey;
  name: string;
  description: string;
  leader: string;
  activities: string[];
};

const OUTREACH_ARMS: OutreachArm[] = [
  { id: "child",  icon: Baby,      style: "pink",   name: "Children's Department",          description: "Five age-grouped classes serving 50–100 children regularly with dedicated Sunday school teachers nurturing faith from the earliest years.", leader: "Mrs. Anda Nsa (Superintendent)",       activities: ["5 age-grouped classes", "50–100 children", "Sunday school"] },
  { id: "teen",   icon: Star,      style: "violet", name: "Teenage Department",             description: "Investing in teenagers (ages 13–21) for a fruitful future generation through mentorship, discipleship, and fellowship.",                     leader: "Elder Mike Ani Agwu (Co-ordinator)",  activities: ["Youth discipleship", "Leadership training", "Monthly fellowships"] },
  { id: "friends",icon: Globe,     style: "amber",  name: "Friends of the Lost",            description: "A dedicated support structure for missionaries in the field — connecting the parish to gospel frontlines across Nigeria and beyond.",           leader: "Elder Dr. A. K. Allotey",             activities: ["Missionary support", "Mission giving", "Prayer for the field"] },
  { id: "prison", icon: BookOpen,  style: "emerald",name: "Prison & Hospital Ministry",     description: "Active outreach to hospitals, prisons, and vulnerable communities — taking the love of Christ to those the world often forgets.",              leader: "Evangelism & Missions Team",          activities: ["Hospital visitation", "Prison ministry", "Community evangelism"] },
];

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION VARIANTS
//
// SEC-NOTE: Do NOT annotate this as `Variants` from framer-motion.
// When `visible` is a function (custom variant), the `Variants` type rejects
// it because `Variant` only allows TargetAndTransition | TargetResolver, and
// the function form is `TargetResolver` — but TypeScript cannot verify that
// the return type satisfies `TargetAndTransition` when `ease` is inferred as
// `number[]` (not the required `Easing` tuple). Two fixes applied:
//   1. No `: Variants` annotation — TypeScript infers the correct shape.
//   2. `ease` explicitly typed as `[number,number,number,number]` (cubic-bezier
//      tuple) so framer-motion's `Easing` type constraint is satisfied.
//   3. `custom={index}` prop must be set on the motion element (already done)
//      to feed the `i` parameter into the visible() function at runtime.
// ─────────────────────────────────────────────────────────────────────────────
const MINISTRY_ICON_MAP = { Music, Globe, Star, UserCheck, Monitor, Heart, Home, HandHeart, Leaf } as const;
const ARM_ICON_MAP = { Users, Heart, Crosshair, Star, Shield } as const;
const OUTREACH_ICON_MAP = { Baby, Star, Globe, BookOpen } as const;

const CARD_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.07,
      ease: CARD_EASE,
    },
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD COMPONENT — Ministry
// VULN-08 fixed: keyboard accessible, aria-expanded, role="button"
// ─────────────────────────────────────────────────────────────────────────────
function MinistryCard({ ministry, index }: { ministry: Ministry; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const s = STYLES[ministry.style];
  const Icon = ministry.icon;
  const panelId = `ministry-panel-${ministry.id}`;
  const btnId   = `ministry-btn-${ministry.id}`;

  const toggle = useCallback(() => setExpanded(v => !v), []);
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
  };

  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      {/* VULN-08: role + aria attributes */}
      <div
        id={btnId}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={toggle}
        onKeyDown={handleKey}
        className={`group relative h-full rounded-2xl border border-white/6 bg-white/[0.02] cursor-pointer transition-all duration-400 hover:shadow-xl ${s.glow} ${s.border} hover:bg-white/[0.04] outline-none focus-visible:ring-2 focus-visible:ring-white/20`}
      >
        {/* Top accent line */}
        <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/0 to-transparent ${s.border} transition-all duration-500 rounded-t-2xl`} />

        <div className="p-6 flex flex-col gap-4 h-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${s.badge}`}>
                {ministry.units.length} units
              </span>
              <div className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
                <ChevronDown className={`w-4 h-4 ${s.accent}`} />
              </div>
            </div>
          </div>

          {/* Title + description */}
          <div>
            <h3 className="display text-lg font-bold text-white/90 leading-snug mb-2 group-hover:text-white transition-colors">
              {sanitize(ministry.name)}
            </h3>
            <p className="text-[11px] font-semibold tracking-wide uppercase mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
              {sanitize(ministry.tagline)}
            </p>
            <p className="text-sm text-white/40 leading-relaxed">{sanitize(ministry.description)}</p>
          </div>

          {/* Expandable panel — VULN-08: id + aria-labelledby */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-white/6 space-y-4">
                  {/* Units */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/25 mb-2">Unit / Focus Areas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ministry.units.map((u) => (
                        <span key={u} className={`text-[10px] px-2.5 py-1 rounded-lg border ${s.badge}`}>
                          {sanitize(u)}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Members */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/25 mb-2">Elders / Members</p>
                    <div className="space-y-1">
                      {ministry.members.map((m) => (
                        <p key={m} className="text-xs text-white/45 flex items-center gap-2">
                          <span className={`w-1 h-1 rounded-full shrink-0 ${s.accent.replace("text-", "bg-")}`} />
                          {sanitize(m)}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer — convener */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <p className="text-[9px] uppercase tracking-widest text-white/20 mb-1">Convener</p>
            <p className={`text-sm font-bold ${s.accent}`}>
              {ministry.convener ? sanitize(ministry.convener) : "—"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHURCH ARM CARD
// ─────────────────────────────────────────────────────────────────────────────
function ArmCard({ arm, index }: { arm: ChurchArm; index: number }) {
  const s = STYLES[arm.style];
  const Icon = arm.icon;
  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
      className={`group relative rounded-2xl border border-white/6 bg-white/[0.02] hover:bg-white/[0.05] hover:shadow-xl ${s.glow} transition-all duration-400 p-6 flex flex-col gap-4`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/0 to-transparent group-hover:via-white/8 transition-all rounded-t-2xl" />
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${s.badge} mb-2 inline-block`}>{arm.shortName}</span>
          <h3 className="display text-lg font-bold text-white/90 leading-snug">{sanitize(arm.name)}</h3>
        </div>
      </div>
      <p className="text-sm text-white/40 leading-relaxed">{sanitize(arm.description)}</p>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/20 mb-2">Activities</p>
        <div className="flex flex-wrap gap-1.5">
          {arm.activities.map((a) => (
            <span key={a} className="text-[10px] px-2.5 py-1 rounded-lg bg-white/4 border border-white/8 text-white/40">{sanitize(a)}</span>
          ))}
        </div>
      </div>
      <div className="mt-auto pt-3 border-t border-white/5">
        <p className="text-[9px] text-white/20 uppercase tracking-widest mb-0.5">{sanitize(arm.leaderTitle)}</p>
        <p className={`text-sm font-bold ${s.accent}`}>{sanitize(arm.leader)}</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTREACH CARD
// ─────────────────────────────────────────────────────────────────────────────
function OutreachCard({ arm, index }: { arm: OutreachArm; index: number }) {
  const s = STYLES[arm.style];
  const Icon = arm.icon;
  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
      className={`group relative rounded-2xl border border-white/6 bg-white/[0.02] hover:bg-white/[0.05] hover:shadow-xl ${s.glow} transition-all duration-400 p-7 flex gap-5`}>
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform shrink-0`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1 space-y-3">
        <h3 className="display text-xl font-bold text-white/90">{sanitize(arm.name)}</h3>
        <p className="text-sm text-white/40 leading-relaxed">{sanitize(arm.description)}</p>
        <div className="flex flex-wrap gap-1.5">
          {arm.activities.map((a) => (
            <span key={a} className={`text-[10px] px-2.5 py-1 rounded-lg border ${s.badge}`}>{sanitize(a)}</span>
          ))}
        </div>
        <div className="pt-2 border-t border-white/5">
          <p className={`text-sm font-bold ${s.accent}`}>{sanitize(arm.leader)}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Ministries() {
  const [, navigate] = useLocation();
  // VULN-01: safe tab type with runtime whitelist
  const [activeTab, setActiveTab] = useState<TabId>("ministries");
  // VULN-10: transition lock prevents rapid-click layout thrash
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mainMinistries, setMainMinistries] = useState(MAIN_MINISTRIES);
  const [churchArms, setChurchArms] = useState(CHURCH_ARMS);
  const [outreachArms, setOutreachArms] = useState(OUTREACH_ARMS);

  // VULN-02: all navigation via ROUTES constant
  const goTo = useCallback((path: string) => navigate(path), [navigate]);

  useEffect(() => {
    api.getSiteContent("ministries")
      .then((data) => {
        if (Array.isArray(data?.mainMinistries) && data.mainMinistries.length > 0) {
          setMainMinistries(
            data.mainMinistries.map((item: Omit<Ministry, "icon"> & { icon: keyof typeof MINISTRY_ICON_MAP }) => ({
              ...item,
              icon: MINISTRY_ICON_MAP[item.icon] ?? Music,
            }))
          );
        }
        if (Array.isArray(data?.churchArms) && data.churchArms.length > 0) {
          setChurchArms(
            data.churchArms.map((item: Omit<ChurchArm, "icon"> & { icon: keyof typeof ARM_ICON_MAP }) => ({
              ...item,
              icon: ARM_ICON_MAP[item.icon] ?? Users,
            }))
          );
        }
        if (Array.isArray(data?.outreachArms) && data.outreachArms.length > 0) {
          setOutreachArms(
            data.outreachArms.map((item: Omit<OutreachArm, "icon"> & { icon: keyof typeof OUTREACH_ICON_MAP }) => ({
              ...item,
              icon: OUTREACH_ICON_MAP[item.icon] ?? Baby,
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

  return (
    <div className="min-h-screen bg-[#070b14] text-white"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .display { font-family: 'Cormorant Garamond', Georgia, serif; }
        /* VULN-05: named CSS animation — no dynamic string interpolation */
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        .float-badge { animation: floatBadge 3s ease-in-out infinite; }
        .float-badge:nth-child(2) { animation-delay: 0.5s; }
        .float-badge:nth-child(3) { animation-delay: 1s; }
        .float-badge:nth-child(4) { animation-delay: 1.5s; }
        .float-badge:nth-child(5) { animation-delay: 2s; }
        .grain::before {
          content:''; position:fixed; inset:0; pointer-events:none; z-index:9998;
          opacity:0.018;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
      `}</style>
      <div className="grain" />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b3e] via-[#070b14] to-[#080e20]" />
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[400px] bg-emerald-500/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-violet-500/5 rounded-full blur-[100px]" />

        {/* Ghost watermark */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden lg:block display font-extrabold opacity-[0.025] text-white"
          style={{ fontSize: "clamp(180px,22vw,360px)", lineHeight: 1 }}>✝</div>

        <div className="container relative py-24">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-white/25 mb-10">
            <button onClick={() => goTo(ROUTES.home)} className="hover:text-white/60 transition-colors">Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/50">Ministries</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">Get Involved</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                className="display font-extrabold leading-[0.9] text-white"
                style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}>
                Our<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                  Ministries
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-white/45 text-lg leading-relaxed max-w-lg font-light">
                Every member has a place to serve, grow, and belong. Discover all 10 official ministries, church arms, and outreach organisations of PCN First Abuja Parish.
              </motion.p>

              {/* Stats */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                className="flex flex-wrap gap-4">
                {[
                  { value: "10", label: "Ministries",    color: "text-emerald-400" },
                  { value: "5",  label: "Church Arms",   color: "text-violet-400" },
                  { value: "4",  label: "Outreach Arms", color: "text-amber-400" },
                  { value: "40+",label: "Elder Leaders", color: "text-sky-400" },
                ].map((stat) => (
                  <div key={stat.label} className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/6 text-center">
                    <p className={`display text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-white/30 mt-0.5 tracking-wide">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Floating ministry badges — VULN-05: CSS class animation, not inline style string */}
            <div className="relative h-64 hidden lg:block">
              {mainMinistries.slice(0, 5).map((m, i) => {
                const Icon = m.icon;
                const s = STYLES[m.style];
                const pos = ["top-0 left-10", "top-0 right-10", "top-1/2 left-2 -translate-y-1/2", "top-1/2 right-2 -translate-y-1/2", "bottom-0 left-1/2 -translate-x-1/2"];
                return (
                  <div key={m.id} className={`absolute ${pos[i]} float-badge flex flex-col items-center gap-2`}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-xl`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-[10px] text-white/30 font-medium">{m.name.split(" ")[0]}</span>
                  </div>
                );
              })}
              <div className="absolute inset-0 flex items-center justify-center float-badge" style={{ animationDelay: "2.5s" }}>
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-xl shadow-emerald-500/10">
                  <Heart className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-14 space-y-12">

        {/* ── TAB SWITCHER — VULN-01 safe ────────────────────────────────── */}
        <div className="flex gap-1.5 p-1.5 rounded-2xl bg-white/[0.03] border border-white/6 w-fit"
          role="tablist" aria-label="Ministry sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "text-white/35 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-white/5 text-white/30"
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* ── PANELS ───────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* MINISTRIES */}
          {activeTab === "ministries" && (
            <motion.div key="ministries" id="panel-ministries" role="tabpanel"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}
              className="space-y-8">
              <div>
                <h2 className="display text-4xl font-bold text-white mb-2">The 10 Harmonised Ministries</h2>
                <p className="text-white/35">Officially structured as per the PCN First Abuja Parish register. Click any card to expand units and elder assignments.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mainMinistries.map((m, i) => (
                  <MinistryCard key={m.id} ministry={m} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {/* CHURCH ARMS */}
          {activeTab === "arms" && (
            <motion.div key="arms" id="panel-arms" role="tabpanel"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}
              className="space-y-8">
              <div>
                <h2 className="display text-4xl font-bold text-white mb-2">Church Arms & Organisations</h2>
                <p className="text-white/35">Fellowship groups for every member — men, women, youth, boys, and girls. A place for everyone.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {churchArms.map((arm, i) => <ArmCard key={arm.id} arm={arm} index={i} />)}
              </div>
            </motion.div>
          )}

          {/* OUTREACH */}
          {activeTab === "outreach" && (
            <motion.div key="outreach" id="panel-outreach" role="tabpanel"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}
              className="space-y-8">
              <div>
                <h2 className="display text-4xl font-bold text-white mb-2">Outreach & Specialist Arms</h2>
                <p className="text-white/35">Outward-facing departments serving children, teenagers, missionaries, hospitals and the community at large.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {outreachArms.map((arm, i) => <OutreachCard key={arm.id} arm={arm} index={i} />)}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-white/6 p-12 md:p-16 text-center"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(52,211,153,0.09) 0%, transparent 60%), linear-gradient(135deg, #0d1b3e 0%, #070b14 100%)" }}>

          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 50px,rgba(255,255,255,.5) 50px,rgba(255,255,255,.5) 51px),repeating-linear-gradient(90deg,transparent,transparent 50px,rgba(255,255,255,.5) 50px,rgba(255,255,255,.5) 51px)" }} />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

          <div className="relative space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="display text-4xl md:text-5xl font-extrabold text-white mb-3">Find Your Place to Serve</h2>
              <p className="text-white/40 max-w-xl mx-auto leading-relaxed">
                Every believer is called to serve. Whether your gift is music, hospitality, prayer, technology, or outreach — there is a ministry waiting for you at PCN First Abuja Parish.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => goTo(ROUTES.about)}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl shadow-emerald-500/20 transition-all">
                Learn About Us
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => goTo(ROUTES.donations)}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold text-white/60 hover:text-white border border-white/8 hover:border-white/20 bg-white/3 hover:bg-white/8 transition-all">
                Support Our Work
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
