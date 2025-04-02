import { prisma } from './prisma';
import connectPg from "connect-pg-simple";
import session from "express-session";
import memorystore from "memorystore";
import { PrismaClient } from '@prisma/client';
import { 
  User, Booking, Car, SiteSettings, CarAvailability,
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
  
  // Car availability operations
  createCarAvailability(availability: AppTypes.CarAvailabilityCreateInput): Promise<CarAvailability>;
  getCarAvailabilities(carId: number): Promise<CarAvailability[]>;
  getAllCarAvailabilities(): Promise<CarAvailability[]>;
  updateCarAvailability(id: number, availability: AppTypes.CarAvailabilityUpdateInput): Promise<CarAvailability | undefined>;
  deleteCarAvailability(id: number): Promise<boolean>;
  getAvailableCars(startDate: Date, endDate: Date, carType?: string): Promise<Car[]>;
  
  // Session store
  sessionStore: any;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookings: Map<number, Booking>;
  private cars: Map<number, Car>;
  private carAvailabilities: Map<number, CarAvailability>;
  private settings: SiteSettings;
  currentUserId: number;
  currentBookingId: number;
  currentCarId: number;
  currentAvailabilityId: number;
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.cars = new Map();
    this.carAvailabilities = new Map();
    this.currentUserId = 1;
    this.currentBookingId = 1;
    this.currentCarId = 1;
    this.currentAvailabilityId = 1;
    
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
  
  // Car availability operations
  async createCarAvailability(availability: AppTypes.CarAvailabilityCreateInput): Promise<CarAvailability> {
    const id = this.currentAvailabilityId++;
    const newAvailability: CarAvailability = {
      ...availability as any,
      id,
      isAvailable: availability.isAvailable ?? true,
      createdAt: new Date(),
    };
    this.carAvailabilities.set(id, newAvailability);
    return newAvailability;
  }
  
  async getCarAvailabilities(carId: number): Promise<CarAvailability[]> {
    return Array.from(this.carAvailabilities.values()).filter(availability => availability.carId === carId);
  }
  
  async getAllCarAvailabilities(): Promise<CarAvailability[]> {
    return Array.from(this.carAvailabilities.values());
  }
  
  async updateCarAvailability(id: number, availability: AppTypes.CarAvailabilityUpdateInput): Promise<CarAvailability | undefined> {
    const existingAvailability = this.carAvailabilities.get(id);
    if (!existingAvailability) return undefined;
    
    const updatedAvailability: CarAvailability = { ...existingAvailability, ...availability as any };
    this.carAvailabilities.set(id, updatedAvailability);
    return updatedAvailability;
  }
  
  async deleteCarAvailability(id: number): Promise<boolean> {
    return this.carAvailabilities.delete(id);
  }
  
  async getAvailableCars(startDate: Date, endDate: Date, carType?: string): Promise<Car[]> {
    // Get all availabilities that overlap with the given date range
    const overlappingAvailabilities = Array.from(this.carAvailabilities.values()).filter(availability => {
      return availability.startDate <= endDate && availability.endDate >= startDate;
    });
    
    // Group availabilities by car ID
    const availabilityByCarId = new Map<number, CarAvailability[]>();
    overlappingAvailabilities.forEach(availability => {
      const entries = availabilityByCarId.get(availability.carId) || [];
      entries.push(availability);
      availabilityByCarId.set(availability.carId, entries);
    });
    
    // Get all cars as array
    const allCars = await this.getAllCars();
    
    // Filter by type if specified
    let filteredCars = [...allCars];
    if (carType && carType !== 'All Cars') {
      filteredCars = filteredCars.filter((car: Car) => car.type === carType);
    }
    
    // Filter available cars
    return filteredCars.filter((car: Car) => {
      // If there are no availabilities for this car, it's considered available
      const availabilities = availabilityByCarId.get(car.id);
      if (!availabilities || availabilities.length === 0) {
        return true;
      }
      
      // If there are any availabilities for this car that are not available, the car is not available
      return !availabilities.some(availability => !availability.isAvailable);
    });
  }
}

// Database storage implementation with Prisma ORM
const PostgresSessionStore = connectPg(session);

