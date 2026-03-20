import { Card } from "@/components/ui/card";
import { Crown, Church, Users, MapPin, Shield, BookOpen } from "lucide-react";

const congregations = [
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
  { name: "PCN JKC", minister: "Rev. Chika Utulor", role: "Associate Minister(Chaplin)" },
  { name: "PCN Waru", minister: "Evang. Sam Kalu", role: "Evangelist" },
];

const sessionMembers = [
  "Elder (Mrs) A.V. Ukpanyang", "Elder (Dr) Eniang Nkang", "Elder (Mrs) D. Nkang",
  "Elder (Mrs) B. Umoga", "Elder (Barr) E. J. Okorie","Elder Emmanuel Ononokpono",
  "Elder Dr. Enefiok A. Asanga", "Elder Felix O. Onwuchekwa",  "Elder (Mrs). Lucy Dickson", 
  "Elder Dr. Asuquo Allotey", "Elder (Mrs) Nnenna Ukonu", "Elder (Mrs) I. Amanambu",
  "Elder (Mrs) Ebere Ukandu", "Elder David Godwin Lamba", "Elder (Mrs) Promise Rabo", 
  "Elder Ikechukwu John Okoro","Elder Esege E. Esege", "Elder Okorie Agbafor", 
  "Elder (Mrs) Offiong Aliyu","Elder Dr. Irene Ijoma","Elder Mary Itobo", "Elder Allojoe Ayang", 
  "Elder Micheal Oti","Elder (Mrs) Ugochi Chima","Elder Mike Ani Agwu","Elder (Mrs) Ogbonne Nnachi-Ibiam",
  "Elder Barr. Efa Ita", "Elder Victor Nwakpa", "Elder Ukpai Orji Etum",
  "Elder Ngozi Obasi Ukonu","Elder Agatha Bature Salami","Elder (Mrs) Onyinyechi Nkata","Elder Patricia K. Igbalum", 
  "Elder Sunday Madu","Elder Ifenyi Nwano", "Elder Akuma Adi James", "Elder (Mrs) Lucy Eleanya", "Elder (Mrs) Precious Rabo",
];

const committees = [
  { name: "Finance & Stewardship", convener: "Elder Felix Onwuchekwa" },
  { name: "Building Committee", convener: "Engr. Charles Iheukwumere" },
  { name: "Project Implementation", convener: "Elder (Arc.) I. K. Umoga" },
  { name: "Education Committee", convener: "Elder A. O. Ogba" },
  { name: "Security Committee", convener: "Barr. Efut Okon (SAN)" },
  { name: "Medical Committee", convener: "Dr. Utibeabasi Urua" },
  { name: "Maintenance Committee", convener: "Engr. O. U. Ude" },
  { name: "Property / Assets", convener: "Barr. Akpabio Ekpa" },
];

function SectionHeader({ icon: Icon, title, color }: { icon: any; title: string; color: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-3xl font-bold">
        {title}
      </h2>
    </div>
  );
}

