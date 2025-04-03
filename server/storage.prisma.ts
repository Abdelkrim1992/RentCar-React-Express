import { prisma } from './prisma';
import connectPg from "connect-pg-simple";
import session from "express-session";
import memorystore from "memorystore";
import { PrismaClient } from '@prisma/client';
import { 
  User, Booking, Car, SiteSettings, CarAvailability, UserPreferences,
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
  private userPreferences: Map<number, UserPreferences>;
  private settings: SiteSettings;
  currentUserId: number;
  currentBookingId: number;
  currentCarId: number;
  currentAvailabilityId: number;
  currentPreferencesId: number;
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.cars = new Map();
    this.carAvailabilities = new Map();
    this.userPreferences = new Map();
    this.currentUserId = 1;
    this.currentBookingId = 1;
    this.currentCarId = 1;
    this.currentAvailabilityId = 1;
    this.currentPreferencesId = 1;
    
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

  // User preferences operations
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    // Find user preferences by userId
    return Array.from(this.userPreferences.values()).find(
      (preferences) => preferences.userId === userId
    );
  }

  async createUserPreferences(preferences: AppTypes.UserPreferencesCreateInput): Promise<UserPreferences> {
    const id = this.currentPreferencesId++;
    const newPreferences: UserPreferences = {
      ...preferences as any,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.userPreferences.set(id, newPreferences);
    return newPreferences;
  }

  async updateUserPreferences(userId: number, preferences: AppTypes.UserPreferencesUpdateInput): Promise<UserPreferences | undefined> {
    const existingPreferences = await this.getUserPreferences(userId);
    if (!existingPreferences) return undefined;
    
    const updatedPreferences: UserPreferences = {
      ...existingPreferences,
      ...preferences as any,
      updatedAt: new Date()
    };
    this.userPreferences.set(existingPreferences.id, updatedPreferences);
    return updatedPreferences;
  }

  async getRecommendedCars(userId: number, limit: number = 3): Promise<Car[]> {
    // Get user preferences
    const preferences = await this.getUserPreferences(userId);
    if (!preferences) return [];
    
    // Filter cars based on preferences
    let allCars = await this.getAllCars();
    
    // First filter by car type
    let filteredCars = allCars.filter(car => {
      // Match by car type or features
      return (
        preferences.preferredCarTypes.includes(car.type) || 
        car.features.some(feature => preferences.preferredFeatures.includes(feature))
      );
    });
    
    // Apply additional filters if present
    if (preferences.minSeats) {
      filteredCars = filteredCars.filter(car => car.seats >= preferences.minSeats!);
    }
    
    // Sort by rating (highest first)
    filteredCars.sort((a, b) => {
      const ratingA = parseFloat(a.rating);
      const ratingB = parseFloat(b.rating);
      return ratingB - ratingA;
    });
    
    // Limit results
    return filteredCars.slice(0, limit);
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
      // First, get the car type from the car table
      let carType = availability.carType;
      
      if (!carType) {
        try {
          const car = await prisma.car.findUnique({
            where: { id: availability.carId }
          });
          
          if (car) {
            carType = car.type;
          }
        } catch (err) {
          console.error('Error fetching car type:', err);
        }
      }
      
      // Try first with car_type column
      try {
        const result = await prisma.$queryRaw`
          INSERT INTO car_availabilities (car_id, start_date, end_date, is_available, car_type, created_at)
          VALUES (${availability.carId}, ${availability.startDate}, ${availability.endDate}, ${availability.isAvailable ?? true}, ${carType}, NOW())
          RETURNING id, car_id, start_date, end_date, is_available, car_type, created_at
        `;
        
        // Convert the raw result to our CarAvailability type
        const created = Array.isArray(result) ? result[0] : result as any;
        return {
          id: Number(created.id),
          carId: Number(created.car_id),
          startDate: new Date(created.start_date),
          endDate: new Date(created.end_date),
          isAvailable: Boolean(created.is_available),
          carType: created.car_type,
          createdAt: new Date(created.created_at)
        };
      } catch (e) {
        console.log('Error inserting with car_type, trying without car_type column:', e);
        // Fallback if car_type column doesn't exist
        const fallbackResult = await prisma.$queryRaw`
          INSERT INTO car_availabilities (car_id, start_date, end_date, is_available, created_at)
          VALUES (${availability.carId}, ${availability.startDate}, ${availability.endDate}, ${availability.isAvailable ?? true}, NOW())
          RETURNING id, car_id, start_date, end_date, is_available, created_at
        `;
        
        // Convert the raw result to our CarAvailability type
        const created = Array.isArray(fallbackResult) ? fallbackResult[0] : fallbackResult as any;
        return {
          id: Number(created.id),
          carId: Number(created.car_id),
          startDate: new Date(created.start_date),
          endDate: new Date(created.end_date),
          isAvailable: Boolean(created.is_available),
          carType: carType,  // Use the car type we got earlier
          createdAt: new Date(created.created_at)
        };
      }
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
      // First try to use Prisma's auto-generated methods for better typesafety
      try {
        const availabilities = await prisma.carAvailability.findMany({
          include: {
            car: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        });
        
        // Map to our CarAvailability type
        return availabilities.map((avail: any) => ({
          id: avail.id,
          carId: avail.carId,
          startDate: avail.startDate,
          endDate: avail.endDate,
          isAvailable: avail.isAvailable,
          carType: avail.carType || (avail.car ? avail.car.type : undefined),
          createdAt: avail.createdAt,
          car: avail.car ? {
            id: avail.car.id,
            name: avail.car.name,
            type: avail.car.type
          } : undefined
        }));
      } catch (prismaError) {
        console.log('Prisma findMany failed, falling back to raw query:', prismaError);
        
        // Fallback to raw query if the Prisma model isn't working
        const result = await prisma.$queryRaw`
          SELECT ca.*, c.id as car_id, c.name as car_name, c.type as car_type 
          FROM "car_availabilities" ca
          JOIN "cars" c ON ca."car_id" = c."id"
        `;
        
        console.log('Raw query result:', result);
        
        // Convert the raw result to our CarAvailability type
        return (Array.isArray(result) ? result : [result]).map(row => ({
          id: Number(row.id),
          carId: Number(row.car_id),
          startDate: new Date(row.start_date),
          endDate: new Date(row.end_date),
          isAvailable: Boolean(row.is_available),
          carType: row.car_type || undefined,
          createdAt: new Date(row.created_at),
          car: row.car_name ? {
            id: Number(row.car_id),
            name: row.car_name,
            type: row.car_type
          } : undefined
        }));
      }
    } catch (error) {
      console.error('Error getting all car availabilities:', error);
      return [];
    }
  }
  
  async updateCarAvailability(id: number, availability: AppTypes.CarAvailabilityUpdateInput): Promise<CarAvailability | undefined> {
    try {
      console.log("Updating car availability:", { id, availability });
      
      // First check if the record exists
      const existingRecord = await prisma.$queryRaw`
        SELECT ca.*, c.name as car_name, c.type as car_type 
        FROM car_availabilities ca
        JOIN cars c ON ca.car_id = c.id
        WHERE ca.id = ${id}
      `;
      
      if (!existingRecord || (Array.isArray(existingRecord) && existingRecord.length === 0)) {
        console.log(`Car availability with ID ${id} not found`);
        return undefined;
      }
      
      // Get the existing data to use for fields that aren't being updated
      const existing = Array.isArray(existingRecord) ? existingRecord[0] : existingRecord;
      
      // Get or update car type if needed
      let carType = availability.carType;
      if (!carType && availability.carId !== undefined && availability.carId !== existing.car_id) {
        try {
          const car = await prisma.car.findUnique({
            where: { id: availability.carId }
          });
          
          if (car) {
            carType = car.type;
          }
        } catch (err) {
          console.error('Error fetching car type for update:', err);
        }
      }
      
      // Try first with car_type column
      try {
        await prisma.$executeRaw`
          UPDATE car_availabilities 
          SET 
            car_id = ${availability.carId !== undefined ? availability.carId : existing.car_id},
            start_date = ${availability.startDate !== undefined ? availability.startDate : existing.start_date},
            end_date = ${availability.endDate !== undefined ? availability.endDate : existing.end_date},
            is_available = ${availability.isAvailable !== undefined ? availability.isAvailable : existing.is_available},
            car_type = ${carType !== undefined ? carType : existing.car_type}
          WHERE id = ${id}
        `;
        console.log('Updated car availability with car_type column');
      } catch (error) {
        console.log('Error updating with car_type, trying without car_type column', error);
        // If car_type column doesn't exist, try without it
        await prisma.$executeRaw`
          UPDATE car_availabilities 
          SET 
            car_id = ${availability.carId !== undefined ? availability.carId : existing.car_id},
            start_date = ${availability.startDate !== undefined ? availability.startDate : existing.start_date},
            end_date = ${availability.endDate !== undefined ? availability.endDate : existing.end_date},
            is_available = ${availability.isAvailable !== undefined ? availability.isAvailable : existing.is_available}
          WHERE id = ${id}
        `;
        console.log('Updated car availability without car_type column');
      }
      
      // Fetch the updated record
      return this.fetchUpdatedAvailability(id);
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
  
  // Helper method to fetch updated availability data
  private async fetchUpdatedAvailability(id: number): Promise<CarAvailability | undefined> {
    try {
      // Fetch the updated record
      const updated = await prisma.$queryRaw`
        SELECT ca.*, c.name as car_name, c.type as car_type 
        FROM car_availabilities ca
        JOIN cars c ON ca.car_id = c.id
        WHERE ca.id = ${id}
      `;
      
      if (!updated || (Array.isArray(updated) && updated.length === 0)) {
        console.log('Failed to retrieve updated record');
        return undefined;
      }
      
      const row = Array.isArray(updated) ? updated[0] : updated;
      console.log('Updated record:', row);
      
      return {
        id: Number(row.id),
        carId: Number(row.car_id),
        startDate: new Date(row.start_date),
        endDate: new Date(row.end_date),
        isAvailable: Boolean(row.is_available),
        carType: row.car_type || undefined,
        createdAt: new Date(row.created_at),
        car: row.car_name ? {
          id: Number(row.car_id),
          name: row.car_name,
          type: row.car_type
        } : undefined
      };
    } catch (error) {
      console.error('Error fetching updated availability:', error);
      return undefined;
    }
  }
  
  async getAvailableCars(startDate: Date, endDate: Date, carType?: string): Promise<Car[]> {
    try {
      console.log('Getting cars directly from car_availabilities table:', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(), 
        carType 
      });
      
      // Query to get cars from car_availabilities table that are available during the requested period
      const query = `
        SELECT c.*
        FROM cars c
        INNER JOIN car_availabilities ca ON c.id = ca.car_id
        WHERE ca.is_available = true
        AND ca.start_date <= $1 
        AND ca.end_date >= $2
      `;
      
      // We need to ensure we're using Date objects as parameters
      const params: (Date | string)[] = [endDate, startDate];
      
      // Add car type filter if specified
      let finalQuery = query;
      if (carType && carType !== 'All Cars') {
        finalQuery += ` AND c.type = $3`;
        params.push(carType);
      }
      
      // Add ordering and remove duplicates
      finalQuery += ` GROUP BY c.id ORDER BY c.name`;
      
      // Execute the query
      console.log('Executing query:', finalQuery);
      console.log('With params:', params);
      
      const results = await prisma.$queryRawUnsafe<any[]>(finalQuery, ...params);
      console.log(`Found ${results ? results.length : 0} available cars`);
      
      return this.mapCarResults(results);
    } catch (error) {
      console.error('Error getting available cars from car_availabilities:', error);
      
      // Attempt to fall back to the previous implementation if there's an error
      try {
        console.log('Falling back to previous car availability implementation');
        try {
          return await this.getAvailableCarsWithCarType(startDate, endDate, carType);
        } catch (err: any) {
          // If the query fails because car_type column doesn't exist, fall back to simpler query
          if (err?.meta?.message?.includes('car_type does not exist')) {
            console.log('Falling back to query without car_type filter in car_availabilities table');
            return await this.getAvailableCarsWithoutCarTypeColumn(startDate, endDate, carType);
          }
          throw err; // Re-throw if it's a different error
        }
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        throw error; // Throw the original error
      }
    }
  }
  
  // Version with car_type column in car_availabilities table
  private async getAvailableCarsWithCarType(startDate: Date, endDate: Date, carType?: string): Promise<Car[]> {
    // First get all cars that match the basic criteria
    let carsQuery = `
      SELECT c.*
      FROM "cars" c
      WHERE 1=1
    `;
    
    // Parameters for the query
    const queryParams: any[] = [];
    let paramCounter = 1;
    
    // Add car type filter if specified
    if (carType && carType !== 'All Cars') {
      carsQuery += ` AND c.type = $${paramCounter}`;
      queryParams.push(carType);
      paramCounter++;
    }
    
    // For checking availability, we need to:
    // 1. Include cars that have no availability records (these are always available)
    // 2. Include cars that have availability records marking them as available for this period
    // 3. Exclude cars that have any availability records marking them as unavailable for this period
    carsQuery += `
      AND (
        -- Case 1: Cars with no availability records are considered available
        NOT EXISTS (
          SELECT 1 FROM "car_availabilities" ca 
          WHERE ca.car_id = c.id
        )
        OR
        -- Case 2: Cars that are explicitly marked as available for this period with matching car type
        EXISTS (
          SELECT 1 FROM "car_availabilities" ca 
          WHERE ca.car_id = c.id 
          AND ca.is_available = true
          AND (
            (ca.start_date <= $${paramCounter} AND ca.end_date >= $${paramCounter+1})
          )
    `;
    
    // Add car type filter to availability records if specified
    if (carType && carType !== 'All Cars') {
      carsQuery += `
          AND (ca.car_type IS NULL OR ca.car_type = $${paramCounter+2})
      `;
      queryParams.push(endDate, startDate, carType);
      paramCounter += 3;
    } else {
      queryParams.push(endDate, startDate);
      paramCounter += 2;
    }
    
    carsQuery += `
        )
        -- Case 3: We exclude cars with any unavailable periods that overlap with requested dates
        AND NOT EXISTS (
          SELECT 1 FROM "car_availabilities" ca 
          WHERE ca.car_id = c.id 
          AND ca.is_available = false
          AND (
            (ca.start_date <= $${paramCounter} AND ca.end_date >= $${paramCounter+1})
          )
    `;
    
    // Add car type filter to unavailable check if specified  
    if (carType && carType !== 'All Cars') {
      carsQuery += `
          AND (ca.car_type IS NULL OR ca.car_type = $${paramCounter+2})
      `;
      queryParams.push(endDate, startDate, carType);
    } else {
      queryParams.push(endDate, startDate);
    }
    
    carsQuery += `
        )
      )
    `;
    
    console.log('Query with car_type:', carsQuery);
    console.log('Params:', queryParams);
    
    // Execute the query
    const result = await prisma.$queryRawUnsafe(carsQuery, ...queryParams);
    console.log(`Query returned ${result ? (Array.isArray(result) ? result.length : 1) : 0} cars`);
    
    // Convert the raw result to our Car type
    return this.mapCarResults(result);
  }
  
  // Version without car_type column in car_availabilities table
  private async getAvailableCarsWithoutCarTypeColumn(startDate: Date, endDate: Date, carType?: string): Promise<Car[]> {
    // First get all cars that match the basic criteria
    let carsQuery = `
      SELECT c.*
      FROM "cars" c
      WHERE 1=1
    `;
    
    // Parameters for the query
    const queryParams: any[] = [];
    let paramCounter = 1;
    
    // Add car type filter if specified (this still works properly)
    if (carType && carType !== 'All Cars') {
      carsQuery += ` AND c.type = $${paramCounter}`;
      queryParams.push(carType);
      paramCounter++;
    }
    
    // For checking availability, we need to:
    // 1. Include cars that have no availability records (these are always available)
    // 2. Include cars that have availability records marking them as available for this period
    // 3. Exclude cars that have any availability records marking them as unavailable for this period
    carsQuery += `
      AND (
        -- Case 1: Cars with no availability records are considered available
        NOT EXISTS (
          SELECT 1 FROM "car_availabilities" ca 
          WHERE ca.car_id = c.id
        )
        OR
        -- Case 2: Cars that are explicitly marked as available for this period
        EXISTS (
          SELECT 1 FROM "car_availabilities" ca 
          WHERE ca.car_id = c.id 
          AND ca.is_available = true
          AND (
            (ca.start_date <= $${paramCounter} AND ca.end_date >= $${paramCounter+1})
          )
        )
        -- Case 3: We exclude cars with any unavailable periods that overlap with requested dates
        AND NOT EXISTS (
          SELECT 1 FROM "car_availabilities" ca 
          WHERE ca.car_id = c.id 
          AND ca.is_available = false
          AND (
            (ca.start_date <= $${paramCounter+2} AND ca.end_date >= $${paramCounter+3})
          )
        )
      )
    `;
    
    queryParams.push(endDate, startDate, endDate, startDate);
    
    console.log('Query without car_type:', carsQuery);
    console.log('Params:', queryParams);
    
    // Execute the query
    const result = await prisma.$queryRawUnsafe(carsQuery, ...queryParams);
    console.log(`Query returned ${result ? (Array.isArray(result) ? result.length : 1) : 0} cars`);
    
    // Convert the raw result to our Car type
    return this.mapCarResults(result);
  }
  
  // Helper to map database results to Car objects
  private mapCarResults(result: any[] | any | null): Car[] {
    if (!result) return [];
    return (Array.isArray(result) ? result : [result]).map((row: any) => ({
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
      features: Array.isArray(row.features) ? row.features : [],
      createdAt: new Date(row.created_at)
    }));
  }

  // User preferences operations
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    try {
      const preferences = await prisma.userPreferences.findFirst({
        where: { userId }
      });
      
      if (!preferences) return undefined;
      
      // Convert the Prisma model to our UserPreferences type
      return {
        id: preferences.id,
        userId: preferences.userId,
        preferredCarTypes: preferences.preferredCarTypes,
        preferredFeatures: preferences.preferredFeatures,
        minSeats: preferences.minSeats === null ? undefined : preferences.minSeats,
        maxBudget: preferences.maxBudget === null ? undefined : preferences.maxBudget,
        travelPurpose: preferences.travelPurpose === null ? undefined : preferences.travelPurpose,
        rentalFrequency: preferences.rentalFrequency === null ? undefined : preferences.rentalFrequency,
        createdAt: preferences.createdAt,
        updatedAt: preferences.updatedAt
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return undefined;
    }
  }

  async createUserPreferences(preferences: AppTypes.UserPreferencesCreateInput): Promise<UserPreferences> {
    try {
      const created = await prisma.userPreferences.create({
        data: preferences as any
      });
      
      // Convert the Prisma model to our UserPreferences type
      return {
        id: created.id,
        userId: created.userId,
        preferredCarTypes: created.preferredCarTypes,
        preferredFeatures: created.preferredFeatures,
        minSeats: created.minSeats === null ? undefined : created.minSeats,
        maxBudget: created.maxBudget === null ? undefined : created.maxBudget,
        travelPurpose: created.travelPurpose === null ? undefined : created.travelPurpose,
        rentalFrequency: created.rentalFrequency === null ? undefined : created.rentalFrequency,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt
      };
    } catch (error) {
      console.error('Error creating user preferences:', error);
      throw error;
    }
  }

  async updateUserPreferences(userId: number, preferences: AppTypes.UserPreferencesUpdateInput): Promise<UserPreferences | undefined> {
    try {
      const existingPreferences = await this.getUserPreferences(userId);
      if (!existingPreferences) return undefined;

      const updated = await prisma.userPreferences.update({
        where: { id: existingPreferences.id },
        data: preferences as any
      });
      
      // Convert the Prisma model to our UserPreferences type
      return {
        id: updated.id,
        userId: updated.userId,
        preferredCarTypes: updated.preferredCarTypes,
        preferredFeatures: updated.preferredFeatures,
        minSeats: updated.minSeats === null ? undefined : updated.minSeats,
        maxBudget: updated.maxBudget === null ? undefined : updated.maxBudget,
        travelPurpose: updated.travelPurpose === null ? undefined : updated.travelPurpose,
        rentalFrequency: updated.rentalFrequency === null ? undefined : updated.rentalFrequency,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt
      };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return undefined;
    }
  }

  async getRecommendedCars(userId: number, limit: number = 3): Promise<Car[]> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      if (!preferences) return [];

      // Build query based on preferences
      let carsQuery = prisma.car.findMany({
        where: {
          OR: [
            { type: { in: preferences.preferredCarTypes } },
            { features: { hasSome: preferences.preferredFeatures } }
          ]
        },
        orderBy: [
          { rating: 'desc' }
        ],
        take: limit
      });

      // Add seat count filter if provided
      if (preferences.minSeats) {
        carsQuery = prisma.car.findMany({
          where: {
            AND: [
              { 
                OR: [
                  { type: { in: preferences.preferredCarTypes } },
                  { features: { hasSome: preferences.preferredFeatures } }
                ]
              },
              { seats: { gte: preferences.minSeats } }
            ]
          },
          orderBy: [
            { rating: 'desc' }
          ],
          take: limit
        });
      }

      return await carsQuery;
    } catch (error) {
      console.error('Error getting recommended cars:', error);
      return [];
    }
  }
}

// Always use database storage with our explicit URL
export const storage = new DatabaseStorage();
