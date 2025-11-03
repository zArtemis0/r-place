// lib/db.ts
import { Pool } from 'pg';

// Create a connection pool using the DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Utility function to execute a query
export const db = {
  query: (text: string, params?: any[]) => {
    return pool.query(text, params);
  },
};
