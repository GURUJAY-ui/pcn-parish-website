import logger from "./logger";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

let _accessToken: string | null = null;
let _refreshToken: string | null = null;

// ── Initialize tokens from localStorage ────────────────────────────────────
function initializeTokens() {
  _accessToken = localStorage.getItem("accessToken");
  _refreshToken = localStorage.getItem("refreshToken");
}

// ── Set tokens in memory and localStorage ──────────────────────────────────
function setAccessToken(token: string, expiresIn?: number) {
  _accessToken = token;
  localStorage.setItem("accessToken", token);

  if (expiresIn) {
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem("accessTokenExpiresAt", String(expiresAt));
  }
}

function setRefreshToken(token: string) {
  _refreshToken = token;
  localStorage.setItem("refreshToken", token);
}

// ── Clear tokens ──────────────────────────────────────────────────────────
function clearAccessToken() {
  _accessToken = null;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("accessTokenExpiresAt");
}

function clearRefreshToken() {
  _refreshToken = null;
  localStorage.removeItem("refreshToken");
}

function clearAllTokens() {
  clearAccessToken();
  clearRefreshToken();
}

// ── Check if token is expired ──────────────────────────────────────────────
function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem("accessTokenExpiresAt");
  if (!expiresAt) return false;
  return Date.now() > Number(expiresAt);
}

// ── Refresh access token ──────────────────────────────────────────────────
async function refreshAccessToken(): Promise<{ accessToken: string; expiresIn: number } | null> {
  if (!_refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ refreshToken: _refreshToken }),
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

// ── API Object with all methods ────────────────────────────────────────────
export const api = {
  // ── Authentication ────────────────────────────────────────────────────────
  login: async (username: string, password: string) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setAccessToken(data.accessToken, data.expiresIn);
    setRefreshToken(data.refreshToken);
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

  getUsername: () => localStorage.getItem("username") || "",

  tryRestoreSession: async () => {
    initializeTokens();
    if (!_refreshToken) return false;

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
  getHeroSlides: async (): Promise<any[]> => {
    return request("/hero");
  },

  createHeroSlide: async (data: any): Promise<any> => {
    return request("/hero", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  updateHeroSlide: async (id: number, data: any): Promise<any> => {
    return request(`/hero/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  deleteHeroSlide: async (id: number): Promise<any> => {
    return request(`/hero/${id}`, {
      method: "DELETE",
      requiresAuth: true,
    });
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

  // ── Bank Details ──────────────────────────────────────────────────────────
  getBankDetails: async (): Promise<any> => {
    return request("/bank");
  },

  updateBankDetails: async (data: any): Promise<any> => {
    return request("/bank", {
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

// ── Initialize tokens on module load ──────────────────────────────────────
initializeTokens();

export default api;
