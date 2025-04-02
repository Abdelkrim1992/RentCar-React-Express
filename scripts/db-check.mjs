import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConnection() {
  try {
    // Simple query to test the connection
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('✅ Database connection successful!');
    console.log('Connection result:', result);
    
    // Check if tables exist
    console.log('\nChecking database tables...');
    
    try {
      const userCount = await prisma.user.count();
      console.log(`- Users table: ${userCount} records`);
    } catch (err) {
      console.log('- Users table: ❌ Not available');
    }
    
    try {
      const carCount = await prisma.car.count();
      console.log(`- Cars table: ${carCount} records`);
    } catch (err) {
      console.log('- Cars table: ❌ Not available');
    }
    
    try {
      const bookingCount = await prisma.booking.count();
      console.log(`- Bookings table: ${bookingCount} records`);
    } catch (err) {
      console.log('- Bookings table: ❌ Not available');
    }
    
    try {
      const settingsCount = await prisma.siteSettings.count();
      console.log(`- SiteSettings table: ${settingsCount} records`);
    } catch (err) {
      console.log('- SiteSettings table: ❌ Not available');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();