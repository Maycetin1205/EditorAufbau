import { useState } from 'react'
import { ZeilenKnopf } from '@/ui/molecules/zeilen-knopf'
import type { BlockNode } from '../../core/blocks/BlockData'
import type { BlockDefinition, BlockEventSpec } from '../../core/blocks/BlockDefinition'
import { propertySichtbar } from '../../core/blocks/PropertyDescription'
import {
  QUELLE_PROP,
  traegtEigeneQuelle,
  traegtInspectorZeilen,
} from '../../core/blocks/treeQuery'
import { WEITERE_QUELLEN_PROP, weitereQuellenAus } from '../../core/data/sourceLinks'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { KettenFenster } from '../zentrale/KettenFenster'
import { DatenFenster } from './DatenFenster'

interface BausteinZeilenProps {
  block: BlockNode
  def: BlockDefinition
}

// Die Kopfzeilen des Inspectors: eine Zeile je Faehigkeit, die der Baustein in
// der Registry deklariert — eigene Datenquelle, kannErfassen, blockEvents.
// Jede sagt in Klartext, wie es steht, und oeffnet das Fenster, in dem es
// eingestellt wird. Kein Bausteintyp kommt hier vor (Regel 2).
//
// Der Inspector rendert diese Komponente mit key={block.id}: wechselt die
// Auswahl, faellt der Fensterstand von selbst weg.
export function BausteinZeilen({ block, def }: BausteinZeilenProps) {
  const ed = useEditor()
  const bibliothek = useDataSources().list

  const [datenOffen, setDatenOffen] = useState(false)
  const [kette, setKette] = useState<BlockEventSpec | null>(null)

  const hatQuelle = traegtEigeneQuelle(block)
  const quelleId = typeof block.props[QUELLE_PROP] === 'string'
    ? (block.props[QUELLE_PROP] as string)
    : ''
  const quelle = bibliothek.find((s) => s.id === quelleId)
  const quelleFehlt = quelleId !== '' && quelle === undefined

  const verknuepfungen = weitereQuellenAus(block.props[WEITERE_QUELLEN_PROP]).length
  const erfassenAn = def.kannErfassen !== undefined
    && propertySichtbar(def.kannErfassen.wenn, block.props)

  const events = def.blockEvents ?? []
  const schritteVon = (eventKey: string) => ed.tree[block.id]?.events?.[eventKey]?.length ?? 0

  if (!traegtInspectorZeilen(block)) return null

  return (
    <div className="flex flex-col gap-1.5">
      {hatQuelle && (
        <ZeilenKnopf
          name="Zeigt"
          stand={quelleFehlt ? quelleId : (quelle?.name ?? '— keine Datenquelle —')}
          standWarnung={quelleFehlt}
          bezeichnung="Daten dieses Bausteins"
          onClick={() => setDatenOffen(true)}
        />
      )}

      {hatQuelle && def.kannErfassen !== undefined && (
        <ZeilenKnopf
          name="Erfassen"
          stand={`${erfassenAn ? 'an' : 'aus'} · ${verknuepfungen} ${
            verknuepfungen === 1 ? 'Verknüpfung' : 'Verknüpfungen'
          }`}
          bezeichnung="Erfassen und Verknüpfungen"
          onClick={() => setDatenOffen(true)}
        />
      )}

      {events.map((ev) => {
        const n = schritteVon(ev.key)
        return (
          <ZeilenKnopf
            key={ev.key}
            name="Aktionen"
            stand={`${ev.name} · ${n === 0 ? 'keine Kette' : `${n} ${n === 1 ? 'Schritt' : 'Schritte'}`}`}
            bezeichnung={`Aktionskette ${ev.name}`}
            onClick={() => setKette(ev)}
          />
        )
      })}

      {datenOffen && <DatenFenster block={block} onClose={() => setDatenOffen(false)} />}
      {kette && (
        <KettenFenster
          block={block}
          eventKey={kette.key}
          eventName={kette.name}
          onClose={() => setKette(null)}
        />
      )}
    </div>
  )
}
