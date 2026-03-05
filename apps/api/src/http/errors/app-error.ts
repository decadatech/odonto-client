export type AppErrorDetails = unknown

export class AppError extends Error {
  status: number
  code: string
  details: AppErrorDetails

  constructor(
    status: number,
    code: string,
    details: AppErrorDetails,
  ) {
    super(typeof details === "string" ? details : code)
    this.status = status
    this.code = code
    this.details = details
  }
}

