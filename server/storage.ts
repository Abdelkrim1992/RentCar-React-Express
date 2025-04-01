import { 
  users, type User, type InsertUser, 
  bookings, type Booking, type InsertBooking,
  cars, type Car, type InsertCar,
  siteSettings, type SiteSettings, type InsertSiteSettings
} from "@shared/schema";
import { db, supabase } from './supabase';
import { eq } from 'drizzle-orm';

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
}

// Memory storage implementation (same as before but with extended functionality)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookings: Map<number, Booking>;
  private cars: Map<number, Car>;
  private settings: SiteSettings;
  currentUserId: number;
  currentBookingId: number;
  currentCarId: number;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.cars = new Map();
    this.currentUserId = 1;
    this.currentBookingId = 1;
    this.currentCarId = 1;
    
    // Default site settings
    this.settings = {
      id: 1,
      siteName: 'Ether',
      logoColor: '#6843EC',
      accentColor: '#D2FF3A',
      logoText: 'ETHER',
      customLogo: null,
      updatedAt: new Date()
    };
    
    // Add sample cars for development
    const sampleCars: InsertCar[] = [
      {
        name: "Mercedes AMG GT",
        type: "Sports",
        seats: 2,
        power: "523 HP",
        rating: "4.9",
        price: "299",
        image: "https://images.unsplash.com/photo-1617814076668-8dfc6fe3b744?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        special: "Premium",
        features: ["Luxury Interior", "Performance Tuned", "Carbon Fiber Trim", "V8 Engine"]
      },
      {
        name: "Tesla Model S",
        type: "Electric",
        seats: 5,
        power: "405 mi",
        rating: "4.8",
        price: "249",
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        special: "Electric",
        specialColor: "bg-[#6843EC] bg-opacity-90",
        features: ["Autopilot", "Long Range Battery", "Premium Sound", "Supercharging"]
      },
      {
        name: "Range Rover Sport",
        type: "SUV",
        seats: 5,
        power: "395 HP",
        rating: "4.7",
        price: "269",
        image: "https://images.unsplash.com/photo-1599912027611-484b9fc447af?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        special: "Premium",
        features: ["Off-Road Capability", "Leather Interior", "Panoramic Roof", "Advanced Safety"]
      }
    ];
    
    // Add sample cars
    sampleCars.forEach(car => {
      this.createCar(car);
    });
    
    // Add admin user
    this.createUser({
      username: 'admin',
      password: 'admin123',
      isAdmin: true,
      fullName: 'System Admin',
      email: 'admin@example.com'
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin: insertUser.isAdmin ?? false,
      fullName: insertUser.fullName ?? null,
      email: insertUser.email ?? null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }
  
  async getUsersByAdmin(isAdmin: boolean): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isAdmin === isAdmin);
  }

  // Booking operations
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      status: insertBooking.status || 'pending',
      createdAt: new Date(),
      name: insertBooking.name ?? null,
      email: insertBooking.email ?? null,
      phone: insertBooking.phone ?? null,
      carId: insertBooking.carId ?? null,
      userId: insertBooking.userId ?? null
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }
  
  async getBookingById(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.userId === userId);
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking: Booking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  // Car operations
  async createCar(car: InsertCar): Promise<Car> {
    const id = this.currentCarId++;
    const newCar: Car = { 
      ...car, 
      id, 
      createdAt: new Date(),
      special: car.special ?? null,
      specialColor: car.specialColor ?? null,
      description: car.description ?? null,
      features: car.features ?? null
    };
    this.cars.set(id, newCar);
    return newCar;
  }
  
  async getAllCars(): Promise<Car[]> {
    return Array.from(this.cars.values());
  }
  
  async getCarById(id: number): Promise<Car | undefined> {
    return this.cars.get(id);
  }
  
  async getCarsByType(type: string): Promise<Car[]> {
    if (type === 'All Cars') {
      return this.getAllCars();
    }
    return Array.from(this.cars.values()).filter(car => car.type === type);
  }
  
  async updateCar(id: number, car: Partial<InsertCar>): Promise<Car | undefined> {
    const existingCar = this.cars.get(id);
    if (!existingCar) return undefined;
    
    const updatedCar: Car = { ...existingCar, ...car };
    this.cars.set(id, updatedCar);
    return updatedCar;
  }
  
  async deleteCar(id: number): Promise<boolean> {
    return this.cars.delete(id);
  }
  
  // Site settings operations
  async getSiteSettings(): Promise<SiteSettings | undefined> {
    return this.settings;
  }
  
  async updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings | undefined> {
    this.settings = { 
      ...this.settings, 
      ...settings, 
      updatedAt: new Date() 
    };
    return this.settings;
  }
}

// Supabase/Drizzle-based storage implementation (uncomment when ready to use)
/*
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  
  async getUsersByAdmin(isAdmin: boolean): Promise<User[]> {
    const result = await db.select().from(users).where(eq(users.isAdmin, isAdmin));
    return result;
  }
  
  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const result = await db.insert(bookings).values(booking).returning();
    return result[0];
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }
  
  async getBookingById(id: number): Promise<Booking | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id));
    return result[0];
  }
  
  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    const result = await db.select().from(bookings).where(eq(bookings.userId, userId));
    return result;
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const result = await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return result[0];
  }
  
  // Car operations
  async createCar(car: InsertCar): Promise<Car> {
    const result = await db.insert(cars).values(car).returning();
    return result[0];
  }
  
  async getAllCars(): Promise<Car[]> {
    return await db.select().from(cars);
  }
  
  async getCarById(id: number): Promise<Car | undefined> {
    const result = await db.select().from(cars).where(eq(cars.id, id));
    return result[0];
  }
  
  async getCarsByType(type: string): Promise<Car[]> {
    if (type === 'All Cars') {
      return this.getAllCars();
    }
    const result = await db.select().from(cars).where(eq(cars.type, type));
    return result;
  }
  
  async updateCar(id: number, car: Partial<InsertCar>): Promise<Car | undefined> {
    const result = await db.update(cars)
      .set(car)
      .where(eq(cars.id, id))
      .returning();
    return result[0];
  }
  
  async deleteCar(id: number): Promise<boolean> {
    const result = await db.delete(cars).where(eq(cars.id, id)).returning();
    return result.length > 0;
  }
  
  // Site settings operations
  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const result = await db.select().from(siteSettings);
    return result[0];
  }
  
  async updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings | undefined> {
    const existingSettings = await this.getSiteSettings();
    
    if (existingSettings) {
      const result = await db.update(siteSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(siteSettings.id, existingSettings.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(siteSettings)
        .values({ ...settings, updatedAt: new Date() })
        .returning();
      return result[0];
    }
  }
}
*/

// For now, use the in-memory storage for development
export const storage = new MemStorage();

// When ready to use Supabase, uncomment this line:
// export const storage = new DatabaseStorage();
