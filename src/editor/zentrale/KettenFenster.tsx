// KettenFenster — die Aktionskette EINES Ereignisses in voller Breite.
//
// Warum es das gibt (Nutzer-Auftrag 2026-08-17): das Schritt-Formular
// blaetterte bis hierhin das 340-px-Inspector-Panel um. Eine Relation hat bis
// zu zwoelf Parameter, jeder mit Herkunft UND Ziel — das passt dort nicht,
// und waehrend man es ausfuellte, war der Baustein, um den es geht, nicht
// mehr zu sehen. Jetzt: links die Kette, rechts der angeklickte Schritt, der
// Baustein bleibt hinter dem Fenster stehen.
//
// Die Kette bleibt AM BAUSTEIN (Regel 7) — der Inspector zeigt sie weiter und
// oeffnet nur dieses Fenster. Umgezogen ist das BEARBEITEN, nicht der Besitz.
//
// Rahmen wie die Kommandozentrale: Portal, Schleier, Escape schliesst — ein
// offenes Inline-Formular faengt sein Escape vorher ab (FormularKarte).

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, X } from '@/ui/zeichen'
import { IconButton } from '@/ui/atoms/icon-button'
import type { BlockNode } from '../../core/blocks/BlockData'
import type { ActionStep } from '../../core/data/aktionen'
import { bausteinName } from '../../core/blocks/bausteinName'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { SchrittListe } from './SchrittListe'
import { StepForm } from './StepForm'

interface KettenFensterProps {
  block: BlockNode
  eventKey: string
  eventName: string
  onClose: () => void
}

export function KettenFenster({ block, eventKey, eventName, onClose }: KettenFensterProps) {
  const ed = useEditor()
  const quellen = useDataSources()
  // Welcher Schritt rechts steht: die id (nicht der Schritt selbst), damit die
  // rechte Seite nach jeder Aenderung den FRISCHEN Stand aus dem Baum liest.
  // Mit einer Kopie stuende dort der Stand von vor dem Speichern.
  const [offeneId, setOffeneId] = useState<string | null>(null)
  // Ein NEUER Schritt hat noch keine id — dieser Schalter unterscheidet
  // „nichts offen" von „neu anlegen".
  const [neu, setNeu] = useState(false)

  const kette = ed.tree[block.id]?.events?.[eventKey] ?? []
  const offen = offeneId === null ? undefined : kette.find((s) => s.id === offeneId)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Kette ersetzen — alle Umbauten laufen hierueber, ein Bedienschritt = EIN
  // Undo-Eintrag (updateBlockEvents).
  const setzeKette = (steps: ActionStep[]): void => {
    const node = ed.tree[block.id]
    if (!node) return
    ed.updateBlockEvents(block.id, { ...(node.events ?? {}), [eventKey]: steps })
  }

  // Schritt speichern: dieselbe „ersetzen oder anhaengen"-Regel wie bisher.
  const speichere = (step: ActionStep): void => {
    setzeKette(offen ? kette.map((s) => (s.id === step.id ? step : s)) : [...kette, step])
    setNeu(false)
    setOffeneId(step.id)
  }

  const zeigeFormular = neu || offen !== undefined

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/30 p-6"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Aktionskette ${eventName}`}
        className="flex h-full max-h-[47.5rem] w-full max-w-5xl flex-col rounded-lg border border-border bg-background shadow-lg"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <h2 className="min-w-0 truncate text-sm font-semibold">
            {bausteinName(block, quellen.list)}
            <span className="ml-2 font-normal text-muted-foreground">
              {eventName} · {kette.length} {kette.length === 1 ? 'Schritt' : 'Schritte'}
            </span>
          </h2>
          <IconButton aria-label="Schließen" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="flex w-[22rem] shrink-0 flex-col border-r border-border">
            <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                Schritte
              </span>
              <IconButton
                aria-label="Schritt hinzufügen"
                title="Schritt hinzufügen"
                onClick={() => {
                  setOffeneId(null)
                  setNeu(true)
                }}
              >
                <Plus size={14} />
              </IconButton>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-1 py-1">
              <SchrittListe
                steps={kette}
                aktivId={offeneId ?? undefined}
                onWaehle={(s) => {
                  setNeu(false)
                  setOffeneId(s.id)
                }}
                onAendern={setzeKette}
              />
            </div>
          </div>

          {/* Breit, aber nicht endlos: eine Parameterzeile ueber 900 px waere
              wieder schlecht zu lesen — nur andersherum als in 340 px. */}
          <div className="min-w-0 flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl">
            {zeigeFormular ? (
              <StepForm
                // Beim Wechsel auf einen anderen Schritt baut das Formular neu
                // auf — sonst stuenden die Eingaben des vorherigen darin.
                key={offen?.id ?? 'neu'}
                step={offen}
                kette={kette}
                onClose={() => {
                  setNeu(false)
                  setOffeneId(null)
                }}
                onSave={speichere}
              />
            ) : (
              /* Kein Schritt gewaehlt: den Zustand benennen statt eine leere
                 Flaeche zeigen (Regel 4). */
              <p className="text-xs text-muted-foreground">
                {kette.length === 0
                  ? 'Noch kein Schritt.'
                  : 'Schritt links auswählen.'}
              </p>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
