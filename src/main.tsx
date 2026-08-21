import './index.css'
import './design/masken-schriften.css'
import './design/masken-tokens.css'
import './blocks/registerEditorAngaben'

import { createRoot } from 'react-dom/client'
import { TIER_BILDER } from './core/data/tierBilder'
import { App } from './app/App'
import { Providers } from './app/providers'

/* Im Editor liegen die Tierbilder immer bereit. Der Canvas rendert dieselben
   Bausteine wie die Maske (Regel 1), und die lesen die Bilder aus diesem
   Global — in der Maske legt sie der Export nur bei Bedarf hin
   (export/tierbilder.ts). */
const globalMitBildern = globalThis as { FF_TIER_BILDER?: unknown }
globalMitBildern.FF_TIER_BILDER = TIER_BILDER

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('#root nicht gefunden in index.html')
createRoot(rootEl).render(
  <Providers>
    <App />
  </Providers>,
)
