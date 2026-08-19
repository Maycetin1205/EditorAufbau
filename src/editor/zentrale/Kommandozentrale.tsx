import { useState } from 'react'
import { Database, Link2 } from '@/ui/zeichen'
import { EditorFenster } from '@/ui/molecules/editor-fenster'
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

  const navZahl: Record<Bereich, string> = {
    datenquellen: String(sources.list.length),
    relationen: String(relations.list.length),
  }

  return (
    <EditorFenster bezeichnung="Datencenter" titel="Datencenter" onClose={onClose}>
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
    </EditorFenster>
  )
}
