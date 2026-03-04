import { requestContext } from "@fastify/request-context"

declare module "@fastify/request-context" {
  interface RequestContextData {
    userId: string
    orgId: string
  }
}

export { requestContext }
