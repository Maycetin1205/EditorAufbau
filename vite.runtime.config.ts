// Vite-Konfiguration für das Export-Runtime-Bündel (Kap. 3 Mini-Export).
// Baut die Block-Web-Components (inkl. Lit) als EIN klassisches IIFE-Skript,
// das der Export in die SoftEngine-Maske einbettet. Kein Hashing, kein
// Zeitstempel → deterministisch (gleicher Code → identisches Bündel).

import { defineConfig } from 'vite'

export default defineConfig({
  // Der Runtime-Build erzeugt ausschließlich das eingebettete JS-Bündel.
  // Dateien aus public/ gehören zur Editor-App und dürfen hier nicht in
  // src/export/generated/ kopiert werden.
  publicDir: false,
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    lib: {
      entry: 'src/export/runtime-entry.ts',
      formats: ['iife'],
      name: 'FFRuntime',
      fileName: () => 'ff-runtime.js',
    },
    outDir: 'src/export/generated',
    // Nicht vor dem Schreiben leeren: ein parallel geoeffneter Vite-Editor
    // koennte sonst den kurzen leeren Zustand per HMR uebernehmen und eine
    // Maske ohne Runtime exportieren. Es gibt hier ohnehin nur diese Datei.
    emptyOutDir: false,
    minify: true,
  },
})
