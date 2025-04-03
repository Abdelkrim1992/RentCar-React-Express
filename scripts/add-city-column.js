// Import the Prisma client
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addCityColumn() {
  try {
    console.log('Adding city column to car_availabilities table...');
    
    // Execute raw SQL to add the column
    await prisma.$executeRaw`ALTER TABLE car_availabilities ADD COLUMN IF NOT EXISTS city VARCHAR(255);`;
    
    console.log('Successfully added city column!');
    return true;
  } catch (error) {
    console.error('Error adding city column:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addCityColumn()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });