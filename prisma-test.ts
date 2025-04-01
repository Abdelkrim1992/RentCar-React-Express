import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Test the connection by performing a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Connection to Prisma Accelerate successful!')
    console.log('Query result:', result)
    
    // Test a sample query to the users table
    const users = await prisma.user.findMany({ take: 5 })
    console.log(`Found ${users.length} users:`)
    console.log(users)
  } catch (error) {
    console.error('Error connecting to database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
