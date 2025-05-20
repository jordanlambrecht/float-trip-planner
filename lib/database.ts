// lib/database.ts
import { Pool } from "pg"

let pool: Pool

const initializePool = () => {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set.")
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

export const db = initializePool()

//Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
  const res = await db.query(text, params)

  return res
}
