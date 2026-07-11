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
import { Database, Link2, ListChecks, X } from 'lucide-react'
import { IconButton } from '@/ui/atoms/icon-button'
import { ROOT_ID } from '../../core/blocks/BlockData'
import type { BlockEventSpec } from '../../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { useEditor } from '../../state/useEditor'
import { DataSourceList } from '../sidebar/DataSourceList'
import { RelationList } from '../sidebar/RelationList'

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

// Aktionen-Übersicht (Z1): Bausteine der Maske mit ihren Ereignissen
// (Registry: blockEvents, nur Klarnamen) in Baumreihenfolge. Ist im Canvas
// gerade ein Baustein ausgewählt, ist sein Eintrag markiert und die Liste
// scrollt zu ihm. Die Schrittketten entstehen im nächsten Paket (Z2) genau
// hier.
function AktionenBereich() {
  const ed = useEditor()

  const eintraege: Array<{ id: string; name: string; events: readonly BlockEventSpec[] }> = []
  const walk = (id: string): void => {
    for (const cid of ed.tree[id]?.childIds ?? []) {
      const node = ed.tree[cid]
      if (!node) continue
      const def = getBlockDefinition(node.type)
      if (def?.blockEvents?.length) {
        eintraege.push({ id: cid, name: def.displayName, events: def.blockEvents })
      }
      walk(cid)
    }
  }
  walk(ROOT_ID)

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
          <ul className="mt-1.5 flex flex-col gap-1">
            {e.events.map((ev) => (
              <li key={ev.key} className="flex items-baseline justify-between gap-2 text-xs">
                <span>{ev.name}</span>
                <span className="text-muted-foreground">Noch keine Schritte</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        Schrittketten anlegen folgt als nächstes Paket.
      </p>
    </div>
  )
}
