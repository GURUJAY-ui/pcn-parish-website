/**
 * Contact.tsx — PCN First Abuja Parish
 * MotionSites contact-page spec: full-viewport rounded media card with
 * a floating white contact form (service chips, success state), plus
 * info/service-times/socials sections. Both forms (message + prayer)
 * keep their real API submit logic.
 */

import { useEffect, useState } from "react";
import { Phone, Mail, MapPin, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useGlassTheme, SERIF, SOCIAL_LINKS, isAllowedExternalUrl, SocialIcon } from "@/lib/glass";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { api } from "@/lib/api";

const TOPICS = [
  "New Visitor", "Prayer Request", "Baptism", "Wedding", "Counselling",
  "Membership", "Giving", "Volunteering", "Other",
] as const;

// Contact hero background video — parish footage in client/public/assets.
const CONTACT_VIDEO_URL = "/assets/hero.mp4";

type ContactCard = {
  label: string;
  lines: string[];
  href: string;
  icon: typeof Phone;
};

const fallbackCards: ContactCard[] = [
  { icon: Phone,  label: "Phone",   lines: ["+234 (0) 8151111877", "+234 (0) 817 5777773"], href: "tel:+2348151111877" },
  { icon: MapPin, label: "Address", lines: ["No. 5 Boke Close, off Sakono Street,", "Opposite AP Plaza, Wuse II, Abuja"], href: "https://maps.google.com/?q=Wuse+II+Abuja" },
  { icon: Mail,   label: "Email",   lines: ["pulpitfap@gmail.com"], href: "mailto:pulpitfap@gmail.com" },
];

const fallbackServiceTimes = [
  { day: "Sunday", time: "7:00 AM & 9:30 AM" },
  { day: "Tuesday", time: "6:00 PM - Bible Study" },
  { day: "Wednesday", time: "6:00 PM - Midweek" },
];

