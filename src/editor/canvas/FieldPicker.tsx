import { useEffect } from 'react'
import { AuswahlFenster } from '@/ui/molecules/auswahl-fenster'
import { WaehlerListe, type WaehlerGruppe } from '@/ui/molecules/waehler'
import {
  bindungMitQuelle,
  type ZuordnungZeile,
} from '../../core/blocks/BlockDefinition'
import type { DataSourceField } from '../../core/data/dataSources'
import type { Eingabesitzung } from '../inspector/controls/eingabeSitzung'

export interface PickerGruppe {
  quelleId: string

  name: string

  kennung?: string

  hinweis?: string
  fields: readonly DataSourceField[]
}

export interface PickerWahl {
  label: string
  optionen: readonly { wert: string; name: string }[]
  aktuell: string
  onWaehle: (wert: string) => void
}

export interface PickerFeld {
  key: string
  label: string

  aktuell: string
  onWaehle: (wert: string) => void
}

export interface PickerZuordnung {
  label: string
  wertLabel: string
  nameLabel: string
  bedeutungLabel: string
  bedeutungen: readonly { wert: string; name: string }[]
  zeilen: readonly ZuordnungZeile[]

  onAendern: (zeilen: ZuordnungZeile[]) => void

  sitzung: Eingabesitzung
}

interface FieldPickerProps {
  spotLabel: string
  gruppen: readonly PickerGruppe[]

  wahl?: PickerWahl

  felder?: readonly PickerFeld[]

  zuordnung?: PickerZuordnung

  current?: string

  top: number
  left: number

  onPick: (wert: string) => void
  onClose: () => void
}

