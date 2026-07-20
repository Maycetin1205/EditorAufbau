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
    // 5s-Default flakte bei kaltem Parallel-Lauf am projectMap-Test (langsamer
    // Import). 20s gibt den langsamen Tests Luft, ohne echte Hänger zu maskieren
    // (Nutzer-Go 2026-07-20).
    testTimeout: 20_000,
  },
})
