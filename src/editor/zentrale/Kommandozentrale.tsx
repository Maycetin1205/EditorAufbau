import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Database, Link2, X } from '@/ui/zeichen'
import { IconButton } from '@/ui/atoms/icon-button'
import { useDataSources } from '../../state/useDataSources'
import { useRelations } from '../../state/useRelations'
import { DatenquellenBereich } from './DatenquellenBereich'
import { RelationenBereich } from './RelationenBereich'

type Bereich = 'datenquellen' | 'relationen'

const BEREICHE: ReadonlyArray<{ key: Bereich; name: string; icon: typeof Database }> = [
  { key: 'datenquellen', name: 'Datenquellen', icon: Database },
  { key: 'relationen', name: 'Relationen', icon: Link2 },
]

export function Kommandozentrale({ onClose }: { onClose: () => void }) {
  const [bereich, setBereich] = useState<Bereich>('datenquellen')
  const sources = useDataSources()
  const relations = useRelations()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const navZahl: Record<Bereich, string> = {
    datenquellen: String(sources.list.length),
    relationen: String(relations.list.length),
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
        aria-label="Datencenter"
        className="flex h-full max-h-[47.5rem] w-full max-w-5xl flex-col rounded-lg border border-border bg-background shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h2 className="text-sm font-semibold">Datencenter</h2>
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
                <span className="shrink-0 text-[0.625rem] tabular-nums text-muted-foreground">
                  {navZahl[key]}
                </span>
              </button>
            ))}
          </nav>
          {bereich === 'datenquellen' && <DatenquellenBereich />}
          {bereich === 'relationen' && <RelationenBereich />}
        </div>
      </div>
    </div>,
    document.body,
  )
}
