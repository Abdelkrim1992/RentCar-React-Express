// This file contains Zod schemas that match our Prisma models
import { z } from "zod";

// Basic type definitions that match Prisma models
// These are defined here to avoid circular dependencies

// User schemas
export const userSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(1),
  password: z.string().min(1),
  isAdmin: z.boolean().default(false),
  fullName: z.string().nullable(),
  email: z.string().email().nullable(),
  createdAt: z.date()
});

export const insertUserSchema = userSchema.omit({ 
  id: true, 
  createdAt: true 
}).extend({
  isAdmin: z.boolean().optional().default(false),
  fullName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
});

// Car schemas
export const carSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  type: z.string().min(1),
  seats: z.number().int().positive(),
  power: z.string().min(1),
  rating: z.string().min(1),
  price: z.string().min(1),
  pricePerDay: z.string().default("0"),
  transmission: z.string().default("Automatic"),
  fuelType: z.string().default("Gasoline"),
  image: z.string().min(1),
  gallery: z.array(z.string()).default([]),
  special: z.string().nullable(),
  specialColor: z.string().nullable(),
  description: z.string().nullable(),
  features: z.array(z.string()),
  available: z.boolean().default(true),
  year: z.number().int().default(2023),
  brand: z.string().default("Unknown"),
  createdAt: z.date()
});

export const insertCarSchema = carSchema.omit({ 
  id: true, 
  createdAt: true 
}).extend({
  special: z.string().optional().nullable(),
  specialColor: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  pricePerDay: z.string().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  available: z.boolean().optional(),
  year: z.number().int().optional(),
  brand: z.string().optional(),
});

// Booking schemas
export const bookingSchema = z.object({
  id: z.number().int().positive(),
  pickupLocation: z.string().min(1),
  returnLocation: z.string().min(1),
  pickupDate: z.string().min(1),
  returnDate: z.string().min(1),
  carType: z.string().min(1),
  carId: z.number().int().positive().nullable(),
  userId: z.number().int().positive().nullable(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  status: z.string().default("pending"),
  rejectionReason: z.string().nullable(),
  notificationSent: z.boolean().default(false),
  currency: z.string().default("USD"),
  createdAt: z.date()
});

export const insertBookingSchema = bookingSchema.omit({ 
  id: true, 
  createdAt: true 
}).extend({
  carId: z.number().optional().nullable(),
  userId: z.number().optional().nullable(),
  name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.string().optional().default("pending"),
  rejectionReason: z.string().optional().nullable(),
  notificationSent: z.boolean().optional().default(false),
  currency: z.string().optional().default("USD"),
});

// SiteSettings schemas
export const siteSettingsSchema = z.object({
  id: z.number().int().positive(),
  siteName: z.string().default("Ether"),
  logoColor: z.string().default("#6843EC"),
  accentColor: z.string().default("#D2FF3A"),
  logoText: z.string().default("ETHER"),
  customLogo: z.string().nullable(),
  defaultCurrency: z.string().default("USD"),
  updatedAt: z.date()
});

export const insertSiteSettingsSchema = siteSettingsSchema.omit({ 
  id: true, 
  updatedAt: true 
}).extend({
  siteName: z.string().optional(),
  logoColor: z.string().optional(),
  accentColor: z.string().optional(),
  logoText: z.string().optional(),
  customLogo: z.string().optional().nullable(),
  defaultCurrency: z.string().optional(),
});

// Car Availability schemas
export const carAvailabilitySchema = z.object({
  id: z.number().int().positive(),
  carId: z.number().int().positive(),
  startDate: z.date(),
  endDate: z.date(),
  isAvailable: z.boolean().default(true),
  carType: z.string().optional(),
  city: z.string().optional(),
  createdAt: z.date()
});

export const insertCarAvailabilitySchema = carAvailabilitySchema.omit({ 
  id: true, 
  createdAt: true 
}).extend({
  isAvailable: z.boolean().optional().default(true),
  carType: z.string().optional(),
  city: z.string().optional(),
});

// User Preferences schemas
export const userPreferencesSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  preferredCarTypes: z.array(z.string()),
  preferredFeatures: z.array(z.string()),
  minSeats: z.number().int().positive().optional(),
  maxBudget: z.number().positive().optional(),
  travelPurpose: z.string().optional(),
  rentalFrequency: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const insertUserPreferencesSchema = userPreferencesSchema.omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true
}).extend({
  preferredCarTypes: z.array(z.string()).default([]),
  preferredFeatures: z.array(z.string()).default([]),
  minSeats: z.number().int().positive().optional(),
  maxBudget: z.number().positive().optional(),
  travelPurpose: z.string().optional(),
  rentalFrequency: z.string().optional(),
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCar = z.infer<typeof insertCarSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type InsertCarAvailability = z.infer<typeof insertCarAvailabilitySchema>;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

// Define the types directly here instead of importing from Prisma
export type User = z.infer<typeof userSchema>;
export type Car = z.infer<typeof carSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type CarAvailability = z.infer<typeof carAvailabilitySchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
