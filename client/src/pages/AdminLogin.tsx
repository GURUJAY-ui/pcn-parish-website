/**
 * AdminLogin.tsx — PCN First Abuja Parish
 * Cinematic liquid-glass login: full-screen congregation photo with a
 * slow Ken Burns drift behind a floating glass card. Always dark —
 * this is the staff door, not a public page. Auth logic unchanged.
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, AlertCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const SERIF = { fontFamily: "'Instrument Serif', Georgia, serif" } as const;

// ── Loading overlay (authentication sequence) ─────────────────────
function LoadingOverlay({ visible }: { visible: boolean }) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  const messages = [
    "Verifying your identity...",
    "Checking authorisation...",
    "Validating credentials...",
    "Establishing secure session...",
    "Unlocking admin portal...",
    "Welcome, authorised user...",
  ];

  useEffect(() => {
    if (!visible) {
      setPhase(0);
      setProgress(0);
      return;
    }

    const phaseInterval = setInterval(() => {
      setPhase((p) => (p < messages.length - 1 ? p + 1 : p));
    }, 400);

    const progressInterval = setInterval(() => {
      setProgress((p) => (p < 95 ? p + Math.random() * 8 : p));
    }, 150);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(progressInterval);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-2xl" />

      {/* Expanding glass rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/15"
            style={{
              width: `${200 + i * 120}px`,
              height: `${200 + i * 120}px`,
              animation: `ringPulse ${2 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Scanning line */}
      <div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"
        style={{ animation: "scanLine 2s ease-in-out infinite" }}
      />

      <div className="relative flex flex-col items-center gap-8 px-8 max-w-sm w-full">
        {/* Logo with glow */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full bg-white/20 blur-2xl scale-150"
            style={{ animation: "logoPulse 1.5s ease-in-out infinite" }}
          />
          <div className="relative w-24 h-24 rounded-full liquid-glass flex items-center justify-center overflow-hidden">
            <img
              src="/assets/pcn-logo.png"
              alt="PCN"
              className="w-16 h-16 object-contain"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/80 border-r-amber-400/80"
              style={{ animation: "spin 1.5s linear infinite" }}
            />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 style={SERIF} className="text-3xl text-white tracking-tight">
            Authenticating<em className="italic text-white/60">...</em>
          </h2>
          <p
            key={phase}
            className="text-sm text-white/50"
            style={{ animation: "fadeInUp 0.3s ease-out" }}
          >
            {messages[phase]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-2">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-white/80 to-amber-400 rounded-full transition-all duration-200 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-300 shadow-lg shadow-amber-400/80" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-white/25">
            <span>Secure connection</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex gap-3">
          {["256-bit SSL", "JWT Secured", "Monitored"].map((badge) => (
            <div key={badge} className="liquid-glass rounded-full flex items-center gap-1.5 px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "blink 1s ease-in-out infinite" }} />
              <span className="text-xs text-white/50">{badge}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 text-center">
        <p className="text-xs text-white/25 uppercase tracking-widest">PCN First Abuja Parish · Secure Admin Portal</p>
      </div>

      <style>{`
        @keyframes ringPulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes scanLine {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes logoPulse {
          0%, 100% { opacity: 0.3; transform: scale(1.5); }
          50% { opacity: 0.6; transform: scale(1.8); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ── Main Login Page ───────────────────────────────────────────────
export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await api.login(username, password);
      // Brief confirmation, then redirect. (Kept short — the login request
      // itself can already be slow against a remote database.)
      setTimeout(() => navigate("/admin"), 500);
    } catch (err: any) {
      setAttempts((p) => p + 1);
      setError(err.message || "Invalid credentials");
      setPassword("");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  const inputCls =
    "w-full h-11 rounded-xl bg-white/5 border border-white/10 text-white text-sm px-4 placeholder:text-white/25 focus:outline-none focus:border-white/40 focus:bg-white/8 transition disabled:opacity-50";

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white flex items-center justify-center p-4">
      <LoadingOverlay visible={isLoading} />

      {/* Cinematic photo background with slow drift */}
      <motion.img
        src="/assets/PCN-FAP-CONG.jpeg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1 }}
        animate={{ scale: 1.1 }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
      />
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)]" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative w-full max-w-md">

        <div className="liquid-glass rounded-3xl p-8 md:p-10 bg-black/30">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="liquid-glass rounded-full w-20 h-20 flex items-center justify-center mb-5">
              <img
                src="/assets/pcn-logo.png"
                alt="PCN First Abuja Parish"
                className="w-12 h-12 object-contain"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
            <div className="liquid-glass rounded-full px-4 py-1.5 inline-flex items-center gap-2 mb-5">
              <ShieldCheck className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white/70 text-[10px] uppercase tracking-[0.3em]">Admin Portal</span>
            </div>
            <h1 style={SERIF} className="text-4xl md:text-5xl text-white tracking-tight leading-tight">
              Welcome <em className="italic text-white/60">back.</em>
            </h1>
            <p className="text-white/40 text-sm mt-3">Authorised personnel only.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {attempts >= 3 && !error && (
            <div className="liquid-glass rounded-xl p-3 mb-5">
              <p className="text-xs text-amber-300/90 text-center">
                ⚠️ Multiple failed attempts. Account locks after 5 tries.
              </p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <label className="text-white/40 text-xs uppercase tracking-widest">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your username"
                autoComplete="username"
                disabled={isLoading}
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <label className="text-white/40 text-xs uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading || !username || !password}
            className="group w-full bg-white text-black rounded-full py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sign in securely
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-[11px] text-white/25 mt-5">
            🔒 All login attempts are logged and monitored
          </p>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="liquid-glass rounded-full px-5 py-2 text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            ← Back to website
          </button>
        </div>
      </motion.div>
    </div>
  );
}
