// Script to check Prisma database tables
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    
    // Check if the car_availabilities table exists using information_schema
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('Tables in database:');
    console.log(tables);
    
    const hasCarAvailabilities = tables.some(t => t.table_name === 'car_availabilities');
    
    if (!hasCarAvailabilities) {
      console.log('Creating car_availabilities table...');
      
      // Create car_availabilities table if it doesn't exist
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS car_availabilities (
          id SERIAL PRIMARY KEY,
          car_id INTEGER NOT NULL REFERENCES cars(id),
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          is_available BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP(6) NOT NULL DEFAULT NOW()
        )
      `;
      
      console.log('Successfully created car_availabilities table!');
    } else {
      console.log('car_availabilities table already exists.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
}

main();