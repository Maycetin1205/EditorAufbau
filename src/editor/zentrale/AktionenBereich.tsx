// AktionenBereich — Master-Detail für die Aktionsketten (Gerüst 2026-07-15;
// die Ketten-Logik stammt aus Z1/Z2 und ist unverändert, nur neu angeordnet).
// Links jeder Baustein der Maske, der auf Ereignisse reagieren kann
// (Registry: blockEvents), in Baumreihenfolge; rechts seine Ereignisse mit
// den Schrittketten. Canvas-Auswahl wählt den passenden Eintrag vor.
// Die Ketten LEBEN am Baustein (block.events) — dieser Bereich ist eine
// von zwei Türen zum selben Schrank. Ein Bedienschritt = EIN Undo-Eintrag
// (editor.updateBlockEvents), Ctrl+Z gilt auch hier.

import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Copy, Pencil, Plus, X } from 'lucide-react'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { ROOT_ID } from '../../core/blocks/BlockData'
import type { BlockEventSpec } from '../../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { stepProblem, stepTypeName, type ActionStep } from '../../core/data/aktionen'
import { useEditor } from '../../state/useEditor'
import { useRelations } from '../../state/useRelations'
import { useDataSources } from '../../state/useDataSources'
import { bausteinName } from './helfer'
import { StepForm } from './StepForm'

interface Eintrag {
  id: string
  name: string
  events: readonly BlockEventSpec[]
}

