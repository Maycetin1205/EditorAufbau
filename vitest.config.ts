// Vitest-Konfiguration (Kap. 2.5 Sicherheitsnetz).
// Node-Umgebung reicht: Store/Persistenz/Token-Regel brauchen kein DOM
// (localStorage wird in src/test/setup.ts gestubbt).

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    css: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
  },
})