export function FieldPicker({
  spotLabel,
  gruppen,
  wahl,
  felder,
  zuordnung,
  current,
  top,
  left,
  onPick,
  onClose,
}: FieldPickerProps) {
  // Schließt das Fenster ohne blur (Escape, Außenklick), bliebe die offene
  // Tipp-Klammer sonst stehen — und Undo wäre für den Rest der Sitzung stumm.
  const sitzung = zuordnung?.sitzung
  useEffect(() => (sitzung ? () => { sitzung.beenden() } : undefined), [sitzung])

  const waehlerGruppen: WaehlerGruppe[] = gruppen.map((g) => ({
    key: g.quelleId === '' ? '__erste__' : g.quelleId,
    name: g.name,
    kennung: g.kennung,
    hinweis: g.hinweis === undefined || g.hinweis === '' ? undefined : `über ${g.hinweis}`,
    eintraege: g.fields.map((f) => ({
      wert: bindungMitQuelle(g.quelleId, f.code),
      name: f.label,
      kennung: f.code,
    })),
  }))

  return (
    <AuswahlFenster
      bezeichnung={`Feld für ${spotLabel}`}
      oben={top}
      links={left}
      onClose={onClose}
      imBildHalten
      escapeAbfangen
      className={zuordnung || (felder && felder.length > 0) ? 'max-h-96 w-80' : 'max-h-80 w-64'}
    >

      {wahl && (
        <div className="mb-1 border-b border-border pb-1">
          <p className="px-2 pb-1 pt-1.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {wahl.label}
          </p>
          <div className="flex flex-wrap gap-1 px-1">
            {wahl.optionen.map((o) => (
              <button
                key={o.wert}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  wahl.onWaehle(o.wert)
                }}
                className={`rounded-sm border px-2 py-1 text-xs ${
                  o.wert === wahl.aktuell
                    ? 'border-primary bg-primary/10 font-semibold text-foreground'
                    : 'border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {o.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {felder && felder.length > 0 && (
        <div className="mb-1 border-b border-border pb-1">
          {felder.map((f) => (
            <label key={f.key} className="mb-1 flex items-center gap-2 px-2">
              <span className="w-20 shrink-0 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
                {f.label}
              </span>
              <select
                value={f.aktuell}
                onChange={(e) => f.onWaehle(e.target.value)}
                className="min-w-0 flex-1 rounded-sm border border-border bg-background px-1 py-1 text-xs"
              >
                <option value="">
                  {gruppen.length === 0 ? '— erst Quelle wählen —' : '— nicht gebunden —'}
                </option>

                {f.aktuell !== ''
                  && !gruppen.some((g) =>
                    g.fields.some((feld) => bindungMitQuelle(g.quelleId, feld.code) === f.aktuell))
                  && <option value={f.aktuell}>— unbekanntes Feld —</option>}
                {gruppen.map((g) => (
                  <optgroup
                    key={g.quelleId === '' ? '__erste__' : g.quelleId}
                    label={g.name}
                  >
                    {g.fields.map((feld) => (
                      <option

                        key={bindungMitQuelle(g.quelleId, feld.code)}
                        value={bindungMitQuelle(g.quelleId, feld.code)}
                      >
                        {feld.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}

      {zuordnung && (
        <div className="mb-1 border-b border-border pb-1">
          <p className="px-2 pb-1 pt-1.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {zuordnung.label}
          </p>
          {zuordnung.zeilen.length === 0 && (
            <p className="px-2 pb-1 text-xs text-muted-foreground">
              Ohne Zuordnung zeigt die Marke den Datenwert grau.
            </p>
          )}
          {zuordnung.zeilen.map((z, i) => {
            const ersetze = (teil: Partial<ZuordnungZeile>) => {
              const next = zuordnung.zeilen.map((z2) => ({ ...z2 }))
              next[i] = { ...next[i], ...teil }
              zuordnung.onAendern(next)
            }
            return (
              <div key={i} className="mb-1 flex items-center gap-1 px-1">
                <input
                  type="text"
                  aria-label={zuordnung.wertLabel}
                  placeholder={zuordnung.wertLabel}
                  value={z.wert}
                  onChange={(e) => {
                    zuordnung.sitzung.beginnen()
                    ersetze({ wert: e.target.value })
                  }}
                  onBlur={zuordnung.sitzung.beenden}
                  className="w-16 rounded-sm border border-border bg-background px-1.5 py-1 text-xs"
                />
                <input
                  type="text"
                  aria-label={zuordnung.nameLabel}
                  placeholder={zuordnung.nameLabel}
                  value={z.name}
                  onChange={(e) => {
                    zuordnung.sitzung.beginnen()
                    ersetze({ name: e.target.value })
                  }}
                  onBlur={zuordnung.sitzung.beenden}
                  className="min-w-0 flex-1 rounded-sm border border-border bg-background px-1.5 py-1 text-xs"
                />
                <select
                  aria-label={zuordnung.bedeutungLabel}
                  value={z.bedeutung}
                  onChange={(e) => ersetze({ bedeutung: e.target.value })}
                  className="rounded-sm border border-border bg-background px-1 py-1 text-xs"
                >
                  {zuordnung.bedeutungen.map((b) => (
                    <option key={b.wert} value={b.wert}>{b.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-label={`${zuordnung.wertLabel} „${z.wert}“ entfernen`}
                  title="Zeile entfernen"
                  onClick={(e) => {
                    e.stopPropagation()
                    zuordnung.onAendern(zuordnung.zeilen.filter((_, k) => k !== i).map((z2) => ({ ...z2 })))
                  }}
                  className="rounded-sm px-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  ×
                </button>
              </div>
            )
          })}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()

              zuordnung.onAendern([
                ...zuordnung.zeilen.map((z2) => ({ ...z2 })),
                { wert: '', name: '', bedeutung: zuordnung.bedeutungen[0]?.wert ?? '' },
              ])
            }}
            className="mx-1 rounded-sm px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            + Zuordnung
          </button>
        </div>
      )}

      <WaehlerListe
        kopf={
          <p className="px-2 pb-1 pt-1.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {gruppen.length === 1 ? `${spotLabel} · Feld aus ${gruppen[0].name}` : `${spotLabel} · Feld wählen`}
            {gruppen.length === 1 && gruppen[0].kennung ? (
              <span className="ml-1.5 font-mono font-normal normal-case opacity-70">{gruppen[0].kennung}</span>
            ) : null}
          </p>
        }
        gruppen={gruppen.length === 1 ? [{ ...waehlerGruppen[0], name: undefined }] : waehlerGruppen}
        wert={current ?? ''}
        leerText="— nicht gebunden —"
        onWaehle={onPick}
      />
    </AuswahlFenster>
  )
}
