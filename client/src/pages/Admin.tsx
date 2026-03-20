import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard, Users, Clock, CreditCard, Image, MapPin,
  LogOut, ChevronRight, Save, Plus, Trash2, Edit3, X, Check,
  Church, Menu,
  BookOpen,
  Calendar,
  MessageSquare,
  GalleryHorizontal
} from "lucide-react";
import { set } from "react-hook-form";

// ─── Types ───────────────────────────────────────────────────────────────────

type HeroSlide = { id: number; title: string; subtitle: string; image: string; cta1: string; cta2: string };
type ServiceTime = { id: number; day: string; name: string; time: string; location: string };
type LeaderEntry = { id: number; name: string; role: string; section: string };
type BankDetail = { bank: string; accountName: string; accountNumber: string; note: string };
type FooterContact = { phone: string; email: string; address: string };
type Sermon = { id: number; title: string; scripture: string; date: string; preacher: string; excerpt: string; category: string; youtubeUrl: string; facebookUrl: string };
type Event = { id: number; day: string; month: string; title: string; time: string; location: string; description: string; category: string; featured: boolean };
type Testimony = { id: number; name: string; profession: string; quote: string; category: string };
type GalleryItem = { id: number; category: string; caption: string; imageUrl: string };

// ─── Default Data ─────────────────────────────────────────────────────────────

