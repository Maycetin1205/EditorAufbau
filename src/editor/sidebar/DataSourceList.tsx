// DataSourceList
// Kap. 5.1/5.4: die Datenquellen-Bibliothek neben der Baustein-Bibliothek
// (Kap. 5). Seit 5.4b mit Anlegen/Bearbeiten/Löschen — die
// Vorlagen gehören dem Bediener (DataSourceStore). Sichtbar sind nur
// Klarnamen, Technikwerte (IDB-ID, Feldcodes) bleiben unsichtbar.
// Löschen fragt nach (Bedienlogik 5), mit deutlicher Warnung, wenn die
// Quelle gerade in der Maske benutzt wird (Registry-getrieben, kein
// `if type===`): der Block bleibt dann stehen, seine Bindungen ruhen.

import { useState } from 'react'
import { Database, Pencil, Plus, X } from 'lucide-react'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type { DataSource } from '../../core/data/dataSources'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { DataSourceForm } from './DataSourceForm'

export function DataSourceList() {
  const store = useDataSources()
  const ed = useEditor()
  // null = kein Formular; 'neu' = Anlegen; sonst die Vorlage in Bearbeitung.
  const [formular, setFormular] = useState<'neu' | DataSource | null>(null)

  // Wird die Vorlage gerade von einem Block der Maske benutzt?
  const inBenutzung = (id: string): boolean =>
    Object.values(ed.tree).some(
      (n) => getBlockDefinition(n.type)?.acceptsDataSource && n.props.source === id,
    )

  function loeschen(s: DataSource) {
    const frage = inBenutzung(s.id)
      ? `„${s.name}" wird in der Maske BENUTZT. Trotzdem löschen? Die Bausteine bleiben stehen, ihre Daten-Bindungen ruhen.`
      : `Datenquelle „${s.name}" löschen?`
    if (!window.confirm(frage)) return
    store.remove(s.id)
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        className="mb-1 w-full"
        onClick={() => setFormular('neu')}
      >
        <Plus size={14} /> Neue Datenquelle
      </Button>
      {store.list.map((s) => (
        <div
          key={s.id}
          className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-center gap-1.5 rounded-md border border-border bg-card py-1 pl-2.5 pr-1 text-xs"
        >
          <Database size={13} className="shrink-0 text-muted-foreground" />
          <span className="truncate font-medium">{s.name}</span>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {s.fields.length} Felder
          </span>
          <IconButton
            aria-label={`${s.name} bearbeiten`}
            className="size-6"
            onClick={() => setFormular(s)}
          >
            <Pencil size={12} />
          </IconButton>
          <IconButton
            aria-label={`${s.name} löschen`}
            className="size-6"
            onClick={() => loeschen(s)}
          >
            <X size={13} />
          </IconButton>
        </div>
      ))}
      {store.list.length === 0 && (
        <p className="px-1 py-2 text-xs text-muted-foreground">
          Noch keine Datenquellen — oben anlegen.
        </p>
      )}
      {formular !== null && (
        <DataSourceForm
          source={formular === 'neu' ? undefined : formular}
          onClose={() => setFormular(null)}
        />
      )}
    </div>
  )
}
