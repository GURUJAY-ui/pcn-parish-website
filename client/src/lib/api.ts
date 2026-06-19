import logger from "./logger";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

let _accessToken: string | null = null;
let _accessTokenExpiresAt: number | null = null;

// ── Tokens are kept in memory only for security ────────────────────────────
// - accessToken: held in memory (clears on refresh, mitigates XSS risk)
// - refreshToken: sent as httpOnly cookie by server (not in JS memory)

// ── Set access token in memory only ────────────────────────────────────────
function setAccessToken(token: string, expiresIn?: number) {
  _accessToken = token;

  if (expiresIn) {
    _accessTokenExpiresAt = Date.now() + expiresIn * 1000;
  }
}

// ── Clear tokens from memory ───────────────────────────────────────────────
function clearAccessToken() {
  _accessToken = null;
  _accessTokenExpiresAt = null;
}

function clearAllTokens() {
  clearAccessToken();
}

// ── Check if token is expired ──────────────────────────────────────────────
function isTokenExpired(): boolean {
  if (!_accessTokenExpiresAt) return false;
  return Date.now() > _accessTokenExpiresAt;
}

// ── Refresh access token ──────────────────────────────────────────────────
async function refreshAccessToken(): Promise<{ accessToken: string; expiresIn: number } | null> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      clearAllTokens();
      return null;
    }

    const data = await res.json();
    setAccessToken(data.accessToken, data.expiresIn);
    return data;
  } catch (err) {
    logger.error("Token refresh failed", err);
    clearAllTokens();
    return null;
  }
}

// ── Generic request helper ────────────────────────────────────────────────
async function request(
  endpoint: string,
  options: RequestInit & { requiresAuth?: boolean } = {}
): Promise<any> {
  const { requiresAuth = false, ...fetchOptions } = options;
  const isFormDataBody = typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;

  // Check if token needs refresh
  if (requiresAuth && isTokenExpired()) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      window.location.href = "/admin/login";
      throw new Error("Session expired");
    }
  }

  // Add auth header if needed
  if (requiresAuth && _accessToken) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${_accessToken}`,
    };
  }

  const url = `${BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers: isFormDataBody
        ? fetchOptions.headers
        : {
            "Content-Type": "application/json",
            ...fetchOptions.headers,
          },
      credentials: "include",
    });

    // Handle 401 Unauthorized
    if (res.status === 401 && requiresAuth) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request(endpoint, options);
      }
      clearAllTokens();
      window.location.href = "/admin/login";
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    logger.error(`Request failed: ${endpoint}`, err);
    throw err;
  }
}

// ── Content helpers ───────────────────────────────────────────────────────
export type HeroSlideContent = {
  id: number;
  label: string;
  title: string;
  subtitle: string;
  image: string;
  cta1: { label: string; route?: string; href?: string };
  cta2: { label: string; route?: string; href?: string };
};

export type ContactContent = {
  cards: Array<{
    label: string;
    lines: string[];
    href: string;
    color: string;
  }>;
  serviceTimes: Array<{
    day: string;
    time: string;
  }>;
  socials: Array<{
    label: string;
    handle: string;
    href: string;
    color: string;
  }>;
};

export type DonationContent = {
  categories: Array<{
    id: string;
    label: string;
    description: string;
    color: string;
  }>;
  accounts: {
    ngn: Array<{
      bank: string;
      accountName: string;
      accountNumber: string;
      type: string;
      flag: string;
      label: string;
    }>;
    usd: Array<{
      bank: string;
      accountName: string;
      accountNumber: string;
      type: string;
      flag: string;
      label: string;
    }>;
    gbp: Array<{
      bank: string;
      accountName: string;
      accountNumber: string;
      type: string;
      flag: string;
      label: string;
    }>;
    eur: Array<{
      bank: string;
      accountName: string;
      accountNumber: string;
      type: string;
      flag: string;
      label: string;
    }>;
  };
};

