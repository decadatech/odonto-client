import { onlyDigits } from "."

describe("onlyDigits", () => {
  it("should return only numeric characters", () => {
    expect(onlyDigits("123.456.789-00")).toBe("12345678900")
    expect(onlyDigits("(11) 99999-8888")).toBe("11999998888")
  })

  it("should return empty string when value has no digits", () => {
    expect(onlyDigits("abc-()")).toBe("")
  })

  it("should keep digits unchanged when input is already numeric", () => {
    expect(onlyDigits("01310100")).toBe("01310100")
  })
})
