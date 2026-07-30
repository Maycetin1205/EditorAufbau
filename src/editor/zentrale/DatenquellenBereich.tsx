// DatenquellenBereich — Master-Detail für die Datenquellen-Bibliothek
// (Gerüst 2026-07-15, ersetzt die frühere schmale DataSourceList).
// Links die Vorlagen mit Art-Etikett und Verwendungs-Zähler, rechts das
// Detail: Felder, „Verwendung in dieser Maske". Bearbeiten
// läuft inline im Detail (FormularKarte) — kein Modal im Modal.
// Löschen fragt nach, mit deutlicher Warnung, wenn die
// Quelle in der Maske benutzt wird (Registry-getrieben, kein `if type===`).

import { useState } from 'react'
import { Plus, TriangleAlert } from 'lucide-react'
import { Button } from '@/ui/atoms/button'
import {
  artFuer,
  kennungAnzeige,
  type DataSource,
} from '../../core/data/dataSources'
import { bausteineMitQuelle } from '../../state/quellenOps'
import { useDataSources } from '../../state/useDataSources'
import { useEditor } from '../../state/useEditor'
import { DataSourceForm } from './DataSourceForm'
import { Gruppe } from './Gruppe'
import { bausteinName, ikonFuer } from './helfer'

export function DatenquellenBereich() {
  const store = useDataSources()
  const ed = useEditor()
  const [auswahlId, setAuswahlId] = useState<string | null>(store.list[0]?.id ?? null)
  // 'lesen' = Detail ansehen; 'bearbeiten'/'neu' = Formular inline im Detail.
  const [modus, setModus] = useState<'lesen' | 'bearbeiten' | 'neu'>('lesen')

  const auswahl = store.list.find((s) => s.id === auswahlId) ?? store.list[0]

  // Klarnamen der Bausteine, die diese Quelle benutzen. Die Baumsuche selbst
  // wohnt in quellenOps (dort geprueft) — sie zaehlt seit 2026-07-30 auch die
  // WEITEREN Quellen mit, s. dort.
  const verwendungFor = (id: string): string[] =>
    bausteineMitQuelle(ed.tree, id).map((n) => bausteinName(n))

  // Eine Stammquelle OHNE Felder bestellt beim ERP nichts — sie sieht heil
  // aus und liefert nie einen Wert. Bei IDB ist dieselbe Lage harmlos
  // (SoftEngine schickt dort ohnehin alles), darum nur hier.
  const unvollstaendig = (s: DataSource): boolean =>
    artFuer(s.kind).felderEinzeln && s.fields.length === 0

  // Die SoftEngine-Kennung einer Quelle, egal woher sie kommt: die feste der
  // Art — oder die eingegebene, wo die Art keine feste hat. Kein `if kind`.
  const kennung = (s: DataSource): string => {
    const feste = artFuer(s.kind).tabellenId
    return feste !== '' ? feste : kennungAnzeige(s.idbId)
  }

  function loeschen(s: DataSource) {
    const frage = verwendungFor(s.id).length > 0
      ? `„${s.name}" wird in der Maske BENUTZT. Trotzdem löschen? Die Bausteine bleiben stehen, ihre Daten-Bindungen ruhen.`
      : `Datenquelle „${s.name}" löschen?`
    if (!window.confirm(frage)) return
    store.remove(s.id)
    setModus('lesen')
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
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
            const Icon = ikonFuer(s.kind)
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
                  <Icon size={12} className="shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate font-medium">{s.name}</span>
                  {unvollstaendig(s) && (
                    <TriangleAlert size={12} className="shrink-0 text-destructive" />
                  )}
                  <span className="shrink-0 rounded-full bg-secondary px-1.5 text-[0.625rem] text-muted-foreground">
                    {artFuer(s.kind).name}
                  </span>
                </div>
                <div className="mt-0.5 pl-[1.125rem] text-[0.625rem] text-muted-foreground">
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
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4">
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
                {artFuer(auswahl.kind).name}
                {kennung(auswahl) !== '' ? ` · ${kennung(auswahl)}` : ''}
              </p>
            </div>

            {unvollstaendig(auswahl) && (
              <p className="rounded-md border border-destructive/40 bg-destructive/5 px-2.5 py-2 text-destructive">
                Ohne Felder liefert SoftEngine für diese Quelle nichts.
                Bearbeiten und die Felder eintragen.
              </p>
            )}

            <Gruppe titel="Felder">
              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full">
                  <tbody>
                    {auswahl.fields.map((f) => (
                      <tr key={f.code} className="border-b border-border last:border-b-0">
                        <td className="px-2.5 py-1">{f.label}</td>
                        <td className="px-2.5 py-1 text-right font-mono text-[0.6875rem] text-muted-foreground">
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
            </Gruppe>

            <Gruppe titel="Verwendung in dieser Maske">
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
            </Gruppe>

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
