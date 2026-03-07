import { z } from "zod"

export const backendErrorSchema = z.object({
  status: z.number(),
  code: z.string(),
  details: z.unknown(),
})
