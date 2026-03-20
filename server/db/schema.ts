import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const heroSlides = pgTable("hero_slides", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  image: text("image").notNull(),
  cta1: text("cta1").notNull().default("Learn More"),
  cta2: text("cta2").notNull().default("Watch Live"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sermons = pgTable("sermons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  scripture: text("scripture").notNull(),
  date: text("date").notNull(),
  preacher: text("preacher").notNull(),
  excerpt: text("excerpt").notNull(),
  category: text("category").notNull(),
  youtubeUrl: text("youtube_url"),
  facebookUrl: text("facebook_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  day: text("day").notNull(),
  month: text("month").notNull(),
  title: text("title").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const testimonies = pgTable("testimonies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  profession: text("profession").notNull(),
  quote: text("quote").notNull(),
  category: text("category").notNull(),
  approved: boolean("approved").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gallery = pgTable("gallery", {
  id: serial("id").primaryKey(),
  caption: text("caption").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  subject: text("subject"),
  message: text("message").notNull(),
  type: text("type").notNull().default("message"), // "message" | "prayer"
  anonymous: boolean("anonymous").default(false),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  donorName: text("donor_name"),
  donorEmail: text("donor_email"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("NGN"),
  category: text("category"),
  message: text("message"),
  anonymous: boolean("anonymous").default(false),
  status: text("status").notNull().default("pending"),
  reference: text("reference"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});