import { prisma } from './prisma';
import connectPg from "connect-pg-simple";
import session from "express-session";
import memorystore from "memorystore";
import { PrismaClient } from '@prisma/client';
import { 
  User, Booking, Car, SiteSettings,
  AppTypes 
} from './types';

// Extended interface with all CRUD methods needed for the application
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: AppTypes.UserCreateInput): Promise<User>;
  getUsersByAdmin(isAdmin: boolean): Promise<User[]>;
  
  // Booking operations
  createBooking(booking: AppTypes.BookingCreateInput): Promise<Booking>;
  getAllBookings(): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Car operations
  createCar(car: AppTypes.CarCreateInput): Promise<Car>;
  getAllCars(): Promise<Car[]>;
  getCarById(id: number): Promise<Car | undefined>;
  getCarsByType(type: string): Promise<Car[]>;
  updateCar(id: number, car: AppTypes.CarUpdateInput): Promise<Car | undefined>;
  deleteCar(id: number): Promise<boolean>;
  
  // Site settings operations
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: AppTypes.SiteSettingsUpdateInput): Promise<SiteSettings | undefined>;
  
  // Session store
  sessionStore: any;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookings: Map<number, Booking>;
  private cars: Map<number, Car>;
  private settings: SiteSettings;
  currentUserId: number;
  currentBookingId: number;
  currentCarId: number;
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.cars = new Map();
    this.currentUserId = 1;
    this.currentBookingId = 1;
    this.currentCarId = 1;
    
    // Create memory session store
    const MemoryStore = memorystore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
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
    const sampleCars: AppTypes.CarCreateInput[] = [
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
        specialColor: "#6843EC",
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

  async createUser(insertUser: AppTypes.UserCreateInput): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser as any, 
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
  async createBooking(insertBooking: AppTypes.BookingCreateInput): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = { 
      ...insertBooking as any, 
      id, 
      status: insertBooking.status || 'pending',
      carId: insertBooking.carId ?? null,
      userId: insertBooking.userId ?? null,
      name: insertBooking.name ?? null,
      email: insertBooking.email ?? null,
      phone: insertBooking.phone ?? null,
      createdAt: new Date(),
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
  async createCar(car: AppTypes.CarCreateInput): Promise<Car> {
    const id = this.currentCarId++;
    const newCar: Car = { 
      ...car as any, 
      id, 
      special: car.special ?? null,
      specialColor: car.specialColor ?? null,
      description: car.description ?? null,
      createdAt: new Date(),
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
  
  async updateCar(id: number, car: AppTypes.CarUpdateInput): Promise<Car | undefined> {
    const existingCar = this.cars.get(id);
    if (!existingCar) return undefined;
    
    const updatedCar: Car = { ...existingCar, ...car as any };
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
  
  async updateSiteSettings(settings: AppTypes.SiteSettingsUpdateInput): Promise<SiteSettings | undefined> {
    this.settings = { 
      ...this.settings, 
      ...settings as any, 
      updatedAt: new Date() 
    };
    return this.settings;
  }
}

// Database storage implementation with Prisma ORM
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    // Create PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await prisma.user.findUnique({
        where: { username }
      });
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: AppTypes.UserCreateInput): Promise<User> {
    try {
      return await prisma.user.create({
        data: user as any
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  async getUsersByAdmin(isAdmin: boolean): Promise<User[]> {
    try {
      return await prisma.user.findMany({
        where: { isAdmin }
      });
    } catch (error) {
      console.error('Error getting users by admin status:', error);
      return [];
    }
  }
  
  // Booking operations
  async createBooking(booking: AppTypes.BookingCreateInput): Promise<Booking> {
    try {
      return await prisma.booking.create({
        data: booking as any
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async getAllBookings(): Promise<Booking[]> {
    try {
      return await prisma.booking.findMany({
        include: {
          user: true,
          car: true
        }
      });
    } catch (error) {
      console.error('Error getting all bookings:', error);
      return [];
    }
  }
  
  async getBookingById(id: number): Promise<Booking | undefined> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          user: true,
          car: true
        }
      });
      return booking || undefined;
    } catch (error) {
      console.error('Error getting booking by ID:', error);
      return undefined;
    }
  }
  
  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    try {
      return await prisma.booking.findMany({
        where: { userId },
        include: {
          car: true
        }
      });
    } catch (error) {
      console.error('Error getting bookings by user ID:', error);
      return [];
    }
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    try {
      return await prisma.booking.update({
        where: { id },
        data: { status }
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      return undefined;
    }
  }
  
  // Car operations
  async createCar(car: AppTypes.CarCreateInput): Promise<Car> {
    try {
      return await prisma.car.create({
        data: car as any
      });
    } catch (error) {
      console.error('Error creating car:', error);
      throw error;
    }
  }
  
  async getAllCars(): Promise<Car[]> {
    try {
      return await prisma.car.findMany();
    } catch (error) {
      console.error('Error getting all cars:', error);
      return [];
    }
  }
  
  async getCarById(id: number): Promise<Car | undefined> {
    try {
      const car = await prisma.car.findUnique({
        where: { id }
      });
      return car || undefined;
    } catch (error) {
      console.error('Error getting car by ID:', error);
      return undefined;
    }
  }
  
  async getCarsByType(type: string): Promise<Car[]> {
    try {
      if (type === 'All Cars') {
        return this.getAllCars();
      }
      return await prisma.car.findMany({
        where: { type }
      });
    } catch (error) {
      console.error('Error getting cars by type:', error);
      return [];
    }
  }
  
  async updateCar(id: number, car: AppTypes.CarUpdateInput): Promise<Car | undefined> {
    try {
      return await prisma.car.update({
        where: { id },
        data: car as any
      });
    } catch (error) {
      console.error('Error updating car:', error);
      return undefined;
    }
  }
  
  async deleteCar(id: number): Promise<boolean> {
    try {
      await prisma.car.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting car:', error);
      return false;
    }
  }
  
  // Site settings operations
  async getSiteSettings(): Promise<SiteSettings | undefined> {
    try {
      const settings = await prisma.siteSettings.findFirst();
      return settings || undefined;
    } catch (error) {
      console.error('Error getting site settings:', error);
      return undefined;
    }
  }
  
  async updateSiteSettings(settings: AppTypes.SiteSettingsUpdateInput): Promise<SiteSettings | undefined> {
    try {
      const existingSettings = await this.getSiteSettings();
      
      if (existingSettings) {
        return await prisma.siteSettings.update({
          where: { id: existingSettings.id },
          data: { ...settings as any, updatedAt: new Date() }
        });
      } else {
        return await prisma.siteSettings.create({
          data: { 
            ...settings as any,
            siteName: (settings.siteName as string) || 'Ether',
            logoColor: (settings.logoColor as string) || '#6843EC',
            accentColor: (settings.accentColor as string) || '#D2FF3A',
            logoText: (settings.logoText as string) || 'ETHER',
            updatedAt: new Date()
          }
        });
      }
    } catch (error) {
      console.error('Error updating site settings:', error);
      return undefined;
    }
  }
}

// For now, let's force using the memory storage until we fix the database connection issues
// We'll manually switch to database storage once the connection is verified
const useDatabase = false; // Temporarily force memory storage

export const storage = useDatabase ? new DatabaseStorage() : new MemStorage();
