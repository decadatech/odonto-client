export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "")
}
