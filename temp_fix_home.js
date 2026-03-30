const fs = require("fs");
const p = "client/src/pages/Home.tsx";
let s = fs.readFileSync(p, "utf8");
const start = s.indexOf("function PastorWelcome() {");
const end = s.indexOf("function Nav() {");
if (start < 0 || end < 0 || end <= start) throw new Error("Markers not found");
const replacement = `function PastorWelcome() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <section className={\`py-20 px-6 ${isLight ? "bg-white" : "bg-[#060d1a]"}\`}>
      <div className="max-w-7xl mx-auto">
        <div className={\`grid lg:grid-cols-2 gap-10 items-center rounded-3xl border p-8 md:p-12 ${isLight ? "border-[#1a3a6b]/10 bg-[#f8f7f4] shadow-xl shadow-[#1a3a6b]/6" : "border-white/5 bg-white/3"}\`}>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-amber-500/10 blur-2xl" />
            <img
              src="/assets/PCN-FAP-CONG.jpeg"
              alt="Pastor welcoming the congregation"
              className="relative w-full h-[360px] object-cover rounded-2xl border border-white/10 shadow-2xl"
            />
          </div>
          <div className="space-y-5">
            <p className={\`text-[9px] font-black uppercase tracking-[0.4em] ${isLight ? "text-amber-600/60" : "text-amber-400/50"}\`}>Pastor's Welcome</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className={\`text-4xl md:text-5xl font-black ${isLight ? "text-[#132744]" : "text-white"}\`}>A Warm Welcome From Our Parish Family</h2>
            <p className={\`leading-relaxed ${isLight ? "text-[#1a3a6b]/60" : "text-white/40"}\`}>
              We are delighted to welcome you to Presbyterian Church of Nigeria, First Abuja Parish. Join us as we worship God, grow in faith, and serve our community with love and excellence.
            </p>
            <p className={\`leading-relaxed ${isLight ? "text-[#1a3a6b]/60" : "text-white/40"}\`}>
              Whether you are visiting for the first time or returning home, we invite you to experience uplifting worship, sound teaching, and genuine fellowship.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={() => window.location.assign("/about")} className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-[#050912] text-sm font-black uppercase tracking-widest transition-all">
                Learn More
              </button>
              <button onClick={() => window.location.assign("/contact")} className={\`px-6 py-3 rounded-full text-sm font-semibold transition-all ${isLight ? "border border-[#1a3a6b]/15 text-[#1a3a6b]/70 hover:bg-[#1a3a6b]/4 hover:text-[#1a3a6b]" : "border border-white/10 text-white/70 hover:bg-white/4 hover:text-white"}\`}>
                Visit Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceTimes() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <section className={\`py-20 px-6 ${isLight ? "bg-[#f8f7f4]" : "bg-[#050912]"}\`}>
      <div className="max-w-7xl mx-auto">
        <div className={\`rounded-3xl border p-8 md:p-12 ${isLight ? "border-[#1a3a6b]/10 bg-white shadow-xl shadow-[#1a3a6b]/6" : "border-white/5 bg-white/3"}\`}>
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-4">
              <p className={\`text-[9px] font-black uppercase tracking-[0.4em] ${isLight ? "text-amber-600/60" : "text-amber-400/50"}\`}>Service Times</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className={\`text-4xl md:text-5xl font-black ${isLight ? "text-[#132744]" : "text-white"}\`}>Join Us for Worship</h2>
              <p className={\`max-w-xl leading-relaxed ${isLight ? "text-[#1a3a6b]/55" : "text-white/35"}\`}>Plan your visit and worship with us during our weekly services and special meetings.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { day: "Sunday", time: "8:00 AM", title: "Main Worship Service" },
                { day: "Wednesday", time: "5:00 PM", title: "Bible Study & Prayer" },
                { day: "Friday", time: "5:30 PM", title: "Prayer Meeting" },
                { day: "1st Sunday", time: "7:00 AM", title: "Holy Communion" },
              ].map((item) => (
                <div key={\`\${item.day}-\${item.time}\`} className={\`rounded-2xl p-5 border ${isLight ? "border-[#1a3a6b]/10 bg-[#f8f7f4]" : "border-white/5 bg-white/2"}\`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className={\`text-[10px] font-black uppercase tracking-[0.3em] ${isLight ? "text-amber-600/60" : "text-amber-400/50"}\`}>{item.day}</p>
                      <h3 className={\`mt-2 text-lg font-bold ${isLight ? "text-[#132744]" : "text-white"}\`}>{item.title}</h3>
                    </div>
                    <div className={\`shrink-0 rounded-xl px-3 py-2 text-sm font-black ${isLight ? "bg-amber-500/10 text-amber-700" : "bg-amber-500/10 text-amber-300"}\`}>
                      {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`;
s = s.slice(0, start) + replacement + s.slice(end);
fs.writeFileSync(p, s);
