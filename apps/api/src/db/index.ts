import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import { env } from "../env"

const pool = new Pool({
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  user: env.DATABASE_USER,
  database: env.DATABASE_NAME,
  password: env.DATABASE_PASSWORD,
  ssl: { rejectUnauthorized: false },
})

export const db = drizzle({ client: pool })
