import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBookingSchema, 
  insertCarSchema, 
  insertSiteSettingsSchema, 
  insertUserSchema
} from "@shared/schema";
import session from "express-session";
import memorystore from "memorystore";

// Create MemoryStore for session storage
const MemoryStore = memorystore(session);

// Extend Request interface to include session properties
declare module "express-session" {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      isAdmin: boolean;
    };
  }
}

// Middleware to check if user is admin
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated and is an admin
  const user = req.session?.user;
  
  if (user && user.isAdmin) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Unauthorized: Admin access required'
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // =============== BOOKING ROUTES ===============
  
  // Create a new booking
  app.post("/api/bookings", async (req, res) => {
    try {
      // Validate the request body using the booking schema
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Save the booking to storage
      const booking = await storage.createBooking(bookingData);
      
      // Return the created booking
      res.status(201).json({ 
        success: true, 
        message: "Booking created successfully", 
        data: booking 
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(400).json({ 
        success: false, 
        message: "Invalid booking data", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get all bookings (admin access)
  app.get("/api/bookings", isAdmin, async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.status(200).json({
        success: true,
        data: bookings
      });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch bookings",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get a booking by ID
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBookingById(id);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: `Booking with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch booking",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Update booking status (admin access)
  app.patch("/api/bookings/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required"
        });
      }
      
      const updatedBooking = await storage.updateBookingStatus(id, status);
      
      if (!updatedBooking) {
        return res.status(404).json({
          success: false,
          message: `Booking with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Booking status updated successfully",
        data: updatedBooking
      });
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update booking status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // =============== CAR ROUTES ===============
  
  // Get all cars
  app.get("/api/cars", async (req, res) => {
    try {
      const type = req.query.type as string;
      let cars;
      
      if (type && type !== 'All Cars') {
        cars = await storage.getCarsByType(type);
      } else {
        cars = await storage.getAllCars();
      }
      
      res.status(200).json({
        success: true,
        data: cars
      });
    } catch (error) {
      console.error("Error fetching cars:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch cars",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get a car by ID
  app.get("/api/cars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const car = await storage.getCarById(id);
      
      if (!car) {
        return res.status(404).json({
          success: false,
          message: `Car with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        data: car
      });
    } catch (error) {
      console.error("Error fetching car:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch car",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Create a new car (admin access)
  app.post("/api/cars", isAdmin, async (req, res) => {
    try {
      const carData = insertCarSchema.parse(req.body);
      const car = await storage.createCar(carData);
      
      res.status(201).json({
        success: true,
        message: "Car created successfully",
        data: car
      });
    } catch (error) {
      console.error("Error creating car:", error);
      res.status(400).json({
        success: false,
        message: "Invalid car data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Update a car (admin access)
  app.put("/api/cars/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedCar = await storage.updateCar(id, req.body);
      
      if (!updatedCar) {
        return res.status(404).json({
          success: false,
          message: `Car with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Car updated successfully",
        data: updatedCar
      });
    } catch (error) {
      console.error("Error updating car:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update car",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Delete a car (admin access)
  app.delete("/api/cars/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCar(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Car with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Car deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting car:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete car",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // =============== SITE SETTINGS ROUTES ===============
  
  // Get site settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      
      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch site settings",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Update site settings (admin access)
  app.put("/api/settings", isAdmin, async (req, res) => {
    try {
      const settingsData = insertSiteSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSiteSettings(settingsData);
      
      res.status(200).json({
        success: true,
        message: "Site settings updated successfully",
        data: settings
      });
    } catch (error) {
      console.error("Error updating site settings:", error);
      res.status(400).json({
        success: false,
        message: "Invalid site settings data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // =============== AUTH ROUTES ===============
  
  // Add route to check if user is authenticated
  app.get("/api/auth/me", (req, res) => {
    if (req.session.user) {
      return res.status(200).json({
        success: true,
        data: req.session.user
      });
    }
    
    return res.status(401).json({
      success: false,
      message: "Not authenticated"
    });
  });
  
  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to logout"
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Logged out successfully"
      });
    });
  });
  
  // Basic auth route with session 
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required"
        });
      }
      
      // For simplicity, check for admin credentials - in a real app, use the database
      if (username === 'admin' && password === 'admin123') {
        // Create admin session
        const userData = {
          id: 1,
          username: 'admin',
          isAdmin: true,
        };
        
        // Store user in session
        req.session.user = userData;
        
        return res.status(200).json({
          success: true,
          message: "Login successful",
          data: userData
        });
      }
      
      // Check regular user authentication
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password"
        });
      }
      
      // Store user in session
      req.session.user = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin
      };
      
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
          fullName: user.fullName,
          email: user.email
        }
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create a user account
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already exists"
        });
      }
      
      // Create the user
      const user = await storage.createUser({
        ...userData,
        isAdmin: false // Regular users can't register as admins
      });
      
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email
        }
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(400).json({
        success: false,
        message: "Invalid user data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
