import { pgTable, text, serial, integer, boolean, date, time, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  fullName: text("full_name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Car rentals table
export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  seats: integer("seats").notNull(),
  power: text("power").notNull(),
  rating: text("rating").notNull(),
  price: text("price").notNull(),
  image: text("image").notNull(),
  special: text("special"),
  specialColor: text("special_color"),
  description: text("description"),
  features: text("features").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  pickupLocation: text("pickup_location").notNull(),
  returnLocation: text("return_location").notNull(),
  pickupDate: text("pickup_date").notNull(),
  returnDate: text("return_date").notNull(),
  carType: text("car_type").notNull(),
  carId: integer("car_id"),
  userId: integer("user_id"),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Site settings table
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").default("Ether"),
  logoColor: text("logo_color").default("#6843EC"),
  accentColor: text("accent_color").default("#D2FF3A"),
  logoText: text("logo_text").default("ETHER"),
  customLogo: text("custom_logo"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users, {
  isAdmin: z.boolean().optional().default(false),
  fullName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
}).omit({ id: true, createdAt: true });

export const insertCarSchema = createInsertSchema(cars, {
  seats: z.number(),
  rating: z.string(),
  price: z.string(),
  special: z.string().optional().nullable(),
  specialColor: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
}).omit({ id: true, createdAt: true });

export const insertBookingSchema = createInsertSchema(bookings, {
  carId: z.number().optional().nullable(),
  userId: z.number().optional().nullable(),
  name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
}).omit({ id: true, createdAt: true });

export const insertSiteSettingsSchema = createInsertSchema(siteSettings, {
  siteName: z.string().optional(),
  logoColor: z.string().optional(),
  accentColor: z.string().optional(),
  logoText: z.string().optional(),
  customLogo: z.string().optional().nullable(),
}).omit({ id: true, updatedAt: true });

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCar = z.infer<typeof insertCarSchema>;
export type Car = typeof cars.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;
