import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.prisma";
import { AppTypes } from "./types";
import { setupAuth, authenticateToken } from "./auth";
import { sendBookingStatusEmail } from "./email";

// We need to define our own validation schemas to match the Prisma types
import { z } from "zod";

// Define validation schemas
const bookingSchema = z.object({
  pickupLocation: z.string(),
  returnLocation: z.string(),
  pickupDate: z.string(),
  returnDate: z.string(),
  carType: z.string(),
  carId: z.number().nullable().optional(),
  userId: z.number().nullable().optional(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  status: z.string().optional().default('pending'),
});

const carSchema = z.object({
  name: z.string(),
  type: z.string(),
  seats: z.number(),
  power: z.string(),
  rating: z.string(),
  price: z.string(),
  image: z.string(),
  special: z.string().nullable().optional(),
  specialColor: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  features: z.array(z.string()),
});

const siteSettingsSchema = z.object({
  siteName: z.string().optional(),
  logoColor: z.string().optional(),
  accentColor: z.string().optional(),
  logoText: z.string().optional(),
  customLogo: z.string().nullable().optional(),
});

const carAvailabilitySchema = z.object({
  carId: z.number(),
  startDate: z.date(),
  endDate: z.date(),
  isAvailable: z.boolean().optional().default(true),
  carType: z.string().optional(),
  // Ensure city is properly validated and transformed
  city: z.string().optional().transform(val => val === undefined || val === null ? '' : val),
});

const userPreferencesSchema = z.object({
  userId: z.number(),
  preferredCarTypes: z.array(z.string()),
  preferredFeatures: z.array(z.string()),
  minSeats: z.number().int().positive().optional(),
  maxBudget: z.number().positive().optional(),
  travelPurpose: z.string().optional(),
  rentalFrequency: z.string().optional(),
});

// Middleware to check if user is admin
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First verify the token is valid
    authenticateToken(req, res, () => {
      // Token is valid, now check if user is an admin
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }
      
      // Ensure we evaluate isAdmin as a boolean
      const isUserAdmin = user.isAdmin === null ? false : !!user.isAdmin;
      
      if (isUserAdmin) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    });
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure authentication
  setupAuth(app);
  // =============== BOOKING ROUTES ===============
  
  // Create a new booking
  app.post("/api/bookings", async (req, res) => {
    try {
      // Validate the request body using the booking schema
      const bookingData = bookingSchema.parse(req.body);
      
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
  
  // Get bookings by email (customer access)
  app.get("/api/bookings/customer", async (req, res) => {
    try {
      const email = req.query.email as string;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required to fetch bookings"
        });
      }
      
      // Find bookings by email
      const bookings = await storage.getAllBookings();
      const customerBookings = bookings.filter(booking => booking.email === email);
      
      res.status(200).json({
        success: true,
        data: customerBookings
      });
    } catch (error) {
      console.error("Error fetching customer bookings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch customer bookings",
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
      const { status, rejectionReason } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required"
        });
      }
      
      // If the status is 'rejected' and a reason is provided, update the booking
      // with the rejection reason
      let updatedBooking;
      if (status === 'rejected' && rejectionReason) {
        updatedBooking = await storage.updateBookingStatusWithReason(id, status, rejectionReason);
      } else {
        updatedBooking = await storage.updateBookingStatus(id, status);
      }
      
      if (!updatedBooking) {
        return res.status(404).json({
          success: false,
          message: `Booking with ID ${id} not found`
        });
      }
      
      // Send email notification to customer
      try {
        if (updatedBooking.email) {
          const emailSent = await sendBookingStatusEmail(updatedBooking, status);
          console.log(`Email notification ${emailSent ? 'sent' : 'failed'} for booking #${id} status update to ${status}`);
        } else {
          console.log(`No email notification sent for booking #${id}: Customer email not available`);
        }
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
        // We don't want to fail the status update if email sending fails
      }
      
      // We don't delete rejected bookings anymore so customers can see them
      // Keeping this commented in case it needs to be reverted in the future
      /*
      if (status === 'rejected') {
        try {
          const deleted = await storage.deleteBooking(id);
          console.log(`Rejected booking #${id} ${deleted ? 'deleted' : 'not deleted'} from database`);
        } catch (deleteError) {
          console.error("Error deleting rejected booking:", deleteError);
          // Don't fail the overall operation if deletion fails
        }
      }
      */
      
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
  
  // Get available cars for date range (must come before the :id route)
  app.get("/api/cars/available", async (req, res) => {
    try {
      const { startDate, endDate, type, city } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Start date and end date are required"
        });
      }
      
      console.log('Getting available cars for:', { startDate, endDate, type, city });
      
      try {
        const parsedStartDate = new Date(startDate as string);
        const parsedEndDate = new Date(endDate as string);
        
        // Validate dates
        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid date format"
          });
        }
        
        const carType = type && type !== 'All Cars' ? type as string : undefined;
        const cityFilter = city && city !== 'all' ? city as string : undefined;
        
        const availableCars = await storage.getAvailableCars(
          parsedStartDate,
          parsedEndDate,
          carType,
          cityFilter
        );
        
        console.log(`Found ${availableCars.length} available cars`);
        
        return res.status(200).json({
          success: true,
          data: availableCars
        });
      } catch (dbError) {
        console.error("Database error fetching available cars:", dbError);
        
        // If it's a database error related to the car_availabilities table,
        // fallback to returning all cars of the requested type
        let fallbackCars: any[] = [];
        try {
          if (type && type !== 'All Cars') {
            fallbackCars = await storage.getCarsByType(type as string);
          } else {
            fallbackCars = await storage.getAllCars();
          }
          
          return res.status(200).json({
            success: true,
            data: fallbackCars,
            message: "Availability system is temporarily unavailable. Showing all cars."
          });
        } catch (fallbackError) {
          // If fallback also fails, throw to the outer catch block
          throw fallbackError;
        }
      }
    } catch (error) {
      console.error("Error fetching available cars:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch available cars. Please try again later.",
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
      const carData = carSchema.parse(req.body);
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
      const settingsData = siteSettingsSchema.parse(req.body);
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
  
  // =============== CAR AVAILABILITY ROUTES ===============
  
  // Get all car availabilities - using a distinct path to avoid route conflicts
  app.get("/api/car-availabilities", isAdmin, async (req, res) => {
    try {
      console.log("Fetching all car availabilities");
      
      // Get actual car availabilities from the database
      const availabilities = await storage.getAllCarAvailabilities();
      console.log(`Retrieved ${availabilities.length} car availabilities from database`);
      
      res.status(200).json({
        success: true,
        data: availabilities
      });
    } catch (error) {
      console.error("Error fetching car availabilities:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch car availabilities",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get car availabilities by car ID (make sure this route is defined AFTER the /api/cars/availability route)
  app.get("/api/cars/:id/availability", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`Fetching availabilities for car ID: ${id}`);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid car ID"
        });
      }
      
      // Check if car exists
      const car = await storage.getCarById(id);
      if (!car) {
        return res.status(404).json({
          success: false,
          message: `Car with ID ${id} not found`
        });
      }
      
      // Try to get car availabilities, but return empty array if database issues occur
      let availabilities: any[] = [];
      try {
        availabilities = await storage.getCarAvailabilities(id);
        console.log(`Retrieved ${availabilities.length} availabilities for car ID: ${id}`);
      } catch (dbError) {
        console.error("Database error fetching car availabilities for car ID:", id, dbError);
        // Return empty array instead of error when table doesn't exist
      }
      
      res.status(200).json({
        success: true,
        data: availabilities
      });
    } catch (error) {
      console.error("Error fetching car availabilities:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch car availabilities",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Create a new car availability (admin access)
  app.post("/api/cars/availability", isAdmin, async (req, res) => {
    try {
      console.log("Creating car availability with request body:", req.body);
      console.log("City value in request:", req.body.city);
      
      // Parse dates from ISO strings to Date objects for Zod validation
      const parsed = {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        // Ensure city is set correctly
        city: req.body.city || ''
      };
      
      console.log("Parsed data before schema validation:", parsed);
      const availabilityData = carAvailabilitySchema.parse(parsed);
      console.log("Validated availability data:", availabilityData);
      
      const availability = await storage.createCarAvailability(availabilityData);
      
      res.status(201).json({
        success: true,
        message: "Car availability created successfully",
        data: availability
      });
    } catch (error) {
      console.error("Error creating car availability:", error);
      res.status(400).json({
        success: false,
        message: "Invalid car availability data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Update a car availability (admin access)
  app.patch("/api/cars/availability/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Parse dates from ISO strings to Date objects if they exist
      const updatedData: any = { ...req.body };
      if (req.body.startDate) updatedData.startDate = new Date(req.body.startDate);
      if (req.body.endDate) updatedData.endDate = new Date(req.body.endDate);
      
      // Debug logs to trace city field
      console.log("Update availability request body:", req.body);
      console.log("City value:", req.body.city);
      console.log("Updated data to be sent to storage:", updatedData);
      
      const updatedAvailability = await storage.updateCarAvailability(id, updatedData);
      
      if (!updatedAvailability) {
        return res.status(404).json({
          success: false,
          message: `Car availability with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Car availability updated successfully",
        data: updatedAvailability
      });
    } catch (error) {
      console.error("Error updating car availability:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update car availability",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Delete a car availability (admin access)
  app.delete("/api/cars/availability/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCarAvailability(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Car availability with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Car availability deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting car availability:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete car availability",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  


  // =============== USER PREFERENCES ROUTES ===============

  // Get user preferences (protected route)
  app.get("/api/user/preferences", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated"
        });
      }
      
      const preferences = await storage.getUserPreferences(user.id);
      
      if (!preferences) {
        return res.status(404).json({
          success: false,
          message: "User preferences not found"
        });
      }
      
      res.status(200).json({
        success: true,
        data: preferences
      });
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user preferences",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Create or update user preferences (protected route)
  app.post("/api/user/preferences", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated"
        });
      }
      
      // Add userId to the preferences data
      const preferencesData = {
        ...req.body,
        userId: user.id
      };
      
      // Validate the data
      const validatedData = userPreferencesSchema.parse(preferencesData);
      
      // Check if user preferences already exist
      const existingPreferences = await storage.getUserPreferences(user.id);
      
      let preferences;
      if (existingPreferences) {
        // Update existing preferences
        preferences = await storage.updateUserPreferences(user.id, validatedData);
      } else {
        // Create new preferences
        preferences = await storage.createUserPreferences(validatedData);
      }
      
      res.status(200).json({
        success: true,
        message: "User preferences saved successfully",
        data: preferences
      });
    } catch (error) {
      console.error("Error saving user preferences:", error);
      res.status(400).json({
        success: false,
        message: "Invalid user preferences data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get recommended cars for user (protected route)
  app.get("/api/user/recommendations", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated"
        });
      }
      
      // Get limit from query params, default to 3
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      
      try {
        const recommendedCars = await storage.getRecommendedCars(user.id, limit);
        
        res.status(200).json({
          success: true,
          data: recommendedCars
        });
      } catch (dbError) {
        console.error("Database error fetching recommended cars:", dbError);
        
        // Fallback to returning a few random cars if recommendation system fails
        const fallbackCars = await storage.getAllCars();
        const randomCars = fallbackCars
          .sort(() => 0.5 - Math.random()) // Simple shuffle
          .slice(0, limit);
        
        res.status(200).json({
          success: true,
          data: randomCars,
          message: "Personalized recommendations are temporarily unavailable."
        });
      }
    } catch (error) {
      console.error("Error fetching recommended cars:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recommended cars",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Auth routes are handled by setupAuth(app) at the beginning of this function

  const httpServer = createServer(app);

  return httpServer;
}
