import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import {
  ChevronRight, Users, Music, Shield, Monitor, Baby,
  Heart, Globe, BookOpen, Star, UserCheck, Crosshair, HandHeart
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const departments = [
  {
    id: "children",
    icon: Baby,
    color: "from-pink-400 to-pink-600",
    glow: "hover:shadow-pink-500/10",
    border: "hover:border-pink-500/40",
    accent: "text-pink-400",
    badge: "bg-pink-500/10 border-pink-500/20 text-pink-400",
    name: "Children's Department",
    ageRange: "Ages 0 – 13",
    description: "Classes grouped into five levels with dedicated teachers nurturing faith from the earliest years.",
    details: "About 160–220 children attend regularly, making this one of the most vibrant departments in the parish.",
    leader: "Mrs. Anda Nsa",
    leaderTitle: "Superintendent",
    highlights: ["5 age-grouped classes", "160–220 children", "Dedicated Sunday school"],
  },
  {
    id: "teenage",
    icon: Star,
    color: "from-violet-400 to-violet-600",
    glow: "hover:shadow-violet-500/10",
    border: "hover:border-violet-500/40",
    accent: "text-violet-400",
    badge: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    name: "Teenage Department",
    ageRange: "Ages 13 – 21",
    description: "Investing in teenagers for a fruitful future generation through mentorship, discipleship, and fellowship.",
    details: "A space where young people discover their identity in Christ and are equipped for leadership.",
    leader: "Elder Mike Ani Agwu",
    leaderTitle: "Co-ordinator",
    highlights: ["Youth discipleship", "Leadership training", "Monthly fellowships"],
  },
  {
    id: "music",
    icon: Music,
    color: "from-amber-400 to-amber-600",
    glow: "hover:shadow-amber-500/10",
    border: "hover:border-amber-500/40",
    accent: "text-amber-400",
    badge: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    name: "Music Ministry",
    ageRange: "Classical Choir & CAS",
    description: "The Classical Choir and Christ Anointed Singers (Doxology) lead the congregation in worship every Sunday.",
    details: "Music is the heartbeat of our worship experience — blending traditional hymns with contemporary praise.",
    leader: "Elder Ukpai Orji Etum",
    leaderTitle: "Supervising-Elder",
    highlights: ["Classical Choir", "Christ Anointed Singers", "Doxology ensemble"],
  },
  {
    id: "ushering",
    icon: UserCheck,
    color: "from-cyan-400 to-cyan-600",
    glow: "hover:shadow-cyan-500/10",
    border: "hover:border-cyan-500/40",
    accent: "text-cyan-400",
    badge: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    name: "Ushering Department",
    ageRange: "Service & Order",
    description: "Dedicated to maintaining orderliness and creating a warm, welcoming atmosphere during all church services.",
    details: "Our ushers are the first point of contact — trained to serve with grace, excellence, and hospitality.",
    leader: "Bro. Ogba Ogba",
    leaderTitle: "Chief Usher",
    highlights: ["Service coordination", "Guest welcoming", "Orderly conduct"],
  },
  {
    id: "media",
    icon: Monitor,
    color: "from-emerald-400 to-emerald-600",
    glow: "hover:shadow-emerald-500/10",
    border: "hover:border-emerald-500/40",
    accent: "text-emerald-400",
    badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    name: "Media & ICT Unit",
    ageRange: "Technology & Communications",
    description: "Handling technical/media content, social media management, and publishing the Kingdom Life Digest.",
    details: "Bridging the gap between the church and the digital world through innovative media solutions.",
    leader: "Chukwuma Amanambu",
    leaderTitle: "Chairman",
    highlights: ["Live streaming", "Social media", "Kingdom Life Digest"],
  },
];

const arms = [
  {
    id: "mca",
    icon: Users,
    color: "from-blue-400 to-blue-600",
    accent: "text-blue-400",
    badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    name: "Men's Christian Association",
    shortName: "MCA",
    description: "Monthly breakfast meetings hosted by different MCA families, building brotherhood and accountability among men.",
    leader: "Dr. Roy Ndoma-Egba",
    leaderTitle: "President",
    activities: ["Monthly breakfast meetings", "Family hosting", "Men's discipleship"],
  },
  {
    id: "wg",
    icon: Heart,
    color: "from-rose-400 to-rose-600",
    accent: "text-rose-400",
    badge: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    name: "Women's Guild",
    shortName: "WG",
    description: "Monthly fellowship every second Saturday and business meetings on the last Thursday — empowering women in faith and life.",
    leader: "Sis Adeola Ijeoma Eleri",
    leaderTitle: "President",
    activities: ["2nd Saturday fellowship", "Last Thursday meetings", "Community service"],
  },
  {
    id: "pypan",
    icon: Crosshair,
    color: "from-orange-400 to-orange-600",
    accent: "text-orange-400",
    badge: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    name: "PYPAN",
    shortName: "Youth Arm",
    description: "The vibrant youth arm of the parish. Fellowships twice monthly on the first and last Friday evenings.",
    leader: "Chidinma Onwuchekwa",
    leaderTitle: "President",
    activities: ["1st & last Friday fellowships", "Youth outreach", "Leadership development"],
  },
  {
    id: "cgit",
    icon: Star,
    color: "from-fuchsia-400 to-fuchsia-600",
    accent: "text-fuchsia-400",
    badge: "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400",
    name: "Christian Girls in Training",
    shortName: "CGIT",
    description: "Raising godly girls through intentional grooming, morals, and skills development for a purposeful life.",
    leader: "Mrs. Ada Agama",
    leaderTitle: "Mother Coordinator",
    activities: ["Character formation", "Skills training", "Moral development"],
  },
  {
    id: "bb",
    icon: Shield,
    color: "from-teal-400 to-teal-600",
    accent: "text-teal-400",
    badge: "bg-teal-500/10 border-teal-500/20 text-teal-400",
    name: "Boy's Brigade",
    shortName: "BB",
    description: "Promoting obedience, reverence, discipline and self-respect in young boys through structured activities.",
    leader: "Mr. Ikechukwu Paul",
    leaderTitle: "Company Captain",
    activities: ["Drill & discipline", "Character building", "Outdoor activities"],
  },
];

const ministryArms = [
  {
    icon: HandHeart,
    color: "from-cyan-400 to-emerald-500",
    accent: "text-cyan-400",
    name: "Christian Home & Family Life",
    description: "Upholding the spiritual welfare of Parish families through counseling, support, and community.",
    leader: "Elder (Mrs.) Bassey Umoga",
    activities: ["Counseling", "Family Week", "Retreats"],
  },
  {
    icon: Globe,
    color: "from-amber-400 to-orange-500",
    accent: "text-amber-400",
    name: "Friends of the Lost",
    description: "A support structure for missionaries in the field — connecting the parish with gospel frontlines.",
    leader: "Elder Dr. A. K. Allotey",
    activities: ["Missionary support", "Visitations", "Mission giving"],
  },
  {
    icon: BookOpen,
    color: "from-rose-400 to-pink-500",
    accent: "text-rose-400",
    name: "Evangelism & Missions",
    description: "Prayer and fasting on first Thursdays, with active outreach to hospitals, prisons, and communities.",
    leader: "Elder Dr. A. K. Allotey",
    activities: ["Evangelism", "Hospital visitation", "Prison ministry"],
  },
  {
    icon: Star,
    color: "from-purple-400 to-violet-500",
    accent: "text-purple-400",
    name: "Prayer Ministry",
    description: "The intercession engine of the parish — fuelling every department through corporate and individual prayer.",
    leader: "Parish Prayer Team",
    activities: ["Prayer meetings", "Vigils", "Intercession chains"],
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Ministries() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"departments" | "arms" | "ministry">("departments");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Hero */}
      <div className="relative overflow-hidden py-28 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-background to-purple-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="container relative">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Ministries</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">Get Involved</span>
              </div>
              <h1 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-5xl md:text-6xl font-bold leading-tight">
                Our Ministries
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every member has a place to serve, grow, and belong. Discover the departments, arms, and organisations that make PCN First Abuja Parish a complete community.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                {[
                  { value: "5", label: "Departments" },
                  { value: "5", label: "Church Arms" },
                  { value: "4", label: "Ministry Arms" },
                ].map((stat) => (
                  <div key={stat.label} className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating ministry badges */}
          <div className="relative h-64 hidden lg:block">
            {departments.slice(0, 5).map((d, i) => {
              const Icon = d.icon;
              const positions = [
                "top-0 left-8", "top-0 right-8", "top-1/2 left-0 -translate-y-1/2",
                "top-1/2 right-0 -translate-y-1/2", "bottom-0 left-1/2 -translate-x-1/2"
              ];
              const delays = ["0s", "0.4s", "0.8s", "1.2s", "1.6s"];
              return (
                <div
                  key={d.id}
                  className={`absolute ${positions[i]} flex flex-col items-center gap-2 group`}
                  style={{
                    animation: `floatBadge 3s ease-in-out infinite`,
                    animationDelay: delays[i],
                  }}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${d.color} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">{d.name.split(" ")[0]}</span>
                </div>
              );
            })}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ animation: "floatBadge 3s ease-in-out infinite", animationDelay: "2s" }}
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Heart className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      <div className="container py-16 space-y-16">

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 w-fit">
          {[
            { id: "departments", label: "Departments & Units" },
            { id: "arms", label: "Church Arms" },
            { id: "ministry", label: "Ministry Arms" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Departments Tab ── */}
        {activeTab === "departments" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-3xl font-bold">Departments & Units</h2>
              <p className="text-muted-foreground">Structured ministries serving every age group and need within the parish.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept) => {
                const Icon = dept.icon;
                const isExpanded = expandedId === dept.id;
                return (
                  <Card
                    key={dept.id}
                    className={`glass-lg p-6 flex flex-col gap-4 transition-all duration-300 hover:shadow-xl ${dept.glow} ${dept.border} cursor-pointer`}
                    onClick={() => setExpandedId(isExpanded ? null : dept.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${dept.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${dept.badge}`}>
                        {dept.ageRange}
                      </span>
                    </div>

                    <div>
                      <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold mb-2">{dept.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{dept.description}</p>
                    </div>

                    {isExpanded && (
                      <div className="space-y-4 pt-2 border-t border-white/10">
                        <p className="text-sm text-muted-foreground leading-relaxed">{dept.details}</p>
                        <div className="flex flex-wrap gap-2">
                          {dept.highlights.map((h) => (
                            <span key={h} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-muted-foreground">{h}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">{dept.leaderTitle}</p>
                          <p className={`text-sm font-semibold ${dept.accent}`}>{dept.leader}</p>
                        </div>
                        <span className={`text-xs ${dept.accent}`}>{isExpanded ? "Show less ↑" : "Learn more ↓"}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Church Arms Tab ── */}
        {activeTab === "arms" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-3xl font-bold">Church Arms & Organisations</h2>
              <p className="text-muted-foreground">Fellowship groups for every member — men, women, youth, boys, and girls.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {arms.map((arm) => {
                const Icon = arm.icon;
                return (
                  <Card key={arm.id} className="glass-lg p-6 flex flex-col gap-4 hover:border-white/20 transition-all duration-300 group">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${arm.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${arm.badge} mb-2 inline-block`}>
                          {arm.shortName}
                        </span>
                        <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-lg font-bold leading-snug">{arm.name}</h3>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">{arm.description}</p>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Activities</p>
                      <div className="flex flex-wrap gap-2">
                        {arm.activities.map((a) => (
                          <span key={a} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-muted-foreground">{a}</span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-white/10">
                      <p className="text-xs text-muted-foreground">{arm.leaderTitle}</p>
                      <p className={`text-sm font-semibold ${arm.accent}`}>{arm.leader}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Ministry Arms Tab ── */}
        {activeTab === "ministry" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-3xl font-bold">Ministry Arms</h2>
              <p className="text-muted-foreground">Outward-facing ministries serving the community, missionaries, and the lost.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {ministryArms.map((m, i) => {
                const Icon = m.icon;
                return (
                  <Card key={i} className="glass-lg p-8 flex gap-6 hover:border-white/20 transition-all duration-300 group">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-xl shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold">{m.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {m.activities.map((a) => (
                          <span key={a} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-muted-foreground">{a}</span>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <p className={`text-sm font-semibold ${m.accent}`}>{m.leader}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Get Involved CTA */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2a6e] to-[#0f1a4a] border border-[#2a3a80] p-12 text-white text-center space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-4xl font-bold mb-3">
              Find Your Place to Serve
            </h2>
            <p className="text-blue-200 max-w-xl mx-auto leading-relaxed">
              Every believer is called to serve. Whether your gift is music, hospitality, prayer, or technology — there is a ministry waiting for you at PCN First Abuja Parish.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <button
                onClick={() => navigate("/about")}
                className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all shadow-lg shadow-emerald-500/20"
              >
                Learn About Us
              </button>
              <button
                onClick={() => navigate("/donations")}
                className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all"
              >
                Support Our Work
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}