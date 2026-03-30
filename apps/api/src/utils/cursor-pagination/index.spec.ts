import { describe, expect, it } from "vitest"

import {
  decodeCursor,
  encodeCursor,
  type CursorPaginationPayload,
} from "."

describe("cursor-pagination", () => {
  it("should encode and decode a cursor payload", () => {
    const payload: CursorPaginationPayload = {
      id: "11111111-1111-4111-8111-111111111111",
      value: "Maria Silva",
    }

    const encodedCursor = encodeCursor(payload)
    const decodedCursor = decodeCursor(encodedCursor)

    expect(decodedCursor).toEqual(payload)
  })

  it("should throw when the cursor is not valid base64url", () => {
    expect(() => decodeCursor("%%%")).toThrow()
  })

  it("should throw when the decoded payload is invalid", () => {
    const invalidPayload = Buffer.from(
      JSON.stringify({ id: "invalid-id", value: 123 }),
    ).toString("base64url")

    expect(() => decodeCursor(invalidPayload)).toThrow()
  })
})
