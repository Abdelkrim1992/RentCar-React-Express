import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import bcrypt from 'bcrypt';

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Use Drizzle with Postgres for direct database access
const connectionString = process.env.DATABASE_URL || '';
console.log('Database connection string available:', !!connectionString);

// Create a postgres client for migrations
const migrationClient = postgres(connectionString, { max: 1 });

// Create a postgres client for queries
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

// Function to run migrations with forced schema creation
export async function runMigrations() {
  if (!connectionString) {
    console.error('DATABASE_URL environment variable not set');
    return;
  }
  
  try {
    console.log('Running database migrations...');
    
    // Create schema if it doesn't exist
    try {
      await migrationClient`CREATE SCHEMA IF NOT EXISTS drizzle`;
    } catch (err) {
      console.error('Error creating schema:', err);
    }
    
    // Run migrations
    const drizzleInstance = drizzle(migrationClient);
    await migrate(drizzleInstance, { 
      migrationsFolder: 'migrations',
    });
    
    console.log('Migrations completed successfully');
    
    // Create sample data if needed
    await seedSampleData();
    
    // Seed the admin user if not exists
    await seedAdminUser();
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error; // Re-throw to ensure we see the full error
  }
}

// Function to seed sample data for testing
async function seedSampleData() {
  try {
    // Check if we already have cars in the database
    const carCount = await db.query.cars.findMany();
    
    if (carCount.length > 0) {
      console.log('Sample car data already exists');
      return;
    }
    
    console.log('Creating sample car data...');
    
    // Create some sample cars
    const sampleCars = [
      {
        name: 'Tesla Model S',
        type: 'Electric',
        seats: 5,
        power: '670 hp',
        rating: '4.9',
        price: '€199/day',
        image: '/cars/tesla-model-s.jpg',
        special: 'Electric',
        specialColor: '#34D399',
        description: 'Experience the future of driving with Tesla Model S, offering exceptional range and performance.',
        features: ['Autopilot', 'Zero Emissions', 'Ludicrous Mode', 'High Range', 'Supercharging']
      },
      {
        name: 'BMW M4 Competition',
        type: 'Sports',
        seats: 4,
        power: '503 hp',
        rating: '4.8',
        price: '€249/day',
        image: '/cars/bmw-m4.jpg',
        special: 'Performance',
        specialColor: '#EC4899',
        description: 'The ultimate driving machine, delivering track-ready performance with everyday usability.',
        features: ['Twin-Turbo Engine', 'M Differential', 'Carbon Fiber Roof', 'Sport Exhaust', 'Track Mode']
      },
      {
        name: 'Range Rover Sport',
        type: 'SUV',
        seats: 7,
        power: '395 hp',
        rating: '4.7',
        price: '€279/day',
        image: '/cars/range-rover.jpg',
        special: 'Luxury',
        specialColor: '#8B5CF6',
        description: 'The Range Rover Sport combines luxury with off-road capability for an unmatched driving experience.',
        features: ['All-Terrain Progress Control', 'Air Suspension', 'Panoramic Roof', 'Premium Sound', 'Off-Road Package']
      }
    ];
    
    // Insert cars
    for (const car of sampleCars) {
      await db.insert(schema.cars).values(car);
    }
    
    console.log('Sample car data created successfully');
  } catch (error) {
    console.error('Error seeding sample data:', error);
  }
}

// Function to seed the admin user with bcrypt hashed password
async function seedAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, 'admin')
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user with bcrypt-hashed password
    console.log('Creating admin user...');
    
    // Hash the password using bcrypt
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await db.insert(schema.users).values({
      username: 'admin',
      password: hashedPassword,
      isAdmin: true,
      fullName: 'Admin User',
      email: 'admin@example.com'
    });
    
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}