// ── API Object with all methods ────────────────────────────────────────────
export const api = {
  // ── Authentication ────────────────────────────────────────────────────────
  login: async (username: string, password: string) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setAccessToken(data.accessToken, data.expiresIn);
    // refreshToken is set as httpOnly cookie by server, not stored in JS
    return data;
  },

  logout: async () => {
    try {
      await request("/auth/logout", {
        method: "POST",
        requiresAuth: true,
      });
    } catch (err) {
      logger.warn("Logout request failed", err);
    } finally {
      clearAllTokens();
    }
  },

  isLoggedIn: () => !!_accessToken,

  tryRestoreSession: async () => {
    // Attempt to refresh token using httpOnly cookie from server
    const refreshed = await refreshAccessToken();
    return !!refreshed;
  },

  // ── Sermons ───────────────────────────────────────────────────────────────
  getSermons: async (): Promise<any[]> => {
    return request("/sermons");
  },

  createSermon: async (data: {
    title: string;
    scripture: string;
    date: string;
    preacher: string;
    excerpt: string;
    category: string;
    youtubeUrl?: string;
    facebookUrl?: string;
  }): Promise<any> => {
    return request("/sermons", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  updateSermon: async (
    id: number,
    data: {
      title: string;
      scripture: string;
      date: string;
      preacher: string;
      excerpt: string;
      category: string;
      youtubeUrl?: string;
      facebookUrl?: string;
    }
  ): Promise<any> => {
    return request(`/sermons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  deleteSermon: async (id: number): Promise<any> => {
    return request(`/sermons/${id}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },

  getYouTubeVideos: async (): Promise<any[]> => {
    return request("/sermons/youtube/videos");
  },

  syncYouTubeVideos: async (): Promise<any> => {
    return request("/sermons/youtube/sync", {
      method: "GET",
      requiresAuth: true,
    });
  },

  // ── Events ────────────────────────────────────────────────────────────────
  getEvents: async (): Promise<any[]> => {
    return request("/events");
  },

  createEvent: async (data: any): Promise<any> => {
    return request("/events", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  updateEvent: async (id: number, data: any): Promise<any> => {
    return request(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  deleteEvent: async (id: number): Promise<any> => {
    return request(`/events/${id}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },

  // ── Testimonies ───────────────────────────────────────────────────────────
  getTestimonies: async (): Promise<any[]> => {
    return request("/testimonies");
  },

  // Admin — includes pending (unapproved) testimonies
  getAllTestimonies: async (): Promise<any[]> => {
    return request("/testimonies/all", { requiresAuth: true });
  },

  submitTestimony: async (data: any): Promise<any> => {
    return request("/testimonies/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  createTestimony: async (data: any): Promise<any> => {
    return request("/testimonies", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  updateTestimony: async (id: number, data: any): Promise<any> => {
    return request(`/testimonies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  deleteTestimony: async (id: number): Promise<any> => {
    return request(`/testimonies/${id}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },

  // ── Gallery ───────────────────────────────────────────────────────────────
  getGallery: async (): Promise<any[]> => {
    return request("/gallery");
  },

  // Admin — includes pending (unapproved) submissions
  getAllGallery: async (): Promise<any[]> => {
    return request("/gallery/all", { requiresAuth: true });
  },

  // Public — submit a photo for admin review (multipart form-data)
  submitGalleryPhoto: async (formData: FormData): Promise<any> => {
    return request("/gallery/submit", {
      method: "POST",
      body: formData,
    });
  },

  approveGalleryItem: async (id: number): Promise<any> => {
    return request(`/gallery/${id}/approve`, {
      method: "PATCH",
      requiresAuth: true,
    });
  },

  createGalleryItem: async (data: any): Promise<any> => {
    return request("/gallery", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  updateGalleryItem: async (id: number, data: any): Promise<any> => {
    return request(`/gallery/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  deleteGalleryItem: async (id: number): Promise<any> => {
    return request(`/gallery/${id}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },

  // ── Hero Slides ───────────────────────────────────────────────────────────
  getHeroSlides: async (): Promise<HeroSlideContent[]> => {
    return request("/site-content/home").then((data) => data?.heroSlides ?? []);
  },

  // ── Contacts ──────────────────────────────────────────────────────────────
  getContacts: async (): Promise<any[]> => {
    return request("/contact", { requiresAuth: true });
  },

  createContact: async (data: any): Promise<any> => {
    return request("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Dedicated endpoint + rate-limit bucket for the homepage newsletter pill.
  subscribeNewsletter: async (data: { name?: string; email: string }): Promise<any> => {
    return request("/contact/newsletter", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ── Newsletter (admin) ────────────────────────────────────────────────────
  getNewsletterStats: async (): Promise<{ total: number; active: number; unsubscribed: number }> => {
    return request("/newsletter/stats", { requiresAuth: true });
  },

  getNewsletterPreview: async (data: { subject?: string; blocks: any[] }): Promise<{
    subscriberCount: number;
    events: any[];
    sermon: any | null;
    html: string;
    text: string;
    emailConfigured: boolean;
  }> => {
    return request("/newsletter/preview", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // Upload a banner/poster image for use in a newsletter block. Returns the
  // hosted (Cloudinary) URL.
  uploadNewsletterImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("image", file);
    return request("/newsletter/image", {
      method: "POST",
      body: formData,
      requiresAuth: true,
    });
  },

  sendNewsletter: async (data: { blocks: any[]; subject?: string }): Promise<{ sent: number; failed: number; totalAttempted: number }> => {
    return request("/newsletter/send", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  getNewsletterSends: async (): Promise<any[]> => {
    return request("/newsletter/sends", { requiresAuth: true });
  },

  getSubscribers: async (): Promise<Array<{ id: number; email: string; name: string | null; subscribedAt: string; unsubscribedAt: string | null }>> => {
    return request("/newsletter/subscribers", { requiresAuth: true });
  },

  setSubscriberActive: async (id: number, active: boolean): Promise<any> => {
    return request(`/newsletter/subscribers/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
      requiresAuth: true,
    });
  },

  deleteSubscriber: async (id: number): Promise<any> => {
    return request(`/newsletter/subscribers/${id}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },

  // Public unsubscribe link target.
  unsubscribeNewsletter: async (token: string): Promise<{ message: string; email?: string }> => {
    return request(`/newsletter/unsubscribe?token=${encodeURIComponent(token)}`);
  },

  markContactRead: async (id: number): Promise<any> => {
    return request(`/contact/${id}/read`, {
      method: "PUT",
      requiresAuth: true,
    });
  },

  deleteContact: async (id: number): Promise<any> => {
    return request(`/contact/${id}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },

  // ── Donations ─────────────────────────────────────────────────────────────
  getDonations: async (): Promise<any[]> => {
    return request("/donations", { requiresAuth: true });
  },

  createDonation: async (data: any): Promise<any> => {
    return request("/donations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getSiteContent: async (page: string): Promise<any> => {
    return request(`/site-content/${page}`);
  },

  updateSiteContent: async (page: string, data: any): Promise<any> => {
    return request(`/site-content/${page}`, {
      method: "PUT",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  getSettings: async (): Promise<any> => {
    return request("/settings");
  },

  updateSettings: async (data: any): Promise<any> => {
    return request("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },
};

export default api;