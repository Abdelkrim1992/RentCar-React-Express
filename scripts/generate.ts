import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Ensure migrations directory exists
const migrationsDir = path.resolve(process.cwd(), 'migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
  console.log('Created migrations directory');
}

try {
  console.log('Generating SQL migrations...');
  
  // Run drizzle-kit generate command
  const result = execSync('npx drizzle-kit generate:pg', { 
    stdio: 'pipe',
    encoding: 'utf-8' 
  });
  
  console.log(result);
  console.log('Migration SQL files generated successfully');
  
  // List the generated files
  const files = fs.readdirSync(migrationsDir);
  console.log('\nGenerated migration files:');
  files.forEach((file) => {
    console.log(`- ${file}`);
  });
  
  console.log('\nYou can now run the migrations with:');
  console.log('npx tsx scripts/migrate.ts');
} catch (error: any) {
  console.error('Error generating migrations:', error.message);
  if (error.stdout) {
    console.error('Output:', error.stdout);
  }
  if (error.stderr) {
    console.error('Error output:', error.stderr);
  }
  process.exit(1);
}