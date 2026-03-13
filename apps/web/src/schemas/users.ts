import { z } from "zod"

export const domainUserSchema = z.object({
  id: z.uuid(),
  clerkId: z.string().min(1),
  orgId: z.string().min(1),
  name: z.string().min(1).max(240),
  role: z.enum(["secretary", "dentist"]),
  cro: z.string().max(20).nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const createDomainUserPayloadSchema = z
  .object({
    name: z.string().min(1).max(240).trim(),
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
