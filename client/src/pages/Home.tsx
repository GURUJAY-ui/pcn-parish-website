import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, Users, Zap, Globe, BookOpen, Lock, Church, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import QRCodeSection from "@/pages/QRCodeSection";

type SocialLink = {
  href: string;
  label: string;
  path?: string;
  isInstagram?: boolean;
};

const socialLinks: SocialLink[] = [
  {
    href: "https://facebook.com/firstabujapresbyterian",
    label: "Facebook",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    href: "https://x.com/firstabujapresbyterian",
    label: "X",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.6l-5.165-6.75-5.913 6.75h-3.308l7.73-8.835L2.56 2.25h6.772l4.681 6.187 5.431-6.187zM17.7 20.005h1.813L6.283 3.993H4.366l13.334 16.012z",
  },
  {
    href: "https://youtube.com/@firstabujapresbyterian",
    label: "YouTube",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    href: "https://instagram.com/firstabujapresbyterian",
    label: "Instagram",
    isInstagram: true,
  },
];

const heroSlides = [
  {
    id: 1,
    title: "Welcome to The Presbyterian Church of Nigeria",
    subtitle: "Transforming Lives, Changing Destinies",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663442941753/aGVKkYmkpS8dwgNiKtJuPS/hero-church-community-XpYfXsab73HbnPsjgMAM8h.webp",
    cta1: "Learn More",
    cta2: "Watch Live",
  },
  {
    id: 2,
    title: "Join Our Community",
    subtitle: "Experience Faith, Fellowship, and Purpose",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663442941753/aGVKkYmkpS8dwgNiKtJuPS/hero-safeguarding-DaMHzJv7ufA7TMjb5jH9wR.webp",
    cta1: "Visit Us",
    cta2: "Learn More",
  },
  {
    id: 3,
    title: "Serving with Excellence & Integrity",
    subtitle: "Spreading the Gospel Across Abuja and Beyond",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663442941753/aGVKkYmkpS8dwgNiKtJuPS/ministry-background-VH63ZYgwAZ2uQP63B7gG3J.webp",
    cta1: "Our Mission",
    cta2: "Get Involved",
  },
];

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "glass backdrop-blur-xl border-b border-white/10" : "bg-transparent"}`}>
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                        <img
              src="/assets/pcn-logo.png"
              alt="PCN Logo"
              className="w-10 h-10 object-contain"
            />
            <div className="flex flex-col">
              <span style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold text-sm leading-tight hidden lg:block">PCN First Abuja</span>
              <span className="text-xs text-muted-foreground hidden lg:block">PARISH</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Button variant="ghost" onClick={() => navigate("/")} className="text-foreground hover:text-primary text-xs">Home</Button>
            <Button variant="ghost" onClick={() => navigate("/about")} className="text-foreground hover:text-primary text-xs">About Us</Button>
            <Button variant="ghost" onClick={() => navigate("/staff")} className="text-foreground hover:text-primary text-xs">Leadership</Button>
            <Button variant="ghost" onClick={() => navigate("/sermons")} className="text-foreground hover:text-primary text-xs">Sermons</Button>
            <Button variant="ghost" onClick={() => navigate("/testimonies")} className="text-foreground hover:text-primary text-xs">Testimonies</Button>
            <Button variant="ghost" onClick={() => navigate("/ministries")} className="text-foreground hover:text-primary text-xs">Ministries</Button>
            <Button variant="ghost" onClick={() => navigate("/events")} className="text-foreground hover:text-primary text-xs">Events</Button>
            <Button variant="ghost" onClick={() => navigate("/contact")} className="text-foreground hover:text-primary text-xs">Contact</Button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass backdrop-blur-xl border-b border-white/10 p-4 space-y-2">
            <Button variant="ghost" onClick={() => navigate("/")} className="w-full text-left text-foreground hover:text-primary text-xs">Home</Button>
            <Button variant="ghost" onClick={() => navigate("/about")} className="w-full text-left text-foreground hover:text-primary text-xs">About Us</Button>
            <Button variant="ghost" onClick={() => navigate("/testimonies")} className="w-full text-left text-foreground hover:text-primary text-xs">Testimonies</Button>
            <Button variant="ghost" onClick={() => navigate("/staff")} className="w-full text-left text-foreground hover:text-primary text-xs">Leadership</Button>
            <Button variant="ghost" onClick={() => navigate("/sermons")} className="w-full text-left text-foreground hover:text-primary text-xs">Sermons</Button>
            <Button variant="ghost" onClick={() => navigate("/events")} className="w-full text-left text-foreground hover:text-primary text-xs">Events</Button>
            <Button variant="ghost" onClick={() => navigate("/donations")} className="w-full text-left text-foreground hover:text-primary text-xs">Give Online</Button>
            <Button variant="ghost" onClick={() => navigate("/contact")} className="w-full text-left text-foreground hover:text-primary text-xs">Contact</Button>
          </div>
        )}
      </nav>

      {/* Hero Carousel */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
          >
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        <div className="container relative z-10 flex flex-col items-center justify-center h-full text-center space-y-8 py-20">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-block px-4 py-2 glass-sm">
              <span style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-amber-400 font-semibold text-sm uppercase tracking-widest">
                FIRST ABUJA PARISH
              </span>
            </div>
            <h1 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-4xl md:text-6xl font-bold leading-tight text-white max-w-4xl mx-auto">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              {heroSlides[currentSlide].subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white gap-2 group rounded-full px-8">
              {heroSlides[currentSlide].cta1}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 hover:bg-white/10 text-white rounded-full px-8">
              ▶ {heroSlides[currentSlide].cta2}
            </Button>
          </div>

          <div className="flex gap-2 justify-center pt-8">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-3 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-amber-500 w-8" : "bg-white/30 w-3 hover:bg-white/50"}`}
              />
            ))}
          </div>
        </div>

        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 glass p-3 hover:bg-white/10 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 glass p-3 hover:bg-white/10 transition-all">
          <ChevronRight className="w-6 h-6" />
        </button>
      </section>

      {/* Service Times Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a6e] to-[#0f1a4a]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

        <div className="container relative">
          {/* Header */}
          <div className="text-center mb-14 space-y-3">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.3em]">Join Us</p>
            <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-5xl font-bold text-white">
              Service Times
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mx-auto mt-2" />
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">

            {/* Sunday */}
            <div className="group relative rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/30 p-8 text-center transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.25em] mb-3">Sunday</p>
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold text-white mb-3">
                Worship Service
              </h3>
              <div className="w-8 h-px bg-white/20 mx-auto mb-3" />
              <p className="text-blue-200 text-lg font-medium">7:00 AM & 9:30 AM</p>
              <p className="text-blue-300/60 text-xs mt-2">Main Sanctuary — Wuse II</p>
            </div>

            {/* Tuesday */}
            <div className="group relative rounded-2xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 p-8 text-center transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 scale-105">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-t-2xl" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Weekly</span>
              </div>
              <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.25em] mb-3 mt-2">Tuesday</p>
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold text-white mb-3">
                Bible Study
              </h3>
              <div className="w-8 h-px bg-white/20 mx-auto mb-3" />
              <p className="text-blue-200 text-lg font-medium">6:00 PM</p>

              {/* Emphasized Note */}
              <div className="mt-4 rounded-xl bg-white/10 border border-amber-500/20 px-4 py-3">
                <p className="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">📍 Please Note</p>
                <p className="text-blue-200 text-xs leading-relaxed">
                  Bible Study holds at the <span className="text-white font-semibold">various district meeting points</span> across the parish. Contact your district elder for your nearest venue.
                </p>
              </div>
            </div>

            {/* Wednesday */}
            <div className="group relative rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/30 p-8 text-center transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.25em] mb-3">Wednesday</p>
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold text-white mb-3">
                Midweek Service
              </h3>
              <div className="w-8 h-px bg-white/20 mx-auto mb-3" />
              <p className="text-blue-200 text-lg font-medium">6:00 PM</p>
              <p className="text-blue-300/60 text-xs mt-2">Main Sanctuary — Wuse II</p>
            </div>

          </div>

          {/* Bottom Note */}
          <p className="text-center text-blue-300/60 text-sm mt-10">
            All are welcome. Come as you are and experience the love of God.
          </p>
        </div>
      </section>

      {/* Pastor's Welcome Message */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-background to-cyan-500/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

        <div className="container relative">
          <div className="max-w-4xl mx-auto">

            {/* Decorative quote mark */}
            <div className="text-[120px] leading-none text-amber-500/10 font-serif select-none -mb-8 -ml-2">"</div>

            <div className="glass-lg rounded-3xl p-10 md:p-14 border border-amber-500/10 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/3 rounded-full blur-3xl" />

              <div className="relative space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                  <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.3em]">A Message from the Pulpit</p>
                  <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-4xl md:text-5xl font-bold">
                    Dearly Beloved, <span className="text-amber-400">Welcome</span>
                  </h2>
                  <div className="w-12 h-0.5 bg-amber-500/50 mx-auto" />
                </div>

                {/* Message Body */}
                <div className="space-y-5 text-muted-foreground leading-relaxed text-base md:text-lg max-w-3xl mx-auto text-center">
                  <p>
                    Thank you for visiting us. We appreciate God for your life and the great decision you have taken to be with us today. Our earnest prayer is that you will be greatly uplifted and the blessings of your fellowship with us shall abide in the precious name of our Lord and Saviour Jesus Christ.
                  </p>
                  <p>
                    We are a <strong className="text-foreground">Bible-centered, Holy Spirit led Reformed Church</strong>. Our mission is to raise worshippers who are passionate for God, winning in life, and positively changing lives through kingdom service to the glory of God.
                  </p>
                  <p>
                    Our core values are <span className="text-amber-400 font-semibold">Righteousness</span>, <span className="text-cyan-400 font-semibold">Love</span> and <span className="text-emerald-400 font-semibold">Excellence</span>.
                  </p>
                </div>

                {/* Signature */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 border-t border-white/10">
                  {/* Avatar placeholder */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                    <span style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-white text-xl font-bold">MNI</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-muted-foreground italic mb-1">Yours in Christ's Service</p>
                    <p style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-lg font-bold text-foreground">Most Rev. Mba Nwankwo Idika</p>
                    <p className="text-sm text-amber-400 font-medium">Minister In-Charge, PCN First Abuja Parish</p>
                  </div>
                </div>

                {/* Core Values Pills */}
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  {[
                    { label: "Bible-Centered", color: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
                    { label: "Holy Spirit Led", color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" },
                    { label: "Reformed Church", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
                    { label: "Righteousness", color: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
                    { label: "Love", color: "bg-rose-500/10 border-rose-500/20 text-rose-400" },
                    { label: "Excellence", color: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
                  ].map((pill) => (
                    <span key={pill.label} className={`text-xs font-semibold px-4 py-1.5 rounded-full border ${pill.color}`}>
                      {pill.label}
                    </span>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Ministry Section */}
      <section className="py-20 relative">
        <div className="container space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-4xl md:text-5xl font-bold">Our Digital Ministry</h2>
            <p className="text-lg text-muted-foreground">Serving our congregation with excellence through structured, governed digital channels</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card onClick={() => navigate("/sermons")} className="glass-lg p-8 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold mb-3">Sermons & Archive</h3>
              <p className="text-muted-foreground">Access our complete sermon library, weekly messages, and spiritual resources</p>
            </Card>

            <Card onClick={() => navigate("/events")} className="glass-lg p-8 hover:border-secondary/50 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold mb-3">Events & Calendar</h3>
              <p className="text-muted-foreground">View upcoming services, events, and RSVP to community gatherings</p>
            </Card>

            <Card onClick={() => navigate("/donations")} className="glass-lg p-8 hover:border-amber-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold mb-3">Giving & Donations</h3>
              <p className="text-muted-foreground">Support our ministry with secure online giving</p>
            </Card>

            <Card onClick={() => navigate("/contact")} className="glass-lg p-8 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold mb-3">Prayer Requests</h3>
              <p className="text-muted-foreground">Submit prayer requests and join our prayer community</p>
            </Card>

            <Card onClick={() => navigate("/staff")} className="glass-lg p-8 hover:border-secondary/50 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold mb-3">Leadership</h3>
              <p className="text-muted-foreground">Meet our pastoral team and ministry leaders</p>
            </Card>

            <Card onClick={() => navigate("/gallery")} className="glass-lg p-8 hover:border-amber-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold mb-3">Gallery</h3>
              <p className="text-muted-foreground">Browse photos from our services, events, and community activities</p>
            </Card>
          </div>
          {/* QR Giving Section */}
          <QRCodeSection />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container">
          <div className="glass-lg p-12 md:p-16 text-center space-y-8">
            <div className="space-y-4">
              <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-4xl md:text-5xl font-bold">Join Our Growing Community</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you're in Abuja or across the globe, connect with PCN First Abuja Parish and be part of our mission to spread the gospel with excellence and integrity.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/events")} className="bg-primary hover:bg-cyan-500 text-primary-foreground gap-2 group rounded-full">
                Visit Us This Sunday
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" onClick={() => navigate("/contact")} variant="outline" className="border-white/20 hover:bg-white/10 text-foreground rounded-full">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="container py-16">
          <div className="grid md:grid-cols-12 gap-12">

            {/* Brand Column */}
            <div className="md:col-span-4 space-y-5">
              <div className="flex items-center gap-3">
                <img
                src="/src/assets/pcn-logo.png"
                alt="PCN Logo"
                className="w-10 h-10 object-contain"
              />
                <div>
                  <p style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold text-sm leading-tight">PCN First Abuja Parish</p>
                  <p className="text-xs text-muted-foreground">Presbyterian Church of Nigeria</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Spreading the gospel with excellence and integrity across Abuja and beyond.
              </p>
              <div className="flex gap-3 pt-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-amber-500/10 hover:border-amber-500/30 transition-all group"
                  >
                    {s.isInstagram === true ? (
                      <svg className="w-4 h-4 text-muted-foreground group-hover:text-amber-400 transition" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <rect x="2.17" y="2.17" width="19.66" height="19.66" rx="4.58" ry="4.58" />
                        <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
                        <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-muted-foreground group-hover:text-amber-400 transition" fill="currentColor" viewBox="0 0 24 24">
                        <path d={s.path} />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h4 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold text-sm uppercase tracking-widest text-primary">New Here?</h4>
                <ul className="space-y-3">
                  {[{ label: "Service Times", path: "/" },
                    { label: "Vision & Beliefs", path: "/about" },
                    { label: "Leadership", path: "/staff" },
                    { label: "Testimonies", path: "/testimonies" },].map((item) => (
                    <li key={item.label}>
                      <a href={item.path} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item.label}                 
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold text-sm uppercase tracking-widest text-secondary">Ministries</h4>
                <ul className="space-y-3">
                  {[{ label: "Children's Dept", path: "/ministries" }, { label: "Teenage Ministry", path: "/ministries" }, { label: "Evangelism", path: "/ministries" }, { label: "Family Life", path: "/ministries" }, { label: "Prayer", path: "/ministries" }].map((item) => (
                    <li key={item.label}>
                      <a href={item.path} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item.label}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold text-sm uppercase tracking-widest text-amber-400">Contact Us</h4>
                <ul className="space-y-4">
                  <li>
                    <a href="tel:+2348151111877" className="flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <span className="text-primary mt-0.5 shrink-0">📞</span>
                      +234 (0) 8151111877
                    </a>
                  </li>
                  <li>
                    <a href="mailto:pulpitfap@gmail.com" className="flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <span className="text-primary mt-0.5 shrink-0">✉️</span>
                      pulpitfap@gmail.com
                    </a>
                  </li>
                  <li>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5 shrink-0">📍</span>
                      <span>No. 5 Boke Close, off Sakono Street, Opposite AP Plaza, Wuse II, Abuja</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 Presbyterian Church of Nigeria, First Abuja Parish. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Safeguarding"].map((item) => (
              <a key={item} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{item}</a>
            ))}
            <a onClick={() => navigate("/contact")} className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Contact</a>

            {/* Admin portal — subtle, staff only */}
            <button
              onClick={() => navigate("/admin/login")}
              className="group flex items-center gap-1.5 text-xs text-muted-foreground/40 hover:text-muted-foreground transition-all duration-300"
              title="Staff Portal"
            >
              <svg
                className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">Admin</span>
            </button>
          </div>
        </div>
      </div>
      </footer>

    </div>
  );
}