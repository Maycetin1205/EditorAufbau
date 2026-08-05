import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// tsconfigRootDir explizit setzen, weil sonst neben react-app auch
// react-app/grundlast als Kandidat fuer das Projekt-Root angesehen wird.
const rootDir = import.meta.dirname

const coreOuterLayers = '(?:app|blocks|design|editor|export|softengine|state|test|ui)'

function restrictCoreImports(files, parentSegments) {
  return {
    files,
    rules: {
      'no-restricted-imports': ['error', {
        paths: [
          { name: 'lit', message: 'Der fachliche Core muss frameworkfrei bleiben.' },
          { name: 'react', message: 'Der fachliche Core muss frameworkfrei bleiben.' },
          { name: 'react-dom', message: 'Der fachliche Core muss frameworkfrei bleiben.' },
        ],
        patterns: [
          {
            group: ['lit/*', 'react/*', 'react-dom/*'],
            message: 'Der fachliche Core muss frameworkfrei bleiben.',
          },
          {
            regex: `^(?:\\.\\./){${parentSegments}}${coreOuterLayers}(?:/|$)`,
            message: 'Der fachliche Core darf keine aeussere Anwendungsschicht importieren.',
          },
        ],
      }],
    },
  }
}

export default defineConfig([
  globalIgnores(['dist', 'src.vibe-backup-*', 'grundlast']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: rootDir,
      },
    },
  },
  // Typ-gestuetztes Linten NUR fuer diese eine Regel. Anlass: vier
  // nebenlaeufig gestartete Aktionsketten verschluckten jeden Fehler, weil
  // niemand `.catch` daran haengte (Befund A3) — ein `void` davor sah aus wie
  // Absicht. Diese Regel braucht den Typpruefer, darum `projectService`.
  // Bewusst NICHT der ganze `recommendedTypeChecked`-Satz: der brachte
  // hunderte Funde ohne Anlass (Regel 10).
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: rootDir,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  restrictCoreImports(['src/core/*.{ts,tsx}'], 1),
  restrictCoreImports(['src/core/*/*.{ts,tsx}'], 2),
  restrictCoreImports(['src/core/*/*/*.{ts,tsx}'], 3),
  restrictCoreImports(['src/core/*/*/*/*.{ts,tsx}'], 4),
])
