import "dotenv/config"
import { defineConfig } from "drizzle-kit"

import { env } from "./src/env"

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    database: env.DATABASE_NAME,
    password: env.DATABASE_PASSWORD,
    ssl: false,
  },
})
