import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Heart, HandCoins, Church, Sprout, Building2, Globe2, Copy, Check } from "lucide-react";
import { useState } from "react";
import QRCodeSection from "@/pages/QRCodeSection";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const givingCategories = [
  { id: "tithe", label: "Tithe", description: "A tenth of your increase unto the Lord", icon: HandCoins, color: "from-amber-400 to-amber-600" },
  { id: "offering", label: "Offering", description: "Freewill offerings and donations", icon: Church, color: "from-cyan-400 to-cyan-600" },
  { id: "special-seed", label: "Special Seed", description: "Special seed sowing and faith offerings", icon: Sprout, color: "from-emerald-400 to-emerald-600" },
  { id: "building-fund", label: "Building Fund", description: "Support the church building project", icon: Building2, color: "from-purple-400 to-purple-600" },
  { id: "missions", label: "Missions", description: "Support evangelism and missions work", icon: Globe2, color: "from-rose-400 to-rose-600" },
  {id: "Covenant Seed", label: "Covenant Seed", description: "A special covenant seed offering to unlock blessings", icon: Sprout, color: "from-green-400 to-green-600"},
  {id: "Education Trust Fund", label: "Education Trust Fund", description: "Support the Funding of Schools owned by the Parish", icon: Building2, color: "from-blue-400 to-blue-600"},
];

const presetAmounts = [1000, 5000, 10000, 25000, 50000];

function AccountNumberCard({ number }: { number: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/10 rounded-xl p-5 border border-white/10 flex items-center justify-between backdrop-blur-sm"
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-blue-300 mb-2">Account Number</p>
        <p className="text-3xl font-bold tracking-[0.2em]">{number}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-medium transition-all"
      >
        {copied ? <><Check className="w-4 h-4 text-emerald-400" />Copied!</> : <><Copy className="w-4 h-4" />Copy</>}
      </motion.button>
    </motion.div>
  );
}

