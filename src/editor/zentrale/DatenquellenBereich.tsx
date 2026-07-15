// DatenquellenBereich — Master-Detail für die Datenquellen-Bibliothek
// (Gerüst 2026-07-15, ersetzt die frühere schmale DataSourceList).
// Links die Vorlagen mit Art-Etikett und Verwendungs-Zähler, rechts das
// Detail: Felder, „Verwendung in dieser Maske". Bearbeiten
// läuft inline im Detail (FormularKarte) — kein Modal im Modal.
// Löschen fragt nach (Bedienlogik 5), mit deutlicher Warnung, wenn die
// Quelle in der Maske benutzt wird (Registry-getrieben, kein `if type===`).

import { useState } from 'react'
import { Database, Plus } from 'lucide-react'
import { Button } from '@/ui/atoms/button'
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import { idbIdAnzeige, type DataSource } from '../../core/data/dataSources'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { DataSourceForm } from './DataSourceForm'
import { bausteinName, KIND_LABELS } from './helfer'

export function DatenquellenBereich() {
  const store = useDataSources()
  const ed = useEditor()
  const [auswahlId, setAuswahlId] = useState<string | null>(store.list[0]?.id ?? null)
  // 'lesen' = Detail ansehen; 'bearbeiten'/'neu' = Formular inline im Detail.
  const [modus, setModus] = useState<'lesen' | 'bearbeiten' | 'neu'>('lesen')

  const auswahl = store.list.find((s) => s.id === auswahlId) ?? store.list[0]

  // Bausteine der Maske, die diese Quelle benutzen (Klarnamen für die Anzeige).
  const verwendungFor = (id: string): string[] =>
    Object.values(ed.tree)
      .filter((n) => getBlockDefinition(n.type)?.acceptsDataSource && n.props.source === id)
      .map((n) => bausteinName(n))

  function loeschen(s: DataSource) {
    const frage = verwendungFor(s.id).length > 0
      ? `„${s.name}" wird in der Maske BENUTZT. Trotzdem löschen? Die Bausteine bleiben stehen, ihre Daten-Bindungen ruhen.`
      : `Datenquelle „${s.name}" löschen?`
    if (!window.confirm(frage)) return
    store.remove(s.id)
    setModus('lesen')
  }

  return (
    <div className="flex min-h-0 flex-1">
      {/* Master: die Vorlagen-Liste */}
      <div className="flex w-64 shrink-0 flex-col border-r border-border">
        <div className="border-b border-border p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setModus('neu')}
          >
            <Plus size={14} /> Neue Datenquelle
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {store.list.map((s) => {
            const verwendet = verwendungFor(s.id).length
            const aktiv = modus !== 'neu' && auswahl?.id === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => { setAuswahlId(s.id); setModus('lesen') }}
                className={`mb-1 w-full rounded-md border px-2.5 py-1 text-left text-xs transition-colors ${
                  aktiv ? 'border-ring bg-secondary' : 'border-transparent hover:bg-secondary/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Database size={12} className="shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate font-medium">{s.name}</span>
                  <span className="shrink-0 rounded-full bg-secondary px-1.5 text-[10px] text-muted-foreground">
                    {KIND_LABELS[s.kind]}
                  </span>
                </div>
                <div className="mt-0.5 pl-[18px] text-[10px] text-muted-foreground">
                  {s.fields.length} Felder · {verwendet > 0 ? `verwendet von ${verwendet}` : 'nicht verwendet'}
                </div>
              </button>
            )
          })}
          {store.list.length === 0 && (
            <p className="px-1 py-2 text-xs text-muted-foreground">
              Noch keine Datenquellen.
            </p>
          )}
        </div>
      </div>

      {/* Detail */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {modus === 'neu' && (
          <DataSourceForm onClose={() => setModus('lesen')} />
        )}
        {modus === 'bearbeiten' && auswahl && (
          <DataSourceForm source={auswahl} onClose={() => setModus('lesen')} />
        )}
        {modus === 'lesen' && !auswahl && (
          <p className="text-xs text-muted-foreground">Keine Datenquelle gewählt.</p>
        )}
        {modus === 'lesen' && auswahl && (
          <div className="flex flex-col gap-4 text-xs">
            <div>
              <h3 className="text-sm font-semibold">{auswahl.name}</h3>
              <p className="text-muted-foreground">
                {KIND_LABELS[auswahl.kind]}
                {auswahl.kind === 'idb' && idbIdAnzeige(auswahl.idbId) !== ''
                  ? ` · ${idbIdAnzeige(auswahl.idbId)}`
                  : ''}
              </p>
            </div>

            <div>
              <h4 className="mb-1 font-semibold uppercase tracking-wide text-[10px] text-muted-foreground">
                Felder
              </h4>
              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full">
                  <tbody>
                    {auswahl.fields.map((f) => (
                      <tr key={f.code} className="border-b border-border last:border-b-0">
                        <td className="px-2.5 py-1">{f.label}</td>
                        <td className="px-2.5 py-1 text-right font-mono text-[11px] text-muted-foreground">
                          {f.code}
                        </td>
                      </tr>
                    ))}
                    {auswahl.fields.length === 0 && (
                      <tr><td className="px-2.5 py-1 text-muted-foreground">Keine Felder.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="mb-1 font-semibold uppercase tracking-wide text-[10px] text-muted-foreground">
                Verwendung in dieser Maske
              </h4>
              {verwendungFor(auswahl.id).length === 0 ? (
                <p className="text-muted-foreground">Von keinem Baustein verwendet.</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {verwendungFor(auswahl.id).map((name, i) => (
                    <li key={i} className="rounded-md border border-border bg-card px-2.5 py-1">
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex gap-2 border-t border-border pt-3">
              <Button size="sm" onClick={() => setModus('bearbeiten')}>Bearbeiten</Button>
              <Button variant="outline" size="sm" onClick={() => loeschen(auswahl)}>
                Löschen…
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
