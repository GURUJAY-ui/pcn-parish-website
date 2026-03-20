const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function getAccessToken() {
  return localStorage.getItem("pcn_access_token");
}

function getRefreshToken() {
  return localStorage.getItem("pcn_refresh_token");
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("pcn_access_token", accessToken);
  localStorage.setItem("pcn_refresh_token", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("pcn_access_token");
  localStorage.removeItem("pcn_refresh_token");
  localStorage.removeItem("pcn_admin_username");
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

async function request(path: string, options: RequestInit = {}, retry = true): Promise<any> {
  let token = getAccessToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // If 401 and we haven't retried, try refreshing the token
  if (res.status === 401 && retry) {
    token = await refreshAccessToken();
    if (token) return request(path, options, false);
    // Redirect to login if refresh also fails
    window.location.href = "/admin/login";
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }

  return res.json();
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────
  login: async (username: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    localStorage.setItem("pcn_admin_username", data.username);
    return data;
  },

  logout: async () => {
    const refreshToken = getRefreshToken();
    try {
      await request("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      clearTokens();
    }
  },

  isLoggedIn: () => !!getAccessToken(),
  getUsername: () => localStorage.getItem("pcn_admin_username") ?? "Admin",

  // ── Hero ──────────────────────────────────────────────────────────────
  getHero: () => request("/hero"),
  createHero: (data: any) => request("/hero", { method: "POST", body: JSON.stringify(data) }),
  updateHero: (id: number, data: any) => request(`/hero/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteHero: (id: number) => request(`/hero/${id}`, { method: "DELETE" }),

  // ── Sermons ───────────────────────────────────────────────────────────
  getSermons: () => request("/sermons"),
  createSermon: (data: any) => request("/sermons", { method: "POST", body: JSON.stringify(data) }),
  updateSermon: (id: number, data: any) => request(`/sermons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSermon: (id: number) => request(`/sermons/${id}`, { method: "DELETE" }),

  // ── Events ────────────────────────────────────────────────────────────
  getEvents: () => request("/events"),
  createEvent: (data: any) => request("/events", { method: "POST", body: JSON.stringify(data) }),
  updateEvent: (id: number, data: any) => request(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteEvent: (id: number) => request(`/events/${id}`, { method: "DELETE" }),

  // ── Testimonies ───────────────────────────────────────────────────────
  getTestimonies: () => request("/testimonies"),
  submitTestimony: (data: any) => request("/testimonies/submit", { method: "POST", body: JSON.stringify(data) }),
  createTestimony: (data: any) => request("/testimonies", { method: "POST", body: JSON.stringify(data) }),
  updateTestimony: (id: number, data: any) => request(`/testimonies/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTestimony: (id: number) => request(`/testimonies/${id}`, { method: "DELETE" }),

  // ── Gallery ───────────────────────────────────────────────────────────
  getGallery: () => request("/gallery"),
  uploadGalleryImage: async (formData: FormData) => {
    const token = getAccessToken();
    const res = await fetch(`${BASE_URL}/gallery`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
  updateGallery: (id: number, data: any) => request(`/gallery/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteGallery: (id: number) => request(`/gallery/${id}`, { method: "DELETE" }),

  // ── Contact ───────────────────────────────────────────────────────────
  sendContact: (data: any) => request("/contact", { method: "POST", body: JSON.stringify(data) }),
  getContacts: () => request("/contact"),
  markRead: (id: number) => request(`/contact/${id}/read`, { method: "PUT" }),
  deleteContact: (id: number) => request(`/contact/${id}`, { method: "DELETE" }),

  // ── Donations ─────────────────────────────────────────────────────────
  recordDonation: (data: any) => request("/donations", { method: "POST", body: JSON.stringify(data) }),
  getDonations: () => request("/donations"),
};