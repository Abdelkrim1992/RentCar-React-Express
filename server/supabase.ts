import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Alternatively, use Drizzle with Postgres for direct database access
const connectionString = process.env.DATABASE_URL || '';
const client = postgres(connectionString);
export const db = drizzle(client, { schema });