import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { generateProjectMap, projectMapStatus } from './scripts/generate-project-map.mjs'

// __dirname-Äquivalent für ESM-Config.
const here = path.dirname(fileURLToPath(import.meta.url))

function projectMap(): Plugin {
  let updateTimer: ReturnType<typeof setTimeout> | undefined

  return {
    name: 'project-map',
    configResolved() {
      generateProjectMap()
    },
    configureServer(server) {
      server.middlewares.use('/__project-map/check', (_request, response) => {
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.setHeader('Cache-Control', 'no-store')
        try {
          response.end(JSON.stringify(projectMapStatus()))
        } catch (error) {
          response.statusCode = 500
          response.end(JSON.stringify({
            current: false,
            verified: false,
            problems: [error instanceof Error ? error.message : String(error)],
          }))
        }
      })

      const update = (file: string) => {
        const relative = path.relative(here, file).replaceAll('\\', '/')
        if (
          relative.startsWith('node_modules/')
          || relative.startsWith('dist/')
          || relative === 'public/project-map.html'
        ) return

        clearTimeout(updateTimer)
        updateTimer = setTimeout(() => {
          generateProjectMap()
          server.ws.send({ type: 'full-reload', path: '/project-map.html' })
        }, 120)
      }

      server.watcher.on('add', update)
      server.watcher.on('change', update)
      server.watcher.on('unlink', update)
    },
  }
}

export default defineConfig({
  plugins: [react(), projectMap()],
  resolve: {
    alias: {
      '@': path.resolve(here, 'src'),
    },
  },
})
