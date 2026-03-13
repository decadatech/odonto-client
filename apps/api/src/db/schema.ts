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

export const userRoleEnum = pgEnum("user_role", ["secretary", "dentist"])

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkId: text("clerk_id").notNull(),
    orgId: text("org_id").notNull(),
    name: text("name").notNull(),
    role: userRoleEnum("role").notNull(),
    cro: varchar("cro", { length: 20 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_org_clerk_id_unique").on(table.orgId, table.clerkId),
    index("users_org_id_idx").on(table.orgId),
    index("users_clerk_id_idx").on(table.clerkId),
  ],
)

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

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: text("org_id").notNull(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    dentistUserId: text("dentist_user_id").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("appointments_org_id_idx").on(table.orgId),
    index("appointments_org_dentist_starts_at_idx").on(
      table.orgId,
      table.dentistUserId,
      table.startsAt,
    ),
    index("appointments_org_patient_starts_at_idx").on(
      table.orgId,
      table.patientId,
      table.startsAt,
    ),
    check("appointments_time_check", sql`${table.endsAt} > ${table.startsAt}`),
  ],
)

export type Patient = typeof patients.$inferSelect
export type User = typeof users.$inferSelect
export type Appointment = typeof appointments.$inferSelect
