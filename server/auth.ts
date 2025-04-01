import { Express, Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage.prisma";
import { User } from "./types";

// JWT secret key
const JWT_SECRET = "jwt-secret-key-for-dev-only";
const TOKEN_EXPIRY = "24h";

// Middleware to authenticate token
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Get auth header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required"
    });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token"
      });
    }
    
    // Add the user info to the request
    (req as any).user = user;
    next();
  });
};

// Generate token for a user
const generateToken = (user: User): string => {
  // Don't include password in the token
  const { password, ...userWithoutPassword } = user;
  return jwt.sign(userWithoutPassword, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

export function setupAuth(app: Express) {
  // Initialize passport (still used for the local strategy)
  app.use(passport.initialize());
  
  // Set up the local strategy for username/password validation
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        
        // Compare passwords using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        
        // Password is correct
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Registration endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, fullName, email } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already exists"
        });
      }
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create the user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        fullName,
        email,
        isAdmin: false // Only manually set users to admin
      });
      
      // Generate token
      const token = generateToken(user);
      
      // Return user without password and token
      const { password: _, ...userWithoutPassword } = user;
      return res.status(201).json({
        success: true,
        data: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Error during registration:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during registration"
      });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: User | false, info: { message: string } | undefined) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: info?.message || "Authentication failed"
        });
      }
      
      // User authenticated successfully, generate token
      const token = generateToken(user);
      
      // Remove sensitive data before sending
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json({
        success: true,
        data: userWithoutPassword,
        token
      });
    })(req, res, next);
  });

  // No need for a server-side logout with JWT, client just removes the token
  app.post("/api/auth/logout", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  });

  // Current user endpoint - protected by token auth
  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      // Get the user ID from the token
      const userId = (req as any).user.id;
      
      // Get the latest user data from database
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Remove sensitive data before sending
      const { password, ...userWithoutPassword } = user;
      res.json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error("Error getting current user:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
}