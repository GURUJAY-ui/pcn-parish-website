import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import QRCodeSection from "@/pages/QRCodeSection";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  Check,
  Copy,
  Globe2,
  HandCoins,
  Heart,
  Loader2,
  ShieldCheck,
  Sprout,
  Church,
} from "lucide-react";

const sanitizeText = (value: string, maxLen = 120): string =>
  value.replace(/[<>"'`]/g, "").replace(/javascript:/gi, "").replace(/on\w+\s*=/gi, "").trim().slice(0, maxLen);

const sanitizeAmount = (raw: string): number => {
  const parsed = parseInt(raw.replace(/[^0-9]/g, ""), 10);
  if (isNaN(parsed) || parsed <= 0) return 0;
  return Math.min(parsed, 10_000_000);
};

const isValidEmail = (email: string): boolean =>
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email) && email.length <= 254;

function useRateLimit(limitMs = 5000) {
  const lastFired = useRef<number>(0);
  return useCallback(() => {
    const now = Date.now();
    if (now - lastFired.current < limitMs) return false;
    lastFired.current = now;
    return true;
  }, [limitMs]);
}

const iconMap = {
  tithe: HandCoins,
  offering: Church,
  "special-seed": Sprout,
  "building-fund": Building2,
  missions: Globe2,
  "covenant-seed": Sprout,
  "education-trust-fund": Building2,
} as const;

const fallbackCategories = [
  { id: "tithe", label: "Tithe", description: "A tenth of your increase unto the Lord", color: "from-amber-400 to-amber-600", icon: HandCoins },
  { id: "offering", label: "Offering", description: "Freewill offerings and donations", color: "from-cyan-400 to-cyan-600", icon: Church },
  { id: "special-seed", label: "Special Seed", description: "Special seed sowing and faith offerings", color: "from-emerald-400 to-emerald-600", icon: Sprout },
  { id: "building-fund", label: "Building Fund", description: "Support the church building project", color: "from-purple-400 to-purple-600", icon: Building2 },
  { id: "missions", label: "Missions", description: "Support evangelism and missions work", color: "from-rose-400 to-rose-600", icon: Globe2 },
  { id: "covenant-seed", label: "Covenant Seed", description: "A special covenant seed offering to unlock blessings", color: "from-green-400 to-green-600", icon: Sprout },
  { id: "education-trust-fund", label: "Education Trust Fund", description: "Support the funding of schools owned by the Parish", color: "from-blue-400 to-blue-600", icon: Building2 },
];

const fallbackAccounts = {
  ngn: [
    { bank: "Ecobank Nigeria Plc", accountName: "Presbyterian Church of Nigeria - First Abuja Parish (PCN-ECO 70%)", accountNumber: "0122008480", type: "CURRENT", flag: "NGN", label: "Naira - Tithe & Offering" },
    { bank: "UBA PLC", accountName: "Presbyterian Church of Nigeria - First Abuja Parish (PCN)", accountNumber: "2057766515", type: "SAVINGS", flag: "NGN", label: "Naira - General" },
  ],
  usd: [
    { bank: "Ecobank Nigeria Plc", accountName: "Presbyterian Church of Nigeria - First Abuja Parish (Dollar)", accountNumber: "0122101941", type: "CURRENT", flag: "USD", label: "USD Dollar Account" },
  ],
  eur: [
    { bank: "Ecobank Nigeria Plc", accountName: "Presbyterian Church of Nigeria - First Abuja Parish (Euro)", accountNumber: "0129589449", type: "CURRENT", flag: "EUR", label: "Euro Account" },
  ],
  gbp: [
    { bank: "Ecobank Nigeria Plc", accountName: "Presbyterian Church of Nigeria - First Abuja Parish (Pound)", accountNumber: "0122101958", type: "CURRENT", flag: "GBP", label: "Pounds Sterling Account" },
  ],
} as const;

type CurrencyKey = keyof typeof fallbackAccounts;
type DonationCategory = (typeof fallbackCategories)[number];
type DonationAccount = (typeof fallbackAccounts)[CurrencyKey][number];

const presetAmounts = [1000, 5000, 10000, 25000, 50000];

async function safeCopyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.cssText = "position:absolute;left:-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

function AccountNumberCard({ number }: { number: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  const handleCopy = async () => {
    const ok = await safeCopyToClipboard(number);
    setState(ok ? "copied" : "error");
    setTimeout(() => setState("idle"), 2500);
  };

  return (
    <div className="bg-white/10 rounded-xl p-5 border border-white/10 flex items-center justify-between backdrop-blur-sm">
      <div>
        <p className="text-xs uppercase tracking-widest text-blue-300 mb-2">Account Number</p>
        <p className="text-2xl md:text-3xl font-bold tracking-[0.15em] select-all">{number}</p>
      </div>
      <button
        onClick={handleCopy}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
          state === "error" ? "bg-red-500/20 border-red-400/40 text-red-300" : "bg-white/10 hover:bg-white/20 border-white/20"
        }`}
      >
        {state === "copied" ? <><Check className="w-4 h-4 text-emerald-400" />Copied!</> : state === "error" ? <><AlertTriangle className="w-4 h-4" />Failed</> : <><Copy className="w-4 h-4" />Copy</>}
      </button>
    </div>
  );
}

function BankTransferSection({ accounts }: { accounts: Record<CurrencyKey, readonly DonationAccount[]> }) {
  const [activeCurrency, setActiveCurrency] = useState<CurrencyKey>("ngn");
  const currentAccounts = accounts[activeCurrency];

  const currencies: { id: CurrencyKey; symbol: string; label: string }[] = [
    { id: "ngn", symbol: "NGN", label: "Naira" },
    { id: "usd", symbol: "USD", label: "Dollar" },
    { id: "eur", symbol: "EUR", label: "Euro" },
    { id: "gbp", symbol: "GBP", label: "Pounds" },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="rounded-2xl bg-gradient-to-br from-[#1a2a6e] to-[#0f1a4a] border border-[#2a3a80] p-10 text-white space-y-8 shadow-2xl backdrop-blur-md">
      <div className="text-center">
        <p className="text-blue-200 text-sm font-semibold">Make your offering via direct bank transfer</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {currencies.map((currency) => (
          <button
            key={currency.id}
            onClick={() => setActiveCurrency(currency.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              activeCurrency === currency.id ? "bg-white text-[#0f1a4a] border-white" : "bg-white/10 border-white/15 text-white/70 hover:bg-white/15"
            }`}
          >
            {currency.symbol} {currency.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {currentAccounts.map((account, index) => (
          <div key={`${activeCurrency}-${account.accountNumber}`} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-5 border border-white/10 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-widest text-blue-300 mb-2">Bank</p>
                <p className="text-lg font-bold">{account.bank}</p>
                <p className="text-xs text-blue-300 mt-1">{account.type}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-5 border border-white/10 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-widest text-blue-300 mb-2">Account Name</p>
                <p className="text-base font-bold leading-snug">{account.accountName}</p>
              </div>
            </div>

            <AccountNumberCard number={account.accountNumber} />

            {index < currentAccounts.length - 1 && (
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-blue-300/50 text-xs">OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-blue-200 text-sm text-center">Please use your full name and purpose as payment reference.</p>
    </motion.div>
  );
}

export default function Donations() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [amount, setAmount] = useState(5000);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; amount?: string }>({});
  const [categories, setCategories] = useState<DonationCategory[]>(fallbackCategories);
  const [accounts, setAccounts] = useState<Record<CurrencyKey, readonly DonationAccount[]>>(fallbackAccounts);

  const canFire = useRateLimit(5000);

  useEffect(() => {
    api.getSiteContent("donations")
      .then((data) => {
        if (data?.accounts) setAccounts(data.accounts);
        if (Array.isArray(data?.categories) && data.categories.length > 0) {
          setCategories(
            data.categories.map((category: { id: keyof typeof iconMap; label: string; description: string; color: string }) => ({
              ...category,
              icon: iconMap[category.id] ?? HandCoins,
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (amount <= 0 || amount > 10_000_000) newErrors.amount = "Enter a valid amount between N1 and N10,000,000.";
    if (!isAnonymous) {
      if (sanitizeText(donorName, 100).length < 2) newErrors.name = "Please enter your full name.";
      if (donorEmail && !isValidEmail(donorEmail)) newErrors.email = "Enter a valid email address.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDonate = async () => {
    if (!canFire() || !validate()) return;
    setIsLoading(true);
    setSubmitMessage("");

    try {
      const reference = typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      await api.createDonation({
        donorName: isAnonymous ? "" : sanitizeText(donorName, 100),
        donorEmail: isAnonymous ? "" : sanitizeText(donorEmail, 254),
        amount,
        category: selectedCategory ?? "general",
        message: sanitizeText(message, 500),
        anonymous: isAnonymous,
        status: "pending",
        reference,
      });

      setSubmitMessage("Donation details received. You can now complete your giving using the transfer options below.");
      setSelectedCategory(null);
      setAmount(5000);
      setDonorName("");
      setDonorEmail("");
      setMessage("");
      setIsAnonymous(false);
      setErrors({});
    } catch {
      setErrors({ amount: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCat = categories.find((category) => category.id === selectedCategory);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden py-24 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-background to-cyan-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="container relative text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2">
            <Heart className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">Give Online</span>
          </div>
          <h1 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-5xl md:text-6xl font-bold">Support Our Ministry</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every gift makes a difference in advancing God's kingdom through the ministries of the Presbyterian Church of Nigeria, First Abuja Parish.
          </p>
        </div>
      </div>

      <div className="container py-16 space-y-16">
        <div className="space-y-6">
          <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold">Choose Giving Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`group relative p-6 rounded-2xl border-2 text-center transition-all duration-300 ${
                    isSelected ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20" : "border-white/10 bg-white/5 hover:border-amber-500/40 hover:bg-white/10"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{category.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{category.description}</p>
                  {isSelected && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <Card className="lg:col-span-3 glass-lg p-8 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm">1</div>
              <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold">
                {selectedCat ? `Give ${selectedCat.label}` : "Make a Donation"}
              </h2>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold">Select Amount (NGN)</label>
              <div className="grid grid-cols-3 gap-3">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => { setAmount(preset); setErrors((current) => ({ ...current, amount: undefined })); }}
                    className={`py-3 px-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                      amount === preset ? "border-cyan-500 bg-cyan-500/15 text-cyan-400" : "border-white/15 hover:border-cyan-500/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    N{preset.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">N</span>
                <Input
                  type="number"
                  value={amount || ""}
                  onChange={(e) => {
                    setAmount(sanitizeAmount(e.target.value));
                    setErrors((current) => ({ ...current, amount: undefined }));
                  }}
                  placeholder="Custom amount"
                  className="pl-8"
                />
              </div>
              {errors.amount && <p className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.amount}</p>}
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={isAnonymous} onChange={(e) => { setIsAnonymous(e.target.checked); setErrors({}); }} className="w-4 h-4 accent-cyan-500" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Donate anonymously</span>
              </label>

              {!isAnonymous && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input value={donorName} onChange={(e) => { setDonorName(sanitizeText(e.target.value, 100)); setErrors((current) => ({ ...current, name: undefined })); }} placeholder="Your name" />
                    {errors.name && <p className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" value={donorEmail} onChange={(e) => { setDonorEmail(sanitizeText(e.target.value, 254)); setErrors((current) => ({ ...current, email: undefined })); }} placeholder="your@email.com" />
                    {errors.email && <p className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.email}</p>}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Message (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(sanitizeText(e.target.value, 500))}
                  placeholder="Add a message of encouragement or prayer..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
            </div>

            {submitMessage && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">{submitMessage}</div>}

            <Button
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-60"
              onClick={handleDonate}
              disabled={isLoading}
            >
              {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</> : <><Heart className="w-5 h-5 mr-2" />Donate N{amount.toLocaleString()}{selectedCat ? ` · ${selectedCat.label}` : ""}</>}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Donation attempts are recorded securely on the backend for follow-up and reconciliation.</span>
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-lg p-6 space-y-4">
              <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold text-lg">Why Your Gift Matters</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Funds weekly worship services and programmes",
                  "Supports outreach and evangelism missions",
                  "Maintains and develops church facilities",
                  "Provides welfare support to members in need",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="glass-lg p-6 border-amber-500/20 bg-amber-500/5">
              <blockquote className="text-sm text-muted-foreground italic leading-relaxed">
                "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
              </blockquote>
              <p className="text-amber-400 text-xs font-semibold mt-3">2 Corinthians 9:7</p>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">2</div>
            <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold">Or Pay via Bank Transfer</h2>
          </div>
          <BankTransferSection accounts={accounts} />
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">3</div>
            <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold">Scan to Give</h2>
          </div>
          <QRCodeSection />
        </div>
      </div>
    </div>
  );
}
