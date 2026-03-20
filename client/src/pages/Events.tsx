import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import {
  ChevronRight, Calendar, Clock, MapPin,
  Sun, Moon, Star, Music, Users, BookOpen, Heart, Zap
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type WeeklyActivity = {
  day: string;
  name: string;
  time: string;
  icon: any;
  color: string;
  note?: string;
};

type UpcomingEvent = {
  id: number;
  day: string;
  month: string;
  title: string;
  subtitle?: string;
  time: string;
  location: string;
  description: string;
  category: string;
  categoryColor: string;
  icon?: any;
  featured?: boolean;
};

// ─── Static fallback data ─────────────────────────────────────────────────────

const staticUpcomingEvents: UpcomingEvent[] = [
  {
    id: 1, day: "15", month: "APR", title: "Easter Sunday Celebration",
    subtitle: "He is Risen!", time: "7:00 AM & 9:30 AM", location: "Main Sanctuary — Wuse II",
    description: "Join us for a glorious Easter Sunday celebration as we commemorate the resurrection of our Lord Jesus Christ. Special choir ministration and communion service.",
    category: "Special Service", categoryColor: "bg-amber-500/15 text-amber-400 border-amber-500/20", featured: true,
  },
  {
    id: 2, day: "22", month: "APR", title: "Youth Empowerment Summit",
    subtitle: "Raising Champions", time: "10:00 AM", location: "Fellowship Hall — Wuse II",
    description: "A transformative summit for young people aged 16–35. Topics include career development, faith, and leadership.",
    category: "Youth", categoryColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20", featured: true,
  },
  {
    id: 3, day: "29", month: "APR", title: "Parish Thanksgiving Service",
    subtitle: "Counting Our Blessings", time: "9:00 AM", location: "Main Sanctuary — Wuse II",
    description: "Our quarterly parish thanksgiving service. Come with a heart full of gratitude and give God the glory for His faithfulness.",
    category: "Thanksgiving", categoryColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", featured: true,
  },
  {
    id: 4, day: "5", month: "MAY", title: "Women's Fellowship Retreat",
    subtitle: "", time: "8:00 AM – 4:00 PM", location: "TBC — Contact church office",
    description: "A full-day retreat for all women of the parish. A day of prayer, fellowship, and spiritual refreshment.",
    category: "Women", categoryColor: "bg-rose-500/15 text-rose-400 border-rose-500/20", featured: false,
  },
  {
    id: 5, day: "12", month: "MAY", title: "Children's Sunday",
    subtitle: "", time: "9:30 AM", location: "Main Sanctuary — Wuse II",
    description: "Special service celebrating the children of our parish. Fun activities, special performances, and a children-focused sermon.",
    category: "Children", categoryColor: "bg-purple-500/15 text-purple-400 border-purple-500/20", featured: false,
  },
  {
    id: 6, day: "19", month: "MAY", title: "Men's Fellowship Breakfast",
    subtitle: "", time: "7:30 AM", location: "Fellowship Hall — Wuse II",
    description: "Monthly men's fellowship breakfast meeting. All men of the parish are welcome.",
    category: "Men", categoryColor: "bg-blue-500/15 text-blue-400 border-blue-500/20", featured: false,
  },
];

const dayColors = [
  "from-amber-400 to-amber-600",
  "from-cyan-400 to-cyan-600",
  "from-emerald-400 to-emerald-600",
  "from-rose-400 to-rose-600",
  "from-purple-400 to-purple-600",
  "from-blue-400 to-blue-600",
];

// ─── Weekly Activities ────────────────────────────────────────────────────────

const weeklyActivities: WeeklyActivity[] = [
  { day: "Sunday", name: "Worship Services", time: "7:00 AM & 9:30 AM", icon: Sun, color: "from-amber-400 to-amber-600", note: "Main Sanctuary — Wuse II" },
  { day: "Monday", name: "House Fellowship", time: "6:00 PM", icon: Heart, color: "from-rose-400 to-rose-600", note: "Various homes across districts" },
  { day: "Tuesday", name: "Bible Study", time: "6:00 PM", icon: BookOpen, color: "from-cyan-400 to-cyan-600", note: "Various district meeting points" },
  { day: "Wednesday", name: "Midweek Service", time: "6:00 PM", icon: Star, color: "from-emerald-400 to-emerald-600", note: "Main Sanctuary — Wuse II" },
  { day: "Thursday", name: "E&MM Prayer", time: "6:00 AM", icon: Zap, color: "from-purple-400 to-purple-600", note: "First Thursday of every month" },
  { day: "Friday", name: "PYPAN Fellowship", time: "6:00 PM", icon: Users, color: "from-orange-400 to-orange-600", note: "First and last Friday monthly" },
  { day: "Saturday", name: "Choir / BB / WG Meetings", time: "Various", icon: Music, color: "from-teal-400 to-teal-600", note: "Check department schedules" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Events() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"weekly" | "upcoming">("weekly");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [upcomingEventsList, setUpcomingEventsList] = useState<UpcomingEvent[]>(staticUpcomingEvents);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    api.getEvents()
      .then((data) => {
        if (data && data.length > 0) setUpcomingEventsList(data);
      })
      .catch(() => {}) // keep static fallback silently
      .finally(() => setEventsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Hero */}
      <div className="relative overflow-hidden py-28 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-background to-purple-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

        <div className="container relative">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Events</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">Mark Your Calendar</span>
              </div>
              <h1 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-5xl md:text-6xl font-bold leading-tight">
                Events & <span className="text-cyan-400">Activities</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Stay connected with everything happening at PCN First Abuja Parish — from weekly services to special celebrations.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                {[
                  { value: "7", label: "Weekly Activities", color: "text-cyan-400" },
                  { value: "6+", label: "Upcoming Events", color: "text-amber-400" },
                  { value: "365", label: "Days of Worship", color: "text-emerald-400" },
                ].map((stat) => (
                  <div key={stat.label} className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini calendar visual */}
            <div className="hidden lg:grid grid-cols-3 gap-3">
              {upcomingEventsList.slice(0, 6).map((event, i) => (
                <div key={event.id}
                  className={`rounded-2xl p-4 text-center border border-white/10 bg-white/5 hover:bg-white/10 transition-all ${i === 0 ? "border-amber-500/30 bg-amber-500/5" : ""}`}>
                  <p className={`text-3xl font-bold bg-gradient-to-br ${dayColors[i] ?? dayColors[0]} bg-clip-text text-transparent`}>
                    {event.day}
                  </p>
                  <p className="text-xs text-muted-foreground font-semibold">{event.month}</p>
                  <p className="text-xs text-foreground font-medium mt-1 leading-tight line-clamp-2">{event.subtitle || event.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16 space-y-12">

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 w-fit">
          {[
            { id: "weekly", label: "Weekly Activities" },
            { id: "upcoming", label: "Upcoming Events" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Weekly Tab ── */}
        {activeTab === "weekly" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-3xl font-bold">Weekly Activities</h2>
              <p className="text-muted-foreground">Our regular schedule — every week, every month, all year round.</p>
            </div>

            <div className="relative">
              <div className="absolute left-[28px] top-6 bottom-6 w-px bg-gradient-to-b from-cyan-500/50 via-purple-500/30 to-transparent hidden md:block" />
              <div className="space-y-4">
                {weeklyActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.day} className="flex gap-6 items-center group">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activity.color} flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{activity.day}</span>
                            </div>
                            <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-lg font-bold">{activity.name}</h3>
                            {activity.note && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" /> {activity.note}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-sm font-semibold text-cyan-400">{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-amber-400 text-sm mb-1">📍 Note on Tuesday Bible Study</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The Tuesday Bible Study holds at <strong className="text-foreground">various district meeting points</strong> across the parish. Please contact your district elder or the church office to find your nearest venue.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Upcoming Tab ── */}
        {activeTab === "upcoming" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-3xl font-bold">Upcoming Events</h2>
              <p className="text-muted-foreground">Special services, retreats, and celebrations coming up.</p>
            </div>

            {eventsLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* Featured Events */}
                <div className="grid md:grid-cols-3 gap-6">
                  {upcomingEventsList.filter((e) => e.featured).map((event) => (
                    <div key={event.id}
                      className="relative rounded-2xl border border-white/10 bg-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300 overflow-hidden group cursor-pointer"
                      onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}>
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="text-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#1a2a6e] to-[#0f1a4a] border border-[#2a3a80] flex flex-col items-center justify-center">
                            <p className="text-xl font-bold text-amber-400 leading-none">{event.day}</p>
                            <p className="text-xs text-blue-300 font-semibold uppercase">{event.month}</p>
                          </div>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${event.categoryColor}`}>
                            {event.category}
                          </span>
                        </div>
                        <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
                          className="text-xl font-bold leading-snug group-hover:text-cyan-400 transition-colors">
                          {event.title}
                        </h3>
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" /> {event.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {event.location}
                          </div>
                        </div>
                        {expandedId === event.id && (
                          <p className="text-sm text-muted-foreground leading-relaxed border-t border-white/10 pt-3">
                            {event.description}
                          </p>
                        )}
                        <p className="text-xs text-cyan-400">
                          {expandedId === event.id ? "Show less ↑" : "Read more ↓"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* More Events List */}
                {upcomingEventsList.filter((e) => !e.featured).length > 0 && (
                  <div className="space-y-3 pt-4">
                    <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold text-muted-foreground">More Events</h3>
                    {upcomingEventsList.filter((e) => !e.featured).map((event) => (
                      <div key={event.id}
                        className="flex gap-5 items-center p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8 transition-all cursor-pointer group"
                        onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}>
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1a2a6e] to-[#0f1a4a] border border-[#2a3a80] flex flex-col items-center justify-center shrink-0">
                          <p className="text-xl font-bold text-amber-400 leading-none">{event.day}</p>
                          <p className="text-xs text-blue-300 font-semibold uppercase">{event.month}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${event.categoryColor}`}>{event.category}</span>
                          </div>
                          <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold group-hover:text-cyan-400 transition-colors">{event.title}</h3>
                          {expandedId === event.id && (
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{event.description}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-end">
                            <Clock className="w-3 h-3" /> {event.time}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-end">
                            <MapPin className="w-3 h-3" /> {event.location.split("—")[0].trim()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2a6e] to-[#0f1a4a] border border-[#2a3a80] p-12 text-white text-center space-y-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/20">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-4xl font-bold">Never Miss an Event</h2>
          <p className="text-blue-200 max-w-xl mx-auto leading-relaxed">
            Stay connected with PCN First Abuja Parish. Follow us on social media or contact the church office for the latest updates and announcements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://facebook.com/firstabujapresbyterian" target="_blank" rel="noopener noreferrer"
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all">
              Follow on Facebook
            </a>
            <a href="mailto:pulpitfap@gmail.com"
              className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all">
              Contact the Office
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
