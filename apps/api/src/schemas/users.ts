import { z } from "zod"

const userRoleSchema = z.enum(["secretary", "dentist"])

export const userResponseSchema = z.object({
  id: z.uuid(),
  clerkId: z.string().min(1),
  orgId: z.string().min(1),
  role: userRoleSchema,
  cro: z.string().max(20).nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

function normalizeRoleFilter(value: string | string[] | undefined) {
  if (!value) {
    return undefined
  }

  const rawValues = Array.isArray(value) ? value : [value]

  const roles = rawValues
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean)

  if (roles.length === 0) {
    return undefined
  }

  return [...new Set(roles.map((role) => userRoleSchema.parse(role)))]
}

export const listUsersQuerySchema = z.object({
  role: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform(normalizeRoleFilter),
})

export const listUsersResponseSchema = z.array(userResponseSchema)

export const getUserByExternalIdParamsSchema = z.object({
  user_id: z.string().min(1).trim(),
})

export const getUserByExternalIdResponseSchema = userResponseSchema

export const createUserBodySchema = z
  .object({
    role: userRoleSchema,
    cro: z.string().max(20).trim().optional().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.role === "dentist" && !value.cro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cro"],
        message: "CRO is required when role is dentist",
      })
    }
  })

export const createUserResponseSchema = userResponseSchema
