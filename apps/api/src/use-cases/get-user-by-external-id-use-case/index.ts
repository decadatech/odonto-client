import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../db"
import { users } from "../../db/schema"
import { getUserByExternalIdResponseSchema } from "../../schemas/users"
import { AppError } from "../../http/errors/app-error"

export type GetUserByExternalIdUseCaseInput = {
  orgId: string
  clerkId: string
}

export type GetUserByExternalIdUseCaseOutput = z.infer<typeof getUserByExternalIdResponseSchema>

export async function getUserByExternalIdUseCase(
  input: GetUserByExternalIdUseCaseInput,
): Promise<GetUserByExternalIdUseCaseOutput> {
  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.orgId, input.orgId),
        eq(users.clerkId, input.clerkId),
      ),
    )

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found")
  }

  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
