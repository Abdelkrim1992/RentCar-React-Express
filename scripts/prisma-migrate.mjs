import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkEnvironment() {
  if (!process.env.DATABASE_URL) {
    console.error('\x1b[31mERROR: DATABASE_URL not found in environment variables\x1b[0m');
    console.error('Please make sure you have a valid DATABASE_URL in your .env file');
    process.exit(1);
  }
}

function runMigrations() {
  console.log('\x1b[34m=== Running Prisma migrations ===\x1b[0m');
  
  try {
    // Check if we need to create a fresh migration
    console.log('Creating migration from schema...');
    execSync('npx prisma migrate dev --name initial_setup', { stdio: 'inherit' });
    
    console.log('\x1b[32m✓ Prisma migrations completed successfully\x1b[0m');
  } catch (error) {
    console.error('\x1b[31mError during migration:\x1b[0m', error.message);
    process.exit(1);
  }
}

function seedDatabase() {
  console.log('\x1b[34m=== Seeding database with initial data ===\x1b[0m');
  
  try {
    // Try to run any seed script if it exists
    if (fs.existsSync(path.join(__dirname, '../prisma/seed.mjs'))) {
      console.log('Running database seed script...');
      execSync('node prisma/seed.mjs', { stdio: 'inherit' });
      console.log('\x1b[32m✓ Database seeded successfully\x1b[0m');
    } else {
      console.log('No seed script found, skipping seed step');
    }
  } catch (error) {
    console.error('\x1b[31mError seeding database:\x1b[0m', error.message);
    // Don't exit on seed error, just warn
    console.warn('Continuing without seed data...');
  }
}

function main() {
  console.log('\x1b[34m=== Prisma Database Setup ===\x1b[0m');
  checkEnvironment();
  runMigrations();
  seedDatabase();
  console.log('\x1b[32m=== Database setup completed ===\x1b[0m');
}

main();