import { env } from "./env"

import { buildApp } from "./app"

async function start() {
  const app = buildApp()

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" })
    console.log('Server is running on port', env.PORT)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

void start()
