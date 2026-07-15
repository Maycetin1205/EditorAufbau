// Kommandozentrale (Z1; Gerüst-Neuschnitt 2026-07-15 nach der abgenommenen
// Demo-Vorlage): der EINE übersichtliche Ort für alles Verdrahtete der
// Maske. Drei Bereiche — Datenquellen | Relationen | Aktionen —
// als Master-Detail, Bearbeiten inline im Detail (kein Modal im Modal).
// Der Bereich „Verknüpfungen/Auswahl-Filter" kommt erst MIT der
// Selektions-Funktion (kein leerer Platzhalter-Bereich).
//
// Öffnet über den Toolbar-Knopf „Steuerung". Optik: Editor-UI
// (shadcn-Tokens) — bewusst KEINE Übernahme des alten Editors.
//
// Escape schließt — im BUBBLE-Lauf: ein offenes Inline-Formular
// (FormularKarte: capture + stopPropagation) fängt sein Escape vorher ab,
// die Zentrale bleibt dann offen. Klick auf den Schleier schließt ebenfalls.

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Database, Link2, ListChecks, X } from 'lucide-react'
import { IconButton } from '@/ui/atoms/icon-button'
import { ROOT_ID } from '../../core/blocks/BlockData'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { preflightMask } from '../../export/preflight'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { useRelations } from '../../state/useRelations'
import { AktionenBereich } from './AktionenBereich'
import { DatenquellenBereich } from './DatenquellenBereich'
import { RelationenBereich } from './RelationenBereich'

type Bereich = 'datenquellen' | 'relationen' | 'aktionen'

const BEREICHE: ReadonlyArray<{ key: Bereich; name: string; icon: typeof ListChecks }> = [
  { key: 'datenquellen', name: 'Datenquellen', icon: Database },
  { key: 'relationen', name: 'Relationen', icon: Link2 },
  { key: 'aktionen', name: 'Aktionen', icon: ListChecks },
]

export function Kommandozentrale({ onClose }: { onClose: () => void }) {
  const [bereich, setBereich] = useState<Bereich>('datenquellen')
  const ed = useEditor()
  const sources = useDataSources()
  const relations = useRelations()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Die VORHANDENE Export-Vorprüfung speist die Warn-Punkte in der Navigation
  // — dieselben Meldungen, die sonst erst beim Export erscheinen.
  const probleme = preflightMask(ed.tree, sources.list, relations.list)
  const warnt: Record<Bereich, boolean> = {
    datenquellen: probleme.some((p) => p.name === 'Datenquelle fehlt'),
    relationen: false,
    aktionen: probleme.some((p) =>
      p.name === 'Aktion unvollstaendig' || p.name === 'Relations-Laufzeit fehlt',
    ),
  }

  // Zähler für die Navigation (Bausteine mit Ereignissen in Baumreihenfolge).
  let aktionenBausteine = 0
  const zaehle = (id: string): void => {
    for (const cid of ed.tree[id]?.childIds ?? []) {
      const node = ed.tree[cid]
      if (!node) continue
      if (getBlockDefinition(node.type)?.blockEvents?.length) {
        aktionenBausteine += 1
      }
      zaehle(cid)
    }
  }
  zaehle(ROOT_ID)

  const navZahl: Record<Bereich, string> = {
    datenquellen: String(sources.list.length),
    relationen: String(relations.list.length),
    aktionen: String(aktionenBausteine),
  }

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
        className="flex h-full max-h-[760px] w-full max-w-5xl flex-col rounded-lg border border-border bg-background shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h2 className="text-sm font-semibold">Steuerung</h2>
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
                <Icon size={14} />
                <span className="min-w-0 flex-1">{name}</span>
                {warnt[key] && <span className="size-2 shrink-0 rounded-full bg-amber-500" />}
                {navZahl[key] !== '' && (
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {navZahl[key]}
                  </span>
                )}
              </button>
            ))}
          </nav>
          {bereich === 'datenquellen' && <DatenquellenBereich />}
          {bereich === 'relationen' && <RelationenBereich />}
          {bereich === 'aktionen' && <AktionenBereich />}
        </div>
      </div>
    </div>,
    document.body,
  )
}
