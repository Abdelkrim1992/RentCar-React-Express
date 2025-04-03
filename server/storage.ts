// This file is kept as a reference for the IStorage interface
// We're now using storage.prisma.ts for implementations with Prisma
import { 
  type User, type InsertUser, 
  type Booking, type InsertBooking,
  type Car, type InsertCar,
  type SiteSettings, type InsertSiteSettings,
  type CarAvailability, type InsertCarAvailability,
  type UserPreferences, type InsertUserPreferences
} from "@shared/schema";

// Extended interface with all CRUD methods needed for the application
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByAdmin(isAdmin: boolean): Promise<User[]>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getAllBookings(): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Car operations
  createCar(car: InsertCar): Promise<Car>;
  getAllCars(): Promise<Car[]>;
  getCarById(id: number): Promise<Car | undefined>;
  getCarsByType(type: string): Promise<Car[]>;
  updateCar(id: number, car: Partial<InsertCar>): Promise<Car | undefined>;
  deleteCar(id: number): Promise<boolean>;
  
  // Site settings operations
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings | undefined>;
  
  // Car availability operations
  createCarAvailability(availability: InsertCarAvailability): Promise<CarAvailability>;
  getCarAvailabilities(carId: number): Promise<CarAvailability[]>;
  getAllCarAvailabilities(): Promise<CarAvailability[]>;
  updateCarAvailability(id: number, availability: Partial<InsertCarAvailability>): Promise<CarAvailability | undefined>;
  deleteCarAvailability(id: number): Promise<boolean>;
  getAvailableCars(startDate: Date, endDate: Date, carType?: string, city?: string): Promise<Car[]>;
  
  // User preferences operations
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined>;
  getRecommendedCars(userId: number, limit?: number): Promise<Car[]>;
  
  // Session store
  sessionStore: any;
}

// Import storage implementation from the Prisma-based storage file
import { storage } from "./storage.prisma";
export { storage };
