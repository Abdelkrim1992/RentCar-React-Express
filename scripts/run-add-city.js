// Import required modules
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    console.log('Running migration to add city column to car_availabilities table...');
    
    // Get the path to the migration file
    const migrationFile = path.join(__dirname, '..', 'migrations', 'add_city_to_availabilities.sql');
    
    // Check if the file exists
    if (!fs.existsSync(migrationFile)) {
      throw new Error('Migration file not found: ' + migrationFile);
    }
    
    // Read the migration SQL
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    // Execute the migration
    const result = execSync(`psql ${process.env.DATABASE_URL} -c "${sql}"`, { encoding: 'utf8' });
    
    console.log('Migration completed successfully!');
    console.log(result);
    
    return { success: true, message: 'Migration completed' };
  } catch (error) {
    console.error('Error running migration:', error);
    return { success: false, error: error.message };
  }
}

main()
  .then(result => {
    if (result.success) {
      console.log(result.message);
      process.exit(0);
    } else {
      console.error(result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });