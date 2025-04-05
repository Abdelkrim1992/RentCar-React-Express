import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const prisma = new PrismaClient();

async function createTestBooking() {
  try {
    // First, get a car to link to the booking
    const car = await prisma.car.findFirst();
    
    if (!car) {
      console.error('No cars found to create a test booking');
      return;
    }
    
    // Get an admin user to associate with the booking
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { isAdmin: true },
          { username: 'admin' }
        ] 
      }
    });
    
    if (!user) {
      console.error('No admin user found');
      return;
    }
    
    // Create a test booking
    const booking = await prisma.booking.create({
      data: {
        pickupLocation: "Test Airport",
        returnLocation: "Test Airport",
        pickupDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // tomorrow
        returnDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // three days later
        carType: car.type,
        car: { connect: { id: car.id } },
        user: { connect: { id: user.id } },
        name: "Test Customer",
        email: "test@example.com",
        phone: "123-456-7890",
        status: "pending",
        city: "Test City"
      }
    });
    
    console.log('Created test booking:', booking);
  } catch (error) {
    console.error('Error creating test booking:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestBooking();