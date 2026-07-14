// Kommandozentrale (Z1, 2026-07-11)
// Der EINE übersichtliche Ort für alles Verdrahtete der Maske: Aktionen
// (Bausteine + ihre Ereignisse, Schrittketten ab Z2), Datenquellen und
// Relationen. Die beiden Bibliotheken sind aus der schmalen Sidebar HIERHER
// umgezogen (kein zweiter Pflegeort — die Sidebar behält nur die
// Baustein-Palette). Öffnet über den Toolbar-Knopf „Steuerung".
//
// Optik: Editor-UI (shadcn-Tokens) — bewusst KEINE Übernahme des alten
// Editors (Regel: Funktion ja, Aussehen nein).
//
// Escape schließt — im BUBBLE-Lauf: ein offenes Formular-Modal (Modal-
// Molekül: capture + stopPropagation) fängt sein Escape vorher ab, die
// Zentrale bleibt dann offen. Klick auf den Schleier schließt ebenfalls.

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Database,
  Link2,
  ListChecks,
  Pencil,
  Plus,
  X,
} from 'lucide-react'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { ROOT_ID } from '../../core/blocks/BlockData'
import type { BlockEventSpec } from '../../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { stepTypeName, type ActionStep } from '../../core/data/aktionen'
import { useEditor } from '../../state/useEditor'
import { DataSourceList } from '../sidebar/DataSourceList'
import { RelationList } from '../sidebar/RelationList'
import { StepForm } from './StepForm'

type Bereich = 'aktionen' | 'datenquellen' | 'relationen'

const BEREICHE: ReadonlyArray<{ key: Bereich; name: string; icon: typeof ListChecks }> = [
  { key: 'aktionen', name: 'Aktionen', icon: ListChecks },
  { key: 'datenquellen', name: 'Datenquellen', icon: Database },
  { key: 'relationen', name: 'Relationen', icon: Link2 },
]

