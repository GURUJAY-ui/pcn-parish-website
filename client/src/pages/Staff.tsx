/**
 * Staff.tsx — PCN First Abuja Parish · Leadership
 * Liquid-glass redesign with full light/dark support.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, BriefcaseBusiness, MapPin, Phone, ShieldCheck, Sparkles, Users } from "lucide-react";
import { api } from "@/lib/api";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import { useGlassTheme, SERIF, type GlassTheme } from "@/lib/glass";

type CommitteeLead = { title: string; name: string; phone?: string };
type Leader = { name: string; role: string };
type Congregation = { name: string; minister: string; role: string };
type Committee = { id: number; name: string; duties: string[]; leads: CommitteeLead[] };

const pcnLeadership: Leader[] = [
  { name: "His Eminence, Ekpenyong Nyong Akpanika", role: "Prelate & Moderator of the General Assembly" },
  { name: "Most Rev. Uche Dan-Okafor", role: "Moderator of Abuja Synod" },
  { name: "Rt Rev. Nwadike Okoronkwo", role: "Moderator of Abuja Central Presbytery" },
];

const parishLeadership: Leader[] = [
  { name: "Most. Rev. Mba Nwankwo Idika", role: "Minister-in-Charge" },
  { name: "Rev. Agan Ekpo Agan", role: "Associate Minister" },
  { name: "Rev. Ikechukwu Anaga", role: "Associate Minister" },
  { name: "Rev. Dr. Ukoha Ukiwo", role: "Associate Minister" },
  { name: "Rev. Mrs. Victoria Onu", role: "Associate Minister" },
  { name: "Elder Mrs. Akom Violet Ukpanyang", role: "Session Clerk" },
];

const boardExecutive: Leader[] = [
  { name: "Elder Dr. Joseph E. Okorie", role: "Board Chairman" },
  { name: "Bro. Duke Ezikpe Mma", role: "Board Clerk" },
  { name: "Arc. Kingsley Okoro", role: "Asst. Board Clerk" },
  { name: "Elder Allojoe Ayang", role: "Board Treasurer" },
  { name: "Mrs Ugo Ijoma", role: "Financial Secretary" },
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

const fallbackStats = [
  { label: "Congregations", value: "12" },
  { label: "Session Members", value: "39" },
  { label: "Board Committees", value: "13" },
];

// ─── Shared bits ──────────────────────────────────────────────────
function SectionHeader({ title, eyebrow, icon: Icon, t }: { title: string; eyebrow: string; icon: React.ElementType; t: GlassTheme }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}
      className="mb-8 flex items-center gap-4">
      <div className={`${t.glass} flex h-12 w-12 items-center justify-center rounded-full ${t.ink70}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className={`${t.label} text-[10px] uppercase tracking-[0.35em] mb-1`}>{eyebrow}</p>
        <h2 style={SERIF} className={`text-3xl md:text-4xl ${t.ink} tracking-tight`}>{title}</h2>
      </div>
    </motion.div>
  );
}

function LeaderCard({ leader, index, t }: { leader: Leader; index: number; t: GlassTheme }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: (index % 3) * 0.08 }}
      className={`${t.glass} rounded-3xl p-6`}>
      <p style={SERIF} className={`text-xl ${t.ink} tracking-tight`}>{leader.name}</p>
      <p className={`mt-2 text-sm ${t.ink50}`}>{leader.role}</p>
    </motion.div>
  );
}

function CongregationCard({ congregation, index, t }: { congregation: Congregation; index: number; t: GlassTheme }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: (index % 3) * 0.08 }}
      className={`${t.glass} rounded-3xl p-6`}>
      <p style={SERIF} className={`text-lg ${t.ink} tracking-tight`}>{congregation.name}</p>
      <p className={`mt-3 text-sm ${t.ink70}`}>{congregation.minister}</p>
      <p className={`text-xs ${t.ink40}`}>{congregation.role}</p>
    </motion.div>
  );
}

function CommitteeCard({ committee, index, t }: { committee: Committee; index: number; t: GlassTheme }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, delay: (index % 3) * 0.1 }}
      className={`${t.glass} rounded-3xl p-7`}>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <span className={`${t.glass} inline-flex items-center rounded-full px-3 py-1 text-[10px] ${t.label} uppercase tracking-[0.28em]`}>
              Committee {committee.id}
            </span>
            <h3 style={SERIF} className={`text-2xl ${t.ink} tracking-tight`}>{committee.name}</h3>
          </div>
          <div className={`${t.glass} flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${t.ink70}`}>
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-3">
          <div className={`flex items-center gap-2 text-[10px] ${t.label} uppercase tracking-[0.3em]`}>
            <BriefcaseBusiness className="h-3.5 w-3.5" /> Duties
          </div>
          <div className="flex flex-wrap gap-2">
            {committee.duties.map((duty) => (
              <span key={duty} className={`${t.glass} rounded-full px-3 py-2 text-xs leading-relaxed ${t.ink60}`}>{duty}</span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className={`flex items-center gap-2 text-[10px] ${t.label} uppercase tracking-[0.3em]`}>
            <BookOpen className="h-3.5 w-3.5" /> Convener Details
          </div>
          <div className="space-y-3">
            {committee.leads.map((lead) => (
              <div key={`${committee.id}-${lead.title}-${lead.name}`} className={`${t.glass} rounded-2xl p-4`}>
                <p className={`${t.ink40} text-[10px] uppercase tracking-[0.28em]`}>{lead.title}</p>
                <p className={`mt-2 text-base ${t.ink}`}>{lead.name}</p>
                {lead.phone ? (
                  <a href={`tel:${lead.phone}`} className={`mt-3 inline-flex items-center gap-2 text-sm ${t.label} hover:opacity-70 transition-opacity`}>
                    <Phone className="h-3.5 w-3.5" /> {lead.phone}
                  </a>
                ) : (
                  <p className={`mt-3 text-sm ${t.ink30}`}>Phone not listed</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function Staff() {
  const t = useGlassTheme();
  const [committees, setCommittees] = useState<Committee[]>(fallbackCommittees);
  const [stats, setStats] = useState<{ label: string; value: string }[]>(fallbackStats);

  useEffect(() => {
    api.getSiteContent("staff")
      .then((data) => {
        if (Array.isArray(data?.committees) && data.committees.length > 0) setCommittees(data.committees);
        if (Array.isArray(data?.stats) && data.stats.length > 0) setStats(data.stats);
      })
      .catch(() => {});
  }, []);

  return (
    <div className={`page-shell min-h-screen ${t.pageBg} ${t.ink}`}>
      <SiteNav />

      {/* HERO */}
      <section className={`relative ${t.pageBg} pt-36 md:pt-44 pb-12 md:pb-16 px-6 overflow-hidden`}>
        <div className={`absolute inset-0 ${t.radial}`} />
        <div className="relative max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className={`${t.glass} inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6`}>
            <Sparkles className={`w-3.5 h-3.5 ${t.label}`} />
            <span className={`${t.label} text-[10px] uppercase tracking-[0.25em]`}>Leadership Structure</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            style={SERIF} className={`text-4xl md:text-6xl lg:text-7xl ${t.ink} tracking-tight leading-[1.1] mb-6`}>
            Our <em className={t.em}>leadership.</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className={`${t.ink50} text-base md:text-lg leading-relaxed max-w-2xl mb-10`}>
            Meet the spiritual, administrative, and governance leaders serving PCN First Abuja Parish,
            together with the 2026 board committees coordinating the practical work that strengthens parish life.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-3">
            {stats.map((s) => (
              <div key={s.label} className={`${t.glass} rounded-2xl px-5 py-3 text-center`}>
                <p style={SERIF} className={`text-2xl ${t.ink}`}>{s.value}</p>
                <p className={`${t.ink40} text-[10px] uppercase tracking-widest mt-0.5`}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }}
          className={`${t.glass} rounded-3xl p-8 md:p-10 max-w-3xl`}>
          <p className={`${t.label} text-[10px] uppercase tracking-[0.4em] mb-3`}>Leadership Directory 2026</p>
          <h2 style={SERIF} className={`text-3xl md:text-4xl ${t.ink} tracking-tight mb-4`}>
            Parish leadership & <em className={t.em}>board committees.</em>
          </h2>
          <p className={`${t.ink50} text-base leading-relaxed`}>
            A structured overview of parish leadership, congregational oversight, session membership, and the
            2026 board committees serving governance, welfare, development, stewardship, digital presence, and
            mission expansion across First Abuja Parish.
          </p>
        </motion.div>
      </section>

      {/* Leadership sections */}
      <section className="pb-12 px-6">
        <div className="mx-auto max-w-6xl space-y-16">
          <div>
            <SectionHeader title="PCN Leadership" eyebrow="Church Governance" icon={ShieldCheck} t={t} />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {pcnLeadership.map((l, i) => <LeaderCard key={l.name} leader={l} index={i} t={t} />)}
            </div>
          </div>

          <div>
            <SectionHeader title="Parish Leadership" eyebrow="Pastoral Team" icon={Sparkles} t={t} />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {parishLeadership.map((l, i) => <LeaderCard key={l.name} leader={l} index={i} t={t} />)}
            </div>
          </div>

          <div>
            <SectionHeader title="Board Executive Committee" eyebrow="Administration" icon={BriefcaseBusiness} t={t} />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {boardExecutive.map((l, i) => <LeaderCard key={l.name} leader={l} index={i} t={t} />)}
            </div>
          </div>

          <div>
            <SectionHeader title="Congregations & Preaching Posts" eyebrow="Parish Spread" icon={MapPin} t={t} />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {congregations.map((c, i) => <CongregationCard key={c.name} congregation={c} index={i} t={t} />)}
            </div>
          </div>

          <div>
            <SectionHeader title="Kirk Session Members" eyebrow="Session" icon={Users} t={t} />
            <div className={`${t.glass} rounded-3xl p-6 md:p-8`}>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {sessionMembers.map((member, i) => (
                  <div key={member} className={`${t.glass} flex items-center gap-3 rounded-2xl px-4 py-3`}>
                    <span className={`w-7 shrink-0 text-right text-xs ${t.ink40}`}>{i + 1}</span>
                    <span className={`h-4 w-px shrink-0 ${t.L ? "bg-[#132744]/15" : "bg-white/15"}`} />
                    <span className={`text-sm ${t.ink70}`}>{member}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Committees */}
      <section className="pb-24 px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeader title="Board Committees" eyebrow="2026 Committee Directory" icon={ShieldCheck} t={t} />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {committees.map((c, i) => <CommitteeCard key={c.id} committee={c} index={i} t={t} />)}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
