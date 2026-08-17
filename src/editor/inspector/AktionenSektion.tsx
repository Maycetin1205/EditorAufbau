// AktionenSektion — Inspector-Abschnitt „Aktionen" (R3, 2026-07-21).
// Die Ereignis-Ketten wohnen AM BAUSTEIN statt in der Steuerung: erscheint
// nach Inhalt/Daten, aber NUR für Bausteine, die per Registry Ereignisse
// deklarieren (blockEvents — kein `if typ===`).
//
// UMGEBAUT 2026-08-17: dieser Abschnitt ist eine ZEILE je Ereignis — Name,
// Anzahl, ein Knopf. Mehr nicht.
//
// Zwei Schritte dahin, beide am selben Tag:
// 1. Bis dahin blätterte das Schritt-Formular das 340-px-Panel um
//    (R3-Feinschliff 2026-07-21). Eine Relation hat bis zu zwölf Parameter —
//    das ging dort nicht, und während man sie ausfüllte, war der Baustein,
//    um den es geht, nicht mehr zu sehen. Das Formular lebt jetzt im breiten
//    KettenFenster; Sortieren, Duplizieren und Löschen sind mitgezogen.
// 2. Danach stand hier die ganze Kette UND der Knopf, der sie bearbeitet
//    (Nutzer-Befund: „WIESO steht das da? und trotzdem Kette bearbeiten?").
//    Bei vierzehn Schritten waren das achtundzwanzig Zeilen in einer
//    340-px-Spalte — und keine davon zu gebrauchen, weil bearbeitet ohnehin
//    im Fenster wird. Die Liste steht jetzt NUR dort.

import { useState } from 'react'
import { Button } from '@/ui/atoms/button'
import type { BlockNode } from '../../core/blocks/BlockData'
import type { BlockEventSpec } from '../../core/blocks/BlockDefinition'
import { useEditor } from '../../state/useEditor'
import { KettenFenster } from '../zentrale/KettenFenster'

export function AktionenSektion({
  block,
  events,
}: {
  block: BlockNode
  events: readonly BlockEventSpec[]
}) {
  const ed = useEditor()
  // Höchstens EIN Ketten-Fenster ist offen — dieselbe Linie wie beim Popup
  // (C3.2): zwei übereinander wären zwei Wahrheiten über denselben Baustein.
  const [offenesEreignis, setOffenesEreignis] = useState<BlockEventSpec | null>(null)

  const kette = (eventKey: string) => ed.tree[block.id]?.events?.[eventKey] ?? []

  return (
    <div className="flex flex-col gap-2">
      {events.map((ev) => {
        const steps = kette(ev.key)
        return (
          <div key={ev.key} className="flex min-h-7 items-center justify-between gap-2 text-xs">
            <span className="min-w-0 truncate text-[0.6875rem] font-semibold text-foreground">
              {ev.name}
              {steps.length > 0 && (
                <span className="ml-1.5 font-normal tabular-nums text-muted-foreground">
                  {steps.length}
                </span>
              )}
            </span>
            {/* EIN Knopf, und seine Beschriftung sagt, was er tut: bei einer
                leeren Kette gibt es nichts zu bearbeiten. */}
            <Button variant="outline" size="sm" onClick={() => setOffenesEreignis(ev)}>
              {steps.length === 0 ? 'Schritt anlegen' : 'Kette bearbeiten'}
            </Button>
          </div>
        )
      })}
      {offenesEreignis && (
        <KettenFenster
          block={block}
          eventKey={offenesEreignis.key}
          eventName={offenesEreignis.name}
          onClose={() => setOffenesEreignis(null)}
        />
      )}
    </div>
  )
}
