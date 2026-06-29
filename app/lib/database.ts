// lib/database.ts
import { Pool } from 'pg'

let pool: Pool | undefined

// Lazily create the pool on first query. Initializing at module-load time
// throws during `next build` (which imports this module just to collect route
// config) whenever DATABASE_URL isn't present in the build environment.
const initializePool = (): Pool => {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set.')
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  }
  return pool
}

//Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
  const res = await initializePool().query(text, params)

  return res
}
