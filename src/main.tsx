// main.tsx
// Einstiegspunkt der React-App.
// Built-in-Blocks werden ueber blocks/register importiert (zentrale Side-Effect-Datei).
// index.css zieht Tailwind + shadcn-CSS-Variablen rein (Editor-UI).
// masken-tokens.css ist die Werteliste fuer die Bloecke (Masken-Design, --se-*).

import './index.css'
import './design/masken-tokens.css'
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
