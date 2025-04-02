import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envLocalPath = path.join(__dirname, '.env.local');

console.log(`Checking for .env file: ${fs.existsSync(envPath) ? 'EXISTS' : 'NOT FOUND'}`);
console.log(`Checking for .env.local file: ${fs.existsSync(envLocalPath) ? 'EXISTS' : 'NOT FOUND'}`);

// Load .env and .env.local files
config({ path: envPath });
config({ path: envLocalPath, override: true });

// Print environment variables
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('Has quotes?', process.env.DATABASE_URL?.startsWith('"') || process.env.DATABASE_URL?.endsWith('"'));

// Test Prisma URL validation
const testUrl = process.env.DATABASE_URL;
const isValidUrl = !testUrl?.startsWith('"') && !testUrl?.endsWith('"') &&
                  (testUrl?.startsWith('postgresql://') || testUrl?.startsWith('postgres://'));

console.log('Is valid Prisma URL format?', isValidUrl);