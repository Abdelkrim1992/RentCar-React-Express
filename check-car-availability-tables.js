// Script to check if car_availabilities table exists
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
    
    // Check if car_availabilities table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'car_availabilities'
      );
    `;
    
    const tableExistsResult = await client.query(checkTableQuery);
    const tableExists = tableExistsResult.rows[0].exists;
    
    console.log(`car_availabilities table exists: ${tableExists}`);
    
    if (tableExists) {
      // Count rows in car_availabilities
      const countQuery = 'SELECT COUNT(*) FROM car_availabilities;';
      const countResult = await client.query(countQuery);
      console.log(`Number of car_availabilities records: ${countResult.rows[0].count}`);
      
      // List all records
      const listQuery = `
        SELECT ca.*, c.name as car_name 
        FROM car_availabilities ca
        LEFT JOIN cars c ON ca.car_id = c.id
        LIMIT 10;
      `;
      const listResult = await client.query(listQuery);
      
      if (listResult.rows.length > 0) {
        console.log('Sample car_availabilities records:');
        console.table(listResult.rows);
      } else {
        console.log('No car_availabilities records found');
      }
      
      // List all cars
      const carsQuery = 'SELECT id, name, type FROM cars LIMIT 5;';
      const carsResult = await client.query(carsQuery);
      
      console.log('Available cars:');
      console.table(carsResult.rows);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

main();