import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Make sure the DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Running migration to add car_type to car_availabilities...');
    
    const sqlPath = path.join(process.cwd(), 'migrations', 'add_car_type_to_availabilities.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    // Execute the SQL directly using Prisma's $executeRawUnsafe
    await prisma.$executeRawUnsafe(sqlContent);
    
    console.log('Migration completed successfully.');
    
    // Update existing car availabilities with car type info
    console.log('Updating existing car availability records with car types...');
    
    // Get all car availabilities
    const availabilities = await prisma.car_availabilities.findMany();
    
    for (const availability of availabilities) {
      // Get the car type for this availability
      const car = await prisma.cars.findUnique({
        where: { id: availability.car_id }
      });
      
      if (car) {
        // Update the availability with the car type
        await prisma.car_availabilities.update({
          where: { id: availability.id },
          data: { car_type: car.type }
        });
        console.log(`Updated availability ${availability.id} with car type ${car.type}`);
      }
    }
    
    console.log('All car availability records have been updated with car types.');
    
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();