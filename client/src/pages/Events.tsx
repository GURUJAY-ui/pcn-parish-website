/**
 * Events.tsx — weekly activities + upcoming events (API-driven).
 * Liquid-glass redesign; deep-link expand (?event=id), itinerary
 * parsing and tab logic unchanged.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { parseEventDescription } from "@/lib/event-details";
import { Calendar, Clock, MapPin, Music, Star, Sun, Users, BookOpen, Heart, Zap } from "lucide-react";
import { useGlassTheme, SERIF } from "@/lib/glass";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

type WeeklyActivity = {
  day: string;
  name: string;
  time: string;
  note?: string;
  icon: any;
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
  { day: "Sunday", name: "Worship Services", time: "7:00 AM & 9:30 AM", note: "Main Sanctuary - Wuse II", icon: Sun },
  { day: "Monday", name: "House Fellowship", time: "6:00 PM", note: "Various homes across districts", icon: Heart },
  { day: "Tuesday", name: "Bible Study", time: "6:00 PM", note: "Various district meeting points", icon: BookOpen },
  { day: "Wednesday", name: "Midweek Service", time: "6:00 PM", note: "Main Sanctuary - Wuse II", icon: Star },
  { day: "Thursday", name: "E&MM Prayer", time: "6:00 AM", note: "First Thursday monthly", icon: Zap },
  { day: "Friday", name: "PYPAN Fellowship", time: "6:00 PM", note: "First and last Friday monthly", icon: Users },
  { day: "Saturday", name: "Choir / BB / WG Meetings", time: "Various", note: "Check ministry schedules", icon: Music },
];

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
    categoryColor: "",
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
    categoryColor: "",
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
    categoryColor: "",
    featured: true,
  },
];

function normalizeEvent(event: any): UpcomingEvent {
  const details = parseEventDescription(event.description);
  return {
    ...event,
    subtitle: event.subtitle || "",
    description: details.summary || event.description || "",
    categoryColor: event.categoryColor || "",
    programName: details.programName,
    programDate: details.programDate,
    itinerary: details.itinerary,
  };
}

export default function Events() {
  const t = useGlassTheme();
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

  function ItineraryBlock({ event }: { event: UpcomingEvent }) {
    if (!event.programName && (!event.itinerary || event.itinerary.length === 0)) return null;
    return (
      <div className={`${t.glass} rounded-2xl p-4`}>
        {event.programName ? (
          <p className={`${t.label} text-xs font-medium uppercase tracking-widest`}>{event.programName}</p>
        ) : null}
        {event.programDate ? (
          <p className={`mt-1 text-xs ${t.ink40}`}>{event.programDate}</p>
        ) : null}
        {event.itinerary && event.itinerary.length > 0 ? (
          <div className="mt-3 space-y-2">
            {event.itinerary.map((item, index) => (
              <div key={`${event.id}_${index}`} className="flex gap-3 text-xs">
                <span className={`w-20 shrink-0 font-medium ${t.label}`}>{item.time || "-"}</span>
                <div>
                  <p className={t.ink70}>{item.title || item.note}</p>
                  {item.note && item.title ? <p className={t.ink40}>{item.note}</p> : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  const dateBadge = (event: UpcomingEvent) => (
    <div className={`${t.glass} flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl`}>
      <p style={SERIF} className={`text-xl leading-none ${t.ink}`}>{event.day}</p>
      <p className={`text-[10px] font-medium uppercase tracking-widest ${t.label}`}>{event.month}</p>
    </div>
  );

  const categoryPill = (label: string) => (
    <span className={`${t.glass} rounded-full px-3 py-1 text-[10px] uppercase tracking-widest ${t.ink60}`}>{label}</span>
  );

  return (
    <div className={`page-shell min-h-screen ${t.pageBg} ${t.ink}`}>
      <SiteNav />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className={`relative ${t.pageBg} pt-36 md:pt-44 pb-12 md:pb-16 px-6 overflow-hidden`}>
        <div className={`absolute inset-0 ${t.radial}`} />
        <div className="relative max-w-6xl mx-auto grid items-center gap-12 lg:grid-cols-2">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`${t.label} text-sm tracking-widest uppercase mb-6`}>
              Mark Your Calendar
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              style={SERIF}
              className={`text-5xl md:text-7xl ${t.ink} tracking-tight leading-[1.05] mb-6`}>
              Events & <em className={t.em}>activities.</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className={`${t.ink50} text-base md:text-lg leading-relaxed max-w-xl`}>
              Stay connected with everything happening at PCN First Abuja Parish, from weekly worship
              rhythms to full event programs and special celebrations.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="hidden grid-cols-3 gap-3 lg:grid">
            {upcomingEvents.slice(0, 6).map((event, index) => (
              <div key={event.id} className={`${t.glass} rounded-2xl p-4 text-center`}>
                <p style={SERIF} className={`text-3xl ${t.ink}`}>{event.day}</p>
                <p className={`text-xs ${t.label} uppercase tracking-widest`}>{event.month}</p>
                <p className={`mt-1 line-clamp-2 text-xs ${t.ink60}`}>{event.subtitle || event.title}</p>
                {index === 0 ? <p className={`mt-2 text-[10px] uppercase tracking-widest ${t.ink40}`}>Featured</p> : null}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className={`${t.pageBg} pb-24 px-6`}>
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Tabs */}
          <div className={`${t.glass} flex w-fit gap-1 rounded-full p-1.5`}>
            {[
              { id: "weekly", label: "Weekly Activities" },
              { id: "upcoming", label: "Upcoming Events" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "weekly" | "upcoming")}
                className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.id ? t.btnPrimary : `${t.ink60} ${t.inkHover}`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "weekly" ? (
            <div className="space-y-8">
              <div>
                <h2 style={SERIF} className={`text-3xl md:text-4xl ${t.ink} tracking-tight`}>
                  Our weekly <em className={t.em}>rhythm.</em>
                </h2>
                <p className={`${t.ink50} mt-2`}>Regular worship and fellowship all through the week.</p>
              </div>
              <div className="space-y-4">
                {weeklyActivities.map((activity, i) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div key={activity.day}
                      initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
                      className="flex items-center gap-5">
                      <div className={`${t.glass} flex h-14 w-14 shrink-0 items-center justify-center rounded-full`}>
                        <Icon className={`h-5 w-5 ${t.ink70}`} />
                      </div>
                      <div className={`${t.glass} flex-1 rounded-3xl p-5`}>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className={`text-xs uppercase tracking-widest ${t.label}`}>{activity.day}</p>
                            <h3 style={SERIF} className={`text-xl ${t.ink} tracking-tight`}>{activity.name}</h3>
                            {activity.note ? <p className={`mt-1 text-xs ${t.ink40}`}>{activity.note}</p> : null}
                          </div>
                          <div className={`${t.glass} flex items-center gap-1.5 rounded-full px-4 py-2`}>
                            <Clock className={`h-3.5 w-3.5 ${t.ink40}`} />
                            <span className={`text-sm ${t.ink}`}>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : eventsLoading ? (
            <div className="flex justify-center py-12">
              <div className={`h-10 w-10 animate-spin rounded-full border-2 ${t.L ? "border-[#132744]/15 border-t-[#132744]" : "border-white/15 border-t-white"}`} />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 style={SERIF} className={`text-3xl md:text-4xl ${t.ink} tracking-tight`}>
                  Coming <em className={t.em}>up.</em>
                </h2>
                <p className={`${t.ink50} mt-2`}>Special services, retreats, and event programs.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {upcomingEvents.filter((event) => event.featured).map((event) => (
                  <div
                    key={event.id}
                    id={`event-${event.id}`}
                    onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                    className={`${t.glass} cursor-pointer overflow-hidden rounded-3xl transition-all ${t.hoverGlass}`}
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        {dateBadge(event)}
                        {categoryPill(event.category)}
                      </div>
                      <h3 style={SERIF} className={`text-2xl ${t.ink} tracking-tight leading-snug`}>{event.title}</h3>
                      <div className={`space-y-1.5 text-xs ${t.ink50}`}>
                        <div className="flex items-center gap-2"><Clock className={`h-3.5 w-3.5 ${t.ink40}`} /> {event.time}</div>
                        <div className="flex items-center gap-2"><MapPin className={`h-3.5 w-3.5 ${t.ink40}`} /> {event.location}</div>
                        {event.programDate ? <div className={`flex items-center gap-2 ${t.label}`}><Calendar className="h-3.5 w-3.5" /> {event.programDate}</div> : null}
                      </div>
                      {expandedId === event.id ? (
                        <div className={`space-y-4 border-t ${t.divider} pt-3`}>
                          {event.description ? <p className={`text-sm leading-relaxed ${t.ink50}`}>{event.description}</p> : null}
                          <ItineraryBlock event={event} />
                        </div>
                      ) : null}
                      <p className={`text-xs ${t.label}`}>{expandedId === event.id ? "Show less" : "Read more"}</p>
                    </div>
                  </div>
                ))}
              </div>

              {upcomingEvents.filter((event) => !event.featured).length > 0 ? (
                <div className="space-y-3 pt-4">
                  <h3 style={SERIF} className={`text-2xl ${t.ink60} tracking-tight`}>More events</h3>
                  {upcomingEvents.filter((event) => !event.featured).map((event) => (
                    <div
                      key={event.id}
                      id={`event-${event.id}`}
                      onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                      className={`${t.glass} cursor-pointer rounded-3xl p-5 transition-all ${t.hoverGlass}`}
                    >
                      <div className="flex gap-5">
                        {dateBadge(event)}
                        <div className="flex-1">
                          <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            {categoryPill(event.category)}
                            {event.programName ? categoryPill(event.programName) : null}
                          </div>
                          <h3 style={SERIF} className={`text-xl ${t.ink} tracking-tight`}>{event.title}</h3>
                          {expandedId === event.id ? (
                            <div className="mt-3 space-y-3">
                              {event.description ? <p className={`text-sm leading-relaxed ${t.ink50}`}>{event.description}</p> : null}
                              <ItineraryBlock event={event} />
                            </div>
                          ) : null}
                        </div>
                        <div className={`space-y-1 text-right text-xs ${t.ink40}`}>
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

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8 }}
            className={`${t.glass} rounded-3xl p-10 md:p-14 text-center`}>
            <h2 style={SERIF} className={`text-3xl md:text-5xl ${t.ink} tracking-tight mb-4`}>
              Never miss an <em className={t.em}>event.</em>
            </h2>
            <p className={`${t.ink50} mx-auto max-w-xl leading-relaxed text-sm md:text-base mb-8`}>
              Stay connected with PCN First Abuja Parish. Follow our channels or contact the church office
              for current schedules and announcements.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <a href="https://facebook.com/pcnfap" target="_blank" rel="noopener noreferrer"
                className={`${t.btnPrimary} rounded-full px-8 py-3 text-sm font-medium transition-colors`}>
                Follow on Facebook
              </a>
              <a href="mailto:pulpitfap@gmail.com"
                className={`${t.glass} rounded-full px-8 py-3 ${t.ink} text-sm font-medium ${t.hoverGlass} transition-colors`}>
                Contact the Office
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