// Explicit database URL
const databaseUrl = 'postgresql://car-rent_owner:npg_o2VYey1tzUXS@ep-billowing-art-ab1nuveo-pooler.eu-west-2.aws.neon.tech/car-rent?sslmode=require';

export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    // Create PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({
      conString: databaseUrl,
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
      const result = await prisma.$queryRaw`
        SELECT * FROM cars WHERE id = ${id}
      `;
      
      // Handle case where car doesn't exist
      if (!result || (Array.isArray(result) && result.length === 0)) {
        return undefined;
      }
      
      // Convert the raw result to our Car type
      const row = Array.isArray(result) ? result[0] : result;
      
      return {
        id: Number(row.id),
        name: row.name,
        type: row.type,
        seats: Number(row.seats),
        power: row.power,
        rating: row.rating,
        price: row.price,
        image: row.image,
        special: row.special,
        specialColor: row.special_color,
        description: row.description,
        features: row.features || [],
        createdAt: new Date(row.created_at)
      };
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
  
  // Car availability operations
  async createCarAvailability(availability: AppTypes.CarAvailabilityCreateInput): Promise<CarAvailability> {
    try {
      const result = await prisma.$queryRaw`
        INSERT INTO car_availabilities (car_id, start_date, end_date, is_available, created_at)
        VALUES (${availability.carId}, ${availability.startDate}, ${availability.endDate}, ${availability.isAvailable ?? true}, NOW())
        RETURNING id, car_id, start_date, end_date, is_available, created_at
      `;
      
      // Convert the raw result to our CarAvailability type
      const created = Array.isArray(result) ? result[0] : result;
      return {
        id: Number(created.id),
        carId: Number(created.car_id),
        startDate: new Date(created.start_date),
        endDate: new Date(created.end_date),
        isAvailable: Boolean(created.is_available),
        createdAt: new Date(created.created_at)
      };
    } catch (error) {
      console.error('Error creating car availability:', error);
      throw error;
    }
  }
  
  async getCarAvailabilities(carId: number): Promise<CarAvailability[]> {
    try {
      const result = await prisma.$queryRaw`
        SELECT ca.*, c.name as car_name, c.type as car_type 
        FROM car_availabilities ca
        JOIN cars c ON ca.car_id = c.id
        WHERE ca.car_id = ${carId}
      `;
      
      // Convert the raw result to our CarAvailability type
      return (Array.isArray(result) ? result : [result]).map(row => ({
        id: Number(row.id),
        carId: Number(row.car_id),
        startDate: new Date(row.start_date),
        endDate: new Date(row.end_date),
        isAvailable: Boolean(row.is_available),
        createdAt: new Date(row.created_at),
        car: row.car_name ? {
          id: Number(row.car_id),
          name: row.car_name,
          type: row.car_type
        } : undefined
      }));
    } catch (error) {
      console.error('Error getting car availabilities by car ID:', error);
      return [];
    }
  }
  
  async getAllCarAvailabilities(): Promise<CarAvailability[]> {
    try {
      const result = await prisma.$queryRaw`
        SELECT ca.*, c.name as car_name, c.type as car_type 
        FROM car_availabilities ca
        JOIN cars c ON ca.car_id = c.id
      `;
      
      // Convert the raw result to our CarAvailability type
      return (Array.isArray(result) ? result : [result]).map(row => ({
        id: Number(row.id),
        carId: Number(row.car_id),
        startDate: new Date(row.start_date),
        endDate: new Date(row.end_date),
        isAvailable: Boolean(row.is_available),
        createdAt: new Date(row.created_at),
        car: row.car_name ? {
          id: Number(row.car_id),
          name: row.car_name,
          type: row.car_type
        } : undefined
      }));
    } catch (error) {
      console.error('Error getting all car availabilities:', error);
      return [];
    }
  }
  
  async updateCarAvailability(id: number, availability: AppTypes.CarAvailabilityUpdateInput): Promise<CarAvailability | undefined> {
    try {
      // Simple update query with explicit parameters
      let query = 'UPDATE car_availabilities SET ';
      const updateParts = [];
      const queryParams: any[] = [];
      
      if (availability.carId !== undefined) {
        updateParts.push('car_id = ?');
        queryParams.push(availability.carId);
      }
      
      if (availability.startDate !== undefined) {
        updateParts.push('start_date = ?');
        queryParams.push(availability.startDate);
      }
      
      if (availability.endDate !== undefined) {
        updateParts.push('end_date = ?');
        queryParams.push(availability.endDate);
      }
      
      if (availability.isAvailable !== undefined) {
        updateParts.push('is_available = ?');
        queryParams.push(availability.isAvailable);
      }
      
      if (updateParts.length === 0) {
        // Nothing to update, just return the current value
        const current = await prisma.$queryRaw`
          SELECT ca.*, c.name as car_name, c.type as car_type 
          FROM car_availabilities ca
          JOIN cars c ON ca.car_id = c.id
          WHERE ca.id = ${id}
        `;
        
        if (!current || (Array.isArray(current) && current.length === 0)) {
          return undefined;
        }
        
        const row = Array.isArray(current) ? current[0] : current;
        
        return {
          id: Number(row.id),
          carId: Number(row.car_id),
          startDate: new Date(row.start_date),
          endDate: new Date(row.end_date),
          isAvailable: Boolean(row.is_available),
          createdAt: new Date(row.created_at),
          car: row.car_name ? {
            id: Number(row.car_id),
            name: row.car_name,
            type: row.car_type
          } : undefined
        };
      }
      
      // Complete the query
      query += updateParts.join(', ');
      query += ' WHERE id = ?';
      queryParams.push(id);
      
      // Execute the update
      await prisma.$executeRawUnsafe(query, ...queryParams);
      
      // Fetch the updated record
      const updated = await prisma.$queryRaw`
        SELECT ca.*, c.name as car_name, c.type as car_type 
        FROM car_availabilities ca
        JOIN cars c ON ca.car_id = c.id
        WHERE ca.id = ${id}
      `;
      
      if (!updated || (Array.isArray(updated) && updated.length === 0)) {
        return undefined;
      }
      
      const row = Array.isArray(updated) ? updated[0] : updated;
      
      return {
        id: Number(row.id),
        carId: Number(row.car_id),
        startDate: new Date(row.start_date),
        endDate: new Date(row.end_date),
        isAvailable: Boolean(row.is_available),
        createdAt: new Date(row.created_at),
        car: row.car_name ? {
          id: Number(row.car_id),
          name: row.car_name,
          type: row.car_type
        } : undefined
      };
    } catch (error) {
      console.error('Error updating car availability:', error);
      return undefined;
    }
  }
  
  async deleteCarAvailability(id: number): Promise<boolean> {
    try {
      const result = await prisma.$executeRaw`
        DELETE FROM car_availabilities WHERE id = ${id}
      `;
      
      return result > 0;
    } catch (error) {
      console.error('Error deleting car availability:', error);
      return false;
    }
  }
  
  async getAvailableCars(startDate: Date, endDate: Date, carType?: string): Promise<Car[]> {
    try {
      // Construct the query for getting available cars
      let query = `
        SELECT c.*
        FROM cars c
        WHERE 
          -- Either the car has no availability entries for the date range
          NOT EXISTS (
            SELECT 1 FROM car_availabilities ca 
            WHERE ca.car_id = c.id 
            AND ca.start_date <= $2 
            AND ca.end_date >= $1 
            AND ca.is_available = false
          )
      `;
      
      // Add car type filter if specified
      const queryParams: any[] = [startDate, endDate];
      
      if (carType && carType !== 'All Cars') {
        query += ` AND c.type = $3`;
        queryParams.push(carType);
      }
      
      // Execute the query
      const result = await prisma.$queryRawUnsafe(query, ...queryParams);
      
      // Convert the raw result to our Car type
      return (Array.isArray(result) ? result : [result]).map(row => ({
        id: Number(row.id),
        name: row.name,
        type: row.type,
        seats: Number(row.seats),
        power: row.power,
        rating: row.rating,
        price: row.price,
        image: row.image,
        special: row.special,
        specialColor: row.special_color,
        description: row.description,
        features: row.features || [],
        createdAt: new Date(row.created_at)
      }));
    } catch (error) {
      console.error('Error getting available cars:', error);
      return [];
    }
  }
}

// Always use database storage with our explicit URL
export const storage = new DatabaseStorage();
