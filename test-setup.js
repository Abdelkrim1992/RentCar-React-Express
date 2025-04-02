// Script to set up test data for car availability, admin user and cars
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://car-rent_owner:npg_o2VYey1tzUXS@ep-billowing-art-ab1nuveo-pooler.eu-west-2.aws.neon.tech/car-rent?sslmode=require'
    }
  },
  log: ['query', 'info', 'warn', 'error']
});

async function main() {
  try {
    console.log('Starting test setup...');
    
    // Create admin user if doesn't exist
    await createAdminUser();
    
    // Check if there are cars, if not add some
    await createSampleCars();
    
    // Check if there are car availabilities, if not add some
    await createSampleAvailabilities();
    
    console.log('Test setup completed successfully');
  } catch (error) {
    console.error('Error in test setup:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
}

async function createAdminUser() {
  const existingAdmin = await prisma.user.findFirst({
    where: {
      username: 'admin',
      isAdmin: true
    }
  });
  
  if (existingAdmin) {
    console.log('Admin user already exists - username: admin');
    return;
  }
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      isAdmin: true,
      fullName: 'Admin User',
      email: 'admin@example.com'
    }
  });
  
  console.log('Created admin user:', admin.username);
}

async function createSampleCars() {
  const carCount = await prisma.car.count();
  
  if (carCount > 0) {
    console.log(`${carCount} cars already exist in the database`);
    return;
  }
  
  const sampleCars = [
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
    },
    {
      name: 'Toyota Camry',
      type: 'Sedan',
      seats: 5,
      power: '203 hp',
      rating: '4.5',
      price: '70',
      image: 'https://toyotaassets.scene7.com/is/image/toyota/CAM_MY22_0035_V001?fmt=jpg&fit=crop&resMode=high&qlt=79&wid=1920&hei=1080',
      special: 'Reliable',
      specialColor: '#3B82F6',
      description: 'The Toyota Camry is a dependable and fuel-efficient sedan with modern features and comfort.',
      features: ['Fuel Efficient', 'Safety Sense', 'Apple CarPlay', 'Android Auto', 'Comfortable Interior']
    }
  ];
  
  for (const car of sampleCars) {
    await prisma.car.create({ data: car });
  }
  
  console.log(`Created ${sampleCars.length} sample cars`);
}

async function createSampleAvailabilities() {
  const availabilityCount = await prisma.carAvailability.count();
  
  if (availabilityCount > 0) {
    console.log(`${availabilityCount} car availabilities already exist in the database`);
    return;
  }
  
  const cars = await prisma.car.findMany({ take: 10 });
  
  if (cars.length === 0) {
    console.log('No cars found to create availabilities for');
    return;
  }
  
  const today = new Date();
  
  // Create availabilities for each car
  for (const car of cars) {
    // Sample availability 1: Next week (available)
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
    
    // Sample availability 2: Two weeks from now (unavailable for maintenance)
    const twoWeeksStart = new Date(today);
    twoWeeksStart.setDate(today.getDate() + 14);
    
    const twoWeeksEnd = new Date(twoWeeksStart);
    twoWeeksEnd.setDate(twoWeeksStart.getDate() + 3); // 3 days of maintenance
    
    await prisma.carAvailability.create({
      data: {
        carId: car.id,
        startDate: twoWeeksStart,
        endDate: twoWeeksEnd,
        isAvailable: false // Car is not available during this period
      }
    });
  }
  
  console.log(`Created ${cars.length * 2} sample car availabilities`);
}

main();