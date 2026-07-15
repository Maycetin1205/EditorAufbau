// Datenanschluss im Inspector
// Inspector-Sektion fuer Boards mit eigenem Datenanschluss-Dialog.
// Der Dialog pflegt ausschliesslich Quelle + Einsortieren-Feld; sichtbare
// Struktur/Feldstellen bleiben im Canvas, der Schreibweg bleibt im Inspector.
// Alles kommt aus der Registry, ohne Typ-Sonderfall.

import { useState } from 'react'
import { Button } from '@/ui/atoms/button'
import type { BlockNode } from '../../core/blocks/BlockData'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { bindungsStand } from '../../core/blocks/bindungsStand'
import { useDataSources } from '../../state/useDataSources'
import { BindungsStrecke } from './BindungsStrecke'

interface BindungsAnschlussProps {
  block: BlockNode
}

export function BindungsAnschluss({ block }: BindungsAnschlussProps) {
  const [offen, setOffen] = useState(false)
  const sources = useDataSources().list
  const def = getBlockDefinition(block.type)
  const route = def?.bindingRoute
  if (!route) return null

  const stand = bindungsStand(block, route, sources)
  const sourceId = typeof block.props.source === 'string' ? block.props.source : ''
  const quelle = sources.find((s) => s.id === sourceId)
  const feldRoh = block.props[route.fieldProp]
  const feld = typeof feldRoh === 'string' ? feldRoh : ''
  const feldLabel = quelle?.fields.find((f) => f.code === feld)?.label
  const feldName = def?.customProperties.find(
    (p) => p.attributeName === route.fieldProp,
  )?.name ?? 'Einsortieren nach'

  // Kurzzustand: was fehlt, steht in Klartext — nie ein Technikwert.
  let zustand: string
  let warnung = false
  if (!stand.quelleGewaehlt) {
    zustand = 'Noch nicht angeschlossen.'
  } else if (!stand.quelleBekannt) {
    zustand = 'Die gewählte Datenquelle fehlt in der Bibliothek.'
    warnung = true
  } else if (!stand.feldGewaehlt) {
    // Das Feld ist optional (2026-07-15) — kein Mangel, nur der Zustand.
    zustand = `Quelle: ${quelle?.name} · ${feldName}: keins`
  } else {
    zustand = `Quelle: ${quelle?.name} · ${feldName}: ${feldLabel ?? 'unbekanntes Feld'}`
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" size="sm" onClick={() => setOffen(true)}>
        Daten anschließen…
      </Button>
      <p className={warnung ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>
        {zustand}
      </p>
      {offen && (
        <BindungsStrecke blockId={block.id} onClose={() => setOffen(false)} />
      )}
    </div>
  )
}
