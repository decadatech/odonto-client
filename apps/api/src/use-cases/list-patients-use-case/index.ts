import { and, asc, desc, eq, gt, ilike, lt, or } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../db"
import { patients } from "../../db/schema"
import { sortOrderSchema } from "../../schemas/commons"
import {
  listPatientsResponseSchema,
  listPatientsSortBySchema,
} from "../../schemas/patients"
import { decodeCursor, encodeCursor } from "../../utils/cursor-pagination"

export type ListPatientsUseCaseInput = {
  orgId: string
  cursor?: string
  limit: number
  search?: string
  sortBy: z.infer<typeof listPatientsSortBySchema>
  sortOrder: z.infer<typeof sortOrderSchema>
}

type ListPatientsResponse = z.infer<typeof listPatientsResponseSchema>

type ListPatientsUseCaseOutput = ListPatientsResponse

function toPatientOutput(
  patient: typeof patients.$inferSelect,
): ListPatientsResponse["items"][number] {
  return {
    ...patient,
    createdAt: patient.createdAt.toISOString(),
    updatedAt: patient.updatedAt.toISOString(),
  }
}

function getSortColumn(sortBy: ListPatientsUseCaseInput["sortBy"]) {
  switch (sortBy) {
    case "created_at":
      return patients.createdAt
    case "updated_at":
      return patients.updatedAt
    case "name":
    default:
      return patients.name
  }
}

function getCursorValue(
  patient: typeof patients.$inferSelect,
  sortBy: ListPatientsUseCaseInput["sortBy"],
): string {
  switch (sortBy) {
    case "created_at":
      return patient.createdAt.toISOString()
    case "updated_at":
      return patient.updatedAt.toISOString()
    case "name":
    default:
      return patient.name
  }
}

function buildFilters(
  input: ListPatientsUseCaseInput,
  sortColumn: ReturnType<typeof getSortColumn>,
  cursor: ReturnType<typeof decodeCursor> | null,
  cursorValue: string | Date | null,
) {
  const filters = [eq(patients.orgId, input.orgId)]

  if (input.search) {
    filters.push(ilike(patients.name, `%${input.search}%`))
  }

  if (cursor !== null && cursorValue !== null) {
    const cursorFilter = input.sortOrder === "asc"
      ? or(
        gt(sortColumn, cursorValue),
        and(eq(sortColumn, cursorValue), gt(patients.id, cursor.id)),
      )
      : or(
        lt(sortColumn, cursorValue),
        and(eq(sortColumn, cursorValue), lt(patients.id, cursor.id)),
      )

    if (cursorFilter) {
      filters.push(cursorFilter)
    }
  }

  return filters
}

export async function listPatientsUseCase(
  input: ListPatientsUseCaseInput,
): Promise<ListPatientsUseCaseOutput> {
  const sortColumn = getSortColumn(input.sortBy)
  const cursor = input.cursor ? decodeCursor(input.cursor) : null
  let cursorValue: string | Date | null = null

  if (cursor !== null) {
    if (input.sortBy === "name") {
      cursorValue = cursor.value
    } else {
      cursorValue = new Date(cursor.value)
    }
  }

  const filters = buildFilters(input, sortColumn, cursor, cursorValue)

  const result = await db
    .select()
    .from(patients)
    .where(and(...filters))
    .orderBy(
      input.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn),
      input.sortOrder === "asc" ? asc(patients.id) : desc(patients.id),
    )
    .limit(input.limit + 1)

  const hasMore = result.length > input.limit
  const pageItems = hasMore ? result.slice(0, input.limit) : result
  const lastItem = pageItems.at(-1)

  return {
    items: pageItems.map(toPatientOutput),
    nextCursor: hasMore && lastItem
      ? encodeCursor({
        id: lastItem.id,
        value: getCursorValue(lastItem, input.sortBy),
      })
      : null,
  }
}
