    /**
     * client/src/lib/api.ts
     *
     * Security hardening over the original:
     *  1. Access token stored in MODULE MEMORY only — never localStorage/sessionStorage.
     *     localStorage tokens survive page close and can be stolen by XSS.
     *     A memory variable dies with the page — zero persistence for attackers.
     *  2. Refresh token is an httpOnly cookie set by the server.
     *     The client never sees, touches, or stores it. It's sent automatically
     *     by the browser on /api/auth/* requests with credentials:"include".
     *  3. Auto-refresh: a timer fires 60 seconds before the access token expires,
     *     silently fetching a new one via the cookie. No user interaction needed.
     *  4. username stored in sessionStorage only (non-sensitive display value).
     *  5. All mutating requests send credentials:"include" so the browser attaches
     *     the SameSite=Strict refresh-token cookie automatically.
     */

    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

    // ─── In-memory token store ─────────────────────────────────────────────────
    // These variables live only in this module's closure.
    // They are wiped on page reload — intentional for security.
    let _accessToken: string | null = null;
    let _refreshTimer: ReturnType<typeof setTimeout> | null = null;

    function setAccessToken(token: string, expiresIn: number) {
      _accessToken = token;
      scheduleRefresh(expiresIn);
    }

    function clearAccessToken() {
      _accessToken = null;
      if (_refreshTimer) { clearTimeout(_refreshTimer); _refreshTimer = null; }
    }

    function scheduleRefresh(expiresIn: number) {
      if (_refreshTimer) clearTimeout(_refreshTimer);
      // Refresh 60 s before expiry
      const delay = Math.max((expiresIn - 60) * 1000, 5000);
      _refreshTimer = setTimeout(async () => {
        try {
          const data = await refreshAccessToken();
          if (data) setAccessToken(data.accessToken, data.expiresIn);
          else clearAccessToken();
        } catch {
          clearAccessToken();
        }
      }, delay);
    }

    // ─── Auth helpers ──────────────────────────────────────────────────────────

    async function refreshAccessToken(): Promise<{ accessToken: string; expiresIn: number } | null> {
      try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include", // sends the httpOnly cookie automatically
        });
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    }

    // ─── Core request helper ───────────────────────────────────────────────────

    async function request(path: string, options: RequestInit = {}, retry = true): Promise<any> {
      const headers: Record<string, string> = {};

      // Copy over any caller-provided headers (but not Content-Type for FormData)
      if (options.headers) {
        Object.assign(headers, options.headers);
      }

      // Attach access token if we have one
      if (_accessToken) {
        headers["Authorization"] = `Bearer ${_accessToken}`;
      }

      // Only set Content-Type for JSON — FormData sets its own boundary
      if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: "include", // needed so the refresh cookie is sent on /auth/* routes
      });

      // Auto-refresh on 401 (expired access token)
      if (res.status === 401 && retry) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          setAccessToken(refreshed.accessToken, refreshed.expiresIn);
          return request(path, options, false); // retry once
        }
        // Refresh also failed — force re-login
        clearAccessToken();
        sessionStorage.removeItem("pcn_admin_username");
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Request failed");
      }

      return res.json();
    }

    // ─── Public API ────────────────────────────────────────────────────────────

    export const api = {
      // ── Auth ──────────────────────────────────────────────────────────────────
      login: async (username: string, password: string) => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // so the Set-Cookie for refresh token is accepted
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Login failed");
        }
        const data = await res.json();
        // Store access token in memory only
        setAccessToken(data.accessToken, data.expiresIn ?? 900);
        // Username is non-sensitive — sessionStorage is fine (cleared on tab close)
        sessionStorage.setItem("pcn_admin_username", data.username);
        return data;
      },

      logout: async () => {
        try {
          // Send the access token so the server can blacklist it
          await request("/auth/logout", { method: "POST" });
        } finally {
          clearAccessToken();
          sessionStorage.removeItem("pcn_admin_username");
        }
      },

      // Check if we currently have an access token in memory.
      // Note: returns false after a page reload (token is not persisted).
      // The AdminLogin page should call api.tryRestoreSession() on mount.
      isLoggedIn: () => !!_accessToken,

      getUsername: () => sessionStorage.getItem("pcn_admin_username") ?? "Admin",

      /**
       * Called on app mount / AdminLogin mount.
       * Attempts a silent token refresh using the httpOnly cookie.
       * If the cookie is still valid the user stays logged in across reloads.
       * Returns true if session was restored, false otherwise.
       */
      tryRestoreSession: async (): Promise<boolean> => {
        const data = await refreshAccessToken();
        if (data) {
          setAccessToken(data.accessToken, data.expiresIn ?? 900);
          return true;
        }
        return false;
      },

      // ── Hero ──────────────────────────────────────────────────────────────────
      getHero:     ()                  => request("/hero"),
      createHero:  (data: any)         => request("/hero",      { method: "POST",   body: JSON.stringify(data) }),
      updateHero:  (id: number, data: any) => request(`/hero/${id}`, { method: "PUT", body: JSON.stringify(data) }),
      deleteHero:  (id: number)        => request(`/hero/${id}`, { method: "DELETE" }),

      // ── Sermons ───────────────────────────────────────────────────────────────
      getSermons:    ()                     => request("/sermons"),
      createSermon:  (data: any)            => request("/sermons",       { method: "POST",   body: JSON.stringify(data) }),
      updateSermon:  (id: number, data: any) => request(`/sermons/${id}`, { method: "PUT",    body: JSON.stringify(data) }),
      deleteSermon:  (id: number)           => request(`/sermons/${id}`, { method: "DELETE" }),

      // ── Events ────────────────────────────────────────────────────────────────
      getEvents:    ()                      => request("/events"),
      createEvent:  (data: any)             => request("/events",        { method: "POST",   body: JSON.stringify(data) }),
      updateEvent:  (id: number, data: any) => request(`/events/${id}`,  { method: "PUT",    body: JSON.stringify(data) }),
      deleteEvent:  (id: number)            => request(`/events/${id}`,  { method: "DELETE" }),

      // ── Testimonies ───────────────────────────────────────────────────────────
      getTestimonies:   ()                       => request("/testimonies"),
      submitTestimony:  (data: any)              => request("/testimonies/submit",   { method: "POST", body: JSON.stringify(data) }),
      createTestimony:  (data: any)              => request("/testimonies",          { method: "POST", body: JSON.stringify(data) }),
      updateTestimony:  (id: number, data: any)  => request(`/testimonies/${id}`,    { method: "PUT",  body: JSON.stringify(data) }),
      deleteTestimony:  (id: number)             => request(`/testimonies/${id}`,    { method: "DELETE" }),

      // ── Gallery ───────────────────────────────────────────────────────────────
      getGallery: () => request("/gallery"),

      /**
       * Upload a new gallery item (image + metadata).
       * Requires admin auth — the Bearer token is attached automatically from memory.
       * FormData is sent as multipart/form-data (Content-Type NOT manually set).
       */
      uploadGalleryImage: async (formData: FormData) : Promise<any> => {
        if (!_accessToken) throw new Error("Not authenticated");
        const res = await fetch(`${BASE_URL}/gallery`, {
          method: "POST",
          headers: { Authorization: `Bearer ${_accessToken}` },
          credentials: "include",
          body: formData, // browser sets Content-Type: multipart/form-data with boundary
        });
        if (res.status === 401) {
          // Try refresh once
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            setAccessToken(refreshed.accessToken, refreshed.expiresIn ?? 900);
            return api.uploadGalleryImage(formData);
          }
          clearAccessToken();
          window.location.href = "/admin/login";
          return;
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(err.error || "Upload failed");
        }
        return res.json();
      },

      /**
       * Replace the image on an existing gallery item.
       * Uses PUT /gallery/:id with a FormData body.
       */
      replaceGalleryImage: async (id: number, formData: FormData) => {
        if (!_accessToken) throw new Error("Not authenticated");
        const res = await fetch(`${BASE_URL}/gallery/${id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${_accessToken}` },
          credentials: "include",
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(err.error || "Upload failed");
        }
        return res.json();
      },

      updateGallery: (id: number, data: any) => request(`/gallery/${id}`, { method: "PUT",    body: JSON.stringify(data) }),
      deleteGallery: (id: number)            => request(`/gallery/${id}`, { method: "DELETE" }),

      // ── Contact ───────────────────────────────────────────────────────────────
      sendContact:  (data: any)  => request("/contact",           { method: "POST", body: JSON.stringify(data) }),
      getContacts:  ()           => request("/contact"),
      markRead:     (id: number) => request(`/contact/${id}/read`, { method: "PUT" }),
      deleteContact:(id: number) => request(`/contact/${id}`,      { method: "DELETE" }),

      // ── Donations ─────────────────────────────────────────────────────────────
      recordDonation: (data: any) => request("/donations", { method: "POST", body: JSON.stringify(data) }),
      getDonations:   ()           => request("/donations"),
    };