function BankTransferSection() {
  const [activeCurrency, setActiveCurrency] = useState("ngn");

  const accounts = {
    ngn: [
      { bank: "First Bank of Nigeria", accountNumber: "0000000000", flag: "🇳🇬", label: "Naira Account" },
      { bank: "Ecobank Nigeria Plc", accountNumber: "0122008480", flag: "🇳🇬", label: "Naira Account" },
    ],
    usd: [
      { bank: "Ecobank Nigeria Plc", accountNumber: "0122101941", flag: "🇺🇸", label: "USD Dollar Account" },
    ],
    eur: [
      { bank: "First Bank of Nigeria", accountNumber: "0000000000", flag: "🇪🇺", label: "Euro Account" },
    ],
    gbp: [
      { bank: "First Bank of Nigeria", accountNumber: "0000000000", flag: "🇬🇧", label: "Pounds Sterling Account" },
    ],
  };

  const currencies = [
    { id: "ngn", symbol: "₦", label: "Naira" },
    { id: "usd", symbol: "$", label: "Dollar" },
    { id: "eur", symbol: "€", label: "Euro" },
    { id: "gbp", symbol: "£", label: "Pounds" },
  ];

  const currentAccounts = accounts[activeCurrency as keyof typeof accounts];

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.6 }}
      className="rounded-2xl bg-gradient-to-br from-[#1a2a6e] to-[#0f1a4a] border border-[#2a3a80] p-10 text-white space-y-8 shadow-2xl backdrop-blur-md"
    >
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="text-center">
        <p className="text-blue-200 text-sm font-semibold">Make your offering via direct bank transfer</p>
      </motion.div>

      {/* Currency Switcher */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="flex flex-wrap gap-2 justify-center">
        {currencies.map((c) => (
          <motion.button
            key={c.id}
            onClick={() => setActiveCurrency(c.id)}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all border ${
              activeCurrency === c.id
                ? "border-amber-500 bg-amber-500/10 text-white shadow-lg shadow-amber-500/20"
                : "border-white/10 bg-white/5 text-blue-200 hover:border-amber-500/40 hover:bg-white/10"
            }`}
          >
            <span>{c.symbol}</span> {c.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Account Cards */}
      <div className="space-y-4">
        {currentAccounts.map((acc, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: i * 0.1 }}
            className="space-y-3"
          >
            {currentAccounts.length > 1 && (
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest">
                Option {i + 1} — {acc.bank}
              </p>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ translateY: -5 }}
                transition={{ duration: 0.2 }}
                className="bg-white/10 rounded-xl p-5 border border-white/10 backdrop-blur-sm"
              >
                <p className="text-xs uppercase tracking-widest text-blue-300 mb-2">Bank</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{acc.flag}</span>
                  <p className="text-lg font-bold">{acc.bank}</p>
                </div>
                <p className="text-xs text-blue-300 mt-1">{acc.label}</p>
              </motion.div>
              <motion.div
                whileHover={{ translateY: -5 }}
                transition={{ duration: 0.2 }}
                className="bg-white/10 rounded-xl p-5 border border-white/10 backdrop-blur-sm"
              >
                <p className="text-xs uppercase tracking-widest text-blue-300 mb-2">Account Name</p>
                <p className="text-base font-bold leading-snug">
                  Presbyterian Church of Nigeria — First Abuja Parish
                </p>
              </motion.div>
            </div>
            <AccountNumberCard number={acc.accountNumber} />
            {i < currentAccounts.length - 1 && (
              <motion.div variants={itemVariants} initial="hidden" animate="visible" className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-blue-300/50 text-xs">OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.p variants={itemVariants} initial="hidden" animate="visible" className="text-blue-200 text-sm text-center">
        Please use your full name and purpose (e.g. Tithe, Offering, Building Fund) as payment reference.
      </motion.p>
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

  const handleDonate = () => {
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Donation initiated! Redirecting to payment...");
    }, 1500);
  };

  const selectedCat = givingCategories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Hero Header */}
      <div className="relative overflow-hidden py-24 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-background to-cyan-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="container relative text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2">
            <Heart className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">Give Online</span>
          </div>
          <h1 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-5xl md:text-6xl font-bold">
            Support Our Ministry
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every gift makes a difference in advancing God's kingdom through the ministries of the Presbyterian Church of Nigeria, First Abuja Parish.
          </p>
          {/* Impact Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-400">₦2.5M+</p>
              <p className="text-sm text-muted-foreground">Tithes & Offerings</p>
            </div>
            <div className="w-px bg-white/10 self-stretch hidden sm:block" />
            <div className="text-center">
              <p className="text-3xl font-bold text-cyan-400">₦1.2M+</p>
              <p className="text-sm text-muted-foreground">Community Projects</p>
            </div>
            <div className="w-px bg-white/10 self-stretch hidden sm:block" />
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-400">500+</p>
              <p className="text-sm text-muted-foreground">Members Supported</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16 space-y-16">

        {/* Step 1: Giving Categories */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold">
              Choose Giving Type
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {givingCategories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group relative p-6 rounded-2xl border-2 text-center transition-all duration-300 ${
                    isSelected
                      ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20"
                      : "border-white/10 bg-white/5 hover:border-amber-500/40 hover:bg-white/10"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{cat.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 1: Donation Form */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm">1</div>
            <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold">
              {selectedCat ? `Give ${selectedCat.label}` : "Make a Donation"}
            </h2>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form — takes 3 cols */}
            <Card className="lg:col-span-3 glass-lg p-8 space-y-8">

              {/* Amount */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-foreground">Select Amount (NGN)</label>
                <div className="grid grid-cols-3 gap-3">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset)}
                      className={`py-3 px-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                        amount === preset
                          ? "border-cyan-500 bg-cyan-500/15 text-cyan-400"
                          : "border-white/15 hover:border-cyan-500/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      ₦{preset.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₦</span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                    placeholder="Custom amount"
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Donor Info */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Donate anonymously</span>
                </label>

                {!isAnonymous && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message <span className="text-muted-foreground font-normal">(Optional)</span></label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a message of encouragement or prayer..."
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-cyan-500/50 transition-colors"
                    rows={3}
                  />
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg shadow-amber-500/20"
                onClick={handleDonate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</>
                ) : (
                  <><Heart className="w-5 h-5 mr-2" />Donate ₦{amount.toLocaleString()}{selectedCat ? ` · ${selectedCat.label}` : ""}</>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">🔒 Secure payment powered by Paystack</p>
            </Card>

            {/* Right sidebar — takes 2 cols */}
            <div className="lg:col-span-2 space-y-6">
              {/* Why Give */}
              <Card className="glass-lg p-6 space-y-4">
                <h3 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="font-bold text-lg">Why Your Gift Matters</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    "Funds weekly worship services and programmes",
                    "Supports outreach and evangelism missions",
                    "Maintains and develops church facilities",
                    "Provides welfare support to members in need",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">✦</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Scripture */}
              <Card className="glass-lg p-6 border-amber-500/20 bg-amber-500/5">
                <blockquote className="text-sm text-muted-foreground italic leading-relaxed">
                  "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
                </blockquote>
                <p className="text-amber-400 text-xs font-semibold mt-3">— 2 Corinthians 9:7</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Step 2: Bank Transfer */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">2</div>
            <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold">
              Or Pay via Bank Transfer
            </h2>
          </div>

          <BankTransferSection />
        </div>

        {/* Step 3: Scan to Give */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">3</div>
            <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-2xl font-bold">
              Scan to Give
            </h2>
          </div>
          <QRCodeSection />
        </div>

      </div>
    </div>
  );
}