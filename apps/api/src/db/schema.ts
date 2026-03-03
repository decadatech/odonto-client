import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core"

// Minimal example table to bootstrap Drizzle migrations.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
