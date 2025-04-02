// Script to check Prisma connection and tables
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://car-rent_owner:npg_o2VYey1tzUXS@ep-billowing-art-ab1nuveo-pooler.eu-west-2.aws.neon.tech/car-rent?sslmode=require'
    }
  },
  log: ['query', 'info', 'warn', 'error']
});

async function main() {
  try {
    console.log('Connecting to database via Prisma...');
    
    // Try to query cars table
    console.log('Querying cars table...');
    const cars = await prisma.car.findMany({
      take: 3
    });
    console.log(`Retrieved ${cars.length} cars:`);
    console.log(JSON.stringify(cars, null, 2));
    
    // Try to query car_availabilities table
    console.log('\nQuerying car_availabilities table...');
    const availabilities = await prisma.carAvailability.findMany({
      take: 5,
      include: {
        car: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });
    console.log(`Retrieved ${availabilities.length} car availabilities:`);
    console.log(JSON.stringify(availabilities, null, 2));
    
    if (availabilities.length === 0) {
      // If no availabilities exist, let's create a test availability
      console.log('\nNo availabilities found. Checking if cars exist to create a test availability...');
      
      if (cars.length > 0) {
        const firstCar = cars[0];
        console.log(`Creating a test availability for car ID ${firstCar.id} (${firstCar.name})...`);
        
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7); // One week from now
        
        const newAvailability = await prisma.carAvailability.create({
          data: {
            carId: firstCar.id,
            startDate,
            endDate,
            isAvailable: true
          }
        });
        
        console.log('Created test availability:');
        console.log(JSON.stringify(newAvailability, null, 2));
      } else {
        console.log('No cars found to create test availability.');
      }
    }
    
  } catch (error) {
    console.error('Error in database operations:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
}

main();