import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import bcrypt from 'bcrypt';

// Database connection
const connectionString = process.env.DATABASE_URL || '';
if (!connectionString) {
  console.error('DATABASE_URL environment variable not set');
  process.exit(1);
}

async function main() {
  console.log('Starting database migration...');
  
  // Create postgres clients
  const migrationClient = postgres(connectionString, { max: 1 });
  const queryClient = postgres(connectionString);
  const db = drizzle(queryClient, { schema });
  
  try {
    // Create schema if it doesn't exist
    try {
      await migrationClient`CREATE SCHEMA IF NOT EXISTS drizzle`;
      console.log('Drizzle schema created or already exists');
    } catch (err) {
      console.error('Error creating schema:', err);
    }
    
    // Run migrations with force flag to ensure tables are created
    console.log('Running migrations...');
    await migrate(drizzle(migrationClient), { 
      migrationsFolder: 'migrations'
    });
    console.log('Migrations completed successfully');
    
    // Check and create sample data
    await seedSampleData(db);
    
    // Check and create admin user
    await seedAdminUser(db);
    
    console.log('Migration process completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    // Close the database connections
    await migrationClient.end();
    await queryClient.end();
  }
}

// Function to seed sample data
async function seedSampleData(db: any) {
  try {
    // Check if we already have cars in the database
    const carCount = await db.query.cars.findMany();
    
    if (carCount.length > 0) {
      console.log('Sample car data already exists, skipping seed');
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

// Function to seed the admin user
async function seedAdminUser(db: any) {
  try {
    // Check if admin user already exists
    const existingAdmin = await db.query.users.findFirst({
      where: (users: any, { eq }: any) => eq(users.username, 'admin')
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists, skipping creation');
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

// Run the migration
main().catch(console.error);