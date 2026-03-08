import { z } from "zod"

export const userResponseSchema = z.object({
  id: z.uuid(),
  clerkId: z.string().min(1),
  orgId: z.string().min(1),
  role: z.enum(["secretary", "dentist"]),
  cro: z.string().max(20).nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const getUserByExternalIdParamsSchema = z.object({
  user_id: z.string().min(1).trim(),
})

export const getUserByExternalIdResponseSchema = userResponseSchema

export const createUserBodySchema = z
  .object({
    role: z.enum(["secretary", "dentist"]),
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
