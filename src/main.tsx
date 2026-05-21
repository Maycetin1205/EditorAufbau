// main.tsx
// Einstiegspunkt der React-App.
// Built-in-Blocks werden ueber blocks/register importiert (zentrale Side-Effect-Datei).
// index.css zieht Tailwind + shadcn-CSS-Variablen rein. Wird VOR den Mantine-CSS-Importen
// (in providers.tsx) ausgewertet, damit Mantine seine Stile uebergangsweise drueberlegen kann.

import './index.css'
import './blocks/register'

import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { Providers } from './app/providers'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('#root nicht gefunden in index.html')
createRoot(rootEl).render(
  <Providers>
    <App />
  </Providers>,
)
