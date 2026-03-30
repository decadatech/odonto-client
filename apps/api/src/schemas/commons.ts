import { z } from "zod"

export const sortOrderSchema = z.enum(["asc", "desc"])
