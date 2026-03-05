import { sql } from "drizzle-orm"
import {
  check,
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

export const patientSexEnum = pgEnum("patient_sex", ["male", "female", "other"])

export const patients = pgTable(
  "patients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: text("org_id").notNull(),
    name: text("name").notNull(),
    sex: patientSexEnum("sex").notNull(),
    birthDate: date("birth_date").notNull(),
    rg: varchar("rg", { length: 20 }).notNull(),
    cpf: varchar("cpf", { length: 20 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    email: text("email"),
    zipCode: varchar("zip_code", { length: 20 }).notNull(),
    street: text("street").notNull(),
    streetNumber: varchar("street_number", { length: 20 }).notNull(),
    neighborhood: text("neighborhood").notNull(),
    city: text("city").notNull(),
    state: varchar("state", { length: 5 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("patients_org_cpf_unique").on(table.orgId, table.cpf),
    uniqueIndex("patients_org_rg_unique").on(table.orgId, table.rg),
    uniqueIndex("patients_id_org_unique").on(table.id, table.orgId),
    index("patients_org_id_idx").on(table.orgId),
  ],
)

// Minimal example table to bootstrap Drizzle migrations.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
