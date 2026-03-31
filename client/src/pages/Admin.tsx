import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Edit2,
  FileText,
  GalleryHorizontal,
  History,
  Inbox,
  Image,
  LayoutDashboard,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCog,
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
  formatItineraryText,
  parseEventDescription,
  parseItineraryText,
  serializeEventDescription,
} from "@/lib/event-details";
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

type AuditEntry = {
  id: number | string;
  action: string;
  entity: string;
  summary?: string;
  createdAt?: string;
  actorName?: string;
  role?: string;
};

type RoleInfo = {
  role?: string;
  label?: string;
};

type SiteContentMeta = {
  status?: string;
  publishAt?: string | null;
  updatedAt?: string;
  updatedBy?: string;
  draft?: boolean;
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

const inputCls =
  "w-full rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

const textareaCls =
  "w-full rounded-xl border border-border bg-input p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

function Field({
  label,
  value,
  onChange,
  textarea = false,
  type = "text",
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  textarea?: boolean;
  type?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {textarea ? (
        <Textarea
          value={String(value)}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={textareaCls}
        />
      ) : (
        <Input
          type={type}
          value={String(value)}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
    </div>
  );
}

function SectionShell({
  title,
  description,
  icon,
  action,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle className="text-2xl">{title}</CardTitle>
            </div>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}

function getEventShareUrl(id: number) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/events?event=${id}`;
}

function downloadQrSvg(containerId: string, filename: string) {
  const container = document.getElementById(containerId);
  const svg = container?.querySelector("svg");
  if (!svg) {
    toast.error("QR code not ready yet");
    return;
  }

  const clone = svg.cloneNode(true) as SVGSVGElement;
  const originalSize = svg.getBoundingClientRect().width || 168;
  const labelHeight = 28;
  const totalHeight = originalSize + labelHeight;

  clone.setAttribute("width", String(originalSize));
  clone.setAttribute("height", String(totalHeight));
  clone.setAttribute("viewBox", `0 0 ${originalSize} ${totalHeight}`);

  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", String(originalSize));
  bg.setAttribute("height", String(totalHeight));
  bg.setAttribute("fill", "white");
  clone.insertBefore(bg, clone.firstChild);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", String(originalSize / 2));
  text.setAttribute("y", String(originalSize + 20));
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-family", "Arial, sans-serif");
  text.setAttribute("font-size", "13");
  text.setAttribute("font-weight", "bold");
  text.setAttribute("letter-spacing", "3");
  text.setAttribute("fill", "#1f2937");
  text.textContent = "SCAN ME";
  clone.appendChild(text);

  const scale = 3;
  const canvas = document.createElement("canvas");
  canvas.width = originalSize * scale;
  canvas.height = totalHeight * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, originalSize, totalHeight);

  const svgData = new XMLSerializer().serializeToString(clone);
  const img = new window.Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    link.click();
  };
  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
}

function DashboardCard({
  title,
  value,
  description,
  icon,
  tone = "primary",
}: {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  tone?: "primary" | "secondary" | "emerald" | "amber";
}) {
  const toneClasses =
    tone === "secondary"
      ? "bg-secondary/10 text-secondary"
      : tone === "emerald"
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : tone === "amber"
          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "bg-primary/10 text-primary";

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

function OverviewSection() {
  const [stats, setStats] = useState({
    sermons: 0,
    events: 0,
    testimonies: 0,
    contacts: 0,
    unreadContacts: 0,
    gallery: 0,
  });
  const [roleInfo, setRoleInfo] = useState<RoleInfo>({});
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [sermons, events, testimonies, contacts, gallery, settings] = await Promise.all([
          api.getSermons().catch(() => []),
          api.getEvents().catch(() => []),
          api.getTestimonies().catch(() => []),
          api.getContacts().catch(() => []),
          api.getGallery().catch(() => []),
          api.getSettings().catch(() => null),
        ]);
        setStats({
          sermons: sermons.length || 0,
          events: events.length || 0,
          testimonies: testimonies.length || 0,
          contacts: contacts.length || 0,
          unreadContacts: contacts.filter((contact: ContactRecord) => !contact.read).length || 0,
          gallery: gallery.length || 0,
        });
        setRoleInfo({
          role: settings?.role ?? settings?.userRole ?? undefined,
          label: settings?.roleLabel ?? settings?.role ?? undefined,
        });
        setAuditEntries([]);
      } catch (err) {
        logger.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          title="Sermons"
          value={loading ? "—" : stats.sermons}
          description="Published sermon records"
          icon={<BookOpen className="h-5 w-5" />}
          tone="primary"
        />
        <DashboardCard
          title="Events"
          value={loading ? "—" : stats.events}
          description="Upcoming and archived events"
          icon={<Calendar className="h-5 w-5" />}
          tone="secondary"
        />
        <DashboardCard
          title="Contact Inbox"
          value={loading ? "—" : stats.contacts}
          description={`${stats.unreadContacts} unread messages`}
          icon={<Inbox className="h-5 w-5" />}
          tone="amber"
        />
        <DashboardCard
          title="Testimonies"
          value={loading ? "—" : stats.testimonies}
          description="Shared testimonies awaiting publication"
          icon={<MessageSquare className="h-5 w-5" />}
          tone="emerald"
        />
        <DashboardCard
          title="Gallery"
          value={loading ? "—" : stats.gallery}
          description="Images in public gallery"
          icon={<GalleryHorizontal className="h-5 w-5" />}
          tone="primary"
        />
        <DashboardCard
          title="Role"
          value={roleInfo.label || roleInfo.role || "Admin"}
          description="Current account permission label"
          icon={<ShieldCheck className="h-5 w-5" />}
          tone="secondary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Recent Audit History
            </CardTitle>
            <CardDescription>
              If audit support is enabled by the backend, recent changes will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {auditEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No audit entries available yet.</p>
            ) : (
              auditEntries.map((entry) => (
                <div key={String(entry.id)} className="rounded-2xl border border-border/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{entry.action}</p>
                      <p className="text-xs text-muted-foreground">{entry.entity}</p>
                    </div>
                    <Badge variant="secondary">{entry.role || entry.actorName || "system"}</Badge>
                  </div>
                  {entry.summary ? <p className="mt-2 text-sm text-muted-foreground">{entry.summary}</p> : null}
                  {entry.createdAt ? <p className="mt-2 text-xs text-muted-foreground">{entry.createdAt}</p> : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" />
              Content Workflow
            </CardTitle>
            <CardDescription>
              Draft, publish, and scheduling placeholders shown when supported by the content model.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Draft mode", value: "Ready", icon: <Edit2 className="h-4 w-4" /> },
              { label: "Publish queue", value: "Planned", icon: <CheckCircle2 className="h-4 w-4" /> },
              { label: "Scheduled", value: "Supported", icon: <Sparkles className="h-4 w-4" /> },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <div className="text-primary">{item.icon}</div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SitePagesSection() {
  const [selectedPage, setSelectedPage] = useState<EditablePageId>("home");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState<SiteContentMeta>({});
  const [rawData, setRawData] = useState<any>(null);
  const [mode, setMode] = useState<"form" | "json">("form");
  const [roleInfo, setRoleInfo] = useState<RoleInfo>({});
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
  const load = async () => {
    try {
      setLoading(true);
      const [data, settings] = await Promise.all([
        api.getSiteContent(selectedPage),
        api.getSettings().catch(() => null),
      ]);
      setRawData(data);
      setMeta({
        status: data?.status,
        publishAt: data?.publishAt ?? data?.scheduledAt ?? null,
        updatedAt: data?.updatedAt,
        updatedBy: data?.updatedBy,
        draft: data?.draft,
      });
      setDraft(JSON.stringify(data, null, 2));
      setRoleInfo({
        role: settings?.role ?? settings?.userRole ?? undefined,
        label: settings?.roleLabel ?? settings?.role ?? undefined,
      });
      setAuditEntries([]);
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
      setRawData(saved);
      setMeta({
        status: saved?.status,
        publishAt: saved?.publishAt ?? saved?.scheduledAt ?? null,
        updatedAt: saved?.updatedAt,
        updatedBy: saved?.updatedBy,
        draft: saved?.draft,
      });
      setDraft(JSON.stringify(saved, null, 2));
      toast.success(`${selectedPage} page updated`);
    } catch (err) {
      logger.error("Failed to save site content", err);
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const preview = useMemo(() => {
    if (selectedPage === "home") {
      const heroSlides = Array.isArray(rawData?.heroSlides) ? rawData.heroSlides : [];
      return {
        title: rawData?.title || "Home",
        summary: rawData?.subtitle || "Homepage content editor",
        items: heroSlides.slice(0, 3).map((slide: HeroSlide) => `${slide.label} • ${slide.title}`),
      };
    }
    if (selectedPage === "contact") {
      const cards = Array.isArray(rawData?.cards) ? rawData.cards : [];
      return {
        title: "Contact page",
        summary: "Contact cards, service times, and socials",
        items: cards.slice(0, 3).map((card: any) => card.label || card.title || "Contact item"),
      };
    }
    if (selectedPage === "donations") {
      return {
        title: "Donations page",
        summary: "Donation categories and accounts",
        items: Array.isArray(rawData?.categories) ? rawData.categories.slice(0, 3).map((category: any) => category.label || category.title || "Category") : [],
      };
    }
    return {
      title: selectedPage,
      summary: "Structured content editor with JSON fallback",
      items: [],
    };
  }, [rawData, selectedPage]);

  return (
    <div className="space-y-6">
      <SectionShell
        title="Editable Site Pages"
        description="Form-based editing is available where content models are structured. JSON mode remains as a fallback for unsupported blocks."
        icon={<FileText className="h-5 w-5 text-primary" />}
        action={
          <>
            {editablePages.map((page) => (
              <Button key={page.id} size="sm" variant={selectedPage === page.id ? "default" : "outline"} onClick={() => setSelectedPage(page.id)}>
                {page.label}
              </Button>
            ))}
          </>
        }
      >
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{meta.status || (meta.draft ? "draft" : "published") || "published"}</Badge>
          {meta.publishAt ? <Badge variant="outline">Publish at {meta.publishAt}</Badge> : null}
          {meta.updatedBy ? <Badge variant="outline">Updated by {meta.updatedBy}</Badge> : null}
          {meta.updatedAt ? <Badge variant="outline">Updated {meta.updatedAt}</Badge> : null}
          <div className="ml-auto flex gap-2">
            <Button variant={mode === "form" ? "default" : "outline"} size="sm" onClick={() => setMode("form")}>
              Form view
            </Button>
            <Button variant={mode === "json" ? "default" : "outline"} size="sm" onClick={() => setMode("json")}>
              JSON fallback
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {mode === "form" ? (
                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-primary" />
                      Content preview and editor
                    </CardTitle>
                    <CardDescription>Form-based editor placeholder aligned with public page field names.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current page</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{preview.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{preview.summary}</p>
                    </div>
                    {selectedPage === "home" ? (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Page title" value={rawData?.title || ""} onChange={() => {}} placeholder="Home page title" />
                          <Field label="Page subtitle" value={rawData?.subtitle || ""} onChange={() => {}} placeholder="Homepage subtitle" />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Hero label" value={Array.isArray(rawData?.heroSlides) ? rawData.heroSlides[0]?.label || "" : ""} onChange={() => {}} placeholder="Welcome" />
                          <Field label="Hero title" value={Array.isArray(rawData?.heroSlides) ? rawData.heroSlides[0]?.title || "" : ""} onChange={() => {}} placeholder="Welcome to..." />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Hero image" value={Array.isArray(rawData?.heroSlides) ? rawData.heroSlides[0]?.image || "" : ""} onChange={() => {}} placeholder="/assets/image.jpg" />
                          <Field label="CTA label" value={Array.isArray(rawData?.heroSlides) ? rawData.heroSlides[0]?.cta1?.label || "" : ""} onChange={() => {}} placeholder="Learn More" />
                        </div>
                        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                          <p className="text-sm font-semibold text-primary">Live hero preview</p>
                          <div className="mt-4 grid gap-4 md:grid-cols-3">
                            {(Array.isArray(rawData?.heroSlides) ? rawData.heroSlides : []).slice(0, 3).map((slide: HeroSlide, index: number) => (
                              <div key={String(slide.id ?? index)} className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                                <div className="aspect-[4/3] bg-muted">
                                  {slide.image ? <img src={slide.image} alt={slide.label} className="h-full w-full object-cover" /> : null}
                                </div>
                                <div className="space-y-1 p-4">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{slide.label}</p>
                                  <p className="text-sm font-semibold text-foreground line-clamp-2">{slide.title}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{slide.subtitle}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : selectedPage === "contact" ? (
                      <div className="space-y-4">
                        <p className="text-sm leading-relaxed text-muted-foreground">Structured contact content should map to cards, serviceTimes, and socials exactly as the public contact page expects.</p>
                        <div className="grid gap-4 md:grid-cols-3">
                          {(Array.isArray(rawData?.cards) ? rawData.cards : []).map((card: any, index: number) => (
                            <Card key={index} className="border-border/60">
                              <CardContent className="p-4">
                                <p className="text-sm font-semibold text-foreground">{card.label || `Card ${index + 1}`}</p>
                                <p className="mt-2 text-xs text-muted-foreground">{Array.isArray(card.lines) ? card.lines.join(" • ") : "No lines configured"}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <div className="rounded-2xl border border-border/60 p-4">
                          <p className="text-sm font-semibold text-foreground">Contact inbox tools</p>
                          <p className="text-sm leading-relaxed text-muted-foreground">Use mark as read, delete, and status labels below to manage incoming enquiries.</p>
                        </div>
                      </div>
                    ) : selectedPage === "donations" ? (
                      <div className="space-y-4">
                        <p className="text-sm leading-relaxed text-muted-foreground">Donation categories and accounts must keep the public page data shape intact.</p>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Card className="border-border/60">
                            <CardHeader>
                              <CardTitle className="text-base">Categories</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {(Array.isArray(rawData?.categories) ? rawData.categories : []).map((category: any, index: number) => (
                                <div key={index} className="rounded-xl border border-border/60 p-3 text-sm">
                                  <p className="font-medium text-foreground">{category.label || category.name || `Category ${index + 1}`}</p>
                                  <p className="text-xs text-muted-foreground">{category.description || "No description"}</p>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                          <Card className="border-border/60">
                            <CardHeader>
                              <CardTitle className="text-base">Accounts</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <pre className="overflow-auto rounded-xl bg-muted p-3 text-xs text-foreground">{JSON.stringify(rawData?.accounts ?? {}, null, 2)}</pre>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-muted-foreground">No specialized form editor is available for this page yet, so JSON mode remains supported.</p>
                    )}
                  </CardContent>
                </Card>
              ) : null}

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg">Structured JSON payload</CardTitle>
                  <CardDescription>Edit the exact content model used by the public pages.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} spellCheck={false} className="min-h-[420px] font-mono text-sm" />
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button variant="outline" size="sm" disabled={saving}>
                      <Clock3 className="mr-2 h-4 w-4" />
                      Draft
                    </Button>
                    <Button variant="outline" size="sm" disabled={saving}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Schedule
                    </Button>
                    <Button onClick={save} disabled={saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    Publish status
                  </CardTitle>
                  <CardDescription>Draft/publish/scheduling placeholders for content workflows.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-2xl border border-border/60 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Current status</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{meta.status || (meta.draft ? "draft" : "published") || "published"}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Publish date</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{meta.publishAt || "Not scheduled"}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Updated by</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{meta.updatedBy || "Unknown"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Role Labels
                  </CardTitle>
                  <CardDescription>Labels exposed by the backend can be shown here without changing the login flow.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge>{roleInfo.label || roleInfo.role || "Admin"}</Badge>
                  <Badge variant="secondary">Content Editor</Badge>
                  <Badge variant="outline">Moderator</Badge>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    Audit Timeline
                  </CardTitle>
                  <CardDescription>Recent actions tied to the active account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {auditEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No audit history available.</p>
                  ) : (
                    auditEntries.map((entry) => (
                      <div key={String(entry.id)} className="rounded-2xl border border-border/60 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground">{entry.action}</p>
                          <Badge variant="secondary">{entry.entity}</Badge>
                        </div>
                        {entry.summary ? <p className="mt-2 text-sm text-muted-foreground">{entry.summary}</p> : null}
                        {entry.createdAt ? <p className="mt-2 text-xs text-muted-foreground">{entry.createdAt}</p> : null}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </SectionShell>
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
  const [form, setForm] = useState({
    title: "",
    scripture: "",
    date: "",
    preacher: "",
    excerpt: "",
    category: "",
    youtubeUrl: "",
    facebookUrl: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      setItems((await api.getSermons()) || []);
    } catch (err) {
      logger.error("Failed to load sermons", err);
      toast.error("Failed to load sermons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openDialog = (item?: Sermon) => {
    setEditingId(item && typeof item.id === "number" ? item.id : null);
    setForm(
      item
        ? {
            title: item.title,
            scripture: item.scripture,
            date: item.date,
            preacher: item.preacher,
            excerpt: item.excerpt,
            category: item.category,
            youtubeUrl: item.youtubeUrl || "",
            facebookUrl: item.facebookUrl || "",
          }
        : {
            title: "",
            scripture: "",
            date: "",
            preacher: "",
            excerpt: "",
            category: "",
            youtubeUrl: "",
            facebookUrl: "",
          }
    );
    setOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.scripture || !form.date || !form.preacher) return toast.error("Fill the required sermon fields");
    try {
      setSaving(true);
      if (editingId) await api.updateSermon(editingId, form);
      else await api.createSermon(form);
      setOpen(false);
      await load();
      toast.success(editingId ? "Sermon updated" : "Sermon created");
    } catch (err) {
      logger.error("Failed to save sermon", err);
      toast.error("Failed to save sermon");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionShell
      title="Sermons"
      description="CRUD functionality preserved, including YouTube sync and sermon management."
      icon={<BookOpen className="h-5 w-5 text-primary" />}
      action={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                setSyncing(true);
                const result = await api.syncYouTubeVideos();
                await load();
                toast.success(result.message);
              } catch (err) {
                logger.error("YouTube sync failed", err);
                toast.error("Failed to sync YouTube");
              } finally {
                setSyncing(false);
              }
            }}
          >
            {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sync YouTube
          </Button>
          <Button size="sm" onClick={() => openDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            New Sermon
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No sermons yet</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={String(item.id)} className="flex items-start justify-between p-4">
              <div className="flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  {item.isLive ? <Badge>Live</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.preacher} • {item.date}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{item.scripture}</p>
              </div>
              <div className="ml-4 flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openDialog(item)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (window.confirm("Delete this sermon?")) {
                      await api.deleteSermon(Number(item.id));
                      await load();
                    }
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Sermon" : "New Sermon"}</DialogTitle>
          </DialogHeader>
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
              <Button onClick={save} disabled={saving} className="flex-1">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SectionShell>
  );
}

function EventsSection() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    day: "",
    month: "",
    title: "",
    time: "",
    location: "",
    category: "",
    summary: "",
    programName: "",
    programDate: "",
    itineraryText: "",
    featured: false,
  });

  const load = async () => {
    try {
      setLoading(true);
      setItems((await api.getEvents()) || []);
    } catch (err) {
      logger.error("Failed to load events", err);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openDialog = (item?: EventItem) => {
    const parsed = parseEventDescription(item?.description);
    setEditingId(item?.id ?? null);
    setForm(
      item
        ? {
            day: item.day,
            month: item.month,
            title: item.title,
            time: item.time,
            location: item.location,
            category: item.category,
            summary: parsed.summary,
            programName: parsed.programName,
            programDate: parsed.programDate,
            itineraryText: formatItineraryText(parsed.itinerary),
            featured: Boolean(item.featured),
          }
        : {
            day: "",
            month: "",
            title: "",
            time: "",
            location: "",
            category: "",
            summary: "",
            programName: "",
            programDate: "",
            itineraryText: "",
            featured: false,
          }
    );
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
      description: serializeEventDescription({
        summary: form.summary,
        programName: form.programName,
        programDate: form.programDate,
        itinerary: parseItineraryText(form.itineraryText),
      }),
    };
    try {
      setSaving(true);
      if (editingId) await api.updateEvent(editingId, payload);
      else await api.createEvent(payload);
      setOpen(false);
      await load();
      toast.success(editingId ? "Event updated" : "Event created");
    } catch (err) {
      logger.error("Failed to save event", err);
      toast.error("Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionShell
      title="Events"
      description="Add regular events, special services, and full day programs with itinerary lines."
      icon={<Calendar className="h-5 w-5 text-primary" />}
      action={<Button size="sm" onClick={() => openDialog()}><Plus className="mr-2 h-4 w-4" />New Event</Button>}
    >
      {editingId ? (
        <Card className="mb-6 border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold text-emerald-600 dark:text-emerald-400">Program QR Code</h3>
              <p className="max-w-xl text-sm text-muted-foreground">
                Church members can scan this QR code to open this event directly and view the full program or itinerary.
              </p>
              <div className="rounded-xl border border-border bg-muted px-3 py-2 font-mono text-xs text-foreground break-all">
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
                <Button type="button" size="sm" variant="outline" onClick={() => downloadQrSvg("event-qr-preview", `pcn-event-program-${editingId}.png`)}>
                  Download QR
                </Button>
              </div>
            </div>
            <div id="event-qr-preview" className="rounded-2xl bg-white p-4 shadow-xl flex flex-col items-center gap-2">
              <QRCodeSVG value={getEventShareUrl(editingId)} size={168} includeMargin bgColor="#ffffff" fgColor="#111827" />
              <p className="text-xs font-bold tracking-widest text-gray-800 uppercase">Scan Me</p>
            </div>
          </div>
        </Card>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No events yet</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => {
            const parsed = parseEventDescription(item.description);
            return (
              <Card key={String(item.id)} className="flex items-start justify-between p-4">
                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    {item.featured ? <Badge>Featured</Badge> : null}
                    {parsed.itinerary.length > 0 ? <Badge variant="secondary">{parsed.itinerary.length} items</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.day} {item.month} • {item.time}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{parsed.programName ? `Program: ${parsed.programName}` : item.location}</p>
                </div>
                <div className="ml-4 flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openDialog(item)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (window.confirm("Delete this event?")) {
                        await api.deleteEvent(item.id);
                        await load();
                      }
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
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
              <div className="mb-3">
                <h3 className="font-semibold text-primary">Program / Itinerary</h3>
                <p className="text-sm text-muted-foreground">Use this for Sunday, Wednesday, conference, or special event schedules.</p>
              </div>
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
                  <div>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Shareable Program QR</p>
                    <p className="text-xs text-muted-foreground">Scan to open this exact event on the public Events page.</p>
                  </div>
                  <div id="event-qr-dialog" className="rounded-xl bg-white p-3 flex flex-col items-center gap-1">
                    <QRCodeSVG value={getEventShareUrl(editingId)} size={112} includeMargin bgColor="#ffffff" fgColor="#111827" />
                    <p className="text-xs font-bold tracking-widest text-gray-800 uppercase">Scan Me</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Button type="button" size="sm" variant="outline" onClick={() => downloadQrSvg("event-qr-dialog", `pcn-event-program-${editingId}.png`)}>
                    Download QR
                  </Button>
                </div>
              </Card>
            ) : null}
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving} className="flex-1">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SectionShell>
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
    try {
      setLoading(true);
      setItems((await api.getTestimonies()) || []);
    } catch (err) {
      logger.error("Failed to load testimonies", err);
      toast.error("Failed to load testimonies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openDialog = (item?: Testimony) => {
    setEditingId(item?.id ?? null);
    setForm(item ? { name: item.name, profession: item.profession, quote: item.quote, category: item.category } : { name: "", profession: "", quote: "", category: "" });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.quote) return toast.error("Fill the required testimony fields");
    try {
      setSaving(true);
      if (editingId) await api.updateTestimony(editingId, form);
      else await api.createTestimony(form);
      setOpen(false);
      await load();
      toast.success(editingId ? "Testimony updated" : "Testimony created");
    } catch (err) {
      logger.error("Failed to save testimony", err);
      toast.error("Failed to save testimony");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionShell
      title="Testimonies"
      description="CRUD functionality preserved for testimonies."
      icon={<MessageSquare className="h-5 w-5 text-primary" />}
      action={<Button size="sm" onClick={() => openDialog()}><Plus className="mr-2 h-4 w-4" />New Testimony</Button>}
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No testimonies yet</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={String(item.id)} className="flex items-start justify-between p-4">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.profession}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.quote}</p>
              </div>
              <div className="ml-4 flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openDialog(item)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (window.confirm("Delete this testimony?")) {
                      await api.deleteTestimony(item.id);
                      await load();
                    }
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Testimony" : "New Testimony"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Profession" value={form.profession} onChange={(v) => setForm({ ...form, profession: v })} />
            <Field label="Quote" value={form.quote} onChange={(v) => setForm({ ...form, quote: v })} textarea />
            <Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving} className="flex-1">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
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

  useEffect(() => {
    void load();
  }, []);

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
    <SectionShell
      title="Gallery"
      description="Upload and manage gallery images shown on the public gallery page."
      icon={<GalleryHorizontal className="h-5 w-5 text-primary" />}
      action={<Button size="sm" onClick={() => openDialog()}><Plus className="mr-2 h-4 w-4" />New Gallery Item</Button>}
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No gallery items yet</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={String(item.id)} className="flex items-start justify-between p-4">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{item.caption}</h3>
                <p className="text-sm text-muted-foreground">{item.category}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.imageUrl || "No image uploaded"}</p>
              </div>
              <div className="ml-4 flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openDialog(item)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (window.confirm("Delete this gallery item?")) {
                      await api.deleteGalleryItem(item.id);
                      await load();
                    }
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Gallery Item" : "New Gallery Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Caption" value={caption} onChange={setCaption} />
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {["worship", "events", "youth", "music"].map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image File</Label>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className={inputCls}
              />
              <p className="text-xs text-muted-foreground">{editing ? "Leave empty to keep the current image." : "Upload a JPEG, PNG, WebP, or GIF."}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving} className="flex-1">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
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
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getSiteContent("home");
        const heroSlides = Array.isArray(data?.heroSlides) ? data.heroSlides : [];
        setSlides(heroSlides);
        setDraft(JSON.stringify(heroSlides, null, 2));
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
      setSlides(heroSlides);
      toast.success("Hero slides updated");
    } catch (err) {
      logger.error("Failed to save hero slides", err);
      toast.error("Invalid hero slides JSON");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionShell
      title="Hero Slides"
      description="Edit the actual home.heroSlides content used by the homepage and preview it live."
      icon={<Image className="h-5 w-5 text-primary" />}
      action={<Badge variant="secondary">Live Preview</Badge>}
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} spellCheck={false} className="min-h-[420px] font-mono text-sm" />
            <div className="flex justify-end">
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Hero Slides
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="text-lg">Live Hero Preview</CardTitle>
                <CardDescription>Matches the home page hero slide fields and image paths.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(slides.length ? slides : ([
                  { label: "Welcome", title: "Preview unavailable", subtitle: "No hero slides loaded", image: "/assets/PCN-FAP-CONG.jpeg" },
                ] as HeroSlide[])).slice(0, 3).map((slide, index) => (
                  <div key={String(slide.id ?? index)} className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                    <div className="aspect-[4/3] bg-muted">
                      {slide.image ? <img src={slide.image} alt={slide.label} className="h-full w-full object-cover" /> : null}
                    </div>
                    <div className="space-y-1 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{slide.label}</p>
                      <p className="text-sm font-semibold text-foreground line-clamp-2">{slide.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{slide.subtitle}</p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {slide.cta1?.label ? <Badge variant="outline">{slide.cta1.label}</Badge> : null}
                        {slide.cta2?.label ? <Badge variant="secondary">{slide.cta2.label}</Badge> : null}
                      </div>
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
      <SectionShell
        title="Contact Inbox"
        description="Better inbox tools for marking messages read, deleting entries, and tracking status."
        icon={<Inbox className="h-5 w-5 text-primary" />}
        action={<Badge variant="secondary">{messages.length} messages</Badge>}
      >
        {loadingMessages ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            ) : messages.map((message) => (
              <Card key={message.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{message.name || "Anonymous"}</p>
                      <Badge variant="secondary">{message.type}</Badge>
                      {!message.read ? <Badge>Unread</Badge> : <Badge variant="outline">Read</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{message.email || message.phone || message.subject || "No extra contact details"}</p>
                    <p className="text-sm text-foreground/80">{message.message}</p>
                    {message.createdAt ? <p className="text-xs text-muted-foreground">{message.createdAt}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    {!message.read ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await api.markContactRead(message.id);
                          await loadMessages();
                        }}
                      >
                        Mark Read
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={async () => {
                        if (window.confirm("Delete this message?")) {
                          await api.deleteContact(message.id);
                          await loadMessages();
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </SectionShell>

      <SectionShell
        title="Contact Page Content"
        description="Edit the cards, service times, and social links shown on the public contact page."
        icon={<MapPin className="h-5 w-5 text-primary" />}
      >
        {loadingContent ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <Textarea value={contentDraft} onChange={(e) => setContentDraft(e.target.value)} spellCheck={false} className="min-h-[420px] font-mono text-sm" />
            <div className="space-y-4">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Content rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Keep cards, serviceTimes, and socials aligned with the public Contact page shape.</p>
                  <p>Use the same image paths, URLs, and social structures already consumed by the frontend.</p>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button onClick={saveContent} disabled={savingContent}>
                  {savingContent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Contact Content
                </Button>
              </div>
            </div>
          </div>
        )}
      </SectionShell>
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
    <SectionShell
      title="Bank Details"
      description="Edit the donation accounts and categories shown on the giving page."
      icon={<CreditCard className="h-5 w-5 text-primary" />}
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} spellCheck={false} className="min-h-[420px] font-mono text-sm" />
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Bank Details
            </Button>
          </div>
        </div>
      )}
    </SectionShell>
  );
}

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
          <div>
            <h1 className="text-xl font-bold text-foreground">PCN Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">First Abuja Parish</p>
          </div>
          <Button onClick={async () => { await api.logout(); navigate("/admin/login"); }} variant="outline" size="sm">
            Logout
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid h-auto w-full grid-cols-3 gap-2 bg-transparent p-0 sm:grid-cols-5 lg:grid-cols-9">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className="flex min-h-[72px] flex-col gap-2 rounded-2xl border border-border bg-card px-3 py-4 text-muted-foreground transition-colors hover:bg-muted data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{item.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="overview">
            <OverviewSection />
          </TabsContent>
          <TabsContent value="pages">
            <SitePagesSection />
          </TabsContent>
          <TabsContent value="sermons">
            <SermonsSection />
          </TabsContent>
          <TabsContent value="events">
            <EventsSection />
          </TabsContent>
          <TabsContent value="testimonies">
            <TestimoniesSection />
          </TabsContent>
          <TabsContent value="gallery">
            <GallerySection />
          </TabsContent>
          <TabsContent value="hero">
            <HeroSection />
          </TabsContent>
          <TabsContent value="contact">
            <ContactSection />
          </TabsContent>
          <TabsContent value="bank">
            <BankSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
