import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

// ── Particle component ────────────────────────────────────────────────────────
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-blue-400/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `floatParticle ${4 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Crazy loading overlay ─────────────────────────────────────────────────────
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
      {/* Blurred background */}
      <div className="absolute inset-0 bg-[#0a0f1e]/80 backdrop-blur-2xl" />

      {/* Animated rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-blue-500/20"
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
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
        style={{ animation: "scanLine 2s ease-in-out infinite" }}
      />

      {/* Main content */}
      <div className="relative flex flex-col items-center gap-8 px-8 max-w-sm w-full">

        {/* Logo with glow */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full bg-blue-500/30 blur-2xl scale-150"
            style={{ animation: "logoPulse 1.5s ease-in-out infinite" }}
          />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 flex items-center justify-center backdrop-blur-sm overflow-hidden">
            <img
              src="/assets/pcn-logo.png"
              alt="PCN"
              className="w-16 h-16 object-contain"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            {/* Rotating border */}
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 border-r-cyan-400"
              style={{ animation: "spin 1.5s linear infinite" }}
            />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h2
            style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
            className="text-xl font-bold text-white"
          >
            Authenticating
          </h2>
          <p
            key={phase}
            className="text-sm text-blue-300/70"
            style={{ animation: "fadeInUp 0.3s ease-out" }}
          >
            {messages[phase]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-2">
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-200 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-lg shadow-cyan-400/80" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-white/20">
            <span>Secure connection</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex gap-3">
          {["256-bit SSL", "JWT Secured", "Monitored"].map((badge) => (
            <div
              key={badge}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "blink 1s ease-in-out infinite" }} />
              <span className="text-xs text-white/40">{badge}</span>
            </div>
          ))}
        </div>

        {/* Hex grid decoration */}
        <div className="absolute -z-10 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-blue-400/50"
              style={{
                width: "60px",
                height: "60px",
                transform: `rotate(${i * 30}deg)`,
                left: `${-80 + i * 30}px`,
                top: `${-40 + i * 20}px`,
                animation: `hexRotate ${3 + i}s linear infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-blue-500/40 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-500/40 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-500/40 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-blue-500/40 rounded-br-lg" />

      {/* Bottom text */}
      <div className="absolute bottom-8 text-center">
        <p className="text-xs text-white/20">PCN First Abuja Parish · Secure Admin Portal</p>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          33% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
          66% { transform: translateY(-10px) translateX(-10px); opacity: 0.5; }
        }
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
        @keyframes hexRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ── Main Login Page ───────────────────────────────────────────────────────────
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
      // Keep overlay visible briefly before navigating
      setTimeout(() => navigate("/admin"), 2200);
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

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Loading overlay */}
      <LoadingOverlay visible={isLoading} />

      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <Particles />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/15 rounded-full blur-xl scale-150" />
              <img
                src="/assets/pcn-logo.png"
                alt="PCN First Abuja Parish"
                className="relative w-20 h-20 object-contain drop-shadow-2xl"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>
          <div>
            <h1 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold text-white tracking-tight">
              PCN First Abuja Parish
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className="w-8 h-px bg-blue-500/50" />
              <p className="text-xs text-blue-400/70 font-semibold uppercase tracking-[0.2em]">Admin Portal</p>
              <div className="w-8 h-px bg-blue-500/50" />
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl border border-white/8 bg-white/[0.04] backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

          <div className="p-8 space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-xl font-bold text-white">
                Secure Sign In
              </h2>
              <p className="text-xs text-white/30">Authorised personnel only</p>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {attempts >= 3 && !error && (
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <p className="text-xs text-orange-400 text-center">
                  ⚠️ Multiple failed attempts. Account locks after 5 tries.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your username"
                  autoComplete="username"
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50 rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50 rounded-xl h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading || !username || !password}
              className="w-full h-11 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Authenticating...</>
              ) : (
                <><ShieldCheck className="w-4 h-4" />Sign In Securely</>
              )}
            </button>

            <p className="text-center text-xs text-white/20">
              🔒 All login attempts are logged and monitored
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-xs text-white/25 hover:text-white/50 transition-colors"
          >
            ← Back to website
          </button>
        </div>
      </div>
    </div>
  );
}