import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Play, Youtube, Facebook, Search, BookOpen, Calendar, User, ChevronRight, ChevronDown } from "lucide-react";

type Sermon = {
  id: number;
  title: string;
  scripture: string;
  date: string;
  year: number;
  month: number;
  preacher: string;
  excerpt: string;
  category: string;
  youtubeUrl?: string;
  facebookUrl?: string;
};

const sermons: Sermon[] = [
  { id: 1, title: "Meet the Courageous Harvesters", scripture: "Joshua 1:1-9", date: "November 13, 2021", year: 2021, month: 11, preacher: "Rev. Joseph Eton", excerpt: "The Lord has given us a great theme for the 2019 Harvest and Thanksgiving Service — courageous harvesters. God calls us to step boldly into the harvest field.", category: "Harvest & Thanksgiving", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 2, title: "Pray Like the King", scripture: "James 5:16", date: "November 13, 2021", year: 2021, month: 11, preacher: "Rev. Joseph Eton", excerpt: "The effective, fervent prayer of a righteous man avails much. Prayer is very crucial in the life of the believer. When we pray like kings, we move mountains.", category: "Prayer", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 3, title: "Where Are Nehemiahs Today?", scripture: "Nehemiah 2:17-20", date: "November 13, 2021", year: 2021, month: 11, preacher: "Rev. Joseph Eton", excerpt: "This topic has more to do with nation building. Rebuilding is never easy — it is even harder than starting from scratch. We need modern-day Nehemiahs.", category: "Nation Building", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 4, title: "The God Who Provides", scripture: "Philippians 4:19", date: "October 3, 2021", year: 2021, month: 10, preacher: "Rev. Joseph Eton", excerpt: "My God shall supply all your needs according to His riches in glory. A message on trusting God's provision in every season of life.", category: "Faith & Trust", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 5, title: "Walking in the Spirit", scripture: "Galatians 5:16-25", date: "September 5, 2021", year: 2021, month: 9, preacher: "Rev. Nwadike Okoronkwo", excerpt: "The fruit of the Spirit is not a single fruit but a cluster — love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control.", category: "Christian Living", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 6, title: "The Great Commission", scripture: "Matthew 28:18-20", date: "August 1, 2021", year: 2021, month: 8, preacher: "Rev. Joseph Eton", excerpt: "Go therefore and make disciples of all nations. The commission Jesus gave the church is not optional — it is our primary assignment as believers.", category: "Evangelism", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 7, title: "The Power of Praise", scripture: "Psalm 22:3", date: "July 4, 2021", year: 2021, month: 7, preacher: "Rev. Joseph Eton", excerpt: "God inhabits the praises of His people. When we lift Him up, He shows up in power and glory in our midst.", category: "Worship", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 8, title: "Faith That Moves Mountains", scripture: "Matthew 17:20", date: "June 6, 2021", year: 2021, month: 6, preacher: "Rev. Nwadike Okoronkwo", excerpt: "Jesus said if you have faith as small as a mustard seed, nothing will be impossible for you. Faith is the currency of the kingdom.", category: "Faith & Trust", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 9, title: "Grace Upon Grace", scripture: "John 1:16", date: "May 2, 2021", year: 2021, month: 5, preacher: "Rev. Joseph Eton", excerpt: "Out of His fullness we have all received grace in place of grace already given. God's grace is inexhaustible and available to all who believe.", category: "Grace", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 10, title: "The Armour of God", scripture: "Ephesians 6:10-18", date: "April 4, 2021", year: 2021, month: 4, preacher: "Rev. Joseph Eton", excerpt: "Put on the full armour of God so that you can take your stand against the devil's schemes. We are in a spiritual battle and must be equipped.", category: "Spiritual Warfare", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 11, title: "Renewed Strength", scripture: "Isaiah 40:31", date: "March 7, 2021", year: 2021, month: 3, preacher: "Rev. Nwadike Okoronkwo", excerpt: "Those who wait on the Lord shall renew their strength. They shall mount up with wings as eagles. In every season of waiting, God is working.", category: "Faith & Trust", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
  { id: 12, title: "A New Thing", scripture: "Isaiah 43:19", date: "January 3, 2021", year: 2021, month: 1, preacher: "Rev. Joseph Eton", excerpt: "See, I am doing a new thing! God is always doing something new. Do not be bound by the past — press into what God has prepared for your future.", category: "Hope", youtubeUrl: "https://youtube.com/@pulpitfaptv", facebookUrl: "https://www.facebook.com/pcnfap" },
];

const months = [
  { value: 0, label: "All Months" },
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
];

const categoryColors: Record<string, string> = {
  "Harvest & Thanksgiving": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "Prayer": "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  "Nation Building": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "Faith & Trust": "bg-purple-500/15 text-purple-400 border-purple-500/20",
  "Christian Living": "bg-rose-500/15 text-rose-400 border-rose-500/20",
  "Evangelism": "bg-orange-500/15 text-orange-400 border-orange-500/20",
  "Worship": "bg-pink-500/15 text-pink-400 border-pink-500/20",
  "Grace": "bg-teal-500/15 text-teal-400 border-teal-500/20",
  "Spiritual Warfare": "bg-red-500/15 text-red-400 border-red-500/20",
  "Hope": "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

const PAGE_SIZE = 6;

export default function Sermons() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sermonList, setSermonList] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSermons()
      .then((data) => {
        if (data && data.length > 0) {
          setSermonList(data);
        } else {
          setSermonList(sermons);
        }
      })
      .catch(() => {
        setSermonList(sermons);
      })
      .finally(() => setLoading(false));
  }, []);

  const liveCategories = ["All", ...Array.from(new Set(sermonList.map((s) => s.category)))];
  const liveYears = ["All Years", ...Array.from(new Set(sermonList.map((s) => s.year?.toString()).filter(Boolean))).sort((a, b) => Number(b) - Number(a))];

  const filtered = sermonList.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.preacher.toLowerCase().includes(search.toLowerCase()) ||
      s.scripture.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || s.category === activeCategory;
    const matchesYear = selectedYear === "All Years" || s.year === Number(selectedYear);
    const matchesMonth = selectedMonth === 0 || s.month === selectedMonth;
    return matchesSearch && matchesCategory && matchesYear && matchesMonth;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const resetFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setSelectedYear("All Years");
    setSelectedMonth(0);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Hero Header */}
      <div className="relative overflow-hidden py-28 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-background to-cyan-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="container relative">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Sermons</span>
          </div>
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-semibold uppercase tracking-widest">Sermon Archive</span>
            </div>
            <h1 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-5xl md:text-6xl font-bold">Sermons</h1>
            <p className="text-xl text-muted-foreground">God's Word for You</p>
          </div>
          <div className="flex flex-wrap gap-4 mt-8">
            <a href="https://youtube.com/@pulpitfaptv" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25 transition-all text-sm font-semibold">
              <Youtube className="w-4 h-4" /> Watch on YouTube
            </a>
            <a href="https://www.facebook.com/pcnfap" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 hover:bg-blue-500/25 transition-all text-sm font-semibold">
              <Facebook className="w-4 h-4" /> Watch on Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="container py-16 space-y-10">

        {/* Search + Filters */}
        <div className="space-y-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); }}
              placeholder="Search sermons, scripture, or preacher..." className="pl-11" />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Filter by date:</span>
            </div>
            <select value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); setVisibleCount(PAGE_SIZE); }}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground focus:outline-none focus:border-purple-500/50 transition-colors">
              {liveYears.map((y) => <option key={y} value={y} className="bg-background">{y}</option>)}
            </select>
            <select value={selectedMonth}
              onChange={(e) => { setSelectedMonth(Number(e.target.value)); setVisibleCount(PAGE_SIZE); }}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground focus:outline-none focus:border-purple-500/50 transition-colors">
              {months.map((m) => <option key={m.value} value={m.value} className="bg-background">{m.label}</option>)}
            </select>
            {(selectedYear !== "All Years" || selectedMonth !== 0) && (
              <button onClick={resetFilters}
                className="text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground transition-all">
                Clear dates ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {liveCategories.map((cat) => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setVisibleCount(PAGE_SIZE); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeCategory === cat
                    ? "bg-amber-500 border-amber-500 text-white"
                    : "border-white/15 text-muted-foreground hover:border-white/30 hover:text-foreground"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-semibold">{Math.min(visibleCount, filtered.length)}</span> of{" "}
            <span className="text-foreground font-semibold">{filtered.length}</span> sermon{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "All" && <> in <span className="text-amber-400">{activeCategory}</span></>}
            {selectedYear !== "All Years" && <> · <span className="text-purple-400">{selectedYear}</span></>}
            {selectedMonth !== 0 && <> · <span className="text-purple-400">{months.find(m => m.value === selectedMonth)?.label}</span></>}
          </p>
          {(search || activeCategory !== "All" || selectedYear !== "All Years" || selectedMonth !== 0) && (
            <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Reset all ✕
            </button>
          )}
        </div>

        {/* Loading / Empty / Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading sermons...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No sermons found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
            <button onClick={resetFilters}
              className="mt-4 text-xs px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all">
              Reset all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((sermon) => {
                const isExpanded = expandedId === sermon.id;
                return (
                  <Card key={sermon.id} className="glass-lg p-6 flex flex-col gap-4 hover:border-white/20 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${categoryColors[sermon.category] ?? "bg-white/10 text-muted-foreground border-white/10"}`}>
                        {sermon.category}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                        <BookOpen className="w-3.5 h-3.5" /> {sermon.scripture}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Calendar className="w-3.5 h-3.5" /> {sermon.date}
                      </div>
                    </div>
                    <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
                      className="text-xl font-bold leading-snug group-hover:text-primary transition-colors">
                      {sermon.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-3.5 h-3.5" /> {sermon.preacher}
                    </div>
                    <p className={`text-sm text-muted-foreground leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                      {sermon.excerpt}
                    </p>
                    <button onClick={() => setExpandedId(isExpanded ? null : sermon.id)}
                      className="text-xs text-primary hover:text-cyan-400 transition-colors text-left">
                      {isExpanded ? "Show less ↑" : "Read more ↓"}
                    </button>
                    <div className="h-px bg-white/10" />
                    <div className="flex gap-3">
                      {sermon.youtubeUrl && (
                        <a href={sermon.youtubeUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold transition-all">
                          <Youtube className="w-3.5 h-3.5" /> YouTube
                        </a>
                      )}
                      {sermon.facebookUrl && (
                        <a href={sermon.facebookUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-xs font-semibold transition-all">
                          <Facebook className="w-3.5 h-3.5" /> Facebook
                        </a>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {hasMore && (
              <div className="text-center pt-4">
                <button onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white/5 border border-white/15 hover:border-purple-500/40 hover:bg-purple-500/5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all">
                  <ChevronDown className="w-4 h-4" />
                  Load More ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}

            {!hasMore && filtered.length > PAGE_SIZE && (
              <p className="text-center text-xs text-muted-foreground pt-2">
                All {filtered.length} sermons loaded
              </p>
            )}
          </>
        )}

        {/* Subscribe CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1a2a6e] to-[#0f1a4a] border border-[#2a3a80] p-10 text-white text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto">
            <Play className="w-6 h-6 text-red-400" />
          </div>
          <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-3xl font-bold">Never Miss a Sermon</h2>
          <p className="text-blue-200 max-w-lg mx-auto text-sm leading-relaxed">
            Subscribe to our YouTube channel and follow us on Facebook to get notified every time a new sermon is published.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://youtube.com/@pulpitfaptv" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all shadow-lg shadow-red-500/20">
              <Youtube className="w-4 h-4" /> Subscribe on YouTube
            </a>
            <a href="https://www.facebook.com/pcnfap" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all">
              <Facebook className="w-4 h-4" /> Follow on Facebook
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
