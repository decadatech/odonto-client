import { z } from "zod"

const cursorPaginationPayloadSchema = z.object({
  id: z.uuid(),
  value: z.string(),
})

export interface CursorPaginationPayload {
  id: string
  value: string
}

export function encodeCursor(payload: CursorPaginationPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url")
}

export function decodeCursor(cursor: string): CursorPaginationPayload {
  return cursorPaginationPayloadSchema.parse(
    JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8")),
  )
}
