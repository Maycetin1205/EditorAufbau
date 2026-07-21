// AktionenSektion — Inspector-Abschnitt „Aktionen" (R3, 2026-07-21).
// Die Ereignis-Ketten wohnen jetzt AM BAUSTEIN statt in der Steuerung:
// erscheint nach Inhalt/Daten, aber NUR für Bausteine, die per Registry
// Ereignisse deklarieren (blockEvents — kein `if typ===`). Je Ereignis eine
// kompakte Schrittliste mit „+ Schritt", Bearbeiten/Löschen/Sortieren/
// Duplizieren — Verhalten, Wortlaut und Undo-Kopplung sind exakt die der
// früheren AktionenBereich-Detailspalte (nur ohne deren Master-Liste, weil
// der Baustein hier schon feststeht). Ein Bedienschritt = EIN Undo-Eintrag
// (editor.updateBlockEvents), Ctrl+Z gilt auch hier.
//
// Die Schritt-Bearbeitung nutzt die UNVERÄNDERTE StepForm (Regel: nichts neu
// erfinden). Sie erscheint als Karte, die den Inspector überlagert: die
// 340-px-Spalte ist für die Relation-Parameterzeilen zu schmal — Plan-
// Entscheidung 2026-07-21 „Karte am Panel", ausdrücklich KEIN neuer
// Vollbild-Weltwechsel. Escape-Schichtung erhalten (FormularKarte fängt sein
// Escape per capture + stopPropagation ab).

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowDown, ArrowUp, Copy, Pencil, Plus, X } from 'lucide-react'
import { IconButton } from '@/ui/atoms/icon-button'
import type { BlockNode } from '../../core/blocks/BlockData'
import type { BlockEventSpec } from '../../core/blocks/BlockDefinition'
import {
  ergebnisSchritteVor,
  stepProblem,
  stepTypeName,
  type ActionStep,
} from '../../core/data/aktionen'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { useRelations } from '../../state/useRelations'
import { StepForm } from '../zentrale/StepForm'

interface AktionenSektionProps {
  block: BlockNode
  events: readonly BlockEventSpec[]
}

