import { pgTable, text, serial, integer, boolean, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  pickupLocation: text("pickup_location").notNull(),
  returnLocation: text("return_location").notNull(),
  pickupDate: text("pickup_date").notNull(),
  returnDate: text("return_date").notNull(),
  carType: text("car_type").notNull(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  pickupLocation: true,
  returnLocation: true,
  pickupDate: true,
  returnDate: true,
  carType: true,
  name: true,
  email: true,
  phone: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
