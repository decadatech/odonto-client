import { and, eq, inArray } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../db"
import { users, type User } from "../../db/schema"
import { listUsersResponseSchema } from "../../schemas/users"

export type ListUsersUseCaseInput = {
  orgId: string
  roles?: Array<"secretary" | "dentist">
}

export type ListUsersUseCaseOutput = z.infer<typeof listUsersResponseSchema>

function toUserOutput(user: User): ListUsersUseCaseOutput[number] {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export async function listUsersUseCase(
  input: ListUsersUseCaseInput,
): Promise<ListUsersUseCaseOutput> {
  const filters = [eq(users.orgId, input.orgId)]

  if (input.roles && input.roles.length > 0) {
    filters.push(inArray(users.role, input.roles))
  }

  const result = await db
    .select()
    .from(users)
    .where(and(...filters))

  return result.map(toUserOutput)
}
