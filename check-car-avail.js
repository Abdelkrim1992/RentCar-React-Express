import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking car availabilities...');
    
    // Check if the table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'car_availabilities'
      );
    `;
    console.log('Table exists:', tableExists);
    
    if (tableExists[0].exists) {
      // Count rows
      const count = await prisma.$queryRaw`SELECT COUNT(*) FROM car_availabilities`;
      console.log('Number of car availabilities:', count[0].count);
      
      // Get all car availabilities
      const availabilities = await prisma.$queryRaw`
        SELECT ca.*, c.name as car_name, c.type as car_type 
        FROM "car_availabilities" ca
        JOIN "cars" c ON ca."car_id" = c."id"
      `;
      console.log('Car availabilities:', JSON.stringify(availabilities, null, 2));
    }
    
    // Also check cars
    const cars = await prisma.car.findMany();
    console.log('Number of cars:', cars.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();