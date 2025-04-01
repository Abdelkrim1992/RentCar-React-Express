import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Query users
    const users = await prisma.user.findMany()
    console.log('Users from Supabase:')
    console.log(users)
    
    // Query cars
    const cars = await prisma.car.findMany()
    console.log('\nCars from Supabase:')
    console.log(cars)
    
    // Query site settings
    const settings = await prisma.siteSettings.findMany()
    console.log('\nSite Settings from Supabase:')
    console.log(settings)
  } catch (error) {
    console.error('Error querying database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
