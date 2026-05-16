import { ReactNode } from "react";
import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface LegalPageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function LegalPageLayout({
  title,
  description,
  children,
}: LegalPageLayoutProps) {
  const { theme } = useTheme();
  const [, navigate] = useLocation();

  return (
    <div
      className={`themed-page min-h-screen ${
        theme === "light"
          ? "themed-page--light bg-background text-foreground"
          : "themed-page--dark bg-background text-foreground"
      }`}
    >
      {/* HERO */}
      <div className="relative overflow-hidden py-28 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a6b]/10 via-background to-[#d4af37]/10" />

        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1a3a6b]/5 rounded-full blur-3xl" />

        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl" />

        <div className="container relative">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <button
              onClick={() => navigate("/")}
              className="hover:text-foreground transition-colors"
            >
              Home
            </button>

            <ChevronRight className="w-3.5 h-3.5" />

            <span className="text-foreground">{title}</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
              className="text-5xl md:text-6xl font-bold"
            >
              {title}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container py-16">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}