import { type ReactNode, useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  BookOpen, Calendar, CheckCircle2, ChevronRight, Clock3, CreditCard,
  Edit2, FileText, GalleryHorizontal, History, Inbox, Image,
  LayoutDashboard, Loader2, MapPin, MessageSquare, Plus, Save,
  ShieldCheck, Sparkles, Trash2, UserCog, X, ChevronDown, ChevronUp,
  Globe, Users, Heart, Play, Church, Building2, HandCoins, Sprout,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { logger } from "@/lib/logger";
import {
  formatItineraryText, parseEventDescription, parseItineraryText, serializeEventDescription,
} from "@/lib/event-details";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type Sermon = { id: number | string; title: string; scripture: string; date: string; preacher: string; excerpt: string; category: string; youtubeUrl?: string; facebookUrl?: string; isLive?: boolean };
type EventItem = { id: number; day: string; month: string; title: string; time: string; location: string; description?: string; category: string; featured?: boolean };
type Testimony = { id: number; name: string; profession: string; quote: string; category: string };
type GalleryItem = { id: number; caption: string; category: string; imageUrl: string | null };
type HeroSlide = { id?: number; label: string; title: string; subtitle: string; image: string; cta1?: { label: string; route?: string; href?: string }; cta2?: { label: string; route?: string; href?: string } };
type ContactRecord = { id: number; name?: string; email?: string; phone?: string; subject?: string; message: string; type: string; anonymous?: boolean; read?: boolean; createdAt?: string };
type AuditEntry = { id: number | string; action: string; entity: string; summary?: string; createdAt?: string; actorName?: string; role?: string };
type RoleInfo = { role?: string; label?: string };
type SiteContentMeta = { status?: string; publishAt?: string | null; updatedAt?: string; updatedBy?: string; draft?: boolean };

// Page-specific types
type TimelineEntry = { year: string; event: string };
type DoctrineEntry = { title: string; description: string };
type StatEntry = { value: string; label: string; color: string };
type CommitteeLead = { title: string; name: string; phone?: string };
type Committee = { id: number; name: string; duties: string[]; leads: CommitteeLead[] };
type MinistryUnit = { id: string; name: string; tagline: string; description: string; convener?: string; icon: string; style: string; units: string[]; members: string[] };
type ChurchArm = { id: string; name: string; shortName: string; description: string; leader: string; leaderTitle: string; icon: string; style: string; activities: string[] };
type OutreachArm = { id: string; name: string; description: string; leader: string; icon: string; style: string; activities: string[] };
type ContactCard = { label: string; lines: string[]; href: string; color: string };
type ServiceTime = { day: string; time: string };
type SocialLink = { label: string; handle: string; href: string; color: string };
type DonationCategory = { id: string; label: string; description: string; color: string };
type DonationAccount = { bank: string; accountName: string; accountNumber: string; type: string; flag: string; label: string };

// ─── Nav items ────────────────────────────────────────────────────────────────

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "pages", label: "Site Pages", icon: FileText },
  { id: "sermons", label: "Sermons", icon: BookOpen },
  { id: "events", label: "Events", icon: Calendar },
  { id: "testimonies", label: "Testimonies", icon: MessageSquare },
  { id: "gallery", label: "Gallery", icon: GalleryHorizontal },
  { id: "hero", label: "Hero Slides", icon: Image },
  { id: "contact", label: "Contact", icon: MapPin },
  { id: "bank", label: "Bank Details", icon: CreditCard },
] as const;

// ─── Shared utilities ─────────────────────────────────────────────────────────

const inputCls = "w-full rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";
const textareaCls = "w-full rounded-xl border border-border bg-input p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

