// Run migrations script without prompts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
// We'll skip importing the schema and just create tables directly

async function main() {
  console.log('Running database migrations...');
  
  // Create the DB connection
  const connectionString = process.env.DATABASE_URL;
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);
  
  // Create tables and run migrations
  try {
    // Create tables directly using schema
    console.log('Creating tables...');
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        full_name TEXT,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await client`
      CREATE TABLE IF NOT EXISTS cars (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        seats INTEGER NOT NULL,
        power TEXT NOT NULL,
        rating TEXT NOT NULL,
        price TEXT NOT NULL,
        image TEXT NOT NULL,
        special TEXT,
        special_color TEXT,
        description TEXT,
        features TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await client`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        pickup_location TEXT NOT NULL,
        return_location TEXT NOT NULL,
        pickup_date TEXT NOT NULL,
        return_date TEXT NOT NULL,
        car_type TEXT NOT NULL,
        car_id INTEGER,
        user_id INTEGER,
        name TEXT,
        email TEXT,
        phone TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await client`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        site_name TEXT DEFAULT 'Ether',
        logo_color TEXT DEFAULT '#6843EC',
        accent_color TEXT DEFAULT '#D2FF3A',
        logo_text TEXT DEFAULT 'ETHER',
        custom_logo TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Seed admin user
    const existingAdminUser = await client`SELECT * FROM users WHERE username = 'admin'`;
    if (!existingAdminUser || existingAdminUser.length === 0) {
      console.log('Creating admin user...');
      await client`
        INSERT INTO users (username, password, is_admin)
        VALUES ('admin', '$2b$10$EcPZZM.PJ6YQShQOh9qcgeq0oM0rMYxFaZvRAKbQ4EGwdQqbGPwGK', true)
      `;
    } else {
      console.log('Admin user already exists');
    }
    
    // Seed sample cars
    const existingCars = await client`SELECT * FROM cars`;
    if (!existingCars || existingCars.length === 0) {
      console.log('Creating sample cars...');
      await client`
        INSERT INTO cars (name, type, seats, power, rating, price, image, special, special_color, description, features)
        VALUES 
          ('Tesla Model S', 'Electric', 5, '670 hp', '4.9', '€199/day', '/cars/tesla-model-s.jpg', 'Electric', '#34D399', 'Experience the future of driving with Tesla Model S, offering exceptional range and performance.', ARRAY['Autopilot', 'Zero Emissions', 'Ludicrous Mode', 'High Range', 'Supercharging']),
          ('BMW M4 Competition', 'Sports', 4, '503 hp', '4.8', '€249/day', '/cars/bmw-m4.jpg', 'Performance', '#EC4899', 'The ultimate driving machine, delivering track-ready performance with everyday usability.', ARRAY['Twin-Turbo Engine', 'M Differential', 'Carbon Fiber Roof', 'Sport Exhaust', 'Track Mode']),
          ('Range Rover Sport', 'SUV', 7, '395 hp', '4.7', '€279/day', '/cars/range-rover.jpg', 'Luxury', '#8B5CF6', 'The Range Rover Sport combines luxury with off-road capability for an unmatched driving experience.', ARRAY['All-Terrain Progress Control', 'Air Suspension', 'Panoramic Roof', 'Premium Sound', 'Off-Road Package'])
      `;
    } else {
      console.log('Sample car data already exists');
    }
    
    // Seed site settings
    const existingSettings = await client`SELECT * FROM site_settings`;
    if (!existingSettings || existingSettings.length === 0) {
      console.log('Creating site settings...');
      await client`
        INSERT INTO site_settings (site_name, logo_color, accent_color, logo_text)
        VALUES ('Salaghe', '#6843EC', '#D2FF3A', 'ETHER')
      `;
    } else {
      console.log('Site settings already exist');
    }
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await client.end();
  }
}

main();