import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

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

// Function to run migrations
export async function runMigrations() {
  if (!connectionString) {
    console.error('DATABASE_URL environment variable not set');
    return;
  }
  
  try {
    console.log('Running database migrations...');
    await migrate(drizzle(migrationClient), { migrationsFolder: 'migrations' });
    console.log('Migrations completed successfully');
    
    // Seed the admin user if not exists
    await seedAdminUser();
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}

// Function to seed the admin user
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
    
    // Create admin user
    console.log('Creating admin user...');
    await db.insert(schema.users).values({
      username: 'admin',
      password: 'admin123', // In a production app, this should be hashed
      isAdmin: true,
      fullName: 'Admin User',
      email: 'admin@example.com'
    });
    
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}