const defaultHeroSlides: HeroSlide[] = [
  { id: 1, title: "Welcome to The Presbyterian Church of Nigeria", subtitle: "Transforming Lives, Changing Destinies", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663442941753/aGVKkYmkpS8dwgNiKtJuPS/hero-church-community-XpYfXsab73HbnPsjgMAM8h.webp", cta1: "Learn More", cta2: "Watch Live" },
  { id: 2, title: "Join Our Community", subtitle: "Experience Faith, Fellowship, and Purpose", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663442941753/aGVKkYmkpS8dwgNiKtJuPS/hero-safeguarding-DaMHzJv7ufA7TMjb5jH9wR.webp", cta1: "Visit Us", cta2: "Learn More" },
  { id: 3, title: "Serving with Excellence & Integrity", subtitle: "Spreading the Gospel Across Abuja and Beyond", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663442941753/aGVKkYmkpS8dwgNiKtJuPS/ministry-background-VH63ZYgwAZ2uQP63B7gG3J.webp", cta1: "Our Mission", cta2: "Get Involved" },
];

const defaultServiceTimes: ServiceTime[] = [
  { id: 1, day: "Sunday", name: "Worship Service", time: "7:00 AM & 9:30 AM", location: "Main Sanctuary — Wuse II" },
  { id: 2, day: "Tuesday", name: "Bible Study", time: "6:00 PM", location: "Various District Meeting Points" },
  { id: 3, day: "Wednesday", name: "Midweek Service", time: "6:00 PM", location: "Main Sanctuary — Wuse II" },
];

const defaultLeaders: LeaderEntry[] = [
  // PCN Leadership
  { id: 1, name: "His Eminence, Nzie Nsi Eke", role: "Prelate & Moderator of the General Assembly", section: "PCN Leadership" },
  { id: 2, name: "Rev. Ujah Orji", role: "Moderator of Abuja Central Presbytery", section: "PCN Leadership" },

  // Parish Leadership
  { id: 3, name: "Rt. Rev. Joseph B. Eton", role: "Minister-in-Charge", section: "Parish Leadership" },
  { id: 4, name: "Rev. Nwadike Okoronkwo", role: "Associate Minister", section: "Parish Leadership" },
  { id: 5, name: "Elder Mrs. Marian Ononokpono", role: "Session Clerk", section: "Parish Leadership" },

  // Board Executive Committee
  { id: 6, name: "Elder Dr. Enefiok Asanga", role: "Board Chairman", section: "Board Executive Committee" },
  { id: 7, name: "Sis. Joy Esu", role: "Board Clerk", section: "Board Executive Committee" },
  { id: 8, name: "Bro. Chinedu Kama", role: "Asst. Board Clerk", section: "Board Executive Committee" },
  { id: 9, name: "Elder Felix O. Onwuchekwa", role: "Board Treasurer", section: "Board Executive Committee" },

  // Congregations & Preaching Posts
  { id: 10, name: "Rev. Joseph Eton", role: "Minister-in-Charge", section: "Congregations & Preaching Posts" },
  { id: 11, name: "Rev. Emmanuel Kalu Ibe", role: "Associate Minister — PCN Abaji", section: "Congregations & Preaching Posts" },
  { id: 12, name: "Rev. Ochuba Okam Ochuba", role: "Associate Minister — PCN Apo", section: "Congregations & Preaching Posts" },
  { id: 13, name: "Rev. Mrs. Eunice O. Kalu", role: "Associate Minister — PCN Jeida", section: "Congregations & Preaching Posts" },
  { id: 14, name: "Rev. Reuben O. Iyioku", role: "Associate Minister — PCN Kabusa", section: "Congregations & Preaching Posts" },
  { id: 15, name: "Rev. Elvis Akpera Agber", role: "Associate Minister — PCN Kwali", section: "Congregations & Preaching Posts" },
  { id: 16, name: "Evang. David Adeiza", role: "Evangelist — PCN Ogaminana", section: "Congregations & Preaching Posts" },
  { id: 17, name: "Rev. Daniel Mba Uka", role: "Associate Minister — PCN Pegi", section: "Congregations & Preaching Posts" },
  { id: 18, name: "Rev. Ukoha Ukiwo", role: "Associate Minister — PCN Wuye", section: "Congregations & Preaching Posts" },
  { id: 19, name: "Rev. Abasiama Ekong", role: "Minister — PCN Zauda", section: "Congregations & Preaching Posts" },
  { id: 20, name: "Evang. Chika Orogwu", role: "Evangelist — PCN Piyanko", section: "Congregations & Preaching Posts" },

  // Board Committees
  { id: 21, name: "Elder Felix Onwuchekwa", role: "Convener", section: "Board Committees — Finance & Stewardship" },
  { id: 22, name: "Engr. Charles Iheukwumere", role: "Convener", section: "Board Committees — Building Committee" },
  { id: 23, name: "Elder (Arc.) I. K. Umoga", role: "Convener", section: "Board Committees — Project Implementation" },
  { id: 24, name: "Elder A. O. Ogba", role: "Convener", section: "Board Committees — Education Committee" },
  { id: 25, name: "Barr. Efut Okon (SAN)", role: "Convener", section: "Board Committees — Security Committee" },
  { id: 26, name: "Dr. Utibeabasi Urua", role: "Convener", section: "Board Committees — Medical Committee" },
  { id: 27, name: "Engr. O. U. Ude", role: "Convener", section: "Board Committees — Maintenance Committee" },
  { id: 28, name: "Barr. Akpabio Ekpa", role: "Convener", section: "Board Committees — Property / Assets" },

  // Kirk Session Members
  { id: 29, name: "Elder (Mrs) M. Ononokpono", role: "Session Member", section: "Kirk Session" },
  { id: 30, name: "Elder (Dr) Eniang Nkang", role: "Session Member", section: "Kirk Session" },
  { id: 31, name: "Elder (Mrs) D. Nkang", role: "Session Member", section: "Kirk Session" },
  { id: 32, name: "Elder (Arc) I.K Umoga", role: "Session Member", section: "Kirk Session" },
  { id: 33, name: "Elder (Mrs) B. Umoga", role: "Session Member", section: "Kirk Session" },
  { id: 34, name: "Elder (Barr) E. J. Okorie", role: "Session Member", section: "Kirk Session" },
  { id: 35, name: "Elder (Dr) E. A. Ukpanyang", role: "Session Member", section: "Kirk Session" },
  { id: 36, name: "Elder (Dr) Nma Ogozy", role: "Session Member", section: "Kirk Session" },
  { id: 37, name: "Elder A. O. Ogba", role: "Session Member", section: "Kirk Session" },
  { id: 38, name: "Elder (Mrs) A.V. Ukpanyang", role: "Session Member", section: "Kirk Session" },
  { id: 39, name: "Elder Engr. O. A. Eya", role: "Session Member", section: "Kirk Session" },
  { id: 40, name: "Elder Emmanuel Ononokpono", role: "Session Member", section: "Kirk Session" },
  { id: 41, name: "Elder Dr. Enefiok A. Asanga", role: "Session Member", section: "Kirk Session" },
  { id: 42, name: "Elder Felix O. Onwuchekwa", role: "Session Member", section: "Kirk Session" },
  { id: 43, name: "Elder Godwin I. Oji", role: "Session Member", section: "Kirk Session" },
  { id: 44, name: "Elder Ifendu A. Ukonu", role: "Session Member", section: "Kirk Session" },
  { id: 45, name: "Elder (Mrs). Lucy Dickson", role: "Session Member", section: "Kirk Session" },
  { id: 46, name: "Elder Arc. Mike O. Oti", role: "Session Member", section: "Kirk Session" },
  { id: 47, name: "Elder O. Kalu Achi", role: "Session Member", section: "Kirk Session" },
  { id: 48, name: "Elder Dr. Mma Agbagha", role: "Session Member", section: "Kirk Session" },
  { id: 49, name: "Elder Otu. E. Ekpenyong", role: "Session Member", section: "Kirk Session" },
  { id: 50, name: "Elder Dr. Asuquo Allotey", role: "Session Member", section: "Kirk Session" },
  { id: 51, name: "Elder (Mrs) Nnenna Ukonu", role: "Session Member", section: "Kirk Session" },
  { id: 52, name: "Elder (Mrs) I. Amanambu", role: "Session Member", section: "Kirk Session" },
  { id: 53, name: "Elder Ikechukwu Onu", role: "Session Member", section: "Kirk Session" },
  { id: 54, name: "Elder (Mrs) Ebere Ukandu", role: "Session Member", section: "Kirk Session" },
  { id: 55, name: "Elder Felix Obasi Okoronkwo", role: "Session Member", section: "Kirk Session" },
  { id: 56, name: "Elder David Godwin Lamba", role: "Session Member", section: "Kirk Session" },
  { id: 57, name: "Elder (Mrs) Promise Rabo", role: "Session Member", section: "Kirk Session" },
  { id: 58, name: "Elder Ikechukwu John Okoro", role: "Session Member", section: "Kirk Session" },
  { id: 59, name: "Elder Esege E. Esege", role: "Session Member", section: "Kirk Session" },
  { id: 60, name: "Elder Okorie Agbafor", role: "Session Member", section: "Kirk Session" },
  { id: 61, name: "Elder (Mrs) Ucha Maduekwe", role: "Session Member", section: "Kirk Session" },
];

const defaultBankDetails: BankDetail = {
  bank: "First Bank of Nigeria",
  accountName: "Presbyterian Church of Nigeria — First Abuja Parish",
  accountNumber: "0000000000",
  note: "Please use your full name and purpose (e.g. Tithe, Offering, Building Fund) as payment reference.",
};

const defaultFooterContact: FooterContact = {
  phone: "+234 (0) 8151111877",
  email: "pulpitfap@gmail.com",
  address: "No. 5 Boke Close, off Sakono Street, Opposite AP Plaza, Wuse II, Abuja",
};

const defaultSermons: Sermon[] = [
  { id: 1, title: "Meet the Courageous Harvesters", scripture: "Joshua 1:1-9", date: "November 13, 2021", preacher: "Rev. Joseph Eton", excerpt: "The Lord has given us a great theme for the 2019 Harvest and Thanksgiving Service.", category: "Harvest & Thanksgiving", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 2, title: "Pray Like the King", scripture: "James 5:16", date: "November 13, 2021", preacher: "Rev. Joseph Eton", excerpt: "The effective, fervent prayer of a righteous man avails much.", category: "Prayer", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 3, title: "Where Are Nehemiahs Today?", scripture: "Nehemiah 2:17-20", date: "November 13, 2021", preacher: "Rev. Joseph Eton", excerpt: "This topic has more to do with nation building.", category: "Nation Building", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
];

const defaultEvents: Event[] = [
  { id: 1, day: "9", month: "Nov", title: "Harvest Thanksgiving Sunday Service", time: "7:00 AM", location: "Main Sanctuary — Wuse II", description: "Annual Harvest Thanksgiving celebration.", category: "Special Service", featured: true },
  { id: 2, day: "15", month: "Nov", title: "Kingdom Workers Retreat", time: "7:00 AM", location: "Retreat Centre — TBA", description: "Annual retreat for kingdom workers.", category: "Retreat", featured: true },
  { id: 3, day: "21", month: "Dec", title: "Christmas Carol of 9 Lessons", time: "5:00 PM", location: "Main Sanctuary — Wuse II", description: "Annual Christmas Carol Service.", category: "Carol Service", featured: true },
];

const defaultTestimonies: Testimony[] = [
  { id: 1, name: "Airbeato", profession: "IT Professional", quote: "God is faithful, in the fact that he lives forever.", category: "Faith" },
  { id: 2, name: "Chukwuemeka Effiong", profession: "Student", quote: "After several weeks of praying and fasting, I got the admission I was looking for.", category: "Answered Prayer" },
  { id: 3, name: "Mr. Fayemi Jacob", profession: "Engineer", quote: "I thank God for helping my family through the pandemic.", category: "Family" },
];

const defaultGalleryItems: GalleryItem[] = [
  { id: 1, category: "worship", caption: "Sunday Morning Worship", imageUrl: "" },
  { id: 2, category: "worship", caption: "Corporate Prayer Time", imageUrl: "" },
  { id: 3, category: "events", caption: "Annual Harvest Thanksgiving", imageUrl: "" },
  { id: 4, category: "youth", caption: "PYPAN Youth Fellowship", imageUrl: "" },
  { id: 5, category: "music", caption: "Classical Choir Performance", imageUrl: "" },
  { id: 6, category: "music", caption: "Christ Anointed Singers", imageUrl: "" },
];

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "hero", label: "Hero Slides", icon: Image },
  { id: "services", label: "Service Times", icon: Clock },
  { id: "leadership", label: "Leadership", icon: Users },
  { id: "sermons", label: "Sermons", icon: BookOpen },
  { id: "events", label: "Events", icon: Calendar },
  { id: "testimonies", label: "Testimonies", icon: MessageSquare },
  { id: "gallery", label: "Gallery", icon: GalleryHorizontal },
  { id: "bank", label: "Bank Details", icon: CreditCard },
  { id: "contact", label: "Footer Contact", icon: MapPin },
];

// ─── Reusable Field ───────────────────────────────────────────────────────────

function Field({ label, value, onChange, textarea = false }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
        />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="text-sm" />
      )}
    </div>
  );
}

