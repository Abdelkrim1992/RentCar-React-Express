import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const prisma = new PrismaClient();

async function getBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        car: true,
        user: true
      }
    });
    console.log(JSON.stringify(bookings, null, 2));
  } catch (error) {
    console.error('Error fetching bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getBookings();