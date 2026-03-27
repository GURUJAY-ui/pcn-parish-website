import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { parseEventDescription } from "@/lib/event-details";
import { Calendar, ChevronRight, Clock, MapPin, Music, Star, Sun, Users, BookOpen, Heart, Zap } from "lucide-react";

type WeeklyActivity = {
  day: string;
  name: string;
  time: string;
  note?: string;
  icon: any;
  color: string;
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
  featured?: boolean;
  programName?: string;
  programDate?: string;
  itinerary?: Array<{ time: string; title: string; note?: string }>;
};

const weeklyActivities: WeeklyActivity[] = [
  { day: "Sunday", name: "Worship Services", time: "7:00 AM & 9:30 AM", note: "Main Sanctuary - Wuse II", icon: Sun, color: "from-amber-400 to-amber-600" },
  { day: "Monday", name: "House Fellowship", time: "6:00 PM", note: "Various homes across districts", icon: Heart, color: "from-rose-400 to-rose-600" },
  { day: "Tuesday", name: "Bible Study", time: "6:00 PM", note: "Various district meeting points", icon: BookOpen, color: "from-cyan-400 to-cyan-600" },
  { day: "Wednesday", name: "Midweek Service", time: "6:00 PM", note: "Main Sanctuary - Wuse II", icon: Star, color: "from-emerald-400 to-emerald-600" },
  { day: "Thursday", name: "E&MM Prayer", time: "6:00 AM", note: "First Thursday monthly", icon: Zap, color: "from-purple-400 to-purple-600" },
  { day: "Friday", name: "PYPAN Fellowship", time: "6:00 PM", note: "First and last Friday monthly", icon: Users, color: "from-orange-400 to-orange-600" },
  { day: "Saturday", name: "Choir / BB / WG Meetings", time: "Various", note: "Check ministry schedules", icon: Music, color: "from-teal-400 to-teal-600" },
];

