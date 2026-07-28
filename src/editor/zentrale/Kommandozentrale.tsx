// Kommandozentrale (Z1; Gerüst-Neuschnitt 2026-07-15 nach der abgenommenen
// Demo-Vorlage): das schlanke Verwaltungsfenster für die maskenweite,
// selten angefasste Pflege. Zwei Bereiche — Datenquellen | Relationen —
// als Master-Detail, Bearbeiten inline im Detail (kein Modal im Modal).
// Die Ereignis-Ketten sind seit R3 (2026-07-21) an den Baustein umgezogen
// (Inspector-Abschnitt „Aktionen"); der frühere Bereich „Aktionen" entfiel
// dabei restlos. Der Bereich „Verknüpfungen" (2026-07-25 bis 2026-07-28)
// ist ebenso restlos entfernt — der Nutzer hat die allgemeine Verknüpfung
// verworfen, die Schlüsselregel lebt am Baustein (QuellenListe im
// Inspector, Regel 7).
//
// Öffnet über den Toolbar-Knopf „Steuerung". Optik: Editor-UI
// (shadcn-Tokens) — bewusst KEINE Übernahme des alten Editors.
//
// Escape schließt — im BUBBLE-Lauf: ein offenes Inline-Formular
// (FormularKarte: capture + stopPropagation) fängt sein Escape vorher ab,
// die Zentrale bleibt dann offen. Klick auf den Schleier schließt ebenfalls.

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Database, Link2, X } from 'lucide-react'
import { IconButton } from '@/ui/atoms/icon-button'
import { preflightMask } from '../../export/preflight'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
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
  // — dieselben Meldungen, die sonst erst beim Export erscheinen. Die
  // Aktions-/Relations-Laufzeit-Warnungen wandern mit den Ketten an den
  // Baustein (Schritt-Zeile im Inspector wird amber), nicht mehr hierher.
  const probleme = preflightMask(ed.tree, sources.list, relations.list)
  const warnt: Record<Bereich, boolean> = {
    datenquellen: probleme.some((p) => p.name === 'Datenquelle fehlt'),
    relationen: false,
  }

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
        aria-label="Steuerung"
        className="flex h-full max-h-[47.5rem] w-full max-w-5xl flex-col rounded-lg border border-border bg-background shadow-lg"
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
                  <span className="shrink-0 text-[0.625rem] tabular-nums text-muted-foreground">
                    {navZahl[key]}
                  </span>
                )}
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
