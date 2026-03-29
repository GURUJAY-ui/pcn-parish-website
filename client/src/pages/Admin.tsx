import { type ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  BookOpen,
  Calendar,
  CreditCard,
  Edit2,
  FileText,
  GalleryHorizontal,
  Inbox,
  Image,
  LayoutDashboard,
  Loader,
  MapPin,
  MessageSquare,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { logger } from "@/lib/logger";
import { formatItineraryText, parseEventDescription, parseItineraryText, serializeEventDescription } from "@/lib/event-details";
import { toast } from "sonner";

type Sermon = {
  id: number | string;
  title: string;
  scripture: string;
  date: string;
  preacher: string;
  excerpt: string;
  category: string;
  youtubeUrl?: string;
  facebookUrl?: string;
  isLive?: boolean;
};

type EventItem = {
  id: number;
  day: string;
  month: string;
  title: string;
  time: string;
  location: string;
  description?: string;
  category: string;
  featured?: boolean;
};

type Testimony = {
  id: number;
  name: string;
  profession: string;
  quote: string;
  category: string;
};

type GalleryItem = {
  id: number;
  caption: string;
  category: string;
  imageUrl: string | null;
};

type HeroSlide = {
  id?: number;
  label: string;
  title: string;
  subtitle: string;
  image: string;
  cta1?: { label: string; route?: string; href?: string };
  cta2?: { label: string; route?: string; href?: string };
};

type ContactRecord = {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  type: string;
  anonymous?: boolean;
  read?: boolean;
  createdAt?: string;
};

type SiteContactContent = {
  cards?: unknown[];
  serviceTimes?: unknown[];
  socials?: unknown[];
};

type DonationsContent = {
  categories?: unknown[];
  accounts?: unknown;
};

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

const editablePages = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "staff", label: "Staff" },
  { id: "ministries", label: "Ministries" },
  { id: "contact", label: "Contact" },
  { id: "donations", label: "Donations" },
] as const;

type EditablePageId = (typeof editablePages)[number]["id"];