const categoryStyles: Record<string, string> = {
  "Special Service": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Youth: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  Thanksgiving: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Women: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  Children: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  Men: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

const fallbackEvents: UpcomingEvent[] = [
  {
    id: 1,
    day: "15",
    month: "APR",
    title: "Easter Sunday Celebration",
    subtitle: "He is Risen!",
    time: "7:00 AM & 9:30 AM",
    location: "Main Sanctuary - Wuse II",
    description: "Join us for a glorious Easter Sunday celebration as we commemorate the resurrection of our Lord Jesus Christ.",
    category: "Special Service",
    categoryColor: categoryStyles["Special Service"],
    featured: true,
  },
  {
    id: 2,
    day: "22",
    month: "APR",
    title: "Youth Empowerment Summit",
    subtitle: "Raising Champions",
    time: "10:00 AM",
    location: "Fellowship Hall - Wuse II",
    description: "A transformative summit for young people focused on faith, leadership, and career growth.",
    category: "Youth",
    categoryColor: categoryStyles.Youth,
    featured: true,
  },
  {
    id: 3,
    day: "29",
    month: "APR",
    title: "Parish Thanksgiving Service",
    subtitle: "Counting Our Blessings",
    time: "9:00 AM",
    location: "Main Sanctuary - Wuse II",
    description: "Our quarterly parish thanksgiving service to celebrate God's faithfulness.",
    category: "Thanksgiving",
    categoryColor: categoryStyles.Thanksgiving,
    featured: true,
  },
];

function normalizeEvent(event: any): UpcomingEvent {
  const details = parseEventDescription(event.description);
  return {
    ...event,
    subtitle: event.subtitle || "",
    description: details.summary || event.description || "",
    categoryColor: event.categoryColor || categoryStyles[event.category] || "bg-white/10 text-white border-white/10",
    programName: details.programName,
    programDate: details.programDate,
    itinerary: details.itinerary,
  };
}

function ItineraryBlock({ event }: { event: UpcomingEvent }) {
  if (!event.programName && (!event.itinerary || event.itinerary.length === 0)) return null;

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
      {event.programName ? (
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">{event.programName}</p>
      ) : null}
      {event.programDate ? (
        <p className="mt-1 text-xs text-muted-foreground">{event.programDate}</p>
      ) : null}
      {event.itinerary && event.itinerary.length > 0 ? (
        <div className="mt-3 space-y-2">
          {event.itinerary.map((item, index) => (
            <div key={`${event.id}_${index}`} className="flex gap-3 text-xs">
              <span className="w-20 shrink-0 font-semibold text-cyan-400">{item.time || "-"}</span>
              <div>
                <p className="text-foreground">{item.title || item.note}</p>
                {item.note && item.title ? <p className="text-muted-foreground">{item.note}</p> : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Events() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"weekly" | "upcoming">("weekly");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>(fallbackEvents.map(normalizeEvent));

  useEffect(() => {
    api.getEvents()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setUpcomingEvents(data.map(normalizeEvent));
        }
      })
      .catch(() => {})
      .finally(() => setEventsLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = Number(params.get("event"));

    if (!eventId || Number.isNaN(eventId)) return;

    setActiveTab("upcoming");
    setExpandedId(eventId);
  }, []);

  useEffect(() => {
    if (eventsLoading || !expandedId) return;

    const timer = window.setTimeout(() => {
      const node = document.getElementById(`event-${expandedId}`);
      node?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [eventsLoading, expandedId]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden border-b border-white/10 py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-background to-purple-500/10" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />

        <div className="container relative">
          <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => navigate("/")} className="transition-colors hover:text-foreground">Home</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">Events</span>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Mark Your Calendar</span>
              </div>
              <h1 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-5xl font-bold leading-tight md:text-6xl">
                Events & <span className="text-cyan-400">Activities</span>
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Stay connected with everything happening at PCN First Abuja Parish, from weekly worship rhythms to full event programs and special celebrations.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center"><p className="text-2xl font-bold text-cyan-400">7</p><p className="text-xs text-muted-foreground">Weekly Activities</p></div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center"><p className="text-2xl font-bold text-amber-400">{upcomingEvents.length}</p><p className="text-xs text-muted-foreground">Upcoming Events</p></div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center"><p className="text-2xl font-bold text-emerald-400">Programs</p><p className="text-xs text-muted-foreground">Now Supported</p></div>
              </div>
            </div>

            <div className="hidden grid-cols-3 gap-3 lg:grid">
              {upcomingEvents.slice(0, 6).map((event, index) => (
                <div key={event.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center transition-all hover:bg-white/10">
                  <p className="text-3xl font-bold text-amber-400">{event.day}</p>
                  <p className="text-xs font-semibold text-muted-foreground">{event.month}</p>
                  <p className="mt-1 line-clamp-2 text-xs font-medium text-foreground">{event.subtitle || event.title}</p>
                  {index === 0 ? <p className="mt-2 text-[10px] uppercase tracking-widest text-cyan-400">Featured</p> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container space-y-12 py-16">
        <div className="flex w-fit gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5">
          {[
            { id: "weekly", label: "Weekly Activities" },
            { id: "upcoming", label: "Upcoming Events" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "weekly" | "upcoming")}
              className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab.id ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "weekly" ? (
          <div className="space-y-6">
            <div>
              <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-3xl font-bold">Weekly Activities</h2>
              <p className="text-muted-foreground">Our regular worship and fellowship rhythm all through the week.</p>
            </div>
            <div className="space-y-4">
              {weeklyActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.day} className="flex items-center gap-6">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${activity.color} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{activity.day}</p>
                          <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-lg font-bold">{activity.name}</h3>
                          {activity.note ? <p className="mt-1 text-xs text-muted-foreground">{activity.note}</p> : null}
                        </div>
                        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                          <Clock className="h-3.5 w-3.5 text-cyan-400" />
                          <span className="text-sm font-semibold text-cyan-400">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : eventsLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500/20 border-t-cyan-500" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-3xl font-bold">Upcoming Events</h2>
              <p className="text-muted-foreground">Special services, retreats, and event programs coming up.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {upcomingEvents.filter((event) => event.featured).map((event) => (
                <div
                  key={event.id}
                  id={`event-${event.id}`}
                  onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                  className="cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-[#2a3a80] bg-gradient-to-br from-[#1a2a6e] to-[#0f1a4a]">
                        <p className="text-xl font-bold leading-none text-amber-400">{event.day}</p>
                        <p className="text-xs font-semibold uppercase text-blue-300">{event.month}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${event.categoryColor}`}>{event.category}</span>
                    </div>
                    <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold leading-snug">{event.title}</h3>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-cyan-400" /> {event.time}</div>
                      <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-cyan-400" /> {event.location}</div>
                      {event.programDate ? <div className="flex items-center gap-2 text-emerald-400"><Calendar className="h-3.5 w-3.5" /> {event.programDate}</div> : null}
                    </div>
                    {expandedId === event.id ? (
                      <div className="space-y-4 border-t border-white/10 pt-3">
                        {event.description ? <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p> : null}
                        <ItineraryBlock event={event} />
                      </div>
                    ) : null}
                    <p className="text-xs text-cyan-400">{expandedId === event.id ? "Show less" : "Read more"}</p>
                  </div>
                </div>
              ))}
            </div>

            {upcomingEvents.filter((event) => !event.featured).length > 0 ? (
              <div className="space-y-3 pt-4">
                <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold text-muted-foreground">More Events</h3>
                {upcomingEvents.filter((event) => !event.featured).map((event) => (
                  <div
                    key={event.id}
                    id={`event-${event.id}`}
                    onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                    className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-white/20 hover:bg-white/8"
                  >
                    <div className="flex gap-5">
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-[#2a3a80] bg-gradient-to-br from-[#1a2a6e] to-[#0f1a4a]">
                        <p className="text-xl font-bold leading-none text-amber-400">{event.day}</p>
                        <p className="text-xs font-semibold uppercase text-blue-300">{event.month}</p>
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${event.categoryColor}`}>{event.category}</span>
                          {event.programName ? <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400">{event.programName}</span> : null}
                        </div>
                        <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold">{event.title}</h3>
                        {expandedId === event.id ? (
                          <div className="mt-3 space-y-3">
                            {event.description ? <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p> : null}
                            <ItineraryBlock event={event} />
                          </div>
                        ) : null}
                      </div>
                      <div className="space-y-1 text-right text-xs text-muted-foreground">
                        <div className="flex items-center justify-end gap-1.5"><Clock className="h-3 w-3" /> {event.time}</div>
                        <div className="flex items-center justify-end gap-1.5"><MapPin className="h-3 w-3" /> {event.location}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        <div className="relative overflow-hidden rounded-2xl border border-[#2a3a80] bg-gradient-to-br from-[#1a2a6e] to-[#0f1a4a] p-12 text-center text-white">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
          <div className="relative space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-xl shadow-cyan-500/20">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-4xl font-bold">Never Miss an Event</h2>
            <p className="mx-auto max-w-xl leading-relaxed text-blue-200">
              Stay connected with PCN First Abuja Parish. Follow our channels or contact the church office for current schedules and announcements.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a href="https://facebook.com/firstabujapresbyterian" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition-all hover:bg-blue-700">Follow on Facebook</a>
              <a href="mailto:pulpitfap@gmail.com" className="rounded-xl border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white transition-all hover:bg-white/20">Contact the Office</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
