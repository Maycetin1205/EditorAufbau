import { useState } from 'react'
import { ZeilenKnopf } from '@/ui/molecules/zeilen-knopf'
import type { BlockNode } from '../../core/blocks/BlockData'
import type { BlockDefinition, BlockEventSpec } from '../../core/blocks/BlockDefinition'
import { propertySichtbar } from '../../core/blocks/PropertyDescription'
import {
  darfAuswahlFolgen,
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

  // Was die EINE Datenzeile sagt. Bis 2026-08-20 waren es zwei Knoepfe
  // („Zeigt" und „Erfassen"), die BEIDE dasselbe Fenster oeffneten — zwei
  // Wege zu einem Ziel, ohne Unterschied. Der Stand nennt jetzt der Reihe
  // nach, was der Baustein an Daten hat; was er nicht hat, faellt weg statt
  // als „0" oder „aus" dazustehen.
  const datenStand = (): string => {
    const teile: string[] = []
    // Ein Baustein OHNE eigene Quelle (die Karte) zeigt die gewaehlte Zeile
    // eines anderen — „keine Datenquelle" waere dort schlicht falsch.
    if (hatQuelle) teile.push(quelleFehlt ? quelleId : (quelle?.name ?? '— keine Datenquelle —'))
    else teile.push('folgt einer Auswahl')
    if (def.kannErfassen !== undefined && erfassenAn) teile.push('Erfassen an')
    if (verknuepfungen > 0) {
      teile.push(`${verknuepfungen} ${verknuepfungen === 1 ? 'Verknüpfung' : 'Verknüpfungen'}`)
    }
    return teile.join(' · ')
  }

  if (!traegtInspectorZeilen(block)) return null

  return (
    <div className="flex flex-col gap-1.5">
      {(hatQuelle || darfAuswahlFolgen(block)) && (
        <ZeilenKnopf
          name="Daten"
          stand={datenStand()}
          standWarnung={quelleFehlt}
          bezeichnung="Daten dieses Bausteins"
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
