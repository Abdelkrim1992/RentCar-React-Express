// Script to create car_availabilities table using direct SQL
import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;
dotenv.config();

async function main() {
  // Create a new client
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Creating car_availabilities table...');
    
    // Create car_availabilities table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS car_availabilities (
        id SERIAL PRIMARY KEY,
        car_id INTEGER NOT NULL REFERENCES cars(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP(6) NOT NULL DEFAULT NOW()
      );
    `;
    
    await client.query(createTableQuery);
    
    console.log('Successfully created car_availabilities table!');
    
    // Check if the table was created by listing all tables
    const res = await client.query(`
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
    await client.end();
    console.log('Disconnected from database');
  }
}

main();