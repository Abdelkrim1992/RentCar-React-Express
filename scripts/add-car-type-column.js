import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    // Add the car_type column if it doesn't exist
    await prisma.$executeRawUnsafe('ALTER TABLE car_availabilities ADD COLUMN IF NOT EXISTS car_type VARCHAR(255)');
    console.log('Added car_type column to car_availabilities table');
    
    // Update existing records with car type information
    const result = await prisma.$executeRawUnsafe(`
      UPDATE car_availabilities ca
      SET car_type = c.type
      FROM cars c
      WHERE ca.car_id = c.id AND ca.car_type IS NULL
    `);
    
    console.log('Updated car_type column for existing records');
    
  } catch (error) {
    console.error('Error executing migrations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();