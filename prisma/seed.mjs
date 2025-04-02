import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

// Explicitly set the database URL
const databaseUrl = 'postgresql://car-rent_owner:npg_o2VYey1tzUXS@ep-billowing-art-ab1nuveo-pooler.eu-west-2.aws.neon.tech/car-rent?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

async function main() {
  try {
    console.log('Starting database seed...');
    
    // Check if admin user exists
    const adminExists = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    
    if (!adminExists) {
      console.log('Creating admin user...');
      // Create admin user with hashed password
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
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists, skipping creation');
    }
    
    // Check if we have any cars
    const carsCount = await prisma.car.count();
    
    if (carsCount === 0) {
      console.log('Creating sample cars...');
      
      // Sample car data
      const sampleCars = [
        {
          name: 'Tesla Model S',
          type: 'Electric',
          seats: 5,
          power: '670 hp',
          rating: '4.9',
          price: '€199/day',
          image: '/cars/tesla-model-s.jpg',
          special: 'Electric',
          specialColor: '#34D399',
          description: 'Experience the future of driving with Tesla Model S, offering exceptional range and performance.',
          features: ['Autopilot', 'Zero Emissions', 'Ludicrous Mode', 'High Range', 'Supercharging']
        },
        {
          name: 'BMW M4 Competition',
          type: 'Sports',
          seats: 4,
          power: '503 hp',
          rating: '4.8',
          price: '€249/day',
          image: '/cars/bmw-m4.jpg',
          special: 'Performance',
          specialColor: '#EC4899',
          description: 'The ultimate driving machine, delivering track-ready performance with everyday usability.',
          features: ['Twin-Turbo Engine', 'M Differential', 'Carbon Fiber Roof', 'Sport Exhaust', 'Track Mode']
        },
        {
          name: 'Range Rover Sport',
          type: 'SUV',
          seats: 7,
          power: '395 hp',
          rating: '4.7',
          price: '€279/day',
          image: '/cars/range-rover.jpg',
          special: 'Luxury',
          specialColor: '#8B5CF6',
          description: 'The Range Rover Sport combines luxury with off-road capability for an unmatched driving experience.',
          features: ['All-Terrain Progress Control', 'Air Suspension', 'Panoramic Roof', 'Premium Sound', 'Off-Road Package']
        }
      ];
      
      // Create cars
      for (const carData of sampleCars) {
        await prisma.car.create({
          data: carData
        });
      }
      
      console.log('Sample cars created successfully');
    } else {
      console.log(`Found ${carsCount} existing cars, skipping sample data creation`);
    }
    
    // Create or check site settings
    const settingsExist = await prisma.siteSettings.findFirst();
    if (!settingsExist) {
      console.log('Creating default site settings...');
      await prisma.siteSettings.create({
        data: {
          siteName: 'Ether',
          logoColor: '#6843EC',
          accentColor: '#D2FF3A',
          logoText: 'ETHER',
          customLogo: null
        }
      });
      console.log('Default site settings created');
    } else {
      console.log('Site settings already exist, skipping creation');
    }
    
    console.log('Seed completed successfully');
  } catch (e) {
    console.error('Error during seed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();