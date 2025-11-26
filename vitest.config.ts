import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['dotenv/config'],
    testTimeout: 30000,
    server: {
      deps: {
        inline: ['vitest-package-exports'],
      },
    },
  },
})