function Field({ label, value, onChange, textarea = false, type = "text", rows = 3, placeholder }: { label: string; value: string | number; onChange: (v: string) => void; textarea?: boolean; type?: string; rows?: number; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {textarea ? (
        <Textarea value={String(value)} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={textareaCls} />
      ) : (
        <Input type={type} value={String(value)} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
    </div>
  );
}

function SectionShell({ title, description, icon, action, children }: { title: string; description?: string; icon?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">{icon}<CardTitle className="text-2xl">{title}</CardTitle></div>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}

// Collapsible section for complex editors
function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 bg-muted/30 hover:bg-muted/50 transition-colors text-left">
        <span className="font-semibold text-foreground">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

// ─── QR helpers ───────────────────────────────────────────────────────────────

function getEventShareUrl(id: number) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/events?event=${id}`;
}

function downloadQrSvg(containerId: string, filename: string) {
  const container = document.getElementById(containerId);
  const svg = container?.querySelector("svg");
  if (!svg) { toast.error("QR code not ready yet"); return; }

  const serializer = new XMLSerializer();
  const svgData = serializer.serializeToString(svg);
  const qrSize = 200;
  const paddingX = 48, paddingTop = 48, labelGap = 22, labelHeight = 34, bottomPadding = 48;
  const outputWidth = qrSize + paddingX * 2;
  const outputHeight = paddingTop + qrSize + labelGap + labelHeight + bottomPadding;
  const qrX = (outputWidth - qrSize) / 2;
  const labelY = paddingTop + qrSize + labelGap;

  const centeredSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${outputWidth} ${outputHeight}"><rect width="100%" height="100%" fill="#ffffff"/><g transform="translate(${qrX},${paddingTop})">${svgData.replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g><text x="${outputWidth / 2}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="18" font-weight="700" letter-spacing="4" fill="#1f2937">SCAN ME</text></svg>`;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const img = new window.Image();
  img.onload = () => { canvas.width = outputWidth; canvas.height = outputHeight; ctx.drawImage(img, 0, 0); const link = document.createElement("a"); link.href = canvas.toDataURL("image/png"); link.download = filename; link.click(); };
  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(centeredSvg)));
}

// ─── DashboardCard ────────────────────────────────────────────────────────────

function DashboardCard({ title, value, description, icon, tone = "primary" }: { title: string; value: string | number; description: string; icon: ReactNode; tone?: "primary" | "secondary" | "emerald" | "amber" }) {
  const toneClasses = tone === "secondary" ? "bg-secondary/10 text-secondary" : tone === "emerald" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : tone === "amber" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-primary/10 text-primary";
  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className={`rounded-2xl p-3 ${toneClasses}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── OverviewSection ──────────────────────────────────────────────────────────

function OverviewSection() {
  const [stats, setStats] = useState({ sermons: 0, events: 0, testimonies: 0, contacts: 0, unreadContacts: 0, gallery: 0 });
  const [roleInfo, setRoleInfo] = useState<RoleInfo>({});
  const [auditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [sermons, events, testimonies, contacts, gallery, settings] = await Promise.all([
          api.getSermons().catch(() => []), api.getEvents().catch(() => []), api.getTestimonies().catch(() => []),
          api.getContacts().catch(() => []), api.getGallery().catch(() => []), api.getSettings().catch(() => null),
        ]);
        setStats({ sermons: sermons.length || 0, events: events.length || 0, testimonies: testimonies.length || 0, contacts: contacts.length || 0, unreadContacts: contacts.filter((c: ContactRecord) => !c.read).length || 0, gallery: gallery.length || 0 });
        setRoleInfo({ role: settings?.role ?? settings?.userRole ?? undefined, label: settings?.roleLabel ?? settings?.role ?? undefined });
      } catch (err) { logger.error("Failed to load stats", err); } finally { setLoading(false); }
    };
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard title="Sermons" value={loading ? "—" : stats.sermons} description="Published sermon records" icon={<BookOpen className="h-5 w-5" />} tone="primary" />
        <DashboardCard title="Events" value={loading ? "—" : stats.events} description="Upcoming and archived events" icon={<Calendar className="h-5 w-5" />} tone="secondary" />
        <DashboardCard title="Contact Inbox" value={loading ? "—" : stats.contacts} description={`${stats.unreadContacts} unread messages`} icon={<Inbox className="h-5 w-5" />} tone="amber" />
        <DashboardCard title="Testimonies" value={loading ? "—" : stats.testimonies} description="Shared testimonies" icon={<MessageSquare className="h-5 w-5" />} tone="emerald" />
        <DashboardCard title="Gallery" value={loading ? "—" : stats.gallery} description="Images in public gallery" icon={<GalleryHorizontal className="h-5 w-5" />} tone="primary" />
        <DashboardCard title="Role" value={roleInfo.label || roleInfo.role || "Admin"} description="Current account permission" icon={<ShieldCheck className="h-5 w-5" />} tone="secondary" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><History className="h-4 w-4 text-primary" />Recent Audit History</CardTitle>
          <CardDescription>Backend audit entries will appear here when enabled.</CardDescription>
        </CardHeader>
        <CardContent>
          {auditEntries.length === 0 ? <p className="text-sm text-muted-foreground">No audit entries available yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOME PAGE EDITOR
// ═══════════════════════════════════════════════════════════════════════════════

function HomePageEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const slides: HeroSlide[] = Array.isArray(data?.heroSlides) ? data.heroSlides : [];

  const updateSlide = (i: number, field: string, val: string) => {
    const updated = slides.map((s, idx) => idx === i ? { ...s, [field]: val } : s);
    onChange({ ...data, heroSlides: updated });
  };
  const updateSlideCta = (i: number, cta: "cta1" | "cta2", field: string, val: string) => {
    const updated = slides.map((s, idx) => idx === i ? { ...s, [cta]: { ...(s[cta] || {}), [field]: val } } : s);
    onChange({ ...data, heroSlides: updated });
  };
  const addSlide = () => onChange({ ...data, heroSlides: [...slides, { id: Date.now(), label: "", title: "", subtitle: "", image: "", cta1: { label: "", route: "" }, cta2: { label: "", route: "" } }] });
  const removeSlide = (i: number) => onChange({ ...data, heroSlides: slides.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Page Title" value={data?.title || ""} onChange={(v) => onChange({ ...data, title: v })} />
        <Field label="Page Subtitle" value={data?.subtitle || ""} onChange={(v) => onChange({ ...data, subtitle: v })} />
      </div>

      <div className="flex items-center justify-between pt-2">
        <h3 className="font-semibold text-foreground">Hero Slides ({slides.length})</h3>
        <Button size="sm" onClick={addSlide}><Plus className="mr-2 h-4 w-4" />Add Slide</Button>
      </div>

      {slides.map((slide, i) => (
        <CollapsibleSection key={i} title={`Slide ${i + 1}: ${slide.label || "Untitled"}`} defaultOpen={i === 0}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Label" value={slide.label} onChange={(v) => updateSlide(i, "label", v)} placeholder="Welcome" />
            <Field label="Image URL" value={slide.image} onChange={(v) => updateSlide(i, "image", v)} placeholder="/assets/image.jpg" />
          </div>
          <Field label="Title" value={slide.title} onChange={(v) => updateSlide(i, "title", v)} textarea rows={2} placeholder="Welcome to The\nPresbyterian..." />
          <Field label="Subtitle" value={slide.subtitle} onChange={(v) => updateSlide(i, "subtitle", v)} placeholder="Transforming Lives..." />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CTA Button 1</p>
              <Field label="Label" value={slide.cta1?.label || ""} onChange={(v) => updateSlideCta(i, "cta1", "label", v)} />
              <Field label="Route (internal)" value={slide.cta1?.route || ""} onChange={(v) => updateSlideCta(i, "cta1", "route", v)} placeholder="/about" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CTA Button 2</p>
              <Field label="Label" value={slide.cta2?.label || ""} onChange={(v) => updateSlideCta(i, "cta2", "label", v)} />
              <Field label="Route or URL" value={slide.cta2?.route || slide.cta2?.href || ""} onChange={(v) => updateSlideCta(i, "cta2", v.startsWith("http") ? "href" : "route", v)} placeholder="/contact or https://..." />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => removeSlide(i)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Remove Slide</Button>
        </CollapsibleSection>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABOUT PAGE EDITOR
// ═══════════════════════════════════════════════════════════════════════════════

function AboutPageEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const timeline: TimelineEntry[] = Array.isArray(data?.timeline) ? data.timeline : [];
  const doctrines: DoctrineEntry[] = Array.isArray(data?.doctrines) ? data.doctrines : [];
  const stats: StatEntry[] = Array.isArray(data?.stats) ? data.stats : [];
  const originParagraphs: string[] = Array.isArray(data?.origin?.paragraphs) ? data.origin.paragraphs : [];

  const colorOptions = ["text-amber-400", "text-cyan-400", "text-emerald-400", "text-purple-400", "text-rose-400"];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Vision Statement" value={data?.vision || ""} onChange={(v) => onChange({ ...data, vision: v })} textarea rows={3} />
        <Field label="Mission Statement" value={data?.mission || ""} onChange={(v) => onChange({ ...data, mission: v })} textarea rows={3} />
      </div>

      {/* Origin paragraphs */}
      <CollapsibleSection title={`Origin Paragraphs (${originParagraphs.length})`} defaultOpen>
        {originParagraphs.map((p, i) => (
          <div key={i} className="flex gap-2">
            <Textarea value={p} rows={3} onChange={(e) => { const updated = [...originParagraphs]; updated[i] = e.target.value; onChange({ ...data, origin: { ...data?.origin, paragraphs: updated } }); }} className={textareaCls} />
            <Button variant="ghost" size="sm" onClick={() => { const updated = originParagraphs.filter((_, idx) => idx !== i); onChange({ ...data, origin: { ...data?.origin, paragraphs: updated } }); }} className="text-destructive shrink-0"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => onChange({ ...data, origin: { ...data?.origin, paragraphs: [...originParagraphs, ""] } })}><Plus className="mr-2 h-4 w-4" />Add Paragraph</Button>
      </CollapsibleSection>

      {/* Stats */}
      <CollapsibleSection title={`Stats Cards (${stats.length})`}>
        {stats.map((stat, i) => (
          <div key={i} className="grid gap-3 md:grid-cols-4 items-end p-3 rounded-xl border border-border/60 bg-muted/20">
            <Field label="Value" value={stat.value} onChange={(v) => { const u = [...stats]; u[i] = { ...u[i], value: v }; onChange({ ...data, stats: u }); }} placeholder="1846" />
            <Field label="Label" value={stat.label} onChange={(v) => { const u = [...stats]; u[i] = { ...u[i], label: v }; onChange({ ...data, stats: u }); }} placeholder="Year Founded" />
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color</Label>
              <Select value={stat.color} onValueChange={(v) => { const u = [...stats]; u[i] = { ...u[i], color: v }; onChange({ ...data, stats: u }); }}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent>{colorOptions.map((c) => <SelectItem key={c} value={c}><span className={c}>{c}</span></SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onChange({ ...data, stats: stats.filter((_, idx) => idx !== i) })} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => onChange({ ...data, stats: [...stats, { value: "", label: "", color: "text-amber-400" }] })}><Plus className="mr-2 h-4 w-4" />Add Stat</Button>
      </CollapsibleSection>

      {/* Timeline */}
      <CollapsibleSection title={`History Timeline (${timeline.length} entries)`}>
        {timeline.map((entry, i) => (
          <div key={i} className="grid gap-3 md:grid-cols-[120px_1fr_40px] items-start p-3 rounded-xl border border-border/60 bg-muted/20">
            <Field label="Year" value={entry.year} onChange={(v) => { const u = [...timeline]; u[i] = { ...u[i], year: v }; onChange({ ...data, timeline: u }); }} placeholder="1846" />
            <Field label="Event" value={entry.event} onChange={(v) => { const u = [...timeline]; u[i] = { ...u[i], event: v }; onChange({ ...data, timeline: u }); }} textarea rows={2} />
            <div className="pt-6"><Button variant="ghost" size="sm" onClick={() => onChange({ ...data, timeline: timeline.filter((_, idx) => idx !== i) })} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></div>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => onChange({ ...data, timeline: [...timeline, { year: "", event: "" }] })}><Plus className="mr-2 h-4 w-4" />Add Timeline Entry</Button>
      </CollapsibleSection>

      {/* Doctrines */}
      <CollapsibleSection title={`Statement of Faith (${doctrines.length} doctrines)`}>
        {doctrines.map((doc, i) => (
          <div key={i} className="grid gap-3 md:grid-cols-[1fr_2fr_40px] items-start p-3 rounded-xl border border-border/60 bg-muted/20">
            <Field label="Title" value={doc.title} onChange={(v) => { const u = [...doctrines]; u[i] = { ...u[i], title: v }; onChange({ ...data, doctrines: u }); }} placeholder="The Holy Scripture" />
            <Field label="Description" value={doc.description} onChange={(v) => { const u = [...doctrines]; u[i] = { ...u[i], description: v }; onChange({ ...data, doctrines: u }); }} textarea rows={2} />
            <div className="pt-6"><Button variant="ghost" size="sm" onClick={() => onChange({ ...data, doctrines: doctrines.filter((_, idx) => idx !== i) })} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></div>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => onChange({ ...data, doctrines: [...doctrines, { title: "", description: "" }] })}><Plus className="mr-2 h-4 w-4" />Add Doctrine</Button>
      </CollapsibleSection>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAFF PAGE EDITOR
// ═══════════════════════════════════════════════════════════════════════════════

function StaffPageEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const committees: Committee[] = Array.isArray(data?.committees) ? data.committees : [];
  const stats: StatEntry[] = Array.isArray(data?.stats) ? data.stats : [];
  const colorOptions = ["text-amber-400", "text-cyan-400", "text-emerald-400", "text-purple-400"];

  const updateCommittee = (i: number, field: string, val: any) => {
    const u = [...committees]; u[i] = { ...u[i], [field]: val }; onChange({ ...data, committees: u });
  };
  const updateLead = (ci: number, li: number, field: string, val: string) => {
    const u = [...committees];
    const leads = [...(u[ci].leads || [])];
    leads[li] = { ...leads[li], [field]: val };
    u[ci] = { ...u[ci], leads };
    onChange({ ...data, committees: u });
  };
  const addLead = (ci: number) => {
    const u = [...committees]; u[ci] = { ...u[ci], leads: [...(u[ci].leads || []), { title: "", name: "", phone: "" }] }; onChange({ ...data, committees: u });
  };
  const removeLead = (ci: number, li: number) => {
    const u = [...committees]; u[ci] = { ...u[ci], leads: u[ci].leads.filter((_, idx) => idx !== li) }; onChange({ ...data, committees: u });
  };
  const updateDuties = (ci: number, raw: string) => {
    updateCommittee(ci, "duties", raw.split("\n").filter(Boolean));
  };
  const addCommittee = () => onChange({ ...data, committees: [...committees, { id: committees.length + 1, name: "", duties: [], leads: [] }] });
  const removeCommittee = (i: number) => onChange({ ...data, committees: committees.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4">
      {/* Stats */}
      <CollapsibleSection title={`Hero Stats (${stats.length})`} defaultOpen>
        {stats.map((stat, i) => (
          <div key={i} className="grid gap-3 md:grid-cols-[1fr_2fr_auto_40px] items-end p-3 rounded-xl border border-border/60 bg-muted/20">
            <Field label="Value" value={stat.value} onChange={(v) => { const u = [...stats]; u[i] = { ...u[i], value: v }; onChange({ ...data, stats: u }); }} />
            <Field label="Label" value={stat.label} onChange={(v) => { const u = [...stats]; u[i] = { ...u[i], label: v }; onChange({ ...data, stats: u }); }} />
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color</Label>
              <Select value={stat.color} onValueChange={(v) => { const u = [...stats]; u[i] = { ...u[i], color: v }; onChange({ ...data, stats: u }); }}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent>{colorOptions.map((c) => <SelectItem key={c} value={c}><span className={c}>{c}</span></SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onChange({ ...data, stats: stats.filter((_, idx) => idx !== i) })} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => onChange({ ...data, stats: [...stats, { value: "", label: "", color: "text-cyan-400" }] })}><Plus className="mr-2 h-4 w-4" />Add Stat</Button>
      </CollapsibleSection>

      {/* Committees */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Board Committees ({committees.length})</h3>
        <Button size="sm" onClick={addCommittee}><Plus className="mr-2 h-4 w-4" />Add Committee</Button>
      </div>

      {committees.map((committee, ci) => (
        <CollapsibleSection key={ci} title={`Committee ${committee.id}: ${committee.name || "Untitled"}`}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Committee ID" value={String(committee.id)} onChange={(v) => updateCommittee(ci, "id", Number(v))} type="number" />
            <Field label="Committee Name" value={committee.name} onChange={(v) => updateCommittee(ci, "name", v)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duties (one per line)</Label>
            <Textarea value={committee.duties.join("\n")} rows={4} onChange={(e) => updateDuties(ci, e.target.value)} className={textareaCls} placeholder="Project development and supervision&#10;Another duty..." />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Leads / Conveners</p>
              <Button size="sm" variant="outline" onClick={() => addLead(ci)}><Plus className="mr-2 h-4 w-4" />Add Lead</Button>
            </div>
            {(committee.leads || []).map((lead, li) => (
              <div key={li} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_40px] items-end p-3 rounded-xl border border-border/60 bg-muted/20">
                <Field label="Title" value={lead.title} onChange={(v) => updateLead(ci, li, "title", v)} placeholder="Convener" />
                <Field label="Name" value={lead.name} onChange={(v) => updateLead(ci, li, "name", v)} placeholder="Elder John Doe" />
                <Field label="Phone" value={lead.phone || ""} onChange={(v) => updateLead(ci, li, "phone", v)} placeholder="08012345678" />
                <Button variant="ghost" size="sm" onClick={() => removeLead(ci, li)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>

          <Button variant="ghost" size="sm" onClick={() => removeCommittee(ci)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Remove Committee</Button>
        </CollapsibleSection>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINISTRIES PAGE EDITOR
// ═══════════════════════════════════════════════════════════════════════════════

const MINISTRY_ICON_OPTIONS = ["Music", "Globe", "Star", "UserCheck", "Monitor", "Heart", "Home", "HandHeart", "Leaf"];
const ARM_ICON_OPTIONS = ["Users", "Heart", "Crosshair", "Star", "Shield"];
const STYLE_OPTIONS = ["amber", "cyan", "emerald", "rose", "violet", "pink", "blue", "orange", "teal", "green"];

function MinistriesPageEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const mainMinistries: MinistryUnit[] = Array.isArray(data?.mainMinistries) ? data.mainMinistries : [];
  const churchArms: ChurchArm[] = Array.isArray(data?.churchArms) ? data.churchArms : [];
  const outreachArms: OutreachArm[] = Array.isArray(data?.outreachArms) ? data.outreachArms : [];

  const updateMinistry = (i: number, field: string, val: any) => { const u = [...mainMinistries]; u[i] = { ...u[i], [field]: val }; onChange({ ...data, mainMinistries: u }); };
  const updateArm = (i: number, field: string, val: any) => { const u = [...churchArms]; u[i] = { ...u[i], [field]: val }; onChange({ ...data, churchArms: u }); };
  const updateOutreach = (i: number, field: string, val: any) => { const u = [...outreachArms]; u[i] = { ...u[i], [field]: val }; onChange({ ...data, outreachArms: u }); };

  const listToString = (arr: string[]) => arr.join("\n");
  const stringToList = (s: string) => s.split("\n").filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Main Ministries */}
      <CollapsibleSection title={`Main Ministries (${mainMinistries.length})`} defaultOpen>
        <Button size="sm" variant="outline" onClick={() => onChange({ ...data, mainMinistries: [...mainMinistries, { id: `ministry-${Date.now()}`, icon: "Music", style: "amber", name: "", tagline: "", description: "", convener: "", units: [], members: [] }] })}><Plus className="mr-2 h-4 w-4" />Add Ministry</Button>
        {mainMinistries.map((m, i) => (
          <CollapsibleSection key={i} title={m.name || `Ministry ${i + 1}`}>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="ID" value={m.id} onChange={(v) => updateMinistry(i, "id", v)} />
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Icon</Label>
                <Select value={m.icon} onValueChange={(v) => updateMinistry(i, "icon", v)}>
                  <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                  <SelectContent>{MINISTRY_ICON_OPTIONS.map((ic) => <SelectItem key={ic} value={ic}>{ic}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Style Color</Label>
                <Select value={m.style} onValueChange={(v) => updateMinistry(i, "style", v)}>
                  <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                  <SelectContent>{STYLE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Field label="Ministry Name" value={m.name} onChange={(v) => updateMinistry(i, "name", v)} />
            <Field label="Tagline" value={m.tagline} onChange={(v) => updateMinistry(i, "tagline", v)} />
            <Field label="Description" value={m.description} onChange={(v) => updateMinistry(i, "description", v)} textarea rows={2} />
            <Field label="Convener" value={m.convener || ""} onChange={(v) => updateMinistry(i, "convener", v)} />
            <Field label="Units (one per line)" value={listToString(m.units)} onChange={(v) => updateMinistry(i, "units", stringToList(v))} textarea rows={4} placeholder="First Service&#10;Second Service&#10;..." />
            <Field label="Members/Elders (one per line)" value={listToString(m.members)} onChange={(v) => updateMinistry(i, "members", stringToList(v))} textarea rows={4} />
            <Button variant="ghost" size="sm" onClick={() => onChange({ ...data, mainMinistries: mainMinistries.filter((_, idx) => idx !== i) })} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Remove</Button>
          </CollapsibleSection>
        ))}
      </CollapsibleSection>

      {/* Church Arms */}
      <CollapsibleSection title={`Church Arms (${churchArms.length})`}>
        <Button size="sm" variant="outline" onClick={() => onChange({ ...data, churchArms: [...churchArms, { id: `arm-${Date.now()}`, icon: "Users", style: "blue", name: "", shortName: "", description: "", leader: "", leaderTitle: "President", activities: [] }] })}><Plus className="mr-2 h-4 w-4" />Add Church Arm</Button>
        {churchArms.map((arm, i) => (
          <CollapsibleSection key={i} title={arm.name || `Arm ${i + 1}`}>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="ID" value={arm.id} onChange={(v) => updateArm(i, "id", v)} />
              <Field label="Short Name" value={arm.shortName} onChange={(v) => updateArm(i, "shortName", v)} />
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Icon</Label>
                <Select value={arm.icon} onValueChange={(v) => updateArm(i, "icon", v)}>
                  <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                  <SelectContent>{ARM_ICON_OPTIONS.map((ic) => <SelectItem key={ic} value={ic}>{ic}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Field label="Name" value={arm.name} onChange={(v) => updateArm(i, "name", v)} />
            <Field label="Description" value={arm.description} onChange={(v) => updateArm(i, "description", v)} textarea rows={2} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Leader Name" value={arm.leader} onChange={(v) => updateArm(i, "leader", v)} />
              <Field label="Leader Title" value={arm.leaderTitle} onChange={(v) => updateArm(i, "leaderTitle", v)} />
            </div>
            <Field label="Activities (one per line)" value={listToString(arm.activities)} onChange={(v) => updateArm(i, "activities", stringToList(v))} textarea rows={3} />
            <Button variant="ghost" size="sm" onClick={() => onChange({ ...data, churchArms: churchArms.filter((_, idx) => idx !== i) })} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Remove</Button>
          </CollapsibleSection>
        ))}
      </CollapsibleSection>

      {/* Outreach Arms */}
      <CollapsibleSection title={`Outreach Arms (${outreachArms.length})`}>
        <Button size="sm" variant="outline" onClick={() => onChange({ ...data, outreachArms: [...outreachArms, { id: `outreach-${Date.now()}`, icon: "BookOpen", style: "emerald", name: "", description: "", leader: "", activities: [] }] })}><Plus className="mr-2 h-4 w-4" />Add Outreach Arm</Button>
        {outreachArms.map((arm, i) => (
          <CollapsibleSection key={i} title={arm.name || `Outreach ${i + 1}`}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="ID" value={arm.id} onChange={(v) => updateOutreach(i, "id", v)} />
              <Field label="Icon" value={arm.icon} onChange={(v) => updateOutreach(i, "icon", v)} />
            </div>
            <Field label="Name" value={arm.name} onChange={(v) => updateOutreach(i, "name", v)} />
            <Field label="Description" value={arm.description} onChange={(v) => updateOutreach(i, "description", v)} textarea rows={2} />
            <Field label="Leader" value={arm.leader} onChange={(v) => updateOutreach(i, "leader", v)} />
            <Field label="Activities (one per line)" value={listToString(arm.activities)} onChange={(v) => updateOutreach(i, "activities", stringToList(v))} textarea rows={3} />
            <Button variant="ghost" size="sm" onClick={() => onChange({ ...data, outreachArms: outreachArms.filter((_, idx) => idx !== i) })} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Remove</Button>
          </CollapsibleSection>
        ))}
      </CollapsibleSection>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT PAGE EDITOR
// ═══════════════════════════════════════════════════════════════════════════════

function ContactPageEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const cards: ContactCard[] = Array.isArray(data?.cards) ? data.cards : [];
  const serviceTimes: ServiceTime[] = Array.isArray(data?.serviceTimes) ? data.serviceTimes : [];
  const socials: SocialLink[] = Array.isArray(data?.socials) ? data.socials : [];

  const updateCard = (i: number, field: string, val: any) => { const u = [...cards]; u[i] = { ...u[i], [field]: val }; onChange({ ...data, cards: u }); };
  const updateCardLines = (i: number, raw: string) => updateCard(i, "lines", raw.split("\n").filter(Boolean));

  return (
    <div className="space-y-4">
      {/* Contact Cards */}
      <CollapsibleSection title={`Contact Cards (${cards.length})`} defaultOpen>
        {cards.map((card, i) => (
          <div key={i} className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{card.label || `Card ${i + 1}`}</p>
              <Button variant="ghost" size="sm" onClick={() => onChange({ ...data, cards: cards.filter((_, idx) => idx !== i) })} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Label" value={card.label} onChange={(v) => updateCard(i, "label", v)} placeholder="Phone" />
              <Field label="Href (link)" value={card.href} onChange={(v) => updateCard(i, "href", v)} placeholder="tel:+234..." />
            </div>
            <Field label="Gradient Color" value={card.color} onChange={(v) => updateCard(i, "color", v)} placeholder="from-cyan-400 to-cyan-600" />
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lines (one per line)</Label>
              <Textarea value={(card.lines || []).join("\n")} rows={3} onChange={(e) => updateCardLines(i, e.target.value)} className={textareaCls} placeholder="+234 (0) 8151111877&#10;+234 (0) 817 5777773" />
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => onChange({ ...data, cards: [...cards, { label: "", lines: [], href: "", color: "from-cyan-400 to-cyan-600" }] })}><Plus className="mr-2 h-4 w-4" />Add Card</Button>
      </CollapsibleSection>

      {/* Service Times */}
      <CollapsibleSection title={`Service Times (${serviceTimes.length})`}>
        {serviceTimes.map((s, i) => (
          <div key={i} className="grid gap-3 md:grid-cols-[1fr_2fr_40px] items-end p-3 rounded-xl border border-border/60 bg-muted/20">
            <Field label="Day" value={s.day} onChange={(v) => { const u = [...serviceTimes]; u[i] = { ...u[i], day: v }; onChange({ ...data, serviceTimes: u }); }} placeholder="Sunday" />
            <Field label="Time" value={s.time} onChange={(v) => { const u = [...serviceTimes]; u[i] = { ...u[i], time: v }; onChange({ ...data, serviceTimes: u }); }} placeholder="7:00 AM & 9:30 AM" />
            <Button variant="ghost" size="sm" onClick={() => onChange({ ...data, serviceTimes: serviceTimes.filter((_, idx) => idx !== i) })} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => onChange({ ...data, serviceTimes: [...serviceTimes, { day: "", time: "" }] })}><Plus className="mr-2 h-4 w-4" />Add Service Time</Button>
      </CollapsibleSection>

      {/* Social Links */}
      <CollapsibleSection title={`Social Links (${socials.length})`}>
        {socials.map((s, i) => (
          <div key={i} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_40px] items-end p-3 rounded-xl border border-border/60 bg-muted/20">
            <Field label="Platform" value={s.label} onChange={(v) => { const u = [...socials]; u[i] = { ...u[i], label: v }; onChange({ ...data, socials: u }); }} placeholder="Facebook" />
            <Field label="Handle" value={s.handle} onChange={(v) => { const u = [...socials]; u[i] = { ...u[i], handle: v }; onChange({ ...data, socials: u }); }} placeholder="@pcnfap" />
            <Field label="URL" value={s.href} onChange={(v) => { const u = [...socials]; u[i] = { ...u[i], href: v }; onChange({ ...data, socials: u }); }} placeholder="https://..." />
            <Field label="Color class" value={s.color} onChange={(v) => { const u = [...socials]; u[i] = { ...u[i], color: v }; onChange({ ...data, socials: u }); }} placeholder="text-blue-400" />
            <Button variant="ghost" size="sm" onClick={() => onChange({ ...data, socials: socials.filter((_, idx) => idx !== i) })} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => onChange({ ...data, socials: [...socials, { label: "", handle: "", href: "", color: "text-blue-400" }] })}><Plus className="mr-2 h-4 w-4" />Add Social Link</Button>
      </CollapsibleSection>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DONATIONS PAGE EDITOR
// ═══════════════════════════════════════════════════════════════════════════════

const CURRENCY_KEYS = ["ngn", "usd", "eur", "gbp"] as const;
type CurrencyKey = typeof CURRENCY_KEYS[number];

function DonationsPageEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const categories: DonationCategory[] = Array.isArray(data?.categories) ? data.categories : [];
  const accounts = data?.accounts || {};

  const updateCategory = (i: number, field: string, val: string) => { const u = [...categories]; u[i] = { ...u[i], [field]: val }; onChange({ ...data, categories: u }); };
  const updateAccount = (currency: CurrencyKey, i: number, field: string, val: string) => {
    const currAccounts = [...(accounts[currency] || [])];
    currAccounts[i] = { ...currAccounts[i], [field]: val };
    onChange({ ...data, accounts: { ...accounts, [currency]: currAccounts } });
  };
  const addAccount = (currency: CurrencyKey) => {
    const currAccounts = [...(accounts[currency] || [])];
    currAccounts.push({ bank: "", accountName: "", accountNumber: "", type: "CURRENT", flag: currency.toUpperCase(), label: "" });
    onChange({ ...data, accounts: { ...accounts, [currency]: currAccounts } });
  };
  const removeAccount = (currency: CurrencyKey, i: number) => {
    onChange({ ...data, accounts: { ...accounts, [currency]: (accounts[currency] || []).filter((_: any, idx: number) => idx !== i) } });
  };

  return (
    <div className="space-y-4">
      {/* Donation Categories */}
      <CollapsibleSection title={`Giving Categories (${categories.length})`} defaultOpen>
        {categories.map((cat, i) => (
          <div key={i} className="grid gap-3 md:grid-cols-[1fr_1fr_2fr_1fr_40px] items-end p-3 rounded-xl border border-border/60 bg-muted/20">
            <Field label="ID" value={cat.id} onChange={(v) => updateCategory(i, "id", v)} placeholder="tithe" />
            <Field label="Label" value={cat.label} onChange={(v) => updateCategory(i, "label", v)} placeholder="Tithe" />
            <Field label="Description" value={cat.description} onChange={(v) => updateCategory(i, "description", v)} placeholder="A tenth of your increase..." />
            <Field label="Gradient color" value={cat.color} onChange={(v) => updateCategory(i, "color", v)} placeholder="from-amber-400 to-amber-600" />
            <Button variant="ghost" size="sm" onClick={() => onChange({ ...data, categories: categories.filter((_, idx) => idx !== i) })} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => onChange({ ...data, categories: [...categories, { id: "", label: "", description: "", color: "from-amber-400 to-amber-600" }] })}><Plus className="mr-2 h-4 w-4" />Add Category</Button>
      </CollapsibleSection>

      {/* Bank Accounts per currency */}
      {CURRENCY_KEYS.map((currency) => (
        <CollapsibleSection key={currency} title={`${currency.toUpperCase()} Bank Accounts (${(accounts[currency] || []).length})`}>
          {(accounts[currency] || []).map((acc: DonationAccount, i: number) => (
            <div key={i} className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{acc.bank || `Account ${i + 1}`}</p>
                <Button variant="ghost" size="sm" onClick={() => removeAccount(currency, i)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Bank Name" value={acc.bank} onChange={(v) => updateAccount(currency, i, "bank", v)} placeholder="Ecobank Nigeria Plc" />
                <Field label="Account Name" value={acc.accountName} onChange={(v) => updateAccount(currency, i, "accountName", v)} />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Account Number" value={acc.accountNumber} onChange={(v) => updateAccount(currency, i, "accountNumber", v)} />
                <Field label="Account Type" value={acc.type} onChange={(v) => updateAccount(currency, i, "type", v)} placeholder="CURRENT" />
                <Field label="Label" value={acc.label} onChange={(v) => updateAccount(currency, i, "label", v)} placeholder="Naira - Tithe & Offering" />
              </div>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => addAccount(currency)}><Plus className="mr-2 h-4 w-4" />Add {currency.toUpperCase()} Account</Button>
        </CollapsibleSection>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SITE PAGES SECTION (orchestrator)
// ═══════════════════════════════════════════════════════════════════════════════

const editablePages = [
  { id: "home", label: "Home" }, { id: "about", label: "About" }, { id: "staff", label: "Staff" },
  { id: "ministries", label: "Ministries" }, { id: "contact", label: "Contact" }, { id: "donations", label: "Donations" },
] as const;
type EditablePageId = (typeof editablePages)[number]["id"];

function SitePagesSection() {
  const [selectedPage, setSelectedPage] = useState<EditablePageId>("home");
  const [rawData, setRawData] = useState<any>(null);
  const [draftData, setDraftData] = useState<any>(null);
  const [jsonDraft, setJsonDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"form" | "json">("form");
  const [meta, setMeta] = useState<SiteContentMeta>({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getSiteContent(selectedPage);
        setRawData(data);
        setDraftData(data ? JSON.parse(JSON.stringify(data)) : {});
        setJsonDraft(JSON.stringify(data, null, 2));
        setMeta({ status: data?.status, publishAt: data?.publishAt ?? null, updatedAt: data?.updatedAt, updatedBy: data?.updatedBy, draft: data?.draft });
      } catch (err) {
        logger.error("Failed to load site content", err);
        toast.error(`Failed to load ${selectedPage} content`);
      } finally { setLoading(false); }
    };
    void load();
  }, [selectedPage]);

  const handleFormChange = useCallback((newData: any) => { setDraftData(newData); }, []);

  const save = async () => {
    try {
      setSaving(true);
      const payload = mode === "json" ? JSON.parse(jsonDraft) : draftData;
      const saved = await api.updateSiteContent(selectedPage, payload);
      setRawData(saved);
      setDraftData(saved ? JSON.parse(JSON.stringify(saved)) : {});
      setJsonDraft(JSON.stringify(saved, null, 2));
      setMeta({ status: saved?.status, publishAt: saved?.publishAt ?? null, updatedAt: saved?.updatedAt, updatedBy: saved?.updatedBy });
      toast.success(`${selectedPage} page updated`);
    } catch (err) {
      logger.error("Failed to save site content", err);
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally { setSaving(false); }
  };

  const syncJsonFromForm = () => setJsonDraft(JSON.stringify(draftData, null, 2));
  const syncFormFromJson = () => { try { setDraftData(JSON.parse(jsonDraft)); toast.success("JSON applied to form"); } catch { toast.error("Invalid JSON"); } };

  return (
    <div className="space-y-6">
      <SectionShell
        title="Editable Site Pages"
        description="Full form editors for all pages. Switch to JSON fallback for advanced edits."
        icon={<FileText className="h-5 w-5 text-primary" />}
        action={
          <>{editablePages.map((page) => (
            <Button key={page.id} size="sm" variant={selectedPage === page.id ? "default" : "outline"} onClick={() => setSelectedPage(page.id)}>{page.label}</Button>
          ))}</>
        }
      >
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{meta.status || (meta.draft ? "draft" : "published") || "published"}</Badge>
          {meta.updatedBy ? <Badge variant="outline">Updated by {meta.updatedBy}</Badge> : null}
          {meta.updatedAt ? <Badge variant="outline">Updated {meta.updatedAt}</Badge> : null}
          <div className="ml-auto flex gap-2">
            <Button variant={mode === "form" ? "default" : "outline"} size="sm" onClick={() => { setMode("form"); }}>Form Editor</Button>
            <Button variant={mode === "json" ? "default" : "outline"} size="sm" onClick={() => { syncJsonFromForm(); setMode("json"); }}>JSON Editor</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-4">
            {mode === "form" ? (
              <div className="space-y-4">
                {selectedPage === "home" && <HomePageEditor data={draftData} onChange={handleFormChange} />}
                {selectedPage === "about" && <AboutPageEditor data={draftData} onChange={handleFormChange} />}
                {selectedPage === "staff" && <StaffPageEditor data={draftData} onChange={handleFormChange} />}
                {selectedPage === "ministries" && <MinistriesPageEditor data={draftData} onChange={handleFormChange} />}
                {selectedPage === "contact" && <ContactPageEditor data={draftData} onChange={handleFormChange} />}
                {selectedPage === "donations" && <DonationsPageEditor data={draftData} onChange={handleFormChange} />}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={syncFormFromJson}>Apply JSON to Form</Button>
                </div>
                <Textarea value={jsonDraft} onChange={(e) => setJsonDraft(e.target.value)} spellCheck={false} className="min-h-[520px] font-mono text-sm" />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
              <Button variant="outline" size="sm" disabled={saving}><Clock3 className="mr-2 h-4 w-4" />Draft</Button>
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save {selectedPage} page
              </Button>
            </div>
          </div>
        )}
      </SectionShell>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERMONS SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function SermonsSection() {
  const [items, setItems] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState({ title: "", scripture: "", date: "", preacher: "", excerpt: "", category: "", youtubeUrl: "", facebookUrl: "" });

  const load = async () => { try { setLoading(true); setItems((await api.getSermons()) || []); } catch (err) { logger.error("Failed to load sermons", err); toast.error("Failed to load sermons"); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);

  const openDialog = (item?: Sermon) => {
    setEditingId(item && typeof item.id === "number" ? item.id : null);
    setForm(item ? { title: item.title, scripture: item.scripture, date: item.date, preacher: item.preacher, excerpt: item.excerpt, category: item.category, youtubeUrl: item.youtubeUrl || "", facebookUrl: item.facebookUrl || "" } : { title: "", scripture: "", date: "", preacher: "", excerpt: "", category: "", youtubeUrl: "", facebookUrl: "" });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.scripture || !form.date || !form.preacher) return toast.error("Fill the required sermon fields");
    try { setSaving(true); if (editingId) await api.updateSermon(editingId, form); else await api.createSermon(form); setOpen(false); await load(); toast.success(editingId ? "Sermon updated" : "Sermon created"); } catch (err) { logger.error("Failed to save sermon", err); toast.error("Failed to save sermon"); } finally { setSaving(false); }
  };

  return (
    <SectionShell title="Sermons" description="Manage sermon records and sync from YouTube." icon={<BookOpen className="h-5 w-5 text-primary" />}
      action={<>
        <Button variant="outline" size="sm" onClick={async () => { try { setSyncing(true); const result = await api.syncYouTubeVideos(); await load(); toast.success(result.message); } catch (err) { logger.error("YouTube sync failed", err); toast.error("Failed to sync YouTube"); } finally { setSyncing(false); } }}>
          {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Sync YouTube
        </Button>
        <Button size="sm" onClick={() => openDialog()}><Plus className="mr-2 h-4 w-4" />New Sermon</Button>
      </>}>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : items.length === 0 ? <Card className="p-8 text-center"><p className="text-muted-foreground">No sermons yet</p></Card> : (
        <div className="grid gap-4">{items.map((item) => (
          <Card key={String(item.id)} className="flex items-start justify-between p-4">
            <div className="flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2"><h3 className="font-semibold text-foreground">{item.title}</h3>{item.isLive ? <Badge>Live</Badge> : null}</div>
              <p className="text-sm text-muted-foreground">{item.preacher} • {item.date}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.scripture}</p>
            </div>
            <div className="ml-4 flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => openDialog(item)}><Edit2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={async () => { if (window.confirm("Delete this sermon?")) { await api.deleteSermon(Number(item.id)); await load(); } }} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </Card>
        ))}</div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Sermon" : "New Sermon"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <Field label="Scripture" value={form.scripture} onChange={(v) => setForm({ ...form, scripture: v })} />
            <Field label="Date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} type="date" />
            <Field label="Preacher" value={form.preacher} onChange={(v) => setForm({ ...form, preacher: v })} />
            <Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
            <Field label="Excerpt" value={form.excerpt} onChange={(v) => setForm({ ...form, excerpt: v })} textarea />
            <Field label="YouTube URL" value={form.youtubeUrl} onChange={(v) => setForm({ ...form, youtubeUrl: v })} type="url" />
            <Field label="Facebook URL" value={form.facebookUrl} onChange={(v) => setForm({ ...form, facebookUrl: v })} type="url" />
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving} className="flex-1">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save</Button>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SectionShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function EventsSection() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ day: "", month: "", title: "", time: "", location: "", category: "", summary: "", programName: "", programDate: "", itineraryText: "", featured: false });

  const load = async () => { try { setLoading(true); setItems((await api.getEvents()) || []); } catch (err) { logger.error("Failed to load events", err); toast.error("Failed to load events"); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);

  const openDialog = (item?: EventItem) => {
    const parsed = parseEventDescription(item?.description);
    setEditingId(item?.id ?? null);
    setForm(item ? { day: item.day, month: item.month, title: item.title, time: item.time, location: item.location, category: item.category, summary: parsed.summary, programName: parsed.programName, programDate: parsed.programDate, itineraryText: formatItineraryText(parsed.itinerary), featured: Boolean(item.featured) } : { day: "", month: "", title: "", time: "", location: "", category: "", summary: "", programName: "", programDate: "", itineraryText: "", featured: false });
    setOpen(true);
  };

  const save = async () => {
    if (!form.day || !form.month || !form.title || !form.time || !form.location) return toast.error("Fill the required event fields");
    const payload = { day: form.day, month: form.month, title: form.title, time: form.time, location: form.location, category: form.category, featured: form.featured, description: serializeEventDescription({ summary: form.summary, programName: form.programName, programDate: form.programDate, itinerary: parseItineraryText(form.itineraryText) }) };
    try { setSaving(true); if (editingId) await api.updateEvent(editingId, payload); else await api.createEvent(payload); setOpen(false); await load(); toast.success(editingId ? "Event updated" : "Event created"); } catch (err) { logger.error("Failed to save event", err); toast.error("Failed to save event"); } finally { setSaving(false); }
  };

  return (
    <SectionShell title="Events" description="Add regular events, special services, and full day programs." icon={<Calendar className="h-5 w-5 text-primary" />} action={<Button size="sm" onClick={() => openDialog()}><Plus className="mr-2 h-4 w-4" />New Event</Button>}>
      {editingId ? (
        <Card className="mb-6 border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold text-emerald-600 dark:text-emerald-400">Program QR Code</h3>
              <p className="max-w-xl text-sm text-muted-foreground">Church members can scan this QR code to open this event directly.</p>
              <div className="rounded-xl border border-border bg-muted px-3 py-2 font-mono text-xs text-foreground break-all">{getEventShareUrl(editingId)}</div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(getEventShareUrl(editingId)); toast.success("Program link copied"); } catch { toast.error("Could not copy link"); } }}>Copy Link</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => downloadQrSvg("event-qr-preview", `pcn-event-program-${editingId}.png`)}>Download QR</Button>
              </div>
            </div>
            <div id="event-qr-preview" className="rounded-2xl bg-white p-4 shadow-xl flex flex-col items-center gap-2">
              <QRCodeSVG value={getEventShareUrl(editingId)} size={168} includeMargin bgColor="#ffffff" fgColor="#111827" />
              <p className="text-xs font-bold tracking-widest text-gray-800 uppercase">Scan Me</p>
            </div>
          </div>
        </Card>
      ) : null}

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : items.length === 0 ? <Card className="p-8 text-center"><p className="text-muted-foreground">No events yet</p></Card> : (
        <div className="grid gap-4">{items.map((item) => {
          const parsed = parseEventDescription(item.description);
          return (
            <Card key={String(item.id)} className="flex items-start justify-between p-4">
              <div className="flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2"><h3 className="font-semibold text-foreground">{item.title}</h3>{item.featured ? <Badge>Featured</Badge> : null}{parsed.itinerary.length > 0 ? <Badge variant="secondary">{parsed.itinerary.length} items</Badge> : null}</div>
                <p className="text-sm text-muted-foreground">{item.day} {item.month} • {item.time}</p>
                <p className="mt-1 text-xs text-muted-foreground">{parsed.programName ? `Program: ${parsed.programName}` : item.location}</p>
              </div>
              <div className="ml-4 flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openDialog(item)}><Edit2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={async () => { if (window.confirm("Delete this event?")) { await api.deleteEvent(item.id); await load(); } }} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          );
        })}</div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Event" : "New Event"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Day" value={form.day} onChange={(v) => setForm({ ...form, day: v })} />
              <Field label="Month" value={form.month} onChange={(v) => setForm({ ...form, month: v })} />
            </div>
            <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <Field label="Time" value={form.time} onChange={(v) => setForm({ ...form, time: v })} />
            <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
            <Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
            <Field label="Summary" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} textarea rows={4} />
            <Card className="border-primary/20 bg-primary/5 p-4">
              <div className="mb-3"><h3 className="font-semibold text-primary">Program / Itinerary</h3><p className="text-sm text-muted-foreground">Use for Sunday, Wednesday, conference, or special event schedules.</p></div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Program Name" value={form.programName} onChange={(v) => setForm({ ...form, programName: v })} />
                <Field label="Program Date" value={form.programDate} onChange={(v) => setForm({ ...form, programDate: v })} type="date" />
              </div>
              <div className="mt-4">
                <Field label="Itinerary Items" value={form.itineraryText} onChange={(v) => setForm({ ...form, itineraryText: v })} textarea rows={7} />
                <p className="mt-1 text-xs text-muted-foreground">One line per item: `time | item title | optional note`</p>
              </div>
            </Card>
            <label className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-primary" />
              <span>Show this event in featured events</span>
            </label>
            {editingId ? (
              <Card className="border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Shareable Program QR</p><p className="text-xs text-muted-foreground">Scan to open this exact event on the public Events page.</p></div>
                  <div id="event-qr-dialog" className="rounded-xl bg-white p-3 flex flex-col items-center gap-1">
                    <QRCodeSVG value={getEventShareUrl(editingId)} size={112} includeMargin bgColor="#ffffff" fgColor="#111827" />
                    <p className="text-xs font-bold tracking-widest text-gray-800 uppercase">Scan Me</p>
                  </div>
                </div>
                <div className="mt-3"><Button type="button" size="sm" variant="outline" onClick={() => downloadQrSvg("event-qr-dialog", `pcn-event-program-${editingId}.png`)}>Download QR</Button></div>
              </Card>
            ) : null}
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving} className="flex-1">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save</Button>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SectionShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTIMONIES, GALLERY, HERO, CONTACT INBOX, BANK — unchanged from original
// ═══════════════════════════════════════════════════════════════════════════════

function TestimoniesSection() {
  const [items, setItems] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", profession: "", quote: "", category: "" });

  const load = async () => { try { setLoading(true); setItems((await api.getTestimonies()) || []); } catch (err) { logger.error("Failed to load testimonies", err); toast.error("Failed to load testimonies"); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);

  const openDialog = (item?: Testimony) => { setEditingId(item?.id ?? null); setForm(item ? { name: item.name, profession: item.profession, quote: item.quote, category: item.category } : { name: "", profession: "", quote: "", category: "" }); setOpen(true); };
  const save = async () => { if (!form.name || !form.quote) return toast.error("Fill the required testimony fields"); try { setSaving(true); if (editingId) await api.updateTestimony(editingId, form); else await api.createTestimony(form); setOpen(false); await load(); toast.success(editingId ? "Testimony updated" : "Testimony created"); } catch (err) { logger.error("Failed to save testimony", err); toast.error("Failed to save testimony"); } finally { setSaving(false); } };

  return (
    <SectionShell title="Testimonies" description="Manage published testimonies." icon={<MessageSquare className="h-5 w-5 text-primary" />} action={<Button size="sm" onClick={() => openDialog()}><Plus className="mr-2 h-4 w-4" />New Testimony</Button>}>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : items.length === 0 ? <Card className="p-8 text-center"><p className="text-muted-foreground">No testimonies yet</p></Card> : (
        <div className="grid gap-4">{items.map((item) => (
          <Card key={String(item.id)} className="flex items-start justify-between p-4">
            <div className="flex-1"><h3 className="font-semibold text-foreground">{item.name}</h3><p className="text-sm text-muted-foreground">{item.profession}</p><p className="mt-1 text-xs text-muted-foreground">{item.quote}</p></div>
            <div className="ml-4 flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => openDialog(item)}><Edit2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={async () => { if (window.confirm("Delete this testimony?")) { await api.deleteTestimony(item.id); await load(); } }} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </Card>
        ))}</div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? "Edit Testimony" : "New Testimony"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Profession" value={form.profession} onChange={(v) => setForm({ ...form, profession: v })} />
            <Field label="Quote" value={form.quote} onChange={(v) => setForm({ ...form, quote: v })} textarea />
            <Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
            <div className="flex gap-2"><Button onClick={save} disabled={saving} className="flex-1">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save</Button><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </SectionShell>
  );
}

function GallerySection() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("events");
  const [file, setFile] = useState<File | null>(null);

  const load = async () => { try { setLoading(true); setItems((await api.getGallery()) || []); } catch (err) { logger.error("Failed to load gallery", err); toast.error("Failed to load gallery"); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);

  const openDialog = (item?: GalleryItem) => { setEditing(item ?? null); setCaption(item?.caption || ""); setCategory(item?.category || "events"); setFile(null); setOpen(true); };
  const save = async () => {
    if (!caption.trim()) return toast.error("Caption is required");
    const formData = new FormData(); formData.append("caption", caption.trim()); formData.append("category", category); if (file) formData.append("image", file);
    try { setSaving(true); if (editing) { await api.updateGalleryItem(editing.id, formData); toast.success("Gallery item updated"); } else { await api.createGalleryItem(formData); toast.success("Gallery item created"); } setOpen(false); await load(); } catch (err) { logger.error("Failed to save gallery item", err); toast.error("Failed to save gallery item"); } finally { setSaving(false); }
  };

  return (
    <SectionShell title="Gallery" description="Upload and manage gallery images." icon={<GalleryHorizontal className="h-5 w-5 text-primary" />} action={<Button size="sm" onClick={() => openDialog()}><Plus className="mr-2 h-4 w-4" />New Gallery Item</Button>}>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : items.length === 0 ? <Card className="p-8 text-center"><p className="text-muted-foreground">No gallery items yet</p></Card> : (
        <div className="grid gap-4">{items.map((item) => (
          <Card key={String(item.id)} className="flex items-start justify-between p-4">
            <div className="flex-1"><h3 className="font-semibold text-foreground">{item.caption}</h3><p className="text-sm text-muted-foreground">{item.category}</p><p className="mt-1 text-xs text-muted-foreground">{item.imageUrl || "No image uploaded"}</p></div>
            <div className="ml-4 flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => openDialog(item)}><Edit2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={async () => { if (window.confirm("Delete this gallery item?")) { await api.deleteGalleryItem(item.id); await load(); } }} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </Card>
        ))}</div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Gallery Item" : "New Gallery Item"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Field label="Caption" value={caption} onChange={setCaption} />
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Choose category" /></SelectTrigger>
                <SelectContent>{["worship", "events", "youth", "music"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image File</Label>
              <Input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => setFile(e.target.files?.[0] || null)} className={inputCls} />
              <p className="text-xs text-muted-foreground">{editing ? "Leave empty to keep the current image." : "Upload a JPEG, PNG, WebP, or GIF."}</p>
            </div>
            <div className="flex gap-2"><Button onClick={save} disabled={saving} className="flex-1">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save</Button><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </SectionShell>
  );
}

function HeroSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState("[]");
  const [slides, setSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    const load = async () => { try { setLoading(true); const data = await api.getSiteContent("home"); const heroSlides = Array.isArray(data?.heroSlides) ? data.heroSlides : []; setSlides(heroSlides); setDraft(JSON.stringify(heroSlides, null, 2)); } catch (err) { logger.error("Failed to load hero slides", err); toast.error("Failed to load hero slides"); } finally { setLoading(false); } };
    void load();
  }, []);

  const save = async () => { try { setSaving(true); const heroSlides = JSON.parse(draft) as HeroSlide[]; const home = await api.getSiteContent("home"); await api.updateSiteContent("home", { ...home, heroSlides }); setSlides(heroSlides); toast.success("Hero slides updated"); } catch (err) { logger.error("Failed to save hero slides", err); toast.error("Invalid hero slides JSON"); } finally { setSaving(false); } };

  return (
    <SectionShell title="Hero Slides" description="Quick JSON editor for hero slides. Use Site Pages → Home for the full form editor." icon={<Image className="h-5 w-5 text-primary" />} action={<Badge variant="secondary">JSON Quick Edit</Badge>}>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} spellCheck={false} className="min-h-[420px] font-mono text-sm" />
            <div className="flex justify-end"><Button onClick={save} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Hero Slides</Button></div>
          </div>
          <div className="space-y-4">
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardHeader><CardTitle className="text-lg">Live Hero Preview</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {(slides.length ? slides : [{ label: "Welcome", title: "Preview unavailable", subtitle: "No hero slides loaded", image: "/assets/PCN-FAP-CONG.jpeg" }] as HeroSlide[]).slice(0, 3).map((slide, index) => (
                  <div key={String(slide.id ?? index)} className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                    <div className="aspect-[4/3] bg-muted">{slide.image ? <img src={slide.image} alt={slide.label} className="h-full w-full object-cover" /> : null}</div>
                    <div className="space-y-1 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{slide.label}</p>
                      <p className="text-sm font-semibold text-foreground line-clamp-2">{slide.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{slide.subtitle}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </SectionShell>
  );
}

function ContactInboxSection() {
  const [messages, setMessages] = useState<ContactRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => { try { setLoading(true); setMessages((await api.getContacts()) || []); } catch (err) { logger.error("Failed to load contacts", err); toast.error("Failed to load contact messages"); } finally { setLoading(false); } };
  useEffect(() => { void loadMessages(); }, []);

  return (
    <SectionShell title="Contact Inbox" description="Manage incoming messages and prayer requests." icon={<Inbox className="h-5 w-5 text-primary" />} action={<Badge variant="secondary">{messages.length} messages</Badge>}>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
        <div className="grid gap-4">
          {messages.length === 0 ? <p className="text-sm text-muted-foreground">No messages yet.</p> : messages.map((message) => (
            <Card key={message.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-foreground">{message.name || "Anonymous"}</p><Badge variant="secondary">{message.type}</Badge>{!message.read ? <Badge>Unread</Badge> : <Badge variant="outline">Read</Badge>}</div>
                  <p className="text-sm text-muted-foreground">{message.email || message.phone || message.subject || "No extra contact details"}</p>
                  <p className="text-sm text-foreground/80">{message.message}</p>
                  {message.createdAt ? <p className="text-xs text-muted-foreground">{message.createdAt}</p> : null}
                </div>
                <div className="flex gap-2">
                  {!message.read ? <Button size="sm" variant="outline" onClick={async () => { await api.markContactRead(message.id); await loadMessages(); }}>Mark Read</Button> : null}
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => { if (window.confirm("Delete this message?")) { await api.deleteContact(message.id); await loadMessages(); } }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function BankSection() {
  const [draft, setDraft] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => { try { setLoading(true); const data = await api.getSiteContent("donations"); setDraft(JSON.stringify({ accounts: data?.accounts ?? {}, categories: data?.categories ?? [] }, null, 2)); } catch (err) { logger.error("Failed to load bank details", err); toast.error("Failed to load bank details"); } finally { setLoading(false); } };
    void load();
  }, []);

  const save = async () => { try { setSaving(true); const parsed = JSON.parse(draft); const existing = await api.getSiteContent("donations"); await api.updateSiteContent("donations", { ...existing, ...parsed }); toast.success("Bank details updated"); } catch (err) { logger.error("Failed to save bank details", err); toast.error("Invalid bank details JSON"); } finally { setSaving(false); } };

  return (
    <SectionShell title="Bank Details" description="Quick JSON editor for bank accounts. Use Site Pages → Donations for the full form editor." icon={<CreditCard className="h-5 w-5 text-primary" />}>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
        <div className="space-y-4">
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} spellCheck={false} className="min-h-[420px] font-mono text-sm" />
          <div className="flex justify-end"><Button onClick={save} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Bank Details</Button></div>
        </div>
      )}
    </SectionShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════

export default function Admin() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const refresh = localStorage.getItem("refreshToken");
    if (!token && !refresh) navigate("/admin/login");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div><h1 className="text-xl font-bold text-foreground">PCN Admin Dashboard</h1><p className="text-xs text-muted-foreground">First Abuja Parish</p></div>
          <Button onClick={async () => { await api.logout(); navigate("/admin/login"); }} variant="outline" size="sm">Logout</Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid h-auto w-full grid-cols-3 gap-2 bg-transparent p-0 sm:grid-cols-5 lg:grid-cols-9">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger key={item.id} value={item.id} className="flex min-h-[72px] flex-col gap-2 rounded-2xl border border-border bg-card px-3 py-4 text-muted-foreground transition-colors hover:bg-muted data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Icon className="h-4 w-4" /><span className="text-xs">{item.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="overview"><OverviewSection /></TabsContent>
          <TabsContent value="pages"><SitePagesSection /></TabsContent>
          <TabsContent value="sermons"><SermonsSection /></TabsContent>
          <TabsContent value="events"><EventsSection /></TabsContent>
          <TabsContent value="testimonies"><TestimoniesSection /></TabsContent>
          <TabsContent value="gallery"><GallerySection /></TabsContent>
          <TabsContent value="hero"><HeroSection /></TabsContent>
          <TabsContent value="contact"><ContactInboxSection /></TabsContent>
          <TabsContent value="bank"><BankSection /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