// ─── Save Banner ──────────────────────────────────────────────────────────────

function SaveBanner({ onSave, onDiscard }: { onSave: () => void; onDiscard: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 rounded-2xl bg-foreground text-background shadow-2xl border border-white/10">
      <span className="text-sm font-medium">You have unsaved changes</span>
      <button onClick={onDiscard} className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Discard</button>
      <button onClick={onSave} className="text-xs px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors flex items-center gap-1.5">
        <Save className="w-3.5 h-3.5" /> Save Changes
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Admin() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sermonsList, setSermonsList] = useState<Sermon[]>(defaultSermons);
  const [eventsList, setEventsList] = useState<Event[]>(defaultEvents);
  const [testimoniesList, setTestimoniesList] = useState<Testimony[]>(defaultTestimonies);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(defaultGalleryItems);

  // State for each section
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>(defaultServiceTimes);
  const [leaders, setLeaders] = useState<LeaderEntry[]>(defaultLeaders);
  const [bankDetails, setBankDetails] = useState<BankDetail>(defaultBankDetails);
  const [footerContact, setFooterContact] = useState<FooterContact>(defaultFooterContact);
  const [editingId, setEditingId] = useState<number | null>(null);

  const markDirty = () => { setDirty(true); setSaved(false); };

  const handleSave = () => {
    // TODO: wire to backend
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDiscard = () => {
    setHeroSlides(defaultHeroSlides);
    setServiceTimes(defaultServiceTimes);
    setLeaders(defaultLeaders);
    setBankDetails(defaultBankDetails);
    setFooterContact(defaultFooterContact);
    setSermonsList(defaultSermons);
    setEventsList(defaultEvents);
    setTestimoniesList(defaultTestimonies);
    setGalleryItems(defaultGalleryItems);
    setDirty(false);
  };

  // ── Hero helpers
  const updateSlide = (id: number, field: keyof HeroSlide, value: string) => {
    setHeroSlides((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
    markDirty();
  };
  const addSlide = () => {
    setHeroSlides((prev) => [...prev, { id: Date.now(), title: "New Slide", subtitle: "", image: "", cta1: "Learn More", cta2: "Watch Live" }]);
    markDirty();
  };
  const deleteSlide = (id: number) => { setHeroSlides((prev) => prev.filter((s) => s.id !== id)); markDirty(); };

  // ── Service helpers
  const updateService = (id: number, field: keyof ServiceTime, value: string) => {
    setServiceTimes((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
    markDirty();
  };
  const addService = () => {
    setServiceTimes((prev) => [...prev, { id: Date.now(), day: "Sunday", name: "New Service", time: "9:00 AM", location: "Main Sanctuary" }]);
    markDirty();
  };
  const deleteService = (id: number) => { setServiceTimes((prev) => prev.filter((s) => s.id !== id)); markDirty(); };

  // ── Leader helpers
  const updateLeader = (id: number, field: keyof LeaderEntry, value: string) => {
    setLeaders((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l));
    markDirty();
  };
  const addLeader = () => {
    setLeaders((prev) => [...prev, { id: Date.now(), name: "New Leader", role: "", section: "Parish Leadership" }]);
    markDirty();
  };
  const deleteLeader = (id: number) => { setLeaders((prev) => prev.filter((l) => l.id !== id)); markDirty(); };

  return (
    <div className="min-h-screen bg-background text-foreground flex">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} shrink-0 border-r border-white/10 bg-black/20 transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Church className="w-4 h-4 text-white" />
              </div>
              <span style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold text-sm">Admin Panel</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                {sidebarOpen && isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all text-sm"
          >
            <Church className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>View Site</span>}
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all text-sm"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6">
          <div>
            <h1 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold text-lg">
              {navItems.find((n) => n.id === activeTab)?.label ?? "Admin"}
            </h1>
            <p className="text-xs text-muted-foreground">PCN First Abuja Parish — Content Management</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            {dirty && (
              <Button size="sm" onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5">
                <Save className="w-3.5 h-3.5" /> Save Changes
              </Button>
            )}
          </div>
        </div>

        <div className="p-6 max-w-5xl mx-auto space-y-8">

          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                { label: "Hero Slides", value: heroSlides.length, color: "text-cyan-400" },
                { label: "Service Times", value: serviceTimes.length, color: "text-emerald-400" },
                { label: "Leaders Listed", value: leaders.length, color: "text-amber-400" },
                { label: "Sermons", value: sermonsList.length, color: "text-purple-400" },
                { label: "Events", value: eventsList.length, color: "text-rose-400" },
                { label: "Testimonies", value: testimoniesList.length, color: "text-teal-400" },
                { label: "Gallery Slots", value: galleryItems.length, color: "text-orange-400" },
                { label: "Total Sections", value: 10, color: "text-blue-400" },
              ].map((stat) => (
                <Card key={stat.label} className="glass-lg p-5 text-center">
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </Card>
              ))}
              </div>

              <Card className="glass-lg p-6">
                <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold text-lg mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-3 gap-3">
                  {navItems.slice(1).map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-left"
                      >
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{item.label}</p>
                          <p className="text-xs text-muted-foreground">Edit content</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card className="glass-lg p-6 border-amber-500/20 bg-amber-500/5">
                <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">ℹ️ Note</p>
                <p className="text-sm text-muted-foreground">
                  Changes made here are UI-only until a backend is connected. Click <strong className="text-foreground">Save Changes</strong> after editing each section. Contact your developer to wire up persistent storage.
                </p>
              </Card>
            </div>
          )}

          {/* ── Hero Slides ── */}
          {activeTab === "hero" && (
            <div className="space-y-4">
              {heroSlides.map((slide, i) => (
                <Card key={slide.id} className="glass-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold">Slide {i + 1}</h3>
                    <button onClick={() => deleteSlide(slide.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Title" value={slide.title} onChange={(v) => updateSlide(slide.id, "title", v)} />
                    <Field label="Subtitle" value={slide.subtitle} onChange={(v) => updateSlide(slide.id, "subtitle", v)} />
                    <Field label="Image URL" value={slide.image} onChange={(v) => updateSlide(slide.id, "image", v)} />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="CTA Button 1" value={slide.cta1} onChange={(v) => updateSlide(slide.id, "cta1", v)} />
                      <Field label="CTA Button 2" value={slide.cta2} onChange={(v) => updateSlide(slide.id, "cta2", v)} />
                    </div>
                  </div>
                  {slide.image && (
                    <img src={slide.image} alt="preview" className="w-full h-32 object-cover rounded-xl opacity-60" />
                  )}
                </Card>
              ))}
              <button onClick={addSlide} className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-white/15 hover:border-amber-500/40 text-muted-foreground hover:text-foreground transition-all text-sm">
                <Plus className="w-4 h-4" /> Add Slide
              </button>
            </div>
          )}

          {/* ── Service Times ── */}
          {activeTab === "services" && (
            <div className="space-y-4">
              {serviceTimes.map((s) => (
                <Card key={s.id} className="glass-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold">{s.day} — {s.name}</h3>
                    <button onClick={() => deleteService(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Day" value={s.day} onChange={(v) => updateService(s.id, "day", v)} />
                    <Field label="Service Name" value={s.name} onChange={(v) => updateService(s.id, "name", v)} />
                    <Field label="Time" value={s.time} onChange={(v) => updateService(s.id, "time", v)} />
                    <Field label="Location / Note" value={s.location} onChange={(v) => updateService(s.id, "location", v)} />
                  </div>
                </Card>
              ))}
              <button onClick={addService} className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-white/15 hover:border-amber-500/40 text-muted-foreground hover:text-foreground transition-all text-sm">
                <Plus className="w-4 h-4" /> Add Service Time
              </button>
            </div>
          )}

          {activeTab === "leadership" && (
            <div className="space-y-8">
                {/* Group leaders by section */}
                {Array.from(new Set(leaders.map((l) => l.section))).map((section) => (
                <div key={section} className="space-y-3">
                    <div className="flex items-center gap-3">
                    <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-lg font-bold">{section}</h2>
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-muted-foreground">{leaders.filter((l) => l.section === section).length} entries</span>
                    </div>

                    {leaders.filter((l) => l.section === section).map((l) => (
                    <Card key={l.id} className="glass-lg p-5">
                        {editingId === l.id ? (
                        <div className="space-y-3">
                            <div className="grid md:grid-cols-3 gap-3">
                            <Field label="Name" value={l.name} onChange={(v) => updateLeader(l.id, "name", v)} />
                            <Field label="Role / Title" value={l.role} onChange={(v) => updateLeader(l.id, "role", v)} />
                            <Field label="Section" value={l.section} onChange={(v) => updateLeader(l.id, "section", v)} />
                            </div>
                            <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setEditingId(null)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs transition-colors"
                            >
                                <X className="w-3 h-3" /> Done
                            </button>
                            </div>
                        </div>
                        ) : (
                        <div className="flex items-center justify-between">
                            <div>
                            <p className="font-semibold text-sm">{l.name}</p>
                            <p className="text-xs text-muted-foreground">{l.role}</p>
                            </div>
                            <div className="flex gap-2">
                            <button
                                onClick={() => setEditingId(l.id)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => deleteLeader(l.id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            </div>
                        </div>
                        )}
                    </Card>
                    ))}
                </div>
                ))}

                <button
                onClick={addLeader}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-white/15 hover:border-amber-500/40 text-muted-foreground hover:text-foreground transition-all text-sm"
                >
                <Plus className="w-4 h-4" /> Add Leader
                </button>
            </div>
            )}

          {/* ── Bank Details ── */}
          {activeTab === "bank" && (
            <Card className="glass-lg p-6 space-y-4">
              <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold text-lg">Bank Transfer Details</h2>
              <Field label="Bank Name" value={bankDetails.bank} onChange={(v) => { setBankDetails((p) => ({ ...p, bank: v })); markDirty(); }} />
              <Field label="Account Name" value={bankDetails.accountName} onChange={(v) => { setBankDetails((p) => ({ ...p, accountName: v })); markDirty(); }} />
              <Field label="Account Number" value={bankDetails.accountNumber} onChange={(v) => { setBankDetails((p) => ({ ...p, accountNumber: v })); markDirty(); }} />
              <Field label="Payment Reference Note" value={bankDetails.note} onChange={(v) => { setBankDetails((p) => ({ ...p, note: v })); markDirty(); }} textarea />
            </Card>
          )}

          {/* ── Footer Contact ── */}
          {activeTab === "contact" && (
            <Card className="glass-lg p-6 space-y-4">
              <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold text-lg">Footer Contact Information</h2>
              <Field label="Phone Number" value={footerContact.phone} onChange={(v) => { setFooterContact((p) => ({ ...p, phone: v })); markDirty(); }} />
              <Field label="Email Address" value={footerContact.email} onChange={(v) => { setFooterContact((p) => ({ ...p, email: v })); markDirty(); }} />
              <Field label="Physical Address" value={footerContact.address} onChange={(v) => { setFooterContact((p) => ({ ...p, address: v })); markDirty(); }} textarea />
            </Card>
          )}
          {/* ── Sermons ── */}
      {activeTab === "sermons" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Manage sermon entries shown on the Sermons page.</p>
          {sermonsList.map((s, i) => (
            <Card key={s.id} className="glass-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold">Sermon {i + 1}</h3>
                <button onClick={() => { setSermonsList((p) => p.filter((x) => x.id !== s.id)); markDirty(); }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Title" value={s.title} onChange={(v) => { setSermonsList((p) => p.map((x) => x.id === s.id ? { ...x, title: v } : x)); markDirty(); }} />
                <Field label="Scripture" value={s.scripture} onChange={(v) => { setSermonsList((p) => p.map((x) => x.id === s.id ? { ...x, scripture: v } : x)); markDirty(); }} />
                <Field label="Date" value={s.date} onChange={(v) => { setSermonsList((p) => p.map((x) => x.id === s.id ? { ...x, date: v } : x)); markDirty(); }} />
                <Field label="Preacher" value={s.preacher} onChange={(v) => { setSermonsList((p) => p.map((x) => x.id === s.id ? { ...x, preacher: v } : x)); markDirty(); }} />
                <Field label="Category" value={s.category} onChange={(v) => { setSermonsList((p) => p.map((x) => x.id === s.id ? { ...x, category: v } : x)); markDirty(); }} />
                <Field label="YouTube URL" value={s.youtubeUrl} onChange={(v) => { setSermonsList((p) => p.map((x) => x.id === s.id ? { ...x, youtubeUrl: v } : x)); markDirty(); }} />
                <Field label="Facebook URL" value={s.facebookUrl} onChange={(v) => { setSermonsList((p) => p.map((x) => x.id === s.id ? { ...x, facebookUrl: v } : x)); markDirty(); }} />
              </div>
              <Field label="Excerpt" value={s.excerpt} onChange={(v) => { setSermonsList((p) => p.map((x) => x.id === s.id ? { ...x, excerpt: v } : x)); markDirty(); }} textarea />
            </Card>
          ))}
          <button onClick={() => { setSermonsList((p) => [...p, { id: Date.now(), title: "New Sermon", scripture: "", date: "", preacher: "Rev. Joseph Eton", excerpt: "", category: "General", youtubeUrl: "", facebookUrl: "" }]); markDirty(); }}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-white/15 hover:border-amber-500/40 text-muted-foreground hover:text-foreground transition-all text-sm">
            <Plus className="w-4 h-4" /> Add Sermon
          </button>
        </div>
      )}

      {/* ── Events ── */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Manage upcoming events shown on the Events page.</p>
          {eventsList.map((e, i) => (
            <Card key={e.id} className="glass-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold">Event {i + 1} — {e.title}</h3>
                <button onClick={() => { setEventsList((p) => p.filter((x) => x.id !== e.id)); markDirty(); }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Day (number)" value={e.day} onChange={(v) => { setEventsList((p) => p.map((x) => x.id === e.id ? { ...x, day: v } : x)); markDirty(); }} />
                <Field label="Month (e.g. Nov)" value={e.month} onChange={(v) => { setEventsList((p) => p.map((x) => x.id === e.id ? { ...x, month: v } : x)); markDirty(); }} />
                <Field label="Time" value={e.time} onChange={(v) => { setEventsList((p) => p.map((x) => x.id === e.id ? { ...x, time: v } : x)); markDirty(); }} />
                <Field label="Category" value={e.category} onChange={(v) => { setEventsList((p) => p.map((x) => x.id === e.id ? { ...x, category: v } : x)); markDirty(); }} />
                <Field label="Location" value={e.location} onChange={(v) => { setEventsList((p) => p.map((x) => x.id === e.id ? { ...x, location: v } : x)); markDirty(); }} />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Featured</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={e.featured} onChange={(ev) => { setEventsList((p) => p.map((x) => x.id === e.id ? { ...x, featured: ev.target.checked } : x)); markDirty(); }} className="w-4 h-4 accent-amber-500" />
                    <span className="text-sm">Show as featured event</span>
                  </label>
                </div>
              </div>
              <Field label="Title" value={e.title} onChange={(v) => { setEventsList((p) => p.map((x) => x.id === e.id ? { ...x, title: v } : x)); markDirty(); }} />
              <Field label="Description" value={e.description} onChange={(v) => { setEventsList((p) => p.map((x) => x.id === e.id ? { ...x, description: v } : x)); markDirty(); }} textarea />
            </Card>
          ))}
          <button onClick={() => { setEventsList((p) => [...p, { id: Date.now(), day: "1", month: "Jan", title: "New Event", time: "9:00 AM", location: "Main Sanctuary", description: "", category: "Special Service", featured: false }]); markDirty(); }}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-white/15 hover:border-amber-500/40 text-muted-foreground hover:text-foreground transition-all text-sm">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      )}

      {/* ── Testimonies ── */}
      {activeTab === "testimonies" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Manage testimonies shown on the Testimonies page.</p>
          {testimoniesList.map((t, i) => (
            <Card key={t.id} className="glass-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold">Testimony {i + 1} — {t.name}</h3>
                <button onClick={() => { setTestimoniesList((p) => p.filter((x) => x.id !== t.id)); markDirty(); }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Full Name" value={t.name} onChange={(v) => { setTestimoniesList((p) => p.map((x) => x.id === t.id ? { ...x, name: v } : x)); markDirty(); }} />
                <Field label="Profession" value={t.profession} onChange={(v) => { setTestimoniesList((p) => p.map((x) => x.id === t.id ? { ...x, profession: v } : x)); markDirty(); }} />
                <Field label="Category" value={t.category} onChange={(v) => { setTestimoniesList((p) => p.map((x) => x.id === t.id ? { ...x, category: v } : x)); markDirty(); }} />
              </div>
              <Field label="Testimony Quote" value={t.quote} onChange={(v) => { setTestimoniesList((p) => p.map((x) => x.id === t.id ? { ...x, quote: v } : x)); markDirty(); }} textarea />
            </Card>
          ))}
          <button onClick={() => { setTestimoniesList((p) => [...p, { id: Date.now(), name: "New Member", profession: "", quote: "", category: "Faith" }]); markDirty(); }}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-white/15 hover:border-amber-500/40 text-muted-foreground hover:text-foreground transition-all text-sm">
            <Plus className="w-4 h-4" /> Add Testimony
          </button>
        </div>
      )}

      {/* ── Gallery ── */}
      {activeTab === "gallery" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Manage gallery photo slots and captions.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {galleryItems.map((g) => (
              <Card key={g.id} className="glass-lg p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{g.category}</span>
                  <button onClick={() => { setGalleryItems((p) => p.filter((x) => x.id !== g.id)); markDirty(); }}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Field label="Caption" value={g.caption} onChange={(v) => { setGalleryItems((p) => p.map((x) => x.id === g.id ? { ...x, caption: v } : x)); markDirty(); }} />
                <Field label="Category (worship/events/youth/music)" value={g.category} onChange={(v) => { setGalleryItems((p) => p.map((x) => x.id === g.id ? { ...x, category: v } : x)); markDirty(); }} />
                <Field label="Image URL (optional)" value={g.imageUrl} onChange={(v) => { setGalleryItems((p) => p.map((x) => x.id === g.id ? { ...x, imageUrl: v } : x)); markDirty(); }} />
                {g.imageUrl && <img src={g.imageUrl} alt={g.caption} className="w-full h-24 object-cover rounded-xl opacity-70" />}
              </Card>
            ))}
          </div>
          <button onClick={() => { setGalleryItems((p) => [...p, { id: Date.now(), category: "worship", caption: "New Photo", imageUrl: "" }]); markDirty(); }}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-white/15 hover:border-amber-500/40 text-muted-foreground hover:text-foreground transition-all text-sm">
            <Plus className="w-4 h-4" /> Add Gallery Slot
          </button>
        </div>
      )}

        </div>
      </main>

      {/* Floating Save Banner */}
      {dirty && <SaveBanner onSave={handleSave} onDiscard={handleDiscard} />}
    </div>
  );
}