// main.tsx
// Test-Spielwiese fuer die Atom-Phase.
// Prueft: addBlock, removeBlock, selectBlock, updateProperty + React-Re-Render via useSyncExternalStore.

// Self-Registrierung der Block-Klassen ausloesen.
import './blocks/button/ButtonBlock'
import './blocks/text/TextBlock'

import { createRoot } from 'react-dom/client'
import { useEditor } from './state/useEditor'

function Playground() {
  const ed = useEditor()

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h1>Editor Playground</h1>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => ed.addBlock('button')}>Button hinzufuegen</button>
        <button onClick={() => ed.addBlock('text')} style={{ marginLeft: 8 }}>
          Text hinzufuegen
        </button>
      </div>

      <p>
        Selektiert: <strong>{ed.selectedId ?? '(nichts)'}</strong> ({ed.blocks.length} Blocks gesamt)
      </p>

      <ul>
        {ed.blocks.map((b) => (
          <li key={b.id} style={{ marginBottom: 6 }}>
            <code>{b.type}</code> <small>{b.id.slice(0, 8)}</small>
            <button onClick={() => ed.selectBlock(b.id)} style={{ marginLeft: 8 }}>
              auswaehlen
            </button>
            <button onClick={() => ed.removeBlock(b.id)} style={{ marginLeft: 4 }}>
              entfernen
            </button>
            {b.type === 'button' && (
              <button
                onClick={() => ed.updateProperty(b.id, 'label', 'Geaendert ' + Date.now())}
                style={{ marginLeft: 4 }}
              >
                Label aendern
              </button>
            )}
            {b.type === 'text' && (
              <button
                onClick={() => ed.updateProperty(b.id, 'content', 'Neuer Text ' + Date.now())}
                style={{ marginLeft: 4 }}
              >
                Content aendern
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('#root nicht gefunden in index.html')
createRoot(rootEl).render(<Playground />)
