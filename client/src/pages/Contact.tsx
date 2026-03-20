import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronRight, Phone, Mail, MapPin, Send,
  Heart, CheckCircle, MessageSquare
} from "lucide-react";

export default function Contact() {
  const [, navigate] = useLocation();
  const [activeForm, setActiveForm] = useState<"message" | "prayer">("message");
  const [messageSent, setMessageSent] = useState(false);
  const [prayerSent, setPrayerSent] = useState(false);

  const [messageForm, setMessageForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [prayerForm, setPrayerForm] = useState({ name: "", email: "", request: "", anonymous: false });

  const handleMessage = () => {
    setMessageSent(true);
    setMessageForm({ name: "", email: "", phone: "", subject: "", message: "" });
    setTimeout(() => setMessageSent(false), 5000);
  };

  const handlePrayer = () => {
    setPrayerSent(true);
    setPrayerForm({ name: "", email: "", request: "", anonymous: false });
    setTimeout(() => setPrayerSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Hero */}
      <div className="relative overflow-hidden py-28 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-background to-cyan-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="container relative">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Contact</span>
          </div>
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">Get in Touch</span>
            </div>
            <h1 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-5xl md:text-6xl font-bold">Contact Us</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We'd love to hear from you. Reach out to us for enquiries, prayer requests, or to find out more about our ministries.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-16 space-y-16">

        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Phone,
              color: "from-cyan-400 to-cyan-600",
              glow: "hover:shadow-cyan-500/10",
              border: "hover:border-cyan-500/30",
              label: "Phone",
              lines: ["+234 (0) 8151111877", "+234 (0) 817 5777773"],
              href: "tel:+2348151111877",
            },
            {
              icon: MapPin,
              color: "from-amber-400 to-amber-600",
              glow: "hover:shadow-amber-500/10",
              border: "hover:border-amber-500/30",
              label: "Address",
              lines: ["No. 5 Boke Close, off Sakono Street,", "Opposite AP Plaza, Wuse II, Abuja"],
              href: "https://maps.google.com/?q=Wuse+II+Abuja",
            },
            {
              icon: Mail,
              color: "from-emerald-400 to-emerald-600",
              glow: "hover:shadow-emerald-500/10",
              border: "hover:border-emerald-500/30",
              label: "Email",
              lines: ["pulpitfap@gmail.com"],
              href: "mailto:pulpitfap@gmail.com",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              
            <a  key={item.label}
                href={item.href}
                target={item.label === "Address" ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={`group block p-8 rounded-2xl border border-white/10 bg-white/5 hover:shadow-xl transition-all duration-300 ${item.glow} ${item.border}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{item.label}</p>
                {item.lines.map((line, i) => (
                  <p key={i} className="text-sm font-medium text-foreground leading-relaxed">{line}</p>
                ))}
              </a>
            );
          })}
        </div>

        {/* Forms Section */}
        <div className="grid lg:grid-cols-5 gap-10">

          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tab switcher */}
            <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 w-fit">
              {[
                { id: "message", label: "Send a Message" },
                { id: "prayer", label: "Prayer Request" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveForm(tab.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeForm === tab.id
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Message Form */}
            {activeForm === "message" && (
              <Card className="glass-lg p-8 space-y-5">
                <div>
                  <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold mb-1">Send a Message</h2>
                  <p className="text-sm text-muted-foreground">We'll get back to you within 24–48 hours.</p>
                </div>

                {messageSent && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">Message sent! We'll be in touch soon.</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                    <Input value={messageForm.name} onChange={(e) => setMessageForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
                    <Input type="email" value={messageForm.email} onChange={(e) => setMessageForm((p) => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone (Optional)</label>
                    <Input value={messageForm.phone} onChange={(e) => setMessageForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+234..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</label>
                    <Input value={messageForm.subject} onChange={(e) => setMessageForm((p) => ({ ...p, subject: e.target.value }))} placeholder="What is this about?" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</label>
                  <textarea
                    value={messageForm.message}
                    onChange={(e) => setMessageForm((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Write your message here..."
                    rows={5}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                  />
                </div>
                <Button
                  onClick={handleMessage}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-6 text-base font-semibold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  <Send className="w-4 h-4 mr-2" /> Send Message
                </Button>
              </Card>
            )}

            {/* Prayer Form */}
            {activeForm === "prayer" && (
              <Card className="glass-lg p-8 space-y-5">
                <div>
                  <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold mb-1">Prayer Request</h2>
                  <p className="text-sm text-muted-foreground">No matter what you are facing, we would love to pray with you.</p>
                </div>

                {prayerSent && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">Prayer request received. We are praying with you!</p>
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={prayerForm.anonymous}
                    onChange={(e) => setPrayerForm((p) => ({ ...p, anonymous: e.target.checked }))}
                    className="w-4 h-4 accent-cyan-500"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Submit anonymously</span>
                </label>

                {!prayerForm.anonymous && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</label>
                      <Input value={prayerForm.name} onChange={(e) => setPrayerForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your name" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email (Optional)</label>
                      <Input type="email" value={prayerForm.email} onChange={(e) => setPrayerForm((p) => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Prayer Request</label>
                  <textarea
                    value={prayerForm.request}
                    onChange={(e) => setPrayerForm((p) => ({ ...p, request: e.target.value }))}
                    placeholder="Share what's on your heart..."
                    rows={6}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
                  />
                </div>

                <Card className="p-4 border-amber-500/20 bg-amber-500/5">
                  <p className="text-xs text-amber-300 leading-relaxed">
                    🔒 Your prayer request is treated with the utmost confidentiality and shared only with our prayer team.
                  </p>
                </Card>

                <Button
                  onClick={handlePrayer}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white py-6 text-base font-semibold rounded-xl shadow-lg shadow-cyan-500/20"
                >
                  <Heart className="w-4 h-4 mr-2" /> Submit Prayer Request
                </Button>
              </Card>
            )}
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-2 space-y-6">

            {/* Map placeholder */}
            <Card className="glass-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-[#1a2a6e] to-[#0f1a4a] flex flex-col items-center justify-center gap-3 border-b border-white/10">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-amber-400" />
                </div>
                <p className="text-sm text-blue-200 text-center px-4">No. 5 Boke Close, off Sakono Street,<br />Opposite AP Plaza, Wuse II, Abuja</p>
                
                <a  href="https://maps.google.com/?q=Wuse+II+Abuja"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all"
                >
                  Open in Google Maps
                </a>
              </div>
              <div className="p-5 space-y-3">
                <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold">Service Times</h3>
                {[
                  { day: "Sunday", time: "7:00 AM & 9:30 AM" },
                  { day: "Tuesday", time: "6:00 PM — Bible Study" },
                  { day: "Wednesday", time: "6:00 PM — Midweek" },
                ].map((s) => (
                  <div key={s.day} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.day}</span>
                    <span className="font-medium text-cyan-400">{s.time}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Social */}
            <Card className="glass-lg p-6 space-y-4">
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold">Follow Us</h3>
              <div className="space-y-3">
                {[
                  { label: "Facebook", handle: "@firstabujapresbyterian", href: "https://facebook.com/firstabujapresbyterian", color: "text-blue-400" },
                  { label: "YouTube", handle: "@firstabujapresbyterian", href: "https://youtube.com/@firstabujapresbyterian", color: "text-red-400" },
                  { label: "Instagram", handle: "@firstabujapresbyterian", href: "https://instagram.com/firstabujapresbyterian", color: "text-pink-400" },
                  { label: "X (Twitter)", handle: "@firstabujapresbyterian", href: "https://x.com/firstabujapresbyterian", color: "text-foreground" },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                  >
                    <span className="text-sm font-medium">{s.label}</span>
                    <span className={`text-xs ${s.color}`}>{s.handle}</span>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}