export function Kommandozentrale({ onClose }: { onClose: () => void }) {
  const [bereich, setBereich] = useState<Bereich>('aktionen')

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

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
        aria-label="Steuerung"
        className="flex h-full max-h-[720px] w-full max-w-4xl flex-col rounded-lg border border-border bg-background shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="leading-tight">
            <h2 className="text-sm font-semibold">Steuerung</h2>
            <p className="text-xs text-muted-foreground">
              Aktionen, Datenquellen und Relationen der Maske — an einem Ort.
            </p>
          </div>
          <IconButton aria-label="Schließen" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>
        <div className="flex min-h-0 flex-1">
          <nav className="flex w-44 shrink-0 flex-col gap-1 border-r border-border p-2">
            {BEREICHE.map(({ key, name, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setBereich(key)}
                className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                  bereich === key
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                }`}
              >
                <Icon size={14} /> {name}
              </button>
            ))}
          </nav>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {bereich === 'aktionen' && <AktionenBereich />}
            {bereich === 'datenquellen' && <DataSourceList />}
            {bereich === 'relationen' && <RelationList />}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// Der Anzeigename allein ist fuer mehrere gleichartige Bausteine nicht
// eindeutig. Ein kurzer Eigentext macht die Eintraege sprechend.
const TEXT_PROPS = ['label', 'heading', 'title', 'text'] as const

function eigenerText(props: Record<string, unknown>): string {
  for (const key of TEXT_PROPS) {
    const value = props[key]
    if (typeof value === 'string' && value.trim() !== '') {
      const text = value.trim()
      return text.length > 28 ? `${text.slice(0, 27)}…` : text
    }
  }
  return ''
}

// Aktionen-Übersicht + Ketten-Editor (Z1/Z2): Bausteine der Maske mit ihren
// Ereignissen (Registry: blockEvents, nur Klarnamen) in Baumreihenfolge.
// Ist im Canvas gerade ein Baustein ausgewählt, ist sein Eintrag markiert
// und die Liste scrollt zu ihm. Je Ereignis lassen sich Schritte anlegen
// („+ Schritt" → StepForm), umsortieren (↑/↓), bearbeiten, duplizieren und
// löschen. Alle Änderungen laufen über editor.updateBlockEvents — ein
// Bedienschritt = EIN Undo-Eintrag, Ctrl+Z gilt auch hier.
function AktionenBereich() {
  const ed = useEditor()
  // Offenes Schritt-Formular: an welchem Baustein/Ereignis, ggf. welcher
  // Schritt (bearbeiten). null = kein Formular offen.
  const [form, setForm] = useState<{ blockId: string; eventKey: string; step?: ActionStep } | null>(null)

  const eintraege: Array<{ id: string; name: string; events: readonly BlockEventSpec[] }> = []
  const walk = (id: string): void => {
    for (const cid of ed.tree[id]?.childIds ?? []) {
      const node = ed.tree[cid]
      if (!node) continue
      const def = getBlockDefinition(node.type)
      if (def?.blockEvents?.length) {
        const text = eigenerText(node.props)
        const name = text === '' ? def.displayName : `${def.displayName} — ${text}`
        eintraege.push({ id: cid, name, events: def.blockEvents })
      }
      walk(cid)
    }
  }
  walk(ROOT_ID)

  // Gleiche Namen werden in Baumreihenfolge durchnummeriert.
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
    const copy: ActionStep = { ...steps[at], toolParams: [...steps[at].toolParams], id: crypto.randomUUID() }
    const next = [...steps]
    next.splice(at + 1, 0, copy)
    setChain(blockId, eventKey, next)
  }

  // Liegt die Canvas-Auswahl im Teilbaum dieses Eintrags?
  const inSubtree = (id: string): boolean => {
    let cur = ed.selectedId
    while (cur) {
      if (cur === id) return true
      cur = ed.tree[cur]?.parentId ?? null
    }
    return false
  }
  const aktiv = eintraege.find((e) => inSubtree(e.id))?.id ?? null
  const aktivRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    aktivRef.current?.scrollIntoView({ block: 'nearest' })
  }, [aktiv])

  if (eintraege.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Noch kein Baustein mit Ereignissen in der Maske — z. B. ein Kanban
        oder eine Schaltfläche einfügen.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Hier erscheint jeder Baustein, der auf Ereignisse reagieren kann
        (z. B. Kanban, Schaltfläche). Bausteine ohne Ereignisse — etwa Text
        oder Bereich — tauchen bewusst nicht auf.
      </p>
      {eintraege.map((e) => (
        <div
          key={e.id}
          ref={e.id === aktiv ? aktivRef : undefined}
          data-ausgewaehlt={e.id === aktiv || undefined}
          className={`rounded-md border bg-card p-3 ${
            e.id === aktiv ? 'border-ring ring-1 ring-ring' : 'border-border'
          }`}
        >
          <h3 className="text-xs font-semibold">{e.name}</h3>
          <ul className="mt-1.5 flex flex-col gap-2">
            {e.events.map((ev) => {
              const steps = ed.tree[e.id]?.events?.[ev.key] ?? []
              return (
                <li key={ev.key} className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span>{ev.name}</span>
                    <div className="flex items-center gap-2">
                      {steps.length === 0 && (
                        <span className="text-muted-foreground">Noch keine Schritte</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setForm({ blockId: e.id, eventKey: ev.key })}
                      >
                        <Plus size={12} /> Schritt
                      </Button>
                    </div>
                  </div>
                  {steps.length > 0 && (
                    <ol className="flex flex-col gap-1">
                      {steps.map((s, i) => (
                        <li
                          key={s.id}
                          className="flex items-center gap-1 rounded-md border border-border bg-secondary/40 px-2 py-1"
                        >
                          <span className="w-4 shrink-0 text-right text-muted-foreground">{i + 1}.</span>
                          <span className="min-w-0 flex-1 truncate">
                            {stepTypeName(s.type)}
                            {s.toolNr.trim() !== '' ? ` — Nr. ${s.toolNr}` : ''}
                            {s.toolParams.length > 0 ? ` (${s.toolParams.join(', ')})` : ''}
                          </span>
                          <IconButton
                            aria-label={`Schritt ${i + 1} nach oben`}
                            disabled={i === 0}
                            onClick={() => moveStep(e.id, ev.key, steps, i, i - 1)}
                          >
                            <ArrowUp size={12} />
                          </IconButton>
                          <IconButton
                            aria-label={`Schritt ${i + 1} nach unten`}
                            disabled={i === steps.length - 1}
                            onClick={() => moveStep(e.id, ev.key, steps, i, i + 1)}
                          >
                            <ArrowDown size={12} />
                          </IconButton>
                          <IconButton
                            aria-label={`Schritt ${i + 1} bearbeiten`}
                            onClick={() => setForm({ blockId: e.id, eventKey: ev.key, step: s })}
                          >
                            <Pencil size={12} />
                          </IconButton>
                          <IconButton
                            aria-label={`Schritt ${i + 1} duplizieren`}
                            onClick={() => duplicateStep(e.id, ev.key, steps, i)}
                          >
                            <Copy size={12} />
                          </IconButton>
                          <IconButton
                            aria-label={`Schritt ${i + 1} löschen`}
                            onClick={() => setChain(e.id, ev.key, steps.filter((x) => x.id !== s.id))}
                          >
                            <X size={12} />
                          </IconButton>
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
      {form && (
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
  )
}
