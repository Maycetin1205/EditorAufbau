// DataSourceList
// Kap. 5.1: die Datenquellen-Bibliothek neben der Baustein-Bibliothek
// (CLAUDE.md Kap. 5). Vorerst eine Read-only-Liste der Vorlagen — angehängt
// wird im Inspector des Blocks (Sektion "Daten"); Anlegen/Bearbeiten von
// Vorlagen kommt in einem späteren Schritt. Sichtbar sind nur Klarnamen,
// Technikwerte (IDB-ID, Feldcodes) bleiben unsichtbar.

import { Database } from 'lucide-react'
import { useDataSources } from '../../state/useDataSources'

export function DataSourceList() {
  const sources = useDataSources().list
  return (
    <div className="flex flex-col gap-1">
      {sources.map((s) => (
        <div
          key={s.id}
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2 text-xs"
        >
          <Database size={13} className="shrink-0 text-muted-foreground" />
          <span className="truncate font-medium">{s.name}</span>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {s.fields.length} Felder
          </span>
        </div>
      ))}
    </div>
  )
}
