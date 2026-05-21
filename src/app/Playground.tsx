// Playground
// Test-Spielwiese fuer die Atom- und Molekuel-Phase.
// Prueft addBlock, removeBlock, selectBlock und updateProperty sichtbar im Browser.

import { Canvas } from '../editor/canvas/Canvas'
import { Inspector } from '../editor/inspector/Inspector'
import { Sidebar } from '../editor/sidebar/Sidebar'
import { useEditor } from '../state/useEditor'

export function Playground() {
  const ed = useEditor()

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h1>Editor Playground</h1>

      <p>
        Selektiert: <strong>{ed.selectedId ?? '(nichts)'}</strong> ({ed.blocks.length} Blocks gesamt)
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '220px minmax(0, 1fr) 320px',
          gap: 16,
        }}
      >
        <aside style={{ marginTop: 24 }}>
          <Sidebar />
        </aside>

        <section>
          <h2 style={{ marginTop: 24 }}>Canvas</h2>
          <Canvas />
        </section>

        <aside style={{ marginTop: 24 }}>
          <Inspector />
        </aside>
      </div>

      <h2 style={{ marginTop: 24 }}>Liste + Aktionen</h2>
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
