import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Direct database URL, not using env variable
const DATABASE_URL = 'postgresql://car-rent_owner:npg_o2VYey1tzUXS@ep-billowing-art-ab1nuveo-pooler.eu-west-2.aws.neon.tech/car-rent?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function main() {
  console.log("Starting database setup...");
  
  try {
    // Create admin user
    const existingAdmin = await prisma.user.findFirst({
      where: {
        username: 'admin',
        isAdmin: true
      }
    });
    
    if (existingAdmin) {
      console.log("Admin user already exists");
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          isAdmin: true,
          fullName: 'Admin User',
          email: 'admin@example.com'
        }
      });
      console.log("Created admin user");
    }
    
    // Create cars if needed
    const carCount = await prisma.car.count();
    if (carCount === 0) {
      const cars = [
        {
          name: 'Tesla Model S',
          type: 'Electric',
          seats: 5,
          power: '670 hp',
          rating: '4.9',
          price: '100',
          image: 'https://imageio.forbes.com/specials-images/imageserve/5d35eacaf1176b0008974b54/0x0.jpg?format=jpg&crop=4560,2565,x790,y784,safe&height=900&width=1600&fit=bounds',
          special: 'Electric',
          specialColor: '#34D399',
          description: 'Experience the future of driving with Tesla Model S, offering exceptional range and performance.',
          features: ['Autopilot', 'Zero Emissions', 'Ludicrous Mode', 'High Range', 'Supercharging']
        },
        {
          name: 'BMW X5',
          type: 'SUV',
          seats: 7,
          power: '335 hp',
          rating: '4.7',
          price: '120',
          image: 'https://www.bmwusa.com/content/dam/bmwusa/XModels/X5/MY24/Mobile/BMW-MY24-X5-Overview-Mobile-01.jpg',
          special: 'Premium',
          specialColor: '#8B5CF6',
          description: 'The BMW X5 combines luxury, space, and driving dynamics in a premium SUV package.',
          features: ['All-Wheel Drive', 'Panoramic Sunroof', 'Premium Sound', 'Advanced Safety', 'Heated Seats']
        },
        {
          name: 'Ford Mustang',
          type: 'Sports',
          seats: 4,
          power: '450 hp',
          rating: '4.8',
          price: '90',
          image: 'https://www.ford.com/cmslibs/content/dam/vdm_ford/live/en_us/ford/nameplate/mustang/2024/collections/3-2/24_FRD_MST_wht_GT_Prem_34Front_16x9.jpg',
          special: 'Classic',
          specialColor: '#F43F5E',
          description: 'The iconic Ford Mustang delivers exhilarating performance and classic American muscle car styling.',
          features: ['V8 Engine', 'Performance Package', 'Launch Control', 'Track Apps', 'Custom Drive Modes']
        }
      ];
      
      for (const car of cars) {
        await prisma.car.create({ data: car });
      }
      console.log(`Created ${cars.length} cars`);
    } else {
      console.log(`${carCount} cars already exist in the database`);
    }
    
    // Create car availabilities if needed
    const availabilityCount = await prisma.carAvailability.count();
    if (availabilityCount === 0) {
      const cars = await prisma.car.findMany();
      const today = new Date();
      
      for (const car of cars) {
        // Available next week
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(today.getDate() + 7);
        
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 7);
        
        await prisma.carAvailability.create({
          data: {
            carId: car.id,
            startDate: nextWeekStart,
            endDate: nextWeekEnd,
            isAvailable: true
          }
        });
        
        // Unavailable for maintenance in 2 weeks
        const twoWeeksStart = new Date(today);
        twoWeeksStart.setDate(today.getDate() + 14);
        
        const twoWeeksEnd = new Date(twoWeeksStart);
        twoWeeksEnd.setDate(twoWeeksStart.getDate() + 3);
        
        await prisma.carAvailability.create({
          data: {
            carId: car.id,
            startDate: twoWeeksStart,
            endDate: twoWeeksEnd,
            isAvailable: false
          }
        });
      }
      
      console.log(`Created ${cars.length * 2} car availabilities`);
    } else {
      console.log(`${availabilityCount} car availabilities already exist`);
    }
    
    console.log("Database setup completed successfully");
  } catch (error) {
    console.error("Error during database setup:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from database");
  }
}

main();