function LeaderCard({ name, role, accent = "cyan" }: { name: string; role: string; accent?: string }) {
  const colors: Record<string, string> = {
    cyan: "border-cyan-500/30 bg-cyan-500/5",
    amber: "border-amber-500/30 bg-amber-500/5",
    emerald: "border-emerald-500/30 bg-emerald-500/5",
    purple: "border-purple-500/30 bg-purple-500/5",
  };
  const dotColors: Record<string, string> = {
    cyan: "bg-cyan-400",
    amber: "bg-amber-400",
    emerald: "bg-emerald-400",
    purple: "bg-purple-400",
  };
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${colors[accent]}`}>
      <div className={`w-2 h-2 rounded-full ${dotColors[accent]} mt-2 shrink-0`} />
      <div>
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}

export default function Staff() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Hero Header */}
      <div className="relative overflow-hidden py-24 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-background to-emerald-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="container relative text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">Our People</span>
          </div>
          <h1 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-5xl md:text-6xl font-bold">
            Our Leadership
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet the dedicated servants leading PCN First Abuja Parish in worship, mission, and community.
          </p>
          <div className="flex flex-wrap justify-center gap-8 pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-cyan-400">12</p>
              <p className="text-sm text-muted-foreground">Congregations</p>
            </div>
            <div className="w-px bg-white/10 self-stretch hidden sm:block" />
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-400">38</p>
              <p className="text-sm text-muted-foreground">Session Members</p>
            </div>
            <div className="w-px bg-white/10 self-stretch hidden sm:block" />
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-400">8</p>
              <p className="text-sm text-muted-foreground">Board Committees</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16 space-y-20">

        {/* PCN Leadership */}
        <section>
          <SectionHeader icon={Crown} title="PCN Leadership" color="from-amber-400 to-amber-600" />
          <div className="grid md:grid-cols-2 gap-4">
            <LeaderCard name="His Eminence, Ekpenyong Nyong Akpanika" role="Prelate & Moderator of the General Assembly" accent="amber" />
            <LeaderCard name="Most Rev. Uche Dan-Okafor" role="Moderator of Abuja Synod" accent="amber" />
            <LeaderCard name="Rt Rev. Nwadike Okoronkwo" role="Moderator of Abuja Central Presbytery" accent="amber" />
          </div>
        </section>

        {/* Parish Leadership */}
        <section>
          <SectionHeader icon={Church} title="Parish Leadership" color="from-cyan-400 to-cyan-600" />
          <div className="grid md:grid-cols-3 gap-4">
            <LeaderCard name="Most. Rev. Mba Nwankwo Idika" role="Minister-in-Charge" accent="cyan" />
            <LeaderCard name="Rev. Agan Ekpo Agan" role="Associate Minister" accent="cyan" />           
            <LeaderCard name="Rev. Ikechukwu Anaga" role="Associate Minister" accent="cyan" />
            <LeaderCard name="Rev. Dr. Ukoha Ukiwo" role="Associate Minister" accent="cyan" />
            <LeaderCard name="Rev. Mrs. Victoria Onu" role="Associate Minister" accent="cyan" />
            <LeaderCard name="Elder Mrs. Akom Violet Ukpanyang" role="Session Clerk" accent="cyan" />
          </div>
        </section>

        {/* Board Executive */}
        <section>
          <SectionHeader icon={Shield} title="Board Executive Committee" color="from-emerald-400 to-emerald-600" />
          <div className="grid md:grid-cols-2 gap-4">
            <LeaderCard name="Elder Dr. Joseph E. Okorie" role="Board Chairman" accent="emerald" />
            <LeaderCard name="Bro. Duke Ezikpe Mma" role="Board Clerk" accent="emerald" />
            <LeaderCard name="Arc. Kingsley Okoro" role="Asst. Board Clerk" accent="emerald" />
            <LeaderCard name="Elder Allojoe Ayang" role="Board Treasurer" accent="emerald" />
            <LeaderCard name="Mrs Ugo Ijoma" role="Financial Secretary" accent="emerald" />
          </div>
        </section>

        {/* Congregations */}
        <section>
          <SectionHeader icon={MapPin} title="Congregations & Preaching Posts" color="from-purple-400 to-purple-600" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {congregations.map((c) => (
              <div key={c.name} className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <h3 className="font-bold text-sm">{c.name}</h3>
                </div>
                <p className="text-sm font-medium text-foreground pl-4">{c.minister}</p>
                <p className="text-xs text-muted-foreground pl-4">{c.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Session Members */}
        <section>
          <SectionHeader icon={Users} title="Kirk Session Members" color="from-cyan-400 to-emerald-500" />
          <Card className="glass-lg p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sessionMembers.map((name, i) => (
                <div key={name} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
                  <span className="text-xs text-muted-foreground w-6 text-right shrink-0">{i + 1}</span>
                  <span className="w-px h-4 bg-white/10 shrink-0" />
                  <span className="text-sm">{name}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Board Committees */}
        <section>
          <SectionHeader icon={BookOpen} title="Board Committees" color="from-rose-400 to-rose-600" />
          <div className="grid md:grid-cols-2 gap-4">
            {committees.map((c) => (
              <div key={c.name} className="flex items-start gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all">
                <div className="w-2 h-2 rounded-full bg-rose-400 mt-2 shrink-0" />
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">Convener: {c.convener}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}