export function AktionenBereich() {
  const ed = useEditor()
  const relations = useRelations()
  const dataSources = useDataSources()
  // Offenes Schritt-Formular: an welchem Ereignis, ggf. welcher Schritt
  // (bearbeiten). null = kein Formular offen.
  const [form, setForm] = useState<{ blockId: string; eventKey: string; step?: ActionStep } | null>(null)

  // Bausteine mit Ereignissen, in Baumreihenfolge; gleiche Namen werden
  // durchnummeriert (Z1-Verhalten, unverändert).
  const eintraege: Eintrag[] = []
  const walk = (id: string): void => {
    for (const cid of ed.tree[id]?.childIds ?? []) {
      const node = ed.tree[cid]
      if (!node) continue
      const def = getBlockDefinition(node.type)
      if (def?.blockEvents?.length) {
        eintraege.push({ id: cid, name: bausteinName(node), events: def.blockEvents })
      }
      walk(cid)
    }
  }
  walk(ROOT_ID)
  const namensZahl = new Map<string, number>()
  for (const e of eintraege) namensZahl.set(e.name, (namensZahl.get(e.name) ?? 0) + 1)
  const laufend = new Map<string, number>()
  for (const e of eintraege) {
    if ((namensZahl.get(e.name) ?? 0) > 1) {
      const n = (laufend.get(e.name) ?? 0) + 1
      laufend.set(e.name, n)
      e.name = `${e.name} (${n})`
    }
  }

  // Liegt die Canvas-Auswahl im Teilbaum dieses Eintrags? Dann ist er die
  // natürliche Vorauswahl (die zweite Tür: vom Baustein in die Steuerung).
  const inSubtree = (id: string): boolean => {
    let cur = ed.selectedId
    while (cur) {
      if (cur === id) return true
      cur = ed.tree[cur]?.parentId ?? null
    }
    return false
  }
  const aktivImCanvas = eintraege.find((e) => inSubtree(e.id))?.id ?? null

  const [auswahlId, setAuswahlId] = useState<string | null>(aktivImCanvas ?? eintraege[0]?.id ?? null)
  // Ändert sich die Canvas-Auswahl, zieht die Vorauswahl nach — direkt im
  // Render (React-Muster „adjust state when props change", kein Effect).
  const [letzterCanvasAktiv, setLetzterCanvasAktiv] = useState(aktivImCanvas)
  if (aktivImCanvas !== letzterCanvasAktiv) {
    setLetzterCanvasAktiv(aktivImCanvas)
    if (aktivImCanvas) setAuswahlId(aktivImCanvas)
  }
  const auswahl = eintraege.find((e) => e.id === auswahlId) ?? eintraege[0]

  const auswahlRef = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    auswahlRef.current?.scrollIntoView({ block: 'nearest' })
  }, [auswahl?.id])

  // Kette eines Ereignisses ersetzen (alle Mutationen laufen hierüber).
  const setChain = (blockId: string, eventKey: string, steps: ActionStep[]): void => {
    const node = ed.tree[blockId]
    if (!node) return
    ed.updateBlockEvents(blockId, { ...(node.events ?? {}), [eventKey]: steps })
  }

  const moveStep = (blockId: string, eventKey: string, steps: ActionStep[], from: number, to: number): void => {
    const next = [...steps]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setChain(blockId, eventKey, next)
  }

  const duplicateStep = (blockId: string, eventKey: string, steps: ActionStep[], at: number): void => {
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
    setChain(blockId, eventKey, next)
  }

  const schrittSumme = (e: Eintrag): number =>
    e.events.reduce((sum, ev) => sum + (ed.tree[e.id]?.events?.[ev.key]?.length ?? 0), 0)

  const hatProblem = (e: Eintrag): boolean =>
    e.events.some((ev) => (ed.tree[e.id]?.events?.[ev.key] ?? [])
      .some((s) => stepProblem(s, relations.list, dataSources.list) !== null))

  if (eintraege.length === 0) {
    return (
      <div className="flex-1 p-4">
        <p className="text-xs text-muted-foreground">
          Kein Baustein mit Ereignissen in der Maske.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      {/* Master: Bausteine mit Ereignissen */}
      <div className="flex w-64 shrink-0 flex-col border-r border-border">
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {eintraege.map((e) => {
            const aktiv = auswahl?.id === e.id
            const summe = schrittSumme(e)
            return (
              <button
                key={e.id}
                ref={aktiv ? auswahlRef : undefined}
                type="button"
                data-ausgewaehlt={e.id === aktivImCanvas || undefined}
                onClick={() => { setAuswahlId(e.id); setForm(null) }}
                className={`mb-0.5 w-full border-l-2 px-2 py-1 text-left text-xs transition-colors ${
                  aktiv ? 'border-ring bg-secondary' : 'border-transparent hover:bg-secondary/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`size-2 shrink-0 rounded-full ${
                      hatProblem(e) ? 'bg-amber-500' : summe > 0 ? 'bg-emerald-600' : 'bg-border'
                    }`}
                  />
                  <span className="min-w-0 flex-1 truncate font-medium">{e.name}</span>
                </div>
                <div className="mt-0.5 pl-[14px] text-[10px] text-muted-foreground">
                  {e.events.length} Ereignis(se) · {summe} Schritt(e)
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Detail: Ereignisse + Ketten des gewählten Bausteins */}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4">
        {auswahl && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">{auswahl.name}</h3>
            {auswahl.events.map((ev) => {
              const steps = ed.tree[auswahl.id]?.events?.[ev.key] ?? []
              return (
                <div key={ev.key} className="border-b border-border py-2 text-xs last:border-b-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{ev.name}</span>
                    <div className="flex items-center gap-2">
                      {steps.length === 0 && (
                        <span className="text-muted-foreground">Noch keine Schritte</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setForm({ blockId: auswahl.id, eventKey: ev.key })}
                      >
                        <Plus size={12} /> Schritt
                      </Button>
                    </div>
                  </div>
                  {steps.length > 0 && (
                    <ol className="mt-1 divide-y divide-border/70">
                      {steps.map((s, i) => {
                        const popupSeiten = ed.pages.filter((seite) => !seite.istHauptseite)
                        const problem = stepProblem(
                          s, relations.list, dataSources.list, popupSeiten.map((seite) => seite.id),
                        )
                        const relation = s.type === 'RELATION' ? relations.get(s.relationId) : undefined
                        const popupName = s.type === 'POPUP_OPEN' || s.type === 'POPUP_CLOSE'
                          ? popupSeiten.find((seite) => seite.id === s.popupId)?.name
                          : undefined
                        return (
                          <li
                            key={s.id}
                            className={`flex items-center gap-1 border-l-2 px-1 py-1.5 transition-colors ${
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
                              onClick={() => moveStep(auswahl.id, ev.key, steps, i, i - 1)}
                            >
                              <ArrowUp size={12} />
                            </IconButton>
                            <IconButton
                              aria-label={`Schritt ${i + 1} nach unten`}
                              disabled={i === steps.length - 1}
                              onClick={() => moveStep(auswahl.id, ev.key, steps, i, i + 1)}
                            >
                              <ArrowDown size={12} />
                            </IconButton>
                            <IconButton
                              aria-label={`Schritt ${i + 1} bearbeiten`}
                              onClick={() => setForm({ blockId: auswahl.id, eventKey: ev.key, step: s })}
                            >
                              <Pencil size={12} />
                            </IconButton>
                            <IconButton
                              aria-label={`Schritt ${i + 1} duplizieren`}
                              onClick={() => duplicateStep(auswahl.id, ev.key, steps, i)}
                            >
                              <Copy size={12} />
                            </IconButton>
                            <IconButton
                              aria-label={`Schritt ${i + 1} löschen`}
                              onClick={() => setChain(auswahl.id, ev.key, steps.filter((x) => x.id !== s.id))}
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
            {form && form.blockId === auswahl.id && (
              <StepForm
                step={form.step}
                onClose={() => setForm(null)}
                onSave={(step) => {
                  const steps = ed.tree[form.blockId]?.events?.[form.eventKey] ?? []
                  const next = form.step
                    ? steps.map((s) => (s.id === step.id ? step : s))
                    : [...steps, step]
                  setChain(form.blockId, form.eventKey, next)
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
