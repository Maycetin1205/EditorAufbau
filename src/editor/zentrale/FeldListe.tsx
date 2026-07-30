// FeldListe — das Feld-Woerterbuch einer Datenquelle pflegen.
//
// Herausgeloest aus DataSourceForm (2026-07-30, Nutzer-Auftrag „den Bereich
// Datenquelle komplett neu aufbauen"): das Woerterbuch ist der aufwendigste
// Teil des Formulars und hat jetzt drei Wege statt einem.
//
// Warum das noetig war: eine Stammquelle bestellt ihre Felder EINZELN beim
// ERP. Der Adressstamm der echten Maske hat zehn — das waren zehn Klarnamen
// plus zwanzig nachzuschlagende Zahlen, von Hand. Ein Zahlendreher faellt
// erst in der laufenden Maske auf, als leeres Feld ohne Erklaerung.
//
// EIN Weg: Zeile fuer Zeile — Klarname, Position, Laenge.
//
// Am 2026-07-30 standen hier einen halben Tag lang zwei Abkuerzungen, beide
// auf Nutzer-Ansage wieder entfernt:
//   - „Vorlage" setzte erprobte Feldlisten fuer ADR/ART/BEL ein. In Wahrheit
//     waren das 30 Feldpositionen EINER Installation, festgeschrieben im
//     Code — woanders falsch und trotzdem richtig aussehend (Regel 5:
//     solche Werte sind Daten, nie Code).
//   - „Liste einfuegen" nahm den FELDER-Text einer laufenden Maske entgegen
//     und baute die Zeilen daraus. Entfernt auf ausdrueckliche Ansage
//     („ergibt keinen sinn, restlos erstmal weg aus dem code"). Wer sie
//     zurueckholen will, braucht dafuer eine neue Entscheidung des Nutzers —
//     nicht wieder auf Verdacht einbauen.
//
// Der Editor erfindet keine Namen (Regel 7): eine Zeile ohne Klarname bleibt
// ohne Klarname und wird als unvollstaendig gemeldet.

import { Plus, X } from 'lucide-react'
import { Button } from '@/ui/atoms/button'
import { IconButton } from '@/ui/atoms/icon-button'
import { TextInput } from '@/ui/atoms/text-input'
import { artFuer, type DataSourceKind } from '../../core/data/dataSources'
import { LEERE_ZEILE, zeileGefuellt, type FeldZeile } from './feldZeile'

// Spaltenraster: Klarname | Position | Länge | Entfernen.
const SPALTEN = 'grid grid-cols-[minmax(0,1fr)_72px_72px_auto] items-center gap-x-2'

interface FeldListeProps {
  kind: DataSourceKind
  zeilen: FeldZeile[]
  setZeilen: (naechste: FeldZeile[]) => void
  zeilenFehler: string[]
  doppeltFehler: string
  zeigeFehler: boolean
}

export function FeldListe({
  kind, zeilen, setZeilen, zeilenFehler, doppeltFehler, zeigeFehler,
}: FeldListeProps) {
  const einzeln = artFuer(kind).felderEinzeln
  const istLeer = !zeilen.some(zeileGefuellt)

  const setZeile = (at: number, patch: Partial<FeldZeile>) =>
    setZeilen(zeilen.map((row, i) => (i === at ? { ...row, ...patch } : row)))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[0.6875rem] font-medium">Felder</span>
        <Button variant="outline" size="sm" onClick={() => setZeilen([...zeilen, { ...LEERE_ZEILE }])}>
          <Plus size={13} /> Feld
        </Button>
      </div>

      {/* Der Unterschied, an dem sich der Bediener sonst die Zaehne ausbeisst:
          bei einer Stammquelle IST diese Liste die Bestellung ans ERP. */}
      {einzeln ? (
        istLeer && (
          <p className="rounded-md border border-destructive/40 bg-destructive/5 px-2.5 py-2 text-xs text-destructive">
            Ohne Felder liefert SoftEngine für diese Quelle nichts. Was hier
            nicht steht, wird nicht geladen — die gebundene Stelle bliebe leer.
          </p>
        )
      ) : (
        <p className="text-xs text-muted-foreground">
          SoftEngine liefert bei einer eigenen Tabelle ohnehin alle Felder.
          Diese Liste ist nur für die Namen im Feld-Picker — sie muss nicht
          vollständig sein.
        </p>
      )}

      <div className={`${SPALTEN} text-[0.6875rem] text-muted-foreground`}>
        <span>Klarname</span>
        <span>Position</span>
        <span>Länge</span>
        <span />
      </div>
      {zeilen.map((z, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className={SPALTEN}>
            <TextInput
              aria-label={`Feld ${i + 1}: Klarname`}
              value={z.label}
              placeholder="z. B. Vorname"
              onChange={(e) => setZeile(i, { label: e.target.value })}
            />
            <TextInput
              aria-label={`Feld ${i + 1}: Position`}
              value={z.pos}
              placeholder={z.rawCode !== '' ? '—' : '193'}
              onChange={(e) => setZeile(i, { pos: e.target.value })}
            />
            <TextInput
              aria-label={`Feld ${i + 1}: Länge`}
              value={z.len}
              placeholder={z.rawCode !== '' ? '—' : '30'}
              onChange={(e) => setZeile(i, { len: e.target.value })}
            />
            <IconButton
              aria-label={`Feld ${i + 1} entfernen`}
              onClick={() => setZeilen(zeilen.filter((_, at) => at !== i))}
            >
              <X size={14} />
            </IconButton>
          </div>
          {zeigeFehler && zeilenFehler[i] !== '' && (
            <p className="text-xs text-destructive">{zeilenFehler[i]}</p>
          )}
        </div>
      ))}
      {zeigeFehler && doppeltFehler !== '' && (
        <p className="text-xs text-destructive">{doppeltFehler}</p>
      )}
    </div>
  )
}
