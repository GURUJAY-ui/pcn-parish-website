import "./env";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import expressWinston from "express-winston";
import { logger } from "./lib/logger";
import { generalLimiter, sanitizeBody } from "./lib/security";

dotenv.config();

// ── Validate required env vars on startup ────────────────────────────────
const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET", "JWT_REFRESH_SECRET", "SETUP_SECRET"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  logger.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

// ── Ensure upload & log directories exist ────────────────────────────────
["uploads/gallery", "logs"].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

import authRoutes from "./routes/auth";
import heroRoutes from "./routes/hero";
import sermonRoutes from "./routes/sermons";
import eventRoutes from "./routes/events";
import testimonyRoutes from "./routes/testimonies";
import galleryRoutes from "./routes/gallery";
import contactRoutes from "./routes/contact";
import donationRoutes from "./routes/donations";

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security headers via Helmet ───────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ── CORS — only allow your exact frontend domain ─────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl in dev)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn("CORS blocked request", { origin });
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsing with size limits ─────────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // Prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── HTTP Parameter Pollution protection ───────────────────────────────────
app.use(hpp());

// ── XSS sanitization on all inputs ───────────────────────────────────────
app.use(sanitizeBody);

// ── General rate limiting ─────────────────────────────────────────────────
app.use("/api/", generalLimiter);

// ── Request logging ───────────────────────────────────────────────────────
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: "{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
    expressFormat: false,
    colorize: false,
    ignoredRoutes: ["/api/health"],
  })
);

// ── Serve uploaded files (with security headers) ─────────────────────────
app.use(
  "/uploads",
  (req, res, next) => {
    // Prevent script execution on uploaded files
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Disposition", "inline");
    next();
  },
  express.static(path.join(process.cwd(), "uploads"))
);

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/sermons", sermonRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/testimonies", testimonyRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/donations", donationRoutes);

// ── Health check ──────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ── Global error handler ──────────────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    ip: req.ip,
  });

  // Never leak stack traces in production
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(process.cwd(), "client/dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "client/dist", "index.html"));
  });
}

app.listen(PORT, () => {
  logger.info(`✅ PCN API running on port ${PORT} [${process.env.NODE_ENV}]`);
});
