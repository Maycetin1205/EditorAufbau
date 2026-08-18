import { useState } from 'react'
import { Button } from '@/ui/atoms/button'
import { kennungAnzeige } from '../../core/data/dataSources'
import type { DtkTabelle } from '../../core/data/dtkImport'
import { useDataSources } from '../../state/useDataSources'
import { FormularKarte } from './FormularKarte'

interface DtkImportFormProps {
  dateiName: string
  tabellen: DtkTabelle[]

  pannenGrund?: string
  onClose: () => void
}

export function DtkImportForm({ dateiName, tabellen, pannenGrund, onClose }: DtkImportFormProps) {
  const store = useDataSources()

  const vorhanden = new Set(
    store.list.map((s) => s.idbId).filter((k): k is string => typeof k === 'string'),
  )

  const [angehakt, setAngehakt] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        tabellen
          .filter((t) => !vorhanden.has(t.kennung) && t.felder.length > 0)
          .map((t) => t.kennung),
      ),
  )

  function umschalten(kennung: string) {
    setAngehakt((alt) => {
      const neu = new Set(alt)
      if (neu.has(kennung)) neu.delete(kennung)
      else neu.add(kennung)
      return neu
    })
  }

  function uebernehmen() {
    for (const t of tabellen) {
      if (!angehakt.has(t.kennung) || vorhanden.has(t.kennung)) continue
      store.add({
        name: t.name !== '' ? t.name : kennungAnzeige(t.kennung),
        kind: 'idb',
        idbId: t.kennung,

        indexField: '0_10',
        fields: t.felder,
      })
    }
    onClose()
  }

  function hinweis(t: DtkTabelle): string {
    if (vorhanden.has(t.kennung)) return 'schon in der Bibliothek — wird übersprungen'
    if (t.felder.length === 0) return 'keine Felder lesbar — nach dem Import von Hand eintragen'
    if (t.soll > t.felder.length) {
      return `nur ${t.felder.length} von ${t.soll} Feldern lesbar — Rest von Hand ergänzen`
    }
    if (t.soll > 0 && t.felder.length > t.soll) {
      return `${t.felder.length} Felder gelesen, die Zählung nennt ${t.soll} — in SoftEngine gegenprüfen`
    }
    return ''
  }

  const anzahl = [...angehakt].filter((k) => !vorhanden.has(k)).length

  return (
    <FormularKarte title={`Import aus ${dateiName}`} onClose={onClose}>
      <div className="flex flex-col gap-3 text-xs">
        {tabellen.length === 0 ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/5 px-2.5 py-2 text-destructive">
            Keine IDB-Tabellen gefunden. Ist das ein SoftEngine-IDB-Export
            (in SoftEngine: „IDB exportieren“, Dateiendung .DTK)?
            {pannenGrund && <><br />Die Datei liess sich nicht lesen: {pannenGrund}</>}
          </p>
        ) : (
          <>
            <p className="text-muted-foreground">
              {tabellen.length} Tabellen gefunden. Angehakte werden als
              IDB-Datenquellen angelegt — Felder samt Klarnamen inklusive.
            </p>
            <div className="overflow-hidden rounded-md border border-border">
              {tabellen.map((t) => {
                const gesperrt = vorhanden.has(t.kennung)
                const zeile = hinweis(t)
                return (
                  <label
                    key={t.kennung}
                    className={`flex items-start gap-2 border-b border-border px-2.5 py-1.5 last:border-b-0 ${
                      gesperrt ? 'opacity-50' : 'cursor-pointer hover:bg-secondary/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-primary"
                      checked={!gesperrt && angehakt.has(t.kennung)}
                      disabled={gesperrt}
                      onChange={() => umschalten(t.kennung)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-1.5">
                        <span className="truncate font-medium">
                          {t.name !== '' ? t.name : kennungAnzeige(t.kennung)}
                        </span>
                        <span className="shrink-0 font-mono text-[0.625rem] text-muted-foreground">
                          {kennungAnzeige(t.kennung)}
                        </span>
                      </span>
                      <span className="block text-[0.625rem] text-muted-foreground">
                        {t.felder.length} Felder
                        {zeile !== '' ? ` · ${zeile}` : ''}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </>
        )}
        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>Abbrechen</Button>
          {tabellen.length > 0 && (
            <Button size="sm" disabled={anzahl === 0} onClick={uebernehmen}>
              {anzahl === 1 ? '1 Tabelle übernehmen' : `${anzahl} Tabellen übernehmen`}
            </Button>
          )}
        </div>
      </div>
    </FormularKarte>
  )
}