function getEventShareUrl(id: number) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/events?event=${id}`;
}

function downloadQrSvg(containerId: string, filename: string) {
  const svg = document.getElementById(containerId)?.querySelector("svg");
  if (!svg) {
    toast.error("QR code not ready yet");
    return;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const svgData = new XMLSerializer().serializeToString(svg);
  const img = new window.Image();

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx?.drawImage(img, 0, 0);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    link.click();
  };

  img.src = "data:image/svg+xml;base64," + btoa(svgData);
}

function Field({
  label,
  value,
  onChange,
  textarea = false,
  type = "text",
  rows = 3,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  textarea?: boolean;
  type?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea
          value={String(value)}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-foreground focus:border-cyan-500/50 focus:outline-none"
        />
      ) : (
        <input
          type={type}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-cyan-500/50 focus:outline-none"
        />
      )}
    </div>
  );
}

function PlaceholderSection({ label }: { label: string }) {
  return (
    <Card className="glass-lg p-8 text-center">
      <p className="text-muted-foreground">{label} section can be given a dedicated editor next.</p>
    </Card>
  );
}

function OverviewSection() {
  const [stats, setStats] = useState({ sermons: 0, events: 0, testimonies: 0, contacts: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [sermons, events, testimonies, contacts] = await Promise.all([
          api.getSermons().catch(() => []),
          api.getEvents().catch(() => []),
          api.getTestimonies().catch(() => []),
          api.getContacts().catch(() => []),
        ]);
        setStats({
          sermons: sermons.length || 0,
          events: events.length || 0,
          testimonies: testimonies.length || 0,
          contacts: contacts.length || 0,
        });
      } catch (err) {
        logger.error("Failed to load stats", err);
      }
    };
    void load();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="glass-lg p-6 text-center"><BookOpen className="mx-auto mb-2 h-8 w-8 text-blue-400" /><p className="text-3xl font-bold">{stats.sermons}</p><p className="text-sm text-muted-foreground">Sermons</p></Card>
      <Card className="glass-lg p-6 text-center"><Calendar className="mx-auto mb-2 h-8 w-8 text-green-400" /><p className="text-3xl font-bold">{stats.events}</p><p className="text-sm text-muted-foreground">Events</p></Card>
      <Card className="glass-lg p-6 text-center"><MessageSquare className="mx-auto mb-2 h-8 w-8 text-purple-400" /><p className="text-3xl font-bold">{stats.testimonies}</p><p className="text-sm text-muted-foreground">Testimonies</p></Card>
      <Card className="glass-lg p-6 text-center"><MapPin className="mx-auto mb-2 h-8 w-8 text-orange-400" /><p className="text-3xl font-bold">{stats.contacts}</p><p className="text-sm text-muted-foreground">Contacts</p></Card>
    </div>
  );
}

function SitePagesSection() {
  const [selectedPage, setSelectedPage] = useState<EditablePageId>("home");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getSiteContent(selectedPage);
        setDraft(JSON.stringify(data, null, 2));
      } catch (err) {
        logger.error("Failed to load site content", err);
        toast.error(`Failed to load ${selectedPage} content`);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [selectedPage]);

  const save = async () => {
    try {
      setSaving(true);
      const parsed = JSON.parse(draft);
      const saved = await api.updateSiteContent(selectedPage, parsed);
      setDraft(JSON.stringify(saved, null, 2));
      toast.success(`${selectedPage} page updated`);
    } catch (err) {
      logger.error("Failed to save site content", err);
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Editable Site Pages</h2>
        <p className="text-sm text-muted-foreground">Update the content-backed pages here without touching code.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {editablePages.map((page) => (
          <Button key={page.id} size="sm" variant={selectedPage === page.id ? "default" : "outline"} onClick={() => setSelectedPage(page.id)}>
            {page.label}
          </Button>
        ))}
      </div>
      <Card className="glass-lg p-6">
        {loading ? (
          <div className="flex justify-center py-16"><Loader className="h-8 w-8 animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            <p className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-muted-foreground">
              Keep valid JSON structure when editing arrays like `heroSlides`, `stats`, `committees`, and `mainMinistries`.
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck={false}
              className="min-h-[520px] w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 font-mono text-sm text-slate-100 focus:border-cyan-500/50 focus:outline-none"
            />
            <div className="flex justify-end">
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function SermonsSection() {
  const [items, setItems] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState({ title: "", scripture: "", date: "", preacher: "", excerpt: "", category: "", youtubeUrl: "", facebookUrl: "" });

  const load = async () => {
    try { setLoading(true); setItems((await api.getSermons()) || []); } catch (err) { logger.error("Failed to load sermons", err); toast.error("Failed to load sermons"); } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const openDialog = (item?: Sermon) => {
    setEditingId(item && typeof item.id === "number" ? item.id : null);
    setForm(item ? { title: item.title, scripture: item.scripture, date: item.date, preacher: item.preacher, excerpt: item.excerpt, category: item.category, youtubeUrl: item.youtubeUrl || "", facebookUrl: item.facebookUrl || "" } : { title: "", scripture: "", date: "", preacher: "", excerpt: "", category: "", youtubeUrl: "", facebookUrl: "" });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.scripture || !form.date || !form.preacher) return toast.error("Fill the required sermon fields");
    try {
      setSaving(true);
      if (editingId) await api.updateSermon(editingId, form); else await api.createSermon(form);
      setOpen(false);
      await load();
      toast.success(editingId ? "Sermon updated" : "Sermon created");
    } catch (err) { logger.error("Failed to save sermon", err); toast.error("Failed to save sermon"); } finally { setSaving(false); }
  };

  return (
    <CrudSection
      title="Sermons"
      loading={loading}
      onNew={() => openDialog()}
      extraAction={<Button onClick={async () => { try { setSyncing(true); const result = await api.syncYouTubeVideos(); await load();  toast.success(result.message); } catch (err) { logger.error("YouTube sync failed", err); toast.error("Failed to sync YouTube"); } finally { setSyncing(false); } }} variant="outline" size="sm">{syncing ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}Sync YouTube</Button>}
      items={items.map((item) => ({
        id: String(item.id),
        title: item.title,
        meta: `${item.preacher} • ${item.date}`,
        submeta: item.scripture,
        onEdit: typeof item.id === "number" ? () => openDialog(item) : undefined,
        onDelete: typeof item.id === "number" ? async () => { if (window.confirm("Delete this sermon?")) { await api.deleteSermon(item.id as number); await load(); } } : undefined,
      }))}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>{editingId ? "Edit Sermon" : "New Sermon"}</DialogTitle></DialogHeader><div className="space-y-4">
          <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <Field label="Scripture" value={form.scripture} onChange={(v) => setForm({ ...form, scripture: v })} />
          <Field label="Date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} type="date" />
          <Field label="Preacher" value={form.preacher} onChange={(v) => setForm({ ...form, preacher: v })} />
          <Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <Field label="Excerpt" value={form.excerpt} onChange={(v) => setForm({ ...form, excerpt: v })} textarea />
          <Field label="YouTube URL" value={form.youtubeUrl} onChange={(v) => setForm({ ...form, youtubeUrl: v })} type="url" />
          <Field label="Facebook URL" value={form.facebookUrl} onChange={(v) => setForm({ ...form, facebookUrl: v })} type="url" />
          <div className="flex gap-2"><Button onClick={save} disabled={saving} className="flex-1">{saving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save</Button><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button></div>
        </div></DialogContent>
      </Dialog>
    </CrudSection>
  );
}

function EventsSection() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ day: "", month: "", title: "", time: "", location: "", category: "", summary: "", programName: "", programDate: "", itineraryText: "", featured: false });

  const load = async () => {
    try { setLoading(true); setItems((await api.getEvents()) || []); } catch (err) { logger.error("Failed to load events", err); toast.error("Failed to load events"); } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const openDialog = (item?: EventItem) => {
    const parsed = parseEventDescription(item?.description);
    setEditingId(item?.id ?? null);
    setForm(item ? { day: item.day, month: item.month, title: item.title, time: item.time, location: item.location, category: item.category, summary: parsed.summary, programName: parsed.programName, programDate: parsed.programDate, itineraryText: formatItineraryText(parsed.itinerary), featured: Boolean(item.featured) } : { day: "", month: "", title: "", time: "", location: "", category: "", summary: "", programName: "", programDate: "", itineraryText: "", featured: false });
    setOpen(true);
  };

  const save = async () => {
    if (!form.day || !form.month || !form.title || !form.time || !form.location) return toast.error("Fill the required event fields");
    const payload = {
      day: form.day,
      month: form.month,
      title: form.title,
      time: form.time,
      location: form.location,
      category: form.category,
      featured: form.featured,
      description: serializeEventDescription({ summary: form.summary, programName: form.programName, programDate: form.programDate, itinerary: parseItineraryText(form.itineraryText) }),
    };
    try {
      setSaving(true);
      if (editingId) await api.updateEvent(editingId, payload); else await api.createEvent(payload);
      setOpen(false);
      await load();
      toast.success(editingId ? "Event updated" : "Event created");
    } catch (err) { logger.error("Failed to save event", err); toast.error("Failed to save event"); } finally { setSaving(false); }
  };

  return (
    <CrudSection
      title="Events"
      description="Add regular events, special services, and full day programs with itinerary lines."
      loading={loading}
      onNew={() => openDialog()}
      items={items.map((item) => {
        const parsed = parseEventDescription(item.description);
        return {
          id: String(item.id),
          title: item.title,
          meta: `${item.day} ${item.month} • ${item.time}`,
          submeta: parsed.programName ? `Program: ${parsed.programName}${parsed.programDate ? ` • ${parsed.programDate}` : ""}` : item.location,
          badge: item.featured ? "Featured" : parsed.itinerary.length > 0 ? `${parsed.itinerary.length} items` : undefined,
          onEdit: () => openDialog(item),
          onDelete: async () => { if (window.confirm("Delete this event?")) { await api.deleteEvent(item.id); await load(); } },
        };
      })}
    >
      {editingId ? (
        <Card className="border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold text-emerald-400">Program QR Code</h3>
              <p className="max-w-xl text-sm text-muted-foreground">
                Church members can scan this QR code to open this event directly and view the full program or itinerary.
              </p>
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 font-mono text-xs text-slate-200 break-all">
                {getEventShareUrl(editingId)}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(getEventShareUrl(editingId));
                      toast.success("Program link copied");
                    } catch {
                      toast.error("Could not copy link");
                    }
                  }}
                >
                  Copy Link
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => downloadQrSvg("event-qr-preview", `pcn-event-program-${editingId}.png`)}
                >
                  Download QR
                </Button>
              </div>
            </div>
            <div id="event-qr-preview" className="rounded-2xl bg-white p-4 shadow-xl">
              <QRCodeSVG
                value={getEventShareUrl(editingId)}
                size={168}
                includeMargin
                bgColor="#ffffff"
                fgColor="#111827"
              />
            </div>
          </div>
        </Card>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>{editingId ? "Edit Event" : "New Event"}</DialogTitle></DialogHeader><div className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><Field label="Day" value={form.day} onChange={(v) => setForm({ ...form, day: v })} /><Field label="Month" value={form.month} onChange={(v) => setForm({ ...form, month: v })} /></div>
          <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <Field label="Time" value={form.time} onChange={(v) => setForm({ ...form, time: v })} />
          <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          <Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <Field label="Summary" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} textarea rows={4} />
          <Card className="border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="mb-3"><h3 className="font-semibold text-cyan-400">Program / Itinerary</h3><p className="text-sm text-muted-foreground">Use this for Sunday, Wednesday, conference, or special event schedules.</p></div>
            <div className="grid gap-4 md:grid-cols-2"><Field label="Program Name" value={form.programName} onChange={(v) => setForm({ ...form, programName: v })} /><Field label="Program Date" value={form.programDate} onChange={(v) => setForm({ ...form, programDate: v })} type="date" /></div>
            <div className="mt-4"><Field label="Itinerary Items" value={form.itineraryText} onChange={(v) => setForm({ ...form, itineraryText: v })} textarea rows={7} /><p className="mt-1 text-xs text-muted-foreground">One line per item: `time | item title | optional note`</p></div>
          </Card>
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4" /><span>Show this event in featured events</span></label>
          {editingId ? (
            <Card className="border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-400">Shareable Program QR</p>
                  <p className="text-xs text-muted-foreground">Scan to open this exact event on the public Events page.</p>
                </div>
                <div id="event-qr-dialog" className="rounded-xl bg-white p-3">
                  <QRCodeSVG value={getEventShareUrl(editingId)} size={112} includeMargin bgColor="#ffffff" fgColor="#111827" />
                </div>
              </div>
              <div className="mt-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => downloadQrSvg("event-qr-dialog", `pcn-event-program-${editingId}.png`)}
                >
                  Download QR
                </Button>
              </div>
            </Card>
          ) : null}
          <div className="flex gap-2"><Button onClick={save} disabled={saving} className="flex-1">{saving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save</Button><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button></div>
        </div></DialogContent>
      </Dialog>
    </CrudSection>
  );
}

function TestimoniesSection() {
  const [items, setItems] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", profession: "", quote: "", category: "" });

  const load = async () => {
    try { setLoading(true); setItems((await api.getTestimonies()) || []); } catch (err) { logger.error("Failed to load testimonies", err); toast.error("Failed to load testimonies"); } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const openDialog = (item?: Testimony) => {
    setEditingId(item?.id ?? null);
    setForm(item ? { name: item.name, profession: item.profession, quote: item.quote, category: item.category } : { name: "", profession: "", quote: "", category: "" });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.quote) return toast.error("Fill the required testimony fields");
    try {
      setSaving(true);
      if (editingId) await api.updateTestimony(editingId, form); else await api.createTestimony(form);
      setOpen(false);
      await load();
      toast.success(editingId ? "Testimony updated" : "Testimony created");
    } catch (err) { logger.error("Failed to save testimony", err); toast.error("Failed to save testimony"); } finally { setSaving(false); }
  };

  return (
    <CrudSection
      title="Testimonies"
      loading={loading}
      onNew={() => openDialog()}
      items={items.map((item) => ({
        id: String(item.id),
        title: item.name,
        meta: item.profession,
        submeta: item.quote,
        onEdit: () => openDialog(item),
        onDelete: async () => { if (window.confirm("Delete this testimony?")) { await api.deleteTestimony(item.id); await load(); } },
      }))}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{editingId ? "Edit Testimony" : "New Testimony"}</DialogTitle></DialogHeader><div className="space-y-4">
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Profession" value={form.profession} onChange={(v) => setForm({ ...form, profession: v })} />
          <Field label="Quote" value={form.quote} onChange={(v) => setForm({ ...form, quote: v })} textarea />
          <Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <div className="flex gap-2"><Button onClick={save} disabled={saving} className="flex-1">{saving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save</Button><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button></div>
        </div></DialogContent>
      </Dialog>
    </CrudSection>
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

  const load = async () => {
    try {
      setLoading(true);
      setItems((await api.getGallery()) || []);
    } catch (err) {
      logger.error("Failed to load gallery", err);
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const openDialog = (item?: GalleryItem) => {
    setEditing(item ?? null);
    setCaption(item?.caption || "");
    setCategory(item?.category || "events");
    setFile(null);
    setOpen(true);
  };

  const save = async () => {
    if (!caption.trim()) return toast.error("Caption is required");

    const formData = new FormData();
    formData.append("caption", caption.trim());
    formData.append("category", category);
    if (file) formData.append("image", file);

    try {
      setSaving(true);
      if (editing) {
        await api.updateGalleryItem(editing.id, formData);
        toast.success("Gallery item updated");
      } else {
        await api.createGalleryItem(formData);
        toast.success("Gallery item created");
      }
      setOpen(false);
      await load();
    } catch (err) {
      logger.error("Failed to save gallery item", err);
      toast.error("Failed to save gallery item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CrudSection
      title="Gallery"
      description="Upload and manage gallery images shown on the public gallery page."
      loading={loading}
      onNew={() => openDialog()}
      items={items.map((item) => ({
        id: String(item.id),
        title: item.caption,
        meta: item.category,
        submeta: item.imageUrl || "No image uploaded",
        onEdit: () => openDialog(item),
        onDelete: async () => {
          if (window.confirm("Delete this gallery item?")) {
            await api.deleteGalleryItem(item.id);
            await load();
          }
        },
      }))}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Gallery Item" : "New Gallery Item"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Field label="Caption" value={caption} onChange={setCaption} />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-cyan-500/50 focus:outline-none">
                {["worship", "events", "youth", "music"].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image File</label>
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground" />
              <p className="text-xs text-muted-foreground">{editing ? "Leave empty to keep the current image." : "Upload a JPEG, PNG, WebP, or GIF."}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving} className="flex-1">{saving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save</Button>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </CrudSection>
  );
}

function HeroSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState("[]");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getSiteContent("home");
        setDraft(JSON.stringify(data?.heroSlides ?? [], null, 2));
      } catch (err) {
        logger.error("Failed to load hero slides", err);
        toast.error("Failed to load hero slides");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      const heroSlides = JSON.parse(draft) as HeroSlide[];
      const home = await api.getSiteContent("home");
      await api.updateSiteContent("home", { ...home, heroSlides });
      toast.success("Hero slides updated");
    } catch (err) {
      logger.error("Failed to save hero slides", err);
      toast.error("Invalid hero slides JSON");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="glass-lg p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Hero Slides</h2>
        <p className="text-sm text-muted-foreground">This edits the actual `home.heroSlides` content used by the homepage.</p>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader className="h-8 w-8 animate-spin" /></div> : (
        <div className="space-y-4">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} spellCheck={false} className="min-h-[420px] w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 font-mono text-sm text-slate-100 focus:border-cyan-500/50 focus:outline-none" />
          <div className="flex justify-end"><Button onClick={save} disabled={saving}>{saving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Hero Slides</Button></div>
        </div>
      )}
    </Card>
  );
}

function ContactSection() {
  const [messages, setMessages] = useState<ContactRecord[]>([]);
  const [contentDraft, setContentDraft] = useState("{}");
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingContent, setLoadingContent] = useState(true);
  const [savingContent, setSavingContent] = useState(false);

  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      setMessages((await api.getContacts()) || []);
    } catch (err) {
      logger.error("Failed to load contacts", err);
      toast.error("Failed to load contact messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadContent = async () => {
    try {
      setLoadingContent(true);
      const content = await api.getSiteContent("contact");
      setContentDraft(JSON.stringify(content ?? {}, null, 2));
    } catch (err) {
      logger.error("Failed to load contact content", err);
      toast.error("Failed to load contact page content");
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    void loadMessages();
    void loadContent();
  }, []);

  const saveContent = async () => {
    try {
      setSavingContent(true);
      const parsed = JSON.parse(contentDraft) as SiteContactContent;
      await api.updateSiteContent("contact", parsed);
      toast.success("Contact page content updated");
    } catch (err) {
      logger.error("Failed to save contact content", err);
      toast.error("Invalid contact content JSON");
    } finally {
      setSavingContent(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-lg p-6">
        <div className="mb-4 flex items-center gap-2"><Inbox className="h-5 w-5 text-cyan-400" /><h2 className="text-2xl font-bold">Contact Inbox</h2></div>
        {loadingMessages ? <div className="flex justify-center py-12"><Loader className="h-8 w-8 animate-spin" /></div> : (
          <div className="grid gap-4">
            {messages.length === 0 ? <p className="text-sm text-muted-foreground">No messages yet.</p> : messages.map((message) => (
              <Card key={message.id} className="border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{message.name || "Anonymous"}</p>
                      <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs text-cyan-400">{message.type}</span>
                      {!message.read ? <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs text-amber-400">Unread</span> : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{message.email || message.phone || message.subject || "No extra contact details"}</p>
                    <p className="text-sm text-foreground/80">{message.message}</p>
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
      </Card>

      <Card className="glass-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Contact Page Content</h2>
          <p className="text-sm text-muted-foreground">Edit the cards, service times, and social links shown on the public contact page.</p>
        </div>
        {loadingContent ? <div className="flex justify-center py-12"><Loader className="h-8 w-8 animate-spin" /></div> : (
          <div className="space-y-4">
            <textarea value={contentDraft} onChange={(e) => setContentDraft(e.target.value)} spellCheck={false} className="min-h-[420px] w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 font-mono text-sm text-slate-100 focus:border-cyan-500/50 focus:outline-none" />
            <div className="flex justify-end"><Button onClick={saveContent} disabled={savingContent}>{savingContent ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Contact Content</Button></div>
          </div>
        )}
      </Card>
    </div>
  );
}

function BankSection() {
  const [draft, setDraft] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getSiteContent("donations");
        setDraft(JSON.stringify({ accounts: data?.accounts ?? {}, categories: data?.categories ?? [] }, null, 2));
      } catch (err) {
        logger.error("Failed to load bank details", err);
        toast.error("Failed to load bank details");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      const parsed = JSON.parse(draft) as DonationsContent;
      const existing = await api.getSiteContent("donations");
      await api.updateSiteContent("donations", { ...existing, ...parsed });
      toast.success("Bank details updated");
    } catch (err) {
      logger.error("Failed to save bank details", err);
      toast.error("Invalid bank details JSON");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="glass-lg p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Bank Details</h2>
        <p className="text-sm text-muted-foreground">Edit the donation accounts and categories shown on the giving page.</p>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader className="h-8 w-8 animate-spin" /></div> : (
        <div className="space-y-4">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} spellCheck={false} className="min-h-[420px] w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 font-mono text-sm text-slate-100 focus:border-cyan-500/50 focus:outline-none" />
          <div className="flex justify-end"><Button onClick={save} disabled={saving}>{saving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Bank Details</Button></div>
        </div>
      )}
    </Card>
  );
}

function CrudSection({
  title,
  description,
  loading,
  onNew,
  items,
  extraAction,
  children,
}: {
  title: string;
  description?: string;
  loading: boolean;
  onNew: () => void;
  items: Array<{ id: string; title: string; meta?: string; submeta?: string; badge?: string; onEdit?: () => void; onDelete?: () => void }>;
  extraAction?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="text-2xl font-bold">{title}</h2>{description ? <p className="text-sm text-muted-foreground">{description}</p> : null}</div>
        <div className="flex gap-2">{extraAction}<Button size="sm" onClick={onNew}><Plus className="mr-2 h-4 w-4" />New</Button></div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader className="h-8 w-8 animate-spin" /></div>
      ) : items.length === 0 ? (
        <Card className="glass-lg p-8 text-center"><p className="text-muted-foreground">No records yet</p></Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="glass-lg flex items-start justify-between p-4">
              <div className="flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><h3 className="font-semibold">{item.title}</h3>{item.badge ? <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-xs text-cyan-400">{item.badge}</span> : null}</div><p className="text-sm text-muted-foreground">{item.meta}</p>{item.submeta ? <p className="mt-1 text-xs text-muted-foreground">{item.submeta}</p> : null}</div>
              <div className="ml-4 flex gap-2">{item.onEdit ? <Button variant="ghost" size="sm" onClick={item.onEdit}><Edit2 className="h-4 w-4" /></Button> : null}{item.onDelete ? <Button variant="ghost" size="sm" onClick={item.onDelete} className="text-destructive"><Trash2 className="h-4 w-4" /></Button> : null}</div>
            </Card>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

export default function Admin() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) navigate("/admin/login");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white">PCN Admin Dashboard</h1>
          <Button onClick={async () => { await api.logout(); navigate("/admin/login"); }} variant="outline" size="sm">Logout</Button>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid h-auto w-full grid-cols-3 gap-2 bg-transparent p-0 sm:grid-cols-5 lg:grid-cols-9">
            {navItems.map((item) => {
              const Icon = item.icon;
              return <TabsTrigger key={item.id} value={item.id} className="flex min-h-[72px] flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-4 data-[state=active]:border-cyan-500/30 data-[state=active]:bg-cyan-500/10"><Icon className="h-4 w-4" /><span className="text-xs">{item.label}</span></TabsTrigger>;
            })}
          </TabsList>
          <TabsContent value="overview"><OverviewSection /></TabsContent>
          <TabsContent value="pages"><SitePagesSection /></TabsContent>
          <TabsContent value="sermons"><SermonsSection /></TabsContent>
          <TabsContent value="events"><EventsSection /></TabsContent>
          <TabsContent value="testimonies"><TestimoniesSection /></TabsContent>
          <TabsContent value="gallery"><GallerySection /></TabsContent>
          <TabsContent value="hero"><HeroSection /></TabsContent>
          <TabsContent value="contact"><ContactSection /></TabsContent>
          <TabsContent value="bank"><BankSection /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
