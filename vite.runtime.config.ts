// Vite-Konfiguration für das Export-Runtime-Bündel (Kap. 3 Mini-Export).
// Baut die Block-Web-Components (inkl. Lit) als EIN klassisches IIFE-Skript,
// das der Export in die SoftEngine-Maske einbettet. Kein Hashing, kein
// Zeitstempel → deterministisch (gleicher Code → identisches Bündel).

import { defineConfig } from 'vite'

export default defineConfig({
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    lib: {
      entry: 'src/export/runtime-entry.ts',
      formats: ['iife'],
      name: 'FFRuntime',
      fileName: () => 'ff-runtime.js',
    },
    outDir: 'src/export/generated',
    emptyOutDir: true,
    minify: true,
  },
})
