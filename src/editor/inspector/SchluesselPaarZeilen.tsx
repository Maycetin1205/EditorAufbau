// SchluesselPaarZeilen — „Woran erkennt man die zusammengehörige Zeile?":
// die Feldpaare „Feld = Feld" samt Entfernen und „Feld dazu".
//
// Zwei Sektionen stellen dieselbe Frage und hatten sie bis U3 (2026-08-12) je
// eigen gebaut: die QuellenListe (weitere Datenquelle ↔ Datenquelle 1) und die
// AuswahlFolgeSektion (dieser Baustein ↔ Auswahl-Geber). Beide Fassungen waren
// Zeile für Zeile dieselbe — inklusive Deckel, Entfernen-Knopf und dem
// „Feld dazu" darunter. Wer eine reparierte, reparierte die halbe Bedienung.
//
// Der Bediener sieht ausschließlich Klarnamen (Feldbezeichnungen); die
// Feldcodes arbeiten unsichtbar darunter (Regel 3). Kein eigener Zustand: jede
// Änderung geht als GANZE Liste zurück an den Aufrufer und von dort sofort in
// den Baum.
//
// Die Bezeichnungen kommen als Funktionen herein, weil sie je Sektion etwas
// anderes benennen („Feld 1 der ersten Datenquelle" vs. „Feld 1 beim
// Auswahl-Geber"). Für Hilfstechnik ist genau das der Unterschied, der zählt.

import { Plus, X } from '@/ui/zeichen'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { SchrittSelect } from '@/ui/atoms/schritt-select'
import type { DataSourceField } from '../../core/data/dataSources'
import { MAX_SCHLUESSELPAARE, type SchluesselPaar } from '../../core/data/sourceLinks'

interface SchluesselPaarZeilenProps {
  // Die Frage über den Zeilen, in der Zahl der jeweiligen Sektion.
  frage: string
  paare: readonly SchluesselPaar[]
  // Felder der linken (fromField) und der rechten (toField) Seite. Leer =
  // die zugehörige Quelle steht noch nicht — dann bleibt nur „— Feld —".
  linkeFelder: readonly DataSourceField[]
  rechteFelder: readonly DataSourceField[]
  linkeBezeichnung: (at: number) => string
  rechteBezeichnung: (at: number) => string
  entfernenBezeichnung: (at: number) => string
  onAendern: (paare: SchluesselPaar[]) => void
}

export function SchluesselPaarZeilen({
  frage,
  paare,
  linkeFelder,
  rechteFelder,
  linkeBezeichnung,
  rechteBezeichnung,
  entfernenBezeichnung,
  onAendern,
}: SchluesselPaarZeilenProps) {
  const setzePaar = (at: number, teil: Partial<SchluesselPaar>) =>
    onAendern(paare.map((p, i) => (i === at ? { ...p, ...teil } : p)))

  const felderOptionen = (felder: readonly DataSourceField[]) => (
    <>
      <option value="">— Feld —</option>
      {felder.map((f) => (
        <option key={f.code} value={f.code}>{f.label}</option>
      ))}
    </>
  )

  return (
    <>
      <span className="text-xs text-muted-foreground">{frage}</span>
      {paare.map((paar, at) => (
        <div key={at} className="flex items-center gap-1.5">
          <SchrittSelect
            className="min-w-0 flex-1"
            aria-label={linkeBezeichnung(at)}
            value={paar.fromField}
            onChange={(e) => setzePaar(at, { fromField: e.target.value })}
          >
            {felderOptionen(linkeFelder)}
          </SchrittSelect>
          <span className="shrink-0 text-xs text-muted-foreground">=</span>
          <SchrittSelect
            className="min-w-0 flex-1"
            aria-label={rechteBezeichnung(at)}
            value={paar.toField}
            onChange={(e) => setzePaar(at, { toField: e.target.value })}
          >
            {felderOptionen(rechteFelder)}
          </SchrittSelect>
          {paare.length > 1 && (
            <IconButton
              aria-label={entfernenBezeichnung(at)}
              onClick={() => onAendern(paare.filter((_, x) => x !== at))}
            >
              <X size={13} />
            </IconButton>
          )}
        </div>
      ))}
      {paare.length < MAX_SCHLUESSELPAARE && (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => onAendern([...paare, { fromField: '', toField: '' }])}
        >
          <Plus size={13} /> Feld dazu
        </Button>
      )}
    </>
  )
}
