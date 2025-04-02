// ES module script to create car_availabilities table using direct SQL
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create a new database client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    console.log('Connecting to database...');
    
    // Create car_availabilities table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS car_availabilities (
        id SERIAL PRIMARY KEY,
        car_id INTEGER NOT NULL REFERENCES cars(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP(6) NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Successfully created car_availabilities table!');
    
    // Check if the table was created by listing all tables
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables in database:');
    res.rows.forEach(row => {
      console.log(` - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

main();