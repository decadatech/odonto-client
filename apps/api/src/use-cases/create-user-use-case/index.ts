import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../db"
import { users } from "../../db/schema"
import { AppError } from "../../http/errors/app-error"
import { createUserResponseSchema } from "../../schemas/users"

type UserRole = "secretary" | "dentist"

export type CreateUserUseCaseInput = {
  orgId: string
  clerkId: string
  role: UserRole
  cro?: string | null
}

export type CreateUserUseCaseOutput = z.infer<typeof createUserResponseSchema>

export async function createUserUseCase(
  input: CreateUserUseCaseInput,
): Promise<CreateUserUseCaseOutput> {
  if (input.role === "dentist" && !input.cro) {
    throw new AppError(400, "USER_CRO_REQUIRED", "CRO is required when role is dentist")
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.orgId, input.orgId),
        eq(users.clerkId, input.clerkId),
      ),
    )
    .limit(1)

  if (existingUser) {
    throw new AppError(409, "USER_ALREADY_EXISTS", "User already exists")
  }

  const [user] = await db
    .insert(users)
    .values({
      orgId: input.orgId,
      clerkId: input.clerkId,
      role: input.role,
      cro: input.cro ?? null,
    })
    .returning()

  const createdUser = user!

  return {
    ...createdUser,
    createdAt: createdUser.createdAt.toISOString(),
    updatedAt: createdUser.updatedAt.toISOString(),
  }
}
