/// <reference types="vitest" />

import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ["vitest/utils"],
    include: ["@vitest/utils", "vitest/browser"]
  },
  test: {
    setupFiles: ["./src/test/utils/vitest.setup.ts"],
    globals: true,
    // environment: 'jsdom',
    // environmentOptions: {
    //   jsdom: {
    //     resources: "usable"
    //   }
    // },
    threads: false,
    browser: {
      enabled: true,
      provider: "playwright",
      name: "chromium",
      headless: false
    },
  },
})