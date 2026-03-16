import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, Users, Zap, Globe, BookOpen, Lock, Church, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

/**
 * PCN First Abuja Parish - Digital Presence Platform
 * Design: Dark Glassmorphic + Vibrant Accents
 * - Deep navy background (#0f1419) with frosted glass panels
 * - Cyan (#06d6d6), Emerald (#10b981), and Amber (#fbbf24) accent colors
 * - Asymmetric layouts with generous whitespace
 * - Smooth animations and micro-interactions
 */

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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
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
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "glass backdrop-blur-xl border-b border-white/10" : "bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Church className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold text-sm leading-tight hidden sm:block">
                PCN First Abuja
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">PARISH</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="text-foreground hover:text-primary text-sm">
              Home
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary text-sm">
              About Us
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary text-sm">
              Leadership
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary text-sm">
              Sermons
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary text-sm">
              Ministries
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary text-sm">
              Events
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary text-sm">
              Contact
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass backdrop-blur-xl border-b border-white/10 p-4 space-y-2">
            <Button variant="ghost" className="w-full text-left text-foreground hover:text-primary text-sm">
              Home
            </Button>
            <Button variant="ghost" className="w-full text-left text-foreground hover:text-primary text-sm">
              About Us
            </Button>
            <Button variant="ghost" className="w-full text-left text-foreground hover:text-primary text-sm">
              Sermons
            </Button>
            <Button variant="ghost" className="w-full text-left text-foreground hover:text-primary text-sm">
              Events
            </Button>
            <Button variant="ghost" className="w-full text-left text-foreground hover:text-primary text-sm">
              Contact
            </Button>
          </div>
        )}
      </nav>

      {/* Hero Carousel Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Carousel Slides */}
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        {/* Hero Content */}
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

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white gap-2 group rounded-full px-8">
              {heroSlides[currentSlide].cta1}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 hover:bg-white/10 text-white rounded-full px-8"
            >
              ▶ {heroSlides[currentSlide].cta2}
            </Button>
          </div>

          {/* Carousel Indicators */}
          <div className="flex gap-2 justify-center pt-8">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-amber-500 w-8" : "bg-white/30 w-3 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 glass p-3 hover:bg-white/10 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 glass p-3 hover:bg-white/10 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </section>

      {/* Ministry Sections */}
      <section className="py-20 relative">
        <div className="container space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-4xl md:text-5xl font-bold">
              Our Digital Ministry
            </h2>
            <p className="text-lg text-muted-foreground">
              Serving our congregation with excellence through structured, governed digital channels
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="glass-lg p-8 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold mb-3">
                Sermons & Archive
              </h3>
              <p className="text-muted-foreground">
                Access our complete sermon library, weekly messages, and spiritual resources
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="glass-lg p-8 hover:border-secondary/50 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold mb-3">
                Events & Calendar
              </h3>
              <p className="text-muted-foreground">
                View upcoming services, events, and RSVP to community gatherings
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="glass-lg p-8 hover:border-amber-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold mb-3">
                Giving & Donations
              </h3>
              <p className="text-muted-foreground">
                Support our ministry with secure online giving
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="glass-lg p-8 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold mb-3">
                Prayer Requests
              </h3>
              <p className="text-muted-foreground">
                Submit prayer requests and join our prayer community
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="glass-lg p-8 hover:border-secondary/50 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold mb-3">
                Leadership
              </h3>
              <p className="text-muted-foreground">
                Meet our pastoral team and ministry leaders
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="glass-lg p-8 hover:border-amber-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold mb-3">
                Gallery
              </h3>
              <p className="text-muted-foreground">
                Browse photos from our services, events, and community activities
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container">
          <div className="glass-lg p-12 md:p-16 text-center space-y-8">
            <div className="space-y-4">
              <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-4xl md:text-5xl font-bold">
                Join Our Growing Community
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you're in Abuja or across the globe, connect with PCN First Abuja Parish and be part of our mission to spread the gospel with excellence and integrity.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-cyan-500 text-primary-foreground gap-2 group rounded-full">
                Visit Us This Sunday
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 hover:bg-white/10 text-foreground rounded-full"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Church className="w-5 h-5 text-white" />
                </div>
                <span style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold">
                  PCN First Abuja
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Presbyterian Church of Nigeria — Serving with excellence, integrity, and the love of Christ
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold mb-4">
                Ministry
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Services</a></li>
                <li><a href="#" className="hover:text-foreground transition">Events</a></li>
                <li><a href="#" className="hover:text-foreground transition">Sermons</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold mb-4">
                Community
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition">Gallery</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold mb-4">
                Legal
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition">Safeguarding</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2026 Presbyterian Church of Nigeria, First Abuja Parish. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="https://www.facebook.com/pcnfap/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                Facebook
              </a>
              <a href="https://www.youtube.com/@pulpitfaptv" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                YouTube
              </a>
              <a href="mailto:pulpitfap@gmail.com" className="hover:text-primary transition">
                Email
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
