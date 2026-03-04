import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.spec.ts"],
    setupFiles: ["./vitest.setup.ts"],
    clearMocks: true,
  },
})
