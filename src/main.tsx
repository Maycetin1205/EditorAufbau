import './index.css'
import './design/masken-schriften.css'
import './design/masken-tokens.css'
import './blocks/registerEditorAngaben'

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