export default function Contact() {
  const t = useGlassTheme();
  const [activeForm, setActiveForm] = useState<"message" | "prayer">("message");
  const [messageSent, setMessageSent] = useState(false);
  const [prayerSent, setPrayerSent] = useState(false);
  const [submittingMessage, setSubmittingMessage] = useState(false);
  const [submittingPrayer, setSubmittingPrayer] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [prayerError, setPrayerError] = useState("");
  const [contactCards, setContactCards] = useState<ContactCard[]>(fallbackCards);
  const [serviceTimes, setServiceTimes] = useState(fallbackServiceTimes);

  const [selected, setSelected] = useState<string[]>([]);
  const [messageForm, setMessageForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [prayerForm, setPrayerForm] = useState({ name: "", email: "", request: "", anonymous: false });

  useEffect(() => {
    api.getSiteContent("contact")
      .then((data) => {
        if (Array.isArray(data?.cards) && data.cards.length === 3) {
          setContactCards([
            { ...data.cards[0], icon: Phone },
            { ...data.cards[1], icon: MapPin },
            { ...data.cards[2], icon: Mail },
          ]);
        }
        if (Array.isArray(data?.serviceTimes) && data.serviceTimes.length > 0) setServiceTimes(data.serviceTimes);
      })
      .catch(() => {});
  }, []);

  const toggleTopic = (topic: string) =>
    setSelected((p) => (p.includes(topic) ? p.filter((x) => x !== topic) : [...p, topic]));

  const handleMessage = async () => {
    if (!messageForm.message.trim()) return;
    setSubmittingMessage(true);
    setMessageError("");
    try {
      await api.createContact({
        ...messageForm,
        subject: selected.join(", "),
        type: "message",
        anonymous: false,
      });
      setMessageSent(true);
      setMessageForm({ name: "", email: "", phone: "", message: "" });
      setSelected([]);
      setTimeout(() => setMessageSent(false), 6000);
    } catch {
      setMessageError("We couldn't send your message right now. Please try again.");
    } finally {
      setSubmittingMessage(false);
    }
  };

  const handlePrayer = async () => {
    if (!prayerForm.request.trim()) return;
    setSubmittingPrayer(true);
    setPrayerError("");
    try {
      await api.createContact({
        name: prayerForm.anonymous ? "" : prayerForm.name,
        email: prayerForm.anonymous ? "" : prayerForm.email,
        message: prayerForm.request,
        type: "prayer",
        anonymous: prayerForm.anonymous,
      });
      setPrayerSent(true);
      setPrayerForm({ name: "", email: "", request: "", anonymous: false });
      setTimeout(() => setPrayerSent(false), 6000);
    } catch {
      setPrayerError("We couldn't submit your prayer request right now. Please try again.");
    } finally {
      setSubmittingPrayer(false);
    }
  };

  const inputCls =
    "flex-1 min-w-0 text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition";

  const success = (heading: string, sub: string) => (
    <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-xl">✓</div>
      <p className="text-base font-semibold text-gray-900">{heading}</p>
      <p className="text-sm text-gray-500">{sub}</p>
    </div>
  );

  return (
    <div className={`page-shell min-h-screen ${t.pageBg} ${t.ink}`}>
      <SiteNav />

      {/* ── Hero card: video background + headline + form ─────────── */}
      <div className="p-3 sm:p-4 md:p-6 pt-24 sm:pt-24 md:pt-28">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[calc(100vh-120px)] lg:min-h-[calc(100vh-136px)]">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={CONTACT_VIDEO_URL}
            autoPlay muted loop playsInline preload="auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />

          <div className="relative z-10 flex flex-col min-h-[calc(100vh-120px)] lg:min-h-[calc(100vh-136px)] p-4 sm:p-6 md:p-8 gap-6">
            <div className="flex-1 min-h-[2rem]" />

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              {/* Headline */}
              <p className="text-white text-3xl sm:text-4xl xl:text-5xl font-medium leading-tight drop-shadow-lg lg:max-w-lg xl:max-w-2xl shrink-0">
                We'd love to hear from you
                <br />
                and pray{" "}
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>
                  with you.
                </span>
              </p>

              {/* Contact form card */}
              <div className="w-full lg:w-[min(480px,45%)] shrink-0">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden p-4 sm:p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <h1 className="text-xl sm:text-2xl font-semibold text-black tracking-tight">Say hello! 👋</h1>
                    <div className="flex gap-1 bg-gray-50 rounded-xl p-1">
                      {([
                        { id: "message", label: "Message" },
                        { id: "prayer",  label: "Prayer" },
                      ] as const).map((tab) => (
                        <button key={tab.id} onClick={() => setActiveForm(tab.id)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                            activeForm === tab.id ? "bg-black text-white" : "text-gray-500 hover:text-gray-900"}`}>
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email + socials row */}
                  <div className="flex flex-row items-center justify-between gap-3 bg-gray-50 rounded-2xl px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-400">Drop us a line</p>
                      <a href="mailto:pulpitfap@gmail.com" className="text-blue-600 text-sm font-semibold hover:underline truncate block">
                        pulpitfap@gmail.com
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {SOCIAL_LINKS.map((s) =>
                        isAllowedExternalUrl(s.href) ? (
                          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                            title={s.label} aria-label={s.label}
                            className="w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center hover:opacity-80 transition-opacity">
                            <SocialIcon s={s} className="w-3.5 h-3.5" />
                          </a>
                        ) : null
                      )}
                    </div>
                  </div>

                  {/* OR divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-400 font-medium text-sm">OR</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Message form */}
                  {activeForm === "message" && (
                    messageSent ? success("You're all set!", "Expect a reply within 24–48 hours.") : (
                      <div className="flex flex-col gap-4">
                        <label className="text-sm font-medium text-black">Tell us how we can help</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input value={messageForm.name} onChange={(e) => setMessageForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Full name" className={inputCls} />
                          <input type="email" value={messageForm.email} onChange={(e) => setMessageForm((p) => ({ ...p, email: e.target.value }))}
                            placeholder="Email" className={inputCls} />
                        </div>
                        <input value={messageForm.phone} onChange={(e) => setMessageForm((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="Phone (optional)" className={inputCls} />
                        <textarea rows={4} value={messageForm.message}
                          onChange={(e) => setMessageForm((p) => ({ ...p, message: e.target.value }))}
                          placeholder="What's on your mind..." className={`${inputCls} resize-none`} />

                        <div>
                          <p className="text-sm font-medium text-black mb-2">I'm reaching out about...</p>
                          <div className="flex flex-wrap gap-1.5">
                            {TOPICS.map((topic) => (
                              <button key={topic} type="button" onClick={() => toggleTopic(topic)}
                                className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
                                  selected.includes(topic)
                                    ? "bg-gray-100 text-black border-black"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"}`}>
                                {topic}
                              </button>
                            ))}
                          </div>
                        </div>

                        {messageError && <p className="text-sm text-rose-500">{messageError}</p>}
                        <button onClick={handleMessage} disabled={submittingMessage || !messageForm.message.trim()}
                          className="w-full bg-black text-white text-sm font-semibold py-3 rounded-2xl hover:bg-gray-800 transition-colors disabled:opacity-60">
                          {submittingMessage ? "Sending..." : "Send my message"}
                        </button>
                      </div>
                    )
                  )}

                  {/* Prayer form */}
                  {activeForm === "prayer" && (
                    prayerSent ? success("Prayer request received.", "We are praying with you. ♥") : (
                      <div className="flex flex-col gap-4">
                        <label className="text-sm font-medium text-black">Share what's on your heart</label>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={prayerForm.anonymous}
                            onChange={(e) => setPrayerForm((p) => ({ ...p, anonymous: e.target.checked }))}
                            className="w-4 h-4 accent-black" />
                          <span className="text-sm text-gray-600">Submit anonymously</span>
                        </label>
                        {!prayerForm.anonymous && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input value={prayerForm.name} onChange={(e) => setPrayerForm((p) => ({ ...p, name: e.target.value }))}
                              placeholder="Full name" className={inputCls} />
                            <input type="email" value={prayerForm.email} onChange={(e) => setPrayerForm((p) => ({ ...p, email: e.target.value }))}
                              placeholder="Email (optional)" className={inputCls} />
                          </div>
                        )}
                        <textarea rows={4} value={prayerForm.request}
                          onChange={(e) => setPrayerForm((p) => ({ ...p, request: e.target.value }))}
                          placeholder="Share your prayer request..." className={`${inputCls} resize-none`} />
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Your prayer request is treated with the utmost confidentiality and shared only with our prayer team.
                        </p>
                        {prayerError && <p className="text-sm text-rose-500">{prayerError}</p>}
                        <button onClick={handlePrayer} disabled={submittingPrayer || !prayerForm.request.trim()}
                          className="w-full bg-black text-white text-sm font-semibold py-3 rounded-2xl hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                          <Heart className="w-4 h-4" /> {submittingPrayer ? "Submitting..." : "Submit prayer request"}
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Info cards + service times ─────────────────────────────── */}
      <section className={`relative ${t.pageBg} py-20 md:py-28 px-6 overflow-hidden`}>
        <div className={`absolute inset-0 ${t.radialMid}`} />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }}
            className="flex items-end justify-between mb-12 md:mb-16">
            <h2 style={SERIF} className={`text-3xl md:text-5xl ${t.ink} tracking-tight`}>
              Find <em className={t.em}>us.</em>
            </h2>
            <span className={`hidden md:block ${t.label} text-sm tracking-widest uppercase`}>Get in Touch</span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {contactCards.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.a key={item.label} href={item.href}
                  target={item.label === "Address" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay: i * 0.12 }}
                  className={`${t.glass} rounded-3xl p-8 block group`}>
                  <div className={`${t.glass} rounded-full w-12 h-12 flex items-center justify-center mb-5`}>
                    <Icon className={`w-5 h-5 ${t.ink70}`} />
                  </div>
                  <p className={`${t.label} text-xs tracking-widest uppercase mb-3`}>{item.label}</p>
                  {item.lines.map((line) => (
                    <p key={line} className={`text-sm ${t.ink70} leading-relaxed`}>{line}</p>
                  ))}
                </motion.a>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8 }}
            className={`${t.glass} rounded-3xl p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-8`}>
            <div className="md:w-1/3">
              <p className={`${t.label} text-xs tracking-widest uppercase mb-3`}>Worship With Us</p>
              <h3 style={SERIF} className={`${t.ink} text-2xl md:text-3xl tracking-tight`}>Service times.</h3>
            </div>
            <div className="flex-1 grid sm:grid-cols-3 gap-6">
              {serviceTimes.map((service) => (
                <div key={service.day}>
                  <p className={`${t.ink} text-base font-medium mb-1`}>{service.day}</p>
                  <p className={`${t.ink50} text-sm`}>{service.time}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
