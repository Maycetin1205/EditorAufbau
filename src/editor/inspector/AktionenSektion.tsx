// AktionenSektion — Inspector-Abschnitt „Aktionen" (R3, 2026-07-21).
// Die Ereignis-Ketten wohnen AM BAUSTEIN statt in der Steuerung: erscheint
// nach Inhalt/Daten, aber NUR für Bausteine, die per Registry Ereignisse
// deklarieren (blockEvents — kein `if typ===`).
//
// UMGEBAUT 2026-08-17: dieser Abschnitt ZEIGT die Kette, er bearbeitet sie
// nicht mehr. Bis hierhin blätterte das Schritt-Formular das 340-px-Panel um
// (R3-Feinschliff 2026-07-21) — eine Relation mit zwölf Parametern passte
// dort nicht, und während man sie ausfüllte, war der Baustein, um den es
// geht, nicht mehr zu sehen. Jetzt öffnet „Kette bearbeiten" das breite
// KettenFenster; Sortieren, Duplizieren und Löschen sind mit dort hinein
// umgezogen — ein Handgriff, ein Ort.
//
// Die Zeilen selbst zeichnet die geteilte SchrittListe — dieselbe wie im
// Fenster, damit die Zeile „was tut dieser Schritt" nirgends auseinanderläuft.
// Ein Bedienschritt = EIN Undo-Eintrag (editor.updateBlockEvents).

import { useState } from 'react'
import { Plus } from '@/ui/zeichen'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import type { BlockNode } from '../../core/blocks/BlockData'
import type { BlockEventSpec } from '../../core/blocks/BlockDefinition'
import { useEditor } from '../../state/useEditor'
import { KettenFenster } from '../zentrale/KettenFenster'
import { SchrittListe } from '../zentrale/SchrittListe'

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
          <div key={ev.key} className="text-xs">
            {/* Genau EINE Zeile je Ereignis: Name links, Knopf rechts. Kein
                Leerzustand-Text, keine eigene Knopf-Zeile — ein Ereignis ohne
                Schritte kostet null zusätzliche Höhe (Punkt 10, Nutzer
                2026-07-21). */}
            <div className="flex min-h-7 items-center justify-between gap-2">
              <span className="text-[0.6875rem] font-semibold text-foreground">
                {ev.name}
                {steps.length > 0 && (
                  <span className="ml-1.5 font-normal tabular-nums text-muted-foreground">
                    {steps.length}
                  </span>
                )}
              </span>
              {steps.length === 0 ? (
                <IconButton
                  aria-label={`Schritt zu „${ev.name}" hinzufügen`}
                  title="Schritt hinzufügen"
                  onClick={() => setOffenesEreignis(ev)}
                >
                  <Plus size={14} />
                </IconButton>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setOffenesEreignis(ev)}>
                  Kette bearbeiten
                </Button>
              )}
            </div>
            {steps.length > 0 && (
              <div className="mt-0.5">
                <SchrittListe steps={steps} />
              </div>
            )}
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