export function AktionenSektion({ block, events }: AktionenSektionProps) {
  const ed = useEditor()
  const relations = useRelations()
  const dataSources = useDataSources()
  // Offenes Schritt-Formular: an welchem Ereignis, ggf. welcher Schritt
  // (bearbeiten). null = kein Formular offen.
  const [form, setForm] = useState<{ eventKey: string; step?: ActionStep } | null>(null)

  const kette = (eventKey: string): ActionStep[] => ed.tree[block.id]?.events?.[eventKey] ?? []

  // Kette eines Ereignisses ersetzen (alle Mutationen laufen hierüber).
  const setChain = (eventKey: string, steps: ActionStep[]): void => {
    const node = ed.tree[block.id]
    if (!node) return
    ed.updateBlockEvents(block.id, { ...(node.events ?? {}), [eventKey]: steps })
  }

  const moveStep = (eventKey: string, steps: ActionStep[], from: number, to: number): void => {
    const next = [...steps]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setChain(eventKey, next)
  }

  const duplicateStep = (eventKey: string, steps: ActionStep[], at: number): void => {
    const source = steps[at]
    const copy: ActionStep = source.type === 'START_TOOL'
      ? { ...source, toolParams: [...source.toolParams], id: crypto.randomUUID() }
      : source.type === 'RELATION'
        ? {
            ...source,
            params: source.params.map((binding) => ({ ...binding })),
            extraParams: source.extraParams.map((binding) => ({ ...binding })),
            id: crypto.randomUUID(),
          }
        : { ...source, id: crypto.randomUUID() }
    const next = [...steps]
    next.splice(at + 1, 0, copy)
    setChain(eventKey, next)
  }

  const popupSeiten = ed.pages.filter((seite) => !seite.istHauptseite)

  return (
    <div className="flex flex-col gap-2">
      {events.map((ev) => {
        const steps = kette(ev.key)
        return (
          <div key={ev.key} className="text-xs">
            {/* Genau EINE Zeile je Ereignis: Name links, kleiner „+"-Knopf
                rechts. Kein Leerzustand-Text, keine eigene Knopf-Zeile — ein
                Ereignis ohne Schritte kostet null zusätzliche Höhe (Punkt 10,
                Nutzer 2026-07-21). Schritte hängen als dichte Zeilen darunter. */}
            <div className="flex min-h-7 items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-foreground">{ev.name}</span>
              <IconButton
                aria-label="Schritt hinzufügen"
                title="Schritt hinzufügen"
                onClick={() => setForm({ eventKey: ev.key })}
              >
                <Plus size={14} />
              </IconButton>
            </div>
            {steps.length > 0 && (
              <ol className="mt-0.5 divide-y divide-border/70">
                {steps.map((s, i) => {
                  const problem = stepProblem(
                    s, relations.list, dataSources.list, popupSeiten.map((seite) => seite.id),
                    ergebnisSchritteVor(steps, s.id, relations.list).map((g) => g.id),
                  )
                  const relation = s.type === 'RELATION' ? relations.get(s.relationId) : undefined
                  const popupName = s.type === 'POPUP_OPEN' || s.type === 'POPUP_CLOSE'
                    ? popupSeiten.find((seite) => seite.id === s.popupId)?.name
                    : undefined
                  return (
                    <li
                      key={s.id}
                      className={`flex items-center gap-0.5 border-l-2 px-1 py-1.5 transition-colors ${
                        problem !== null
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-transparent hover:bg-secondary/50'
                      }`}
                    >
                      <span className="w-4 shrink-0 text-right text-muted-foreground">{i + 1}.</span>
                      <span className="min-w-0 flex-1 truncate" title={problem ?? undefined}>
                        {stepTypeName(s.type)}
                        {s.type === 'START_TOOL' && s.toolNr.trim() !== '' ? ` — Nr. ${s.toolNr}` : ''}
                        {s.type === 'RELATION' && relation ? ` — ${relation.name}` : ''}
                        {popupName ? ` — ${popupName}` : ''}
                        {problem !== null ? ' — unvollständig' : ''}
                      </span>
                      <IconButton
                        aria-label={`Schritt ${i + 1} nach oben`}
                        disabled={i === 0}
                        onClick={() => moveStep(ev.key, steps, i, i - 1)}
                      >
                        <ArrowUp size={12} />
                      </IconButton>
                      <IconButton
                        aria-label={`Schritt ${i + 1} nach unten`}
                        disabled={i === steps.length - 1}
                        onClick={() => moveStep(ev.key, steps, i, i + 1)}
                      >
                        <ArrowDown size={12} />
                      </IconButton>
                      <IconButton
                        aria-label={`Schritt ${i + 1} bearbeiten`}
                        onClick={() => setForm({ eventKey: ev.key, step: s })}
                      >
                        <Pencil size={12} />
                      </IconButton>
                      <IconButton
                        aria-label={`Schritt ${i + 1} duplizieren`}
                        onClick={() => duplicateStep(ev.key, steps, i)}
                      >
                        <Copy size={12} />
                      </IconButton>
                      <IconButton
                        aria-label={`Schritt ${i + 1} löschen`}
                        onClick={() => setChain(ev.key, steps.filter((x) => x.id !== s.id))}
                      >
                        <X size={12} />
                      </IconButton>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        )
      })}

      {/* Schritt-Formular als Karte am Panel: überlagert den Inspector von
          rechts (dort, wo das Panel sitzt), breit genug für die Relation-
          Parameterzeilen — kein Vollbild-Wechsel. Portal an den Body, damit
          das overflow-hidden des Inspector-Asides die Karte nicht abschneidet. */}
      {form && createPortal(
        <div className="fixed bottom-0 right-0 top-10 z-40 w-[460px] max-w-[calc(100vw-2rem)] overflow-y-auto border-l border-border bg-background shadow-xl">
          <div className="p-4">
            <StepForm
              step={form.step}
              kette={kette(form.eventKey)}
              onClose={() => setForm(null)}
              onSave={(step) => {
                const steps = kette(form.eventKey)
                const next = form.step
                  ? steps.map((s) => (s.id === step.id ? step : s))
                  : [...steps, step]
                setChain(form.eventKey, next)
              }}